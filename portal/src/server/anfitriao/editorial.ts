import "server-only";
import { todosOsTemas } from "@/data/catalogo";
import { limparCorpo } from "@/data/corpo";
import type {
  ConteudoEditorial,
  FonteEditorial,
  PerfilAnfitriao,
  SalaEditorial,
  StatusEditorial,
  TemaSlug,
} from "@/data/types";
import type { ItemChecklist } from "@/features/admin/regras/checklist";
import { gerarSlug, slugUnico } from "@/features/admin/regras/slug";
import {
  camposCalculadosSala,
  checklistEnvioArtigo,
  duracaoDoTexto,
  type FormArtigoAnfitriao,
  type FormFonteProposta,
  type FormSalaAnfitriao,
  interpretarLink,
  pendenciasEnvioSala,
  resumoDoTexto,
  temPendencia,
  validarArtigoParaSalvar,
  validarFonteProposta,
  validarSala,
} from "@/features/anfitriao/regras/artigo";
import {
  editar,
  planejarEnvioSala,
  podeEnviarArtigoAvulso,
  podeExcluir,
  transicao,
} from "@/features/anfitriao/regras/ciclo";
import type { Membro } from "@/features/auth/contas";
import type { ModoSalvar } from "../admin/editorial";
import { registrar } from "../auditoria";
import { conferirImagensDoCorpo, midiaDoDono, urlDaMidia } from "../midia";
import { artigoDoDono, fonteVisivelAoDono, salaDoDono } from "../sessao";
import { acervo } from "../store";
import { agora, comPosse, erro, falha, hoje, novoId, ok, type ResultadoAcao } from "./comum";

/*
 * O que o anfitrião faz nas próprias Salas e artigos (§4, §5). Cada função
 * recebe quem age já identificado como anfitrião (as Server Actions em
 * ./acoes.ts conferem o papel) e confere de novo a posse de cada item.
 * Nada vai ao ar daqui: o máximo é "em revisão". Toda mudança vai para o
 * histórico de auditoria.
 */

const TEMAS_VALIDOS = new Set<string>(todosOsTemas().map((t) => t.slug));

export function perfilDe(contaId: string): PerfilAnfitriao | undefined {
  return acervo().perfis.get(contaId);
}

function exigirPerfil(dono: Membro): PerfilAnfitriao {
  const perfil = perfilDe(dono.id);
  if (!perfil) throw new Error("perfil ausente");
  return perfil;
}

/** O anfitrião precisa ter o papel e um perfil público antes de criar qualquer coisa. */
function conferirAnfitriao(dono: Membro): string | null {
  if (dono.papel !== "anfitriao") return "só anfitriões mantêm Salas.";
  if (!perfilDe(dono.id)) return "complete seu perfil de anfitrião antes de criar uma Sala.";
  return null;
}

const congelado = (item: { revisao?: { congelado?: boolean } }) => Boolean(item.revisao?.congelado);
const ERRO_CONGELADO = "este item foi congelado pela curadoria e não é mais editado.";

/** Slugs de todas as Salas (oficiais e de anfitriões, de qualquer status): o endereço é único no portal. */
function slugsDeSalas(exceto: string | null): string[] {
  return [...acervo().salas.values()].filter((s) => s.id !== exceto).map((s) => s.slug);
}

function slugsDeArtigos(salaSlug: string, exceto: string | null): string[] {
  return [...acervo().conteudos.values()]
    .filter((c) => c.sala === salaSlug && c.id !== exceto)
    .map((c) => c.slug);
}

function artigosDaSala(sala: SalaEditorial): ConteudoEditorial[] {
  return [...acervo().conteudos.values()].filter((c) => c.sala === sala.slug && c.revisao);
}

// ---------- Sala ----------

