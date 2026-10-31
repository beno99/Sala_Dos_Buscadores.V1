import "server-only";
import { randomBytes } from "node:crypto";
import type { Candidatura, ConteudoEditorial, Convite, PerfilAnfitriao, SalaEditorial } from "@/data/types";
import { slugUnico } from "@/features/admin/regras/slug";
import { validarMotivo } from "@/features/anfitriao/regras/ciclo";
import { erroDoConvite, expiraEm, statusDoConvite } from "@/features/anfitriao/regras/convite";
import {
  type FormCandidatura,
  type FormPerfil,
  slugDoNome,
  validarCandidatura,
  validarPerfil,
} from "@/features/anfitriao/regras/perfil";
import { validarEmail, validarPseudonimo, validarSenha } from "@/features/auth/validacao";
import { contas } from "@/modules/conta";
import { hash } from "@/modules/conta/casos-de-uso/sessao";
import type { Membro } from "@/modules/conta/conta.contratos";
import { registrar } from "../auditoria";
import { EMAIL_CURADORIA, enviarEmail, URL_PUBLICA } from "../caixa-saida";
import { midiaDoDono } from "../midia";
import { acervo } from "../store";
import { agora, erro, falha, novoId, ok, type ResultadoAcao } from "./comum";

/*
 * Como alguém vira anfitrião e deixa de ser (§2, §9), e o perfil público.
 * As funções de curadoria recebem o pseudônimo do administrador já
 * conferido (./acoes-admin.ts); as do membro e do anfitrião recebem a conta.
 */

const limpar = (s: string) => s.trim().replace(/\s+/g, " ");

function slugsDePerfis(exceto?: string): string[] {
  return [...acervo().perfis.values()].filter((p) => p.contaId !== exceto).map((p) => p.slug);
}

/** Perfil inicial a partir do que a pessoa já informou (candidatura, convite ou pseudônimo). */
function criarPerfil(contaId: string, dados: Partial<FormCandidatura> & { nome: string }): PerfilAnfitriao {
  const existente = acervo().perfis.get(contaId);
  if (existente) return existente;
  const perfil: PerfilAnfitriao = {
    contaId,
    nome: limpar(dados.nome),
    slug: slugUnico(slugDoNome(dados.nome), slugsDePerfis(contaId)),
    credencial: limpar(dados.credencial ?? ""),
    apresentacao: (dados.apresentacao ?? "").trim(),
    atualizadoEm: agora(),
  };
  if (dados.link?.trim()) perfil.link = dados.link.trim();
  acervo().perfis.set(contaId, perfil);
  return perfil;
}

/** Perfil incompleto: falta o que aparece na página pública. O anfitrião completa em /anfitriao/perfil. */
export function perfilIncompleto(p: PerfilAnfitriao | undefined): boolean {
  return !(p?.credencial.trim() && p.apresentacao.trim());
}

// ---------- promoção pela curadoria ----------

export async function promover(contaId: string, quem: string): Promise<ResultadoAcao> {
  const conta = await contas.porId(contaId);
  if (!conta) return erro("esta conta não existe mais.");
  if (conta.papel !== "membro") return erro("só membros podem ser promovidos a anfitrião.");
  const r = await contas.definirPapel(contaId, "anfitriao");
  if (!r.ok) return erro(r.erro);
  criarPerfil(contaId, { nome: conta.pseudonimo });
  registrar({ quem, acao: "promoveu", tipoItem: "usuario", itemId: contaId, itemTitulo: conta.pseudonimo });
  return ok(undefined, `${conta.pseudonimo} agora é anfitrião. Ao entrar, completa o perfil público.`);
}

// ---------- rebaixamento (§9) ----------

export type OpcaoRebaixamento =
  | { tipo: "manter" }
  | { tipo: "despublicar" }
  | { tipo: "transferir"; para: string };

function itensDoDono(donoId: string) {
  const salas = [...acervo().salas.values()].filter((s) => s.revisao?.donoId === donoId);
  const artigos = [...acervo().conteudos.values()].filter((c) => c.revisao?.donoId === donoId);
  return { salas, artigos };
}

/**
 * Tira o papel de anfitrião. Em todos os casos, o que estava em revisão volta
 * a rascunho e a pessoa vira membro. Depois:
 * - manter: nada sai do ar e tudo fica congelado (ninguém edita; o admin só despublica ou transfere);
 * - despublicar: tudo vai para arquivado, nada é apagado;
 * - transferir: Salas e artigos mudam de dono; os já publicados mantêm a assinatura do autor original.
 */