export function salvarSala(
  f: FormSalaAnfitriao,
  dono: Membro,
  modo: ModoSalvar,
): ResultadoAcao<{ id: string; slug: string; status: StatusEditorial; saiuDoAr: boolean; salvoEm: string }> {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const anterior = f.id ? salaDoDono(f.id, dono.id) : undefined;
    if (anterior && congelado(anterior)) return erro(ERRO_CONGELADO);

    const erros = validarSala(f);
    if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

    let status: StatusEditorial = "rascunho";
    let saiuDoAr = false;
    if (anterior) {
      const t = editar(anterior.status);
      if (!t.ok) return erro(t.erro);
      // Publicado só muda com confirmação (o Modal avisa que sai do ar), nunca no salvamento automático.
      if (t.saiDoAr && modo === "automatico") {
        return erro("a Sala publicada só muda quando você confirma: ela sai do ar até a nova aprovação.");
      }
      status = t.para;
      saiuDoAr = Boolean(t.saiDoAr);
    }

    const perfil = exigirPerfil(dono);
    const nome = f.nome.trim();
    const id = anterior?.id ?? novoId("s");
    // O endereço acompanha o nome até a primeira publicação; depois fica travado.
    const slug = anterior?.revisao?.jaPublicado
      ? anterior.slug
      : slugUnico(gerarSlug(nome) || "sala", slugsDeSalas(id));
    const imagem = midiaDoDono(f.imagem, dono.id);
    const momento = agora();
    const sala: SalaEditorial = {
      id,
      slug,
      nome,
      ...camposCalculadosSala(nome, perfil.nome),
      descricao: f.descricao.trim(),
      periodo: f.periodo.trim(),
      atualizadaEm: hoje(),
      origem: "anfitriao",
      naComparacao: anterior?.naComparacao ?? false,
      anfitriao: anterior?.anfitriao ?? {
        nome: perfil.nome,
        credencial: perfil.credencial,
        slug: perfil.slug,
      },
      status,
      criadoEm: anterior?.criadoEm ?? momento,
      atualizadoEm: momento,
      criadoPor: anterior?.criadoPor ?? dono.pseudonimo,
      atualizadoPor: dono.pseudonimo,
      revisao: anterior?.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] },
    };
    if (f.link.trim()) sala.link = new URL(f.link.trim()).toString();
    if (imagem) {
      sala.midia = imagem;
      sala.imagem = urlDaMidia(imagem);
    }

    const mudou =
      !anterior ||
      ["nome", "descricao", "periodo", "link", "imagem"].some(
        (k) =>
          (anterior as unknown as Record<string, unknown>)[k] !==
          (sala as unknown as Record<string, unknown>)[k],
      );
    if (anterior && !mudou) {
      return ok(
        { id, slug, status: anterior.status, saiuDoAr: false, salvoEm: anterior.atualizadoEm },
        "Nada mudou.",
      );
    }

    acervo().salas.set(id, sala);
    // Antes da primeira publicação, o endereço pode mudar com o nome: os artigos acompanham.
    if (anterior && anterior.slug !== slug) {
      for (const c of acervo().conteudos.values()) {
        if (c.sala === anterior.slug && c.revisao?.donoId === dono.id)
          acervo().conteudos.set(c.id, { ...c, sala: slug });
      }
    }
    registrar({
      quem: dono.pseudonimo,
      acao: anterior ? "editou" : "criou",
      tipoItem: "sala",
      itemId: id,
      itemTitulo: nome,
      mudancas: saiuDoAr ? [{ campo: "Status", antes: "publicado", depois: "rascunho" }] : undefined,
    });
    return ok(
      { id, slug, status, saiuDoAr, salvoEm: momento },
      saiuDoAr
        ? "Alterações salvas. A Sala saiu do ar até a curadoria aprovar a nova versão."
        : modo === "manual"
          ? "Alterações salvas."
          : "Rascunho salvo.",
    );
  });
}

// ---------- artigo ----------

function conferirFontes(fontes: string[], donoId: string): string | null {
  for (const id of fontes) {
    try {
      fonteVisivelAoDono(id, donoId);
    } catch {
      return "uma das fontes escolhidas não está disponível. Escolha no catálogo ou cadastre uma nova.";
    }
  }
  return null;
}

export function salvarArtigo(
  f: FormArtigoAnfitriao,
  dono: Membro,
  modo: ModoSalvar,
): ResultadoAcao<{ id: string; slug: string; status: StatusEditorial; saiuDoAr: boolean; salvoEm: string }> {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const sala = salaDoDono(f.salaId, dono.id);
    const anterior = f.id ? artigoDoDono(f.id, dono.id) : undefined;
    if (anterior && anterior.sala !== sala.slug) return erro("o artigo não muda de Sala.");
    if (congelado(sala) || (anterior && congelado(anterior))) return erro(ERRO_CONGELADO);

    const imagens = conferirImagensDoCorpo(f.corpo, dono.id, anterior?.corpo);
    const erros = { ...validarArtigoParaSalvar(f), ...imagens.erros };
    const erroFontes = conferirFontes(f.fontes, dono.id);
    if (erroFontes) erros["campo-fontes"] = erroFontes;
    if (f.temas.some((t) => !TEMAS_VALIDOS.has(t))) erros["campo-temas"] = "escolha os temas da lista.";
    if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

    let status: StatusEditorial = "rascunho";
    let saiuDoAr = false;
    if (anterior) {
      const t = editar(anterior.status);
      if (!t.ok) return erro(t.erro);
      if (t.saiDoAr && modo === "automatico") {
        return erro("artigo publicado só muda com confirmação: ele sai do ar até a nova aprovação.");
      }
      status = t.para;
      saiuDoAr = Boolean(t.saiDoAr);
    }

    const perfil = exigirPerfil(dono);
    const id = anterior?.id ?? novoId("c");
    const titulo = f.titulo.trim();
    const corpo = limparCorpo(imagens.corpo);
    const link = interpretarLink(f.link);
    const card = midiaDoDono(f.imagemCard, dono.id);
    const thumb = midiaDoDono(f.thumb, dono.id);
    const slug = anterior?.revisao?.jaPublicado
      ? anterior.slug
      : slugUnico(gerarSlug(titulo) || "artigo", slugsDeArtigos(sala.slug, id));
    const momento = agora();
    // A assinatura acompanha o autor; numa transferência, os já publicados mantêm o autor original.
    const assinatura = anterior?.anfitriao ?? {
      nome: perfil.nome,
      credencial: perfil.credencial,
      slug: perfil.slug,
    };
    const artigo: ConteudoEditorial = {
      id,
      slug,
      sala: sala.slug,
      tipo: "artigo",
      titulo,
      resumo: resumoDoTexto(corpo),
      temas: [...new Set(f.temas)] as TemaSlug[],
      periodo: sala.periodo,
      nivel: f.nivel ?? 1,
      formato: link.ok && link.link?.tipo === "youtube" ? "video" : "texto",
      proveniencia: "anfitriao",
      duracaoMin: duracaoDoTexto(corpo),
      autoria: { nome: assinatura.nome, credencial: assinatura.credencial },
      anfitriao: { ...assinatura },
      publicadoEm: anterior?.publicadoEm ?? "",
      corpo,
      fontes: [...new Set(f.fontes)],
      status,
      criadoEm: anterior?.criadoEm ?? momento,
      atualizadoEm: momento,
      criadoPor: anterior?.criadoPor ?? dono.pseudonimo,
      atualizadoPor: dono.pseudonimo,
      situacaoJuridica: null,
      temaDivergente: false,
      notaDivergencia: "",
      producaoIA: false,
      revisao: anterior?.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] },
      midias: { card, thumb },
    };
    if (link.ok && link.link) artigo.link = link.link;
    if (card) artigo.imagem = urlDaMidia(card);
    if (thumb) artigo.thumb = urlDaMidia(thumb);

    const chave = (c: ConteudoEditorial) =>
      JSON.stringify([
        c.titulo,
        c.corpo,
        c.temas,
        c.fontes,
        c.nivel,
        c.link ?? null,
        c.imagem ?? null,
        c.thumb ?? null,
      ]);
    if (anterior && chave(anterior) === chave(artigo)) {
      return ok(
        { id, slug, status: anterior.status, saiuDoAr: false, salvoEm: anterior.atualizadoEm },
        "Nada mudou.",
      );
    }

    acervo().conteudos.set(id, artigo);
    registrar({
      quem: dono.pseudonimo,
      acao: anterior ? "editou" : "criou",
      tipoItem: "artigo",
      itemId: id,
      itemTitulo: titulo,
      mudancas: saiuDoAr ? [{ campo: "Status", antes: "publicado", depois: "rascunho" }] : undefined,
    });
    return ok(
      { id, slug, status, saiuDoAr, salvoEm: momento },
      saiuDoAr
        ? "Alterações salvas. O artigo saiu do ar até a curadoria aprovar a nova versão."
        : modo === "manual"
          ? "Alterações salvas."
          : "Rascunho salvo.",
    );
  });
}