export async function rebaixar(
  contaId: string,
  opcao: OpcaoRebaixamento,
  quem: string,
): Promise<ResultadoAcao> {
  const conta = await contas.porId(contaId);
  if (!conta) return erro("esta conta não existe mais.");
  if (conta.papel !== "anfitriao") return erro("esta conta não é de anfitrião.");
  let destino: Membro | null = null;
  let perfilDestino: PerfilAnfitriao | undefined;
  if (opcao.tipo === "transferir") {
    destino = await contas.porId(opcao.para);
    if (destino?.papel !== "anfitriao" || destino.id === contaId) {
      return erro("escolha outro anfitrião para receber as Salas.");
    }
    perfilDestino = acervo().perfis.get(destino.id);
    if (!perfilDestino) return erro("o anfitrião escolhido ainda não tem perfil público.");
  }

  const { salas, artigos } = itensDoDono(contaId);
  const momento = agora();
  const novoStatus = <T extends SalaEditorial | ConteudoEditorial>(item: T): T["status"] => {
    if (opcao.tipo === "despublicar") return "arquivado";
    return item.status === "em_revisao" ? "rascunho" : item.status;
  };
  const novaRevisao = (r: NonNullable<SalaEditorial["revisao"]>) => ({
    ...r,
    donoId: destino?.id ?? r.donoId,
    congelado: opcao.tipo === "manter" ? true : undefined,
  });
  const assinaturaDestino = perfilDestino
    ? { nome: perfilDestino.nome, credencial: perfilDestino.credencial, slug: perfilDestino.slug }
    : undefined;

  for (const s of salas) {
    if (!s.revisao) continue;
    const sala: SalaEditorial = {
      ...s,
      status: novoStatus(s),
      atualizadoEm: momento,
      atualizadoPor: quem,
      revisao: novaRevisao(s.revisao),
    };
    if (assinaturaDestino) sala.anfitriao = { ...assinaturaDestino };
    acervo().salas.set(s.id, sala);
  }
  for (const a of artigos) {
    if (!a.revisao) continue;
    const artigo: ConteudoEditorial = {
      ...a,
      status: novoStatus(a),
      atualizadoEm: momento,
      atualizadoPor: quem,
      revisao: novaRevisao(a.revisao),
    };
    // Publicados mantêm a assinatura original; os demais passam a ser do novo dono.
    if (assinaturaDestino && !a.revisao.jaPublicado) {
      artigo.anfitriao = { ...assinaturaDestino };
      artigo.autoria = { nome: assinaturaDestino.nome, credencial: assinaturaDestino.credencial };
    }
    acervo().conteudos.set(a.id, artigo);
  }
  if (destino) {
    for (const f of acervo().fontes.values()) {
      if (f.proposta?.donoId === contaId)
        acervo().fontes.set(f.id, { ...f, proposta: { ...f.proposta, donoId: destino.id } });
    }
    for (const m of acervo().midias.values()) {
      if (m.donoId === contaId) acervo().midias.set(m.id, { ...m, donoId: destino.id });
    }
  }

  await contas.definirPapel(contaId, "membro");
  const rotulo = {
    manter: "manter publicado e congelado",
    despublicar: "despublicar tudo",
    transferir: "transferir",
  }[opcao.tipo];
  registrar({
    quem,
    acao: "rebaixou",
    tipoItem: "usuario",
    itemId: contaId,
    itemTitulo: conta.pseudonimo,
    mudancas: [
      { campo: "Conteúdo", antes: `${salas.length} Salas, ${artigos.length} artigos`, depois: rotulo },
    ],
  });

  const nomesSalas = salas.map((s) => `- ${s.nome}`).join("\n");
  const textos = {
    manter: "Suas Salas publicadas continuam no ar, assinadas por você, mas não podem mais ser editadas.",
    despublicar: "Suas Salas e artigos saíram do ar e foram arquivados. Nada foi apagado.",
    transferir: `Suas Salas passaram a ser mantidas por ${perfilDestino?.nome ?? "outro anfitrião"}. Os artigos já publicados continuam assinados por você.`,
  };
  enviarEmail({
    para: conta.email,
    assunto: "Você deixou de ser anfitrião na Sala dos Buscadores",
    corpo: [
      "A curadoria tirou o papel de anfitrião da sua conta. Você continua como membro e pode ler o portal como antes.",
      textos[opcao.tipo],
      "O que estava em revisão voltou a rascunho.",
      nomesSalas ? `Salas afetadas:\n${nomesSalas}` : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  if (destino) {
    registrar({
      quem,
      acao: "transferiu",
      tipoItem: "usuario",
      itemId: destino.id,
      itemTitulo: destino.pseudonimo,
      mudancas: [{ campo: "Origem", antes: conta.pseudonimo, depois: destino.pseudonimo }],
    });
    enviarEmail({
      para: destino.email,
      assunto: "Você recebeu Salas na Sala dos Buscadores",
      corpo: [
        `A curadoria transferiu para você as Salas de ${conta.pseudonimo}. A partir de agora, você responde por elas.`,
        "Os artigos já publicados continuam assinados pelo autor original.",
        nomesSalas ? `Salas recebidas:\n${nomesSalas}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }
  const mensagens = {
    manter: "Papel retirado. O conteúdo continua no ar, congelado.",
    despublicar: "Papel retirado. Todo o conteúdo foi arquivado.",
    transferir: `Papel retirado. As Salas passaram para ${destino?.pseudonimo ?? "outro anfitrião"}.`,
  };
  return ok(undefined, mensagens[opcao.tipo]);
}

// ---------- candidatura (§2.2) ----------

export function candidaturaPendenteDe(contaId: string): Candidatura | undefined {
  return [...acervo().candidaturas.values()].find((c) => c.contaId === contaId && c.status === "pendente");
}

/** A candidatura mais recente do membro (para mostrar o motivo de uma recusa). */
export function ultimaCandidaturaDe(contaId: string): Candidatura | undefined {
  return [...acervo().candidaturas.values()]
    .filter((c) => c.contaId === contaId)
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))[0];
}

export function candidatar(f: FormCandidatura, membro: Membro): ResultadoAcao<{ id: string }> {
  if (membro.papel !== "membro") return erro("só membros se candidatam; sua conta já tem outro papel.");
  if (candidaturaPendenteDe(membro.id))
    return erro("você já tem uma candidatura em análise. Aguarde a resposta.");
  const erros = validarCandidatura(f);
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  const candidatura: Candidatura = {
    id: novoId("cand"),
    contaId: membro.id,
    email: membro.email,
    nome: limpar(f.nome),
    credencial: limpar(f.credencial),
    apresentacao: f.apresentacao.trim(),
    status: "pendente",
    enviadaEm: agora(),
  };
  if (f.link.trim()) candidatura.link = f.link.trim();
  acervo().candidaturas.set(candidatura.id, candidatura);
  registrar({
    quem: membro.pseudonimo,
    acao: "criou",
    tipoItem: "candidatura",
    itemId: candidatura.id,
    itemTitulo: candidatura.nome,
  });
  enviarEmail({
    para: EMAIL_CURADORIA,
    assunto: `Nova candidatura de anfitrião: ${candidatura.nome}`,
    corpo: [
      `${candidatura.nome} (${membro.email}) se candidatou a anfitrião.`,
      `Credencial: ${candidatura.credencial}`,
      `Apresentação: ${candidatura.apresentacao}`,
      candidatura.link ? `Link: ${candidatura.link}` : "",
      "Decida em Curadoria › Usuários › Candidaturas.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  });
  return ok(
    { id: candidatura.id },
    "Candidatura enviada. A curadoria responde por e-mail e nos seus Ajustes.",
  );
}

export async function decidirCandidatura(
  id: string,
  decisao: "aprovar" | "recusar",
  motivo: string | undefined,
  quem: string,
): Promise<ResultadoAcao> {
  const c = acervo().candidaturas.get(id);
  if (!c) return erro("esta candidatura não existe mais.");
  if (c.status !== "pendente") return erro("esta candidatura já foi decidida.");
  const conta = await contas.porId(c.contaId);
  if (!conta) return erro("a conta desta candidatura não existe mais.");

  if (decisao === "recusar") {
    const erroMotivo = validarMotivo(motivo);
    if (erroMotivo) return falha(`Erro: ${erroMotivo}`, { "campo-motivo": erroMotivo });
    const texto = limpar(motivo ?? "");
    acervo().candidaturas.set(id, {
      ...c,
      status: "recusada",
      decididaEm: agora(),
      decididaPor: quem,
      motivo: texto,
    });
    registrar({
      quem,
      acao: "reprovou",
      tipoItem: "candidatura",
      itemId: id,
      itemTitulo: c.nome,
      mudancas: [{ campo: "Motivo", antes: "", depois: texto }],
    });
    enviarEmail({
      para: c.email,
      assunto: "Sua candidatura de anfitrião foi recusada",
      corpo: [
        "A curadoria leu sua candidatura para ser anfitrião e, por ora, não a aprovou.",
        `Motivo: ${texto}`,
        "Você pode ajustar e se candidatar de novo em Ajustes.",
      ].join("\n\n"),
    });
    return ok(undefined, "Candidatura recusada. O membro vê o motivo e pode se candidatar de novo.");
  }

  if (conta.papel !== "membro") return erro("esta conta já não é de membro.");
  await contas.definirPapel(conta.id, "anfitriao");
  criarPerfil(conta.id, c);
  acervo().candidaturas.set(id, { ...c, status: "aprovada", decididaEm: agora(), decididaPor: quem });
  registrar({ quem, acao: "aprovou", tipoItem: "candidatura", itemId: id, itemTitulo: c.nome });
  registrar({ quem, acao: "promoveu", tipoItem: "usuario", itemId: conta.id, itemTitulo: conta.pseudonimo });
  enviarEmail({
    para: c.email,
    assunto: "Sua candidatura de anfitrião foi aprovada",
    corpo: [
      "A curadoria aprovou sua candidatura. Sua conta agora é de anfitrião.",
      `Ao entrar, confira seu perfil público e crie sua primeira Sala: ${URL_PUBLICA}/anfitriao`,
      "Tudo o que você escrever passa pela revisão da curadoria antes de ir ao ar.",
    ].join("\n\n"),
  });
  return ok(undefined, `${c.nome} agora é anfitrião.`);
}

// ---------- convite (§2.3) ----------

export async function convidar(
  email: string,
  quem: string,
  quando = new Date(),
): Promise<ResultadoAcao<{ id: string; link: string }>> {
  const erroEmail = validarEmail(email);
  if (erroEmail) return falha(`Erro: ${erroEmail}`, { "campo-email": erroEmail });
  const para = email.trim().toLowerCase();
  if (await contas.porEmail(para)) {
    return falha("Erro: já existe uma conta com este e-mail.", {
      "campo-email": "já existe uma conta com este e-mail. Promova a pessoa na aba Usuários.",
    });
  }
  const pendente = [...acervo().convites.values()].find(
    (c) => c.email === para && statusDoConvite(c, quando) === "pendente",
  );
  if (pendente) {
    return falha("Erro: já há um convite pendente para este e-mail.", {
      "campo-email": "já há um convite pendente para este e-mail. Revogue-o para enviar outro.",
    });
  }
  const token = randomBytes(24).toString("base64url");
  const convite: Convite = {
    id: novoId("conv"),
    token: hash(token),
    email: para,
    criadoEm: quando.toISOString(),
    expiraEm: expiraEm(quando).toISOString(),
    criadoPor: quem,
    status: "pendente",
  };
  acervo().convites.set(convite.id, convite);
  const link = `${URL_PUBLICA}/cadastro?convite=${token}`;
  registrar({ quem, acao: "convidou", tipoItem: "convite", itemId: convite.id, itemTitulo: para });
  enviarEmail(
    {
      para,
      assunto: "Convite para ser anfitrião na Sala dos Buscadores",
      corpo: [
        "A curadoria da Sala dos Buscadores convida você a ser anfitrião: manter uma Sala própria, com leituras suas, revisadas pela curadoria antes de ir ao ar.",
        `Para aceitar, crie sua conta por este link, que vale 7 dias e só pode ser usado uma vez:\n${link}`,
        "Se não esperava este convite, ignore esta mensagem.",
      ].join("\n\n"),
    },
    quando,
  );
  return ok({ id: convite.id, link }, `Convite enviado para ${para}. Vale 7 dias.`);
}

export function revogarConvite(id: string, quem: string): ResultadoAcao {
  const c = acervo().convites.get(id);
  if (!c) return erro("este convite não existe mais.");
  if (statusDoConvite(c) !== "pendente") return erro("só convite pendente pode ser revogado.");
  acervo().convites.set(id, { ...c, status: "revogado", revogadoEm: agora() });
  registrar({ quem, acao: "revogou-convite", tipoItem: "convite", itemId: id, itemTitulo: c.email });
  return ok(undefined, "Convite revogado. O link deixa de funcionar.");
}

export function conviteDoToken(token: string | undefined | null): Convite | undefined {
  if (!token) return undefined;
  const h = hash(token);
  return [...acervo().convites.values()].find((c) => c.token === h);
}

/** Erro do convite (vencido, usado, revogado, inexistente) ou null quando serve para cadastrar. */
export function situacaoDoConvite(token: string | undefined | null, agoraData = new Date()) {
  const convite = conviteDoToken(token);
  return { convite, erro: erroDoConvite(convite, agoraData) };
}

/**
 * Cadastro pelo link do convite: cria a conta já como anfitrião, com o e-mail
 * travado no do convite, e o perfil inicial (a pessoa completa em seguida).
 */
export async function aceitarConvite(
  token: string,
  dados: { pseudonimo: string; senha: string },
  agoraData = new Date(),
): Promise<ResultadoAcao<Membro>> {
  const { convite, erro: erroConvite } = situacaoDoConvite(token, agoraData);
  if (!convite || erroConvite) return erro(erroConvite ?? "convite inválido.");
  const erroPseudonimo = validarPseudonimo(dados.pseudonimo);
  if (erroPseudonimo) return falha(`Erro: ${erroPseudonimo}`, { pseudonimo: erroPseudonimo });
  const erroSenha = validarSenha(dados.senha);
  if (erroSenha) return falha(`Erro: ${erroSenha}`, { senha: erroSenha });
  const r = await contas.registrar(
    { pseudonimo: dados.pseudonimo, email: convite.email, senha: dados.senha },
    { papel: "anfitriao" },
  );
  if (!r.ok) return falha(`Erro: ${r.erro}`, r.campo ? { [r.campo]: r.erro } : undefined);
  // O link do convite já provou o e-mail: não manda outra verificação.
  const verificado = (await contas.marcarEmailVerificado(r.valor.id)) ?? r.valor;
  acervo().convites.set(convite.id, { ...convite, status: "usado", usadoEm: agoraData.toISOString() });
  criarPerfil(verificado.id, { nome: verificado.pseudonimo });
  registrar({
    quem: verificado.pseudonimo,
    acao: "criou",
    tipoItem: "usuario",
    itemId: verificado.id,
    itemTitulo: verificado.pseudonimo,
    mudancas: [{ campo: "Papel", antes: "", depois: "anfitrião (por convite)" }],
  });
  return ok(verificado, "Conta criada. Complete seu perfil de anfitrião.");
}

// ---------- perfil (§2) ----------

export function salvarPerfil(f: FormPerfil, dono: Membro): ResultadoAcao<PerfilAnfitriao> {
  if (dono.papel !== "anfitriao") return erro("só anfitriões têm perfil público.");
  const anterior = acervo().perfis.get(dono.id);
  const erros = validarPerfil(f, slugsDePerfis(dono.id));
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  const perfil: PerfilAnfitriao = {
    contaId: dono.id,
    nome: limpar(f.nome),
    slug: f.slug.trim(),
    credencial: limpar(f.credencial),
    apresentacao: f.apresentacao.trim(),
    atualizadoEm: agora(),
  };
  const avatar = midiaDoDono(f.avatar, dono.id);
  if (avatar) perfil.avatar = avatar;
  if (f.link.trim()) perfil.link = f.link.trim();
  acervo().perfis.set(dono.id, perfil);

  // A assinatura acompanha o perfil nas Salas e nos artigos escritos por esta pessoa.
  const assinatura = { nome: perfil.nome, credencial: perfil.credencial, slug: perfil.slug };
  const slugAntigo = anterior?.slug;
  for (const s of acervo().salas.values()) {
    if (s.revisao?.donoId === dono.id)
      acervo().salas.set(s.id, {
        ...s,
        anfitriao: { ...assinatura },
        tradicaoCurta: perfil.nome,
        tradicao: `Sala de anfitrião · ${perfil.nome}`,
      });
  }
  for (const c of acervo().conteudos.values()) {
    if (c.revisao && (c.anfitriao?.slug === slugAntigo || (!slugAntigo && c.revisao.donoId === dono.id))) {
      acervo().conteudos.set(c.id, {
        ...c,
        anfitriao: { ...assinatura },
        autoria: { nome: assinatura.nome, credencial: assinatura.credencial },
      });
    }
  }
  const mudancas = anterior
    ? (["nome", "slug", "credencial", "apresentacao", "link"] as const)
        .filter((k) => (anterior[k] ?? "") !== (perfil[k] ?? ""))
        .map((k) => ({ campo: k, antes: String(anterior[k] ?? ""), depois: String(perfil[k] ?? "") }))
    : [];
  registrar({
    quem: dono.pseudonimo,
    acao: "editou-perfil",
    tipoItem: "usuario",
    itemId: dono.id,
    itemTitulo: perfil.nome,
    mudancas,
  });
  return ok(perfil, "Perfil salvo. Ele já aparece na sua página pública.");
}