/** Fonte nova cadastrada pelo anfitrião: pendente, visível só para ele até o artigo ser aprovado. */
export function proporFonte(f: FormFonteProposta, dono: Membro): ResultadoAcao<{ id: string }> {
  const recusa = conferirAnfitriao(dono);
  if (recusa) return erro(recusa);
  const erros = validarFonteProposta(f);
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  const base = gerarSlug(`${f.autor.split(" ")[0] ?? ""} ${f.titulo}`).slice(0, 40) || "fonte";
  const id = slugUnico(base, acervo().fontes.keys());
  const momento = agora();
  const titulo = f.titulo.trim();
  const fonte: FonteEditorial = {
    id,
    titulo,
    autor: f.autor.trim(),
    tradicao: "Indicada por anfitrião",
    tipo: f.tipo as FonteEditorial["tipo"],
    referencia: f.localizacao.trim(),
    capa: "grafite",
    inicial: (titulo[0] ?? "?").toUpperCase(),
    criadoEm: momento,
    atualizadoEm: momento,
    criadoPor: dono.pseudonimo,
    atualizadoPor: dono.pseudonimo,
    proposta: { donoId: dono.id, pendente: true },
  };
  acervo().fontes.set(id, fonte);
  registrar({ quem: dono.pseudonimo, acao: "criou", tipoItem: "fonte", itemId: id, itemTitulo: titulo });
  return ok({ id }, "Fonte cadastrada. Ela entra no catálogo quando a curadoria aprovar o artigo.");
}

// ---------- envio para revisão ----------

const aceiteDe = (dono: Membro) => ({ quem: dono.pseudonimo, quando: agora() });

function pendenciasDoArtigo(a: ConteudoEditorial): ItemChecklist[] {
  return checklistEnvioArtigo(
    {
      id: a.id,
      salaId: "",
      titulo: a.titulo,
      corpo: a.corpo,
      temas: a.temas,
      fontes: a.fontes,
      nivel: a.nivel,
      link: a.link?.url ?? "",
      imagemCard: null,
      thumb: null,
    },
    true,
  ).filter((i) => i.estado === "pendente");
}

const ERRO_ACEITE = "marque a declaração de que tem direito de usar as imagens e os textos enviados.";

/**
 * Envia a Sala para revisão. No primeiro envio vão junto os artigos escolhidos
 * (pelo menos um). O aceite de direitos é obrigatório e fica registrado.
 */
export function enviarSala(
  salaId: string,
  escolhidos: string[],
  aceite: boolean,
  dono: Membro,
): ResultadoAcao<{ artigos: number }> {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const sala = salaDoDono(salaId, dono.id);
    if (congelado(sala)) return erro(ERRO_CONGELADO);
    if (!aceite) return falha(`Erro: ${ERRO_ACEITE}`, { "campo-aceite": ERRO_ACEITE });
    const faltas = pendenciasEnvioSala(sala);
    if (faltas.length) return erro(`falta ${faltas.join(" e ")} para enviar.`);

    const artigos = artigosDaSala(sala);
    const plano = planejarEnvioSala(
      { status: sala.status, jaPublicado: Boolean(sala.revisao?.jaPublicado) },
      artigos,
      escolhidos,
    );
    if (!plano.ok) return erro(plano.erro);
    for (const id of plano.artigos) {
      const a = artigoDoDono(id, dono.id);
      const pend = pendenciasDoArtigo(a);
      if (temPendencia(pend)) {
        return erro(
          `o artigo “${a.titulo}” ainda tem pendências: ${pend.map((p) => p.rotulo.toLowerCase()).join(", ")}.`,
        );
      }
    }

    const quando = agora();
    const aceiteRegistrado = aceiteDe(dono);
    acervo().salas.set(sala.id, {
      ...sala,
      status: "em_revisao",
      atualizadoEm: quando,
      atualizadoPor: dono.pseudonimo,
      revisao: {
        ...(sala.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] }),
        enviadoEm: quando,
        aceite: aceiteRegistrado,
      },
    });
    registrar({
      quem: dono.pseudonimo,
      acao: "enviou-para-revisao",
      tipoItem: "sala",
      itemId: sala.id,
      itemTitulo: sala.nome,
    });
    for (const id of plano.artigos) {
      const a = artigoDoDono(id, dono.id);
      acervo().conteudos.set(id, {
        ...a,
        status: "em_revisao",
        atualizadoEm: quando,
        atualizadoPor: dono.pseudonimo,
        revisao: {
          ...(a.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] }),
          enviadoEm: quando,
          aceite: aceiteRegistrado,
        },
      });
      registrar({
        quem: dono.pseudonimo,
        acao: "enviou-para-revisao",
        tipoItem: "artigo",
        itemId: id,
        itemTitulo: a.titulo,
      });
    }
    const n = plano.artigos.length;
    return ok(
      { artigos: n },
      n
        ? `Sala enviada para revisão com ${n} ${n === 1 ? "artigo" : "artigos"}.`
        : "Sala enviada para revisão.",
    );
  });
}

/** Artigo enviado sozinho, numa Sala já publicada. */
export function enviarArtigo(artigoId: string, aceite: boolean, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const artigo = artigoDoDono(artigoId, dono.id);
    if (congelado(artigo)) return erro(ERRO_CONGELADO);
    if (!aceite) return falha(`Erro: ${ERRO_ACEITE}`, { "campo-aceite": ERRO_ACEITE });
    const sala = [...acervo().salas.values()].find((s) => s.slug === artigo.sala);
    if (!sala) return erro("a Sala deste artigo não existe mais.");
    const erroSala = podeEnviarArtigoAvulso(sala.status);
    if (erroSala) return erro(erroSala);
    const t = transicao(artigo.status, "enviar");
    if (!t.ok) return erro(t.erro);
    const pend = pendenciasDoArtigo(artigo);
    if (temPendencia(pend))
      return erro(`ainda há pendências: ${pend.map((p) => p.rotulo.toLowerCase()).join(", ")}.`);
    const quando = agora();
    acervo().conteudos.set(artigo.id, {
      ...artigo,
      status: t.para,
      atualizadoEm: quando,
      atualizadoPor: dono.pseudonimo,
      revisao: {
        ...(artigo.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] }),
        enviadoEm: quando,
        aceite: aceiteDe(dono),
      },
    });
    registrar({
      quem: dono.pseudonimo,
      acao: "enviou-para-revisao",
      tipoItem: "artigo",
      itemId: artigo.id,
      itemTitulo: artigo.titulo,
    });
    return ok(undefined, "Artigo enviado para revisão.");
  });
}

// ---------- retirar do ar e excluir ----------

export type TipoItemAnfitriao = "sala" | "artigo";

export function retirarDoAr(tipo: TipoItemAnfitriao, id: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const item = tipo === "sala" ? salaDoDono(id, dono.id) : artigoDoDono(id, dono.id);
    if (congelado(item)) return erro(ERRO_CONGELADO);
    const t = transicao(item.status, "retirar");
    if (!t.ok) return erro(t.erro);
    const mudanca = { status: t.para, atualizadoEm: agora(), atualizadoPor: dono.pseudonimo };
    if (tipo === "sala") acervo().salas.set(id, { ...(item as SalaEditorial), ...mudanca });
    else acervo().conteudos.set(id, { ...(item as ConteudoEditorial), ...mudanca });
    const titulo = "nome" in item ? item.nome : item.titulo;
    registrar({
      quem: dono.pseudonimo,
      acao: "arquivou",
      tipoItem: tipo,
      itemId: id,
      itemTitulo: titulo,
      mudancas: [{ campo: "Status", antes: "publicado", depois: "arquivado" }],
    });
    return ok(
      undefined,
      tipo === "sala" ? "Sala retirada do ar. Nada foi apagado." : "Artigo retirado do ar. Nada foi apagado.",
    );
  });
}

/** Apaga propostas de fonte do anfitrião que nenhum outro item usa. */
function podarFontesPropostas(donoId: string) {
  const usadas = new Set([...acervo().conteudos.values()].flatMap((c) => c.fontes));
  for (const f of [...acervo().fontes.values()]) {
    if (f.proposta?.pendente && f.proposta.donoId === donoId && !usadas.has(f.id))
      acervo().fontes.delete(f.id);
  }
}

/** Só o que nunca foi ao ar é excluído; uma Sala leva junto os artigos dela (que também nunca foram publicados). */
export function excluir(tipo: TipoItemAnfitriao, id: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    if (tipo === "sala") {
      const sala = salaDoDono(id, dono.id);
      const motivo = podeExcluir({ status: sala.status, jaPublicado: Boolean(sala.revisao?.jaPublicado) });
      if (motivo) return erro(motivo);
      const artigos = artigosDaSala(sala);
      if (artigos.some((a) => a.revisao?.jaPublicado || a.status === "em_revisao")) {
        return erro(
          "esta Sala tem artigo que já foi publicado ou está em revisão; retire do ar em vez de excluir.",
        );
      }
      for (const a of artigos) acervo().conteudos.delete(a.id);
      acervo().salas.delete(id);
      podarFontesPropostas(dono.id);
      registrar({
        quem: dono.pseudonimo,
        acao: "excluiu",
        tipoItem: "sala",
        itemId: id,
        itemTitulo: sala.nome,
      });
      return ok(undefined, artigos.length ? "Sala e rascunhos excluídos." : "Sala excluída.");
    }
    const artigo = artigoDoDono(id, dono.id);
    const motivo = podeExcluir({ status: artigo.status, jaPublicado: Boolean(artigo.revisao?.jaPublicado) });
    if (motivo) return erro(motivo);
    acervo().conteudos.delete(id);
    podarFontesPropostas(dono.id);
    registrar({
      quem: dono.pseudonimo,
      acao: "excluiu",
      tipoItem: "artigo",
      itemId: id,
      itemTitulo: artigo.titulo,
    });
    return ok(undefined, "Artigo excluído.");
  });
}

// ---------- novidades ----------

/** Abrir o item marca como vistas as decisões da curadoria sobre ele. */
export function marcarNovidadesVistas(tipo: TipoItemAnfitriao, id: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const item = tipo === "sala" ? salaDoDono(id, dono.id) : artigoDoDono(id, dono.id);
    if (!item.revisao?.decisoes.some((d) => !d.vista)) return ok(undefined, "");
    const revisao = { ...item.revisao, decisoes: item.revisao.decisoes.map((d) => ({ ...d, vista: true })) };
    if (tipo === "sala") acervo().salas.set(id, { ...(item as SalaEditorial), revisao });
    else acervo().conteudos.set(id, { ...(item as ConteudoEditorial), revisao });
    return ok(undefined, "");
  });
}
