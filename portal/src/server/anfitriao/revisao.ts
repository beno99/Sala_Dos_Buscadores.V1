import "server-only";
import type { ConteudoEditorial, SalaEditorial } from "@/data/types";
import {
  planejarAprovacaoSala,
  planejarReprovacaoSala,
  reprovar,
  transicao,
} from "@/features/anfitriao/regras/ciclo";
import { contaPorId } from "@/features/auth/contas";
import { registrar } from "../auditoria";
import { enviarEmail } from "../caixa-saida";
import { acervo } from "../store";
import { agora, comDecisao, erro, hoje, novaDecisao, ok, type ResultadoAcao } from "./comum";

/*
 * Decisões da curadoria sobre o que os anfitriões enviam (§4.3). Quem chama
 * (./acoes-admin.ts) já conferiu o papel de administrador; aqui só se julga:
 * nenhuma função altera título, texto, imagens ou fontes do anfitrião.
 * Cada decisão gera um e-mail para o anfitrião na caixa de saída simulada.
 */

function salaPorId(id: string): SalaEditorial | undefined {
  const s = acervo().salas.get(id);
  return s?.origem === "anfitriao" ? s : undefined;
}

function salaDoArtigo(a: ConteudoEditorial): SalaEditorial | undefined {
  return [...acervo().salas.values()].find((s) => s.slug === a.sala);
}

function artigosDaSala(sala: SalaEditorial): ConteudoEditorial[] {
  return [...acervo().conteudos.values()].filter((c) => c.sala === sala.slug && c.revisao);
}

function emailDoDono(donoId: string | undefined): string | undefined {
  return donoId ? (contaPorId(donoId)?.email ?? undefined) : undefined;
}

/** As fontes propostas citadas por artigos publicados entram no catálogo público. */
function liberarFontes(artigos: ConteudoEditorial[]) {
  for (const a of artigos) {
    for (const id of a.fontes) {
      const f = acervo().fontes.get(id);
      if (f?.proposta?.pendente)
        acervo().fontes.set(id, { ...f, proposta: { ...f.proposta, pendente: false } });
    }
  }
}

function publicarArtigo(a: ConteudoEditorial, quem: string): ConteudoEditorial {
  if (!a.revisao) return a;
  const publicado: ConteudoEditorial = {
    ...a,
    status: "publicado",
    publicadoEm: a.publicadoEm || hoje(),
    atualizadoEm: agora(),
    atualizadoPor: quem,
    revisao: comDecisao(a.revisao, novaDecisao(quem, "aprovado")),
  };
  acervo().conteudos.set(a.id, publicado);
  registrar({
    quem,
    acao: "aprovou",
    tipoItem: "artigo",
    itemId: a.id,
    itemTitulo: a.titulo,
    mudancas: [{ campo: "Status", antes: "em revisão", depois: "publicado" }],
  });
  return publicado;
}

function devolverArtigo(a: ConteudoEditorial, quem: string, motivo: string) {
  if (!a.revisao) return;
  acervo().conteudos.set(a.id, {
    ...a,
    status: "reprovado",
    atualizadoEm: agora(),
    atualizadoPor: quem,
    revisao: comDecisao(a.revisao, novaDecisao(quem, "reprovado", motivo)),
  });
  registrar({
    quem,
    acao: "reprovou",
    tipoItem: "artigo",
    itemId: a.id,
    itemTitulo: a.titulo,
    mudancas: [{ campo: "Motivo", antes: "", depois: motivo.trim() }],
  });
}

const lista = (titulos: string[]) => titulos.map((t) => `- ${t}`).join("\n");

// ---------- Sala ----------

export function aprovarSala(salaId: string, quem: string): ResultadoAcao<{ artigos: number }> {
  const sala = salaPorId(salaId);
  if (!sala?.revisao) return erro("esta Sala não existe mais.");
  const artigos = artigosDaSala(sala);
  const plano = planejarAprovacaoSala(sala, artigos);
  if (!plano.ok) return erro(plano.erro);

  acervo().salas.set(sala.id, {
    ...sala,
    status: "publicado",
    atualizadaEm: hoje(),
    atualizadoEm: agora(),
    atualizadoPor: quem,
    revisao: comDecisao(sala.revisao, novaDecisao(quem, "aprovado")),
  });
  registrar({
    quem,
    acao: "aprovou",
    tipoItem: "sala",
    itemId: sala.id,
    itemTitulo: sala.nome,
    mudancas: [{ campo: "Status", antes: "em revisão", depois: "publicado" }],
  });
  const publicados = plano.publicar.flatMap((id) => {
    const a = acervo().conteudos.get(id);
    return a ? [publicarArtigo(a, quem)] : [];
  });
  liberarFontes(publicados);

  const para = emailDoDono(sala.revisao.donoId);
  if (para) {
    enviarEmail({
      para,
      assunto: `Sua Sala “${sala.nome}” foi publicada`,
      corpo: [
        `Sua Sala “${sala.nome}” foi publicada e já aparece em Salas de anfitriões.`,
        publicados.length ? `Artigos publicados com ela:\n${lista(publicados.map((a) => a.titulo))}` : "",
        "Artigos que tiverem sido reprovados nesta revisão continuam no seu painel, com o motivo.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }
  const n = publicados.length;
  return ok(
    { artigos: n },
    n ? `Sala publicada com ${n} ${n === 1 ? "artigo" : "artigos"}.` : "Sala publicada.",
  );
}

export function reprovarSala(
  salaId: string,
  motivo: string,
  quem: string,
): ResultadoAcao<{ artigos: number }> {
  const sala = salaPorId(salaId);
  if (!sala?.revisao) return erro("esta Sala não existe mais.");
  const plano = planejarReprovacaoSala(sala, artigosDaSala(sala), motivo);
  if (!plano.ok) return erro(plano.erro);
  const texto = motivo.trim().replace(/\s+/g, " ");

  acervo().salas.set(sala.id, {
    ...sala,
    status: "reprovado",
    atualizadoEm: agora(),
    atualizadoPor: quem,
    revisao: comDecisao(sala.revisao, novaDecisao(quem, "reprovado", texto)),
  });
  registrar({
    quem,
    acao: "reprovou",
    tipoItem: "sala",
    itemId: sala.id,
    itemTitulo: sala.nome,
    mudancas: [{ campo: "Motivo", antes: "", depois: texto }],
  });
  const devolvidos = plano.devolver.flatMap((id) => {
    const a = acervo().conteudos.get(id);
    if (!a) return [];
    devolverArtigo(a, quem, texto);
    return [a.titulo];
  });

  const para = emailDoDono(sala.revisao.donoId);
  if (para) {
    enviarEmail({
      para,
      assunto: `Sua Sala “${sala.nome}” voltou para ajustes`,
      corpo: [
        `A curadoria revisou a Sala “${sala.nome}” e pediu ajustes antes da publicação.`,
        `Motivo: ${texto}`,
        devolvidos.length ? `Voltaram junto com ela:\n${lista(devolvidos)}` : "",
        "Corrija no seu painel de anfitrião e envie de novo quando quiser.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }
  return ok({ artigos: devolvidos.length }, "Sala devolvida ao anfitrião com o motivo.");
}

// ---------- artigo ----------

/** Aprovar um artigo avulso: só numa Sala já publicada (no primeiro envio, quem aprova é "Aprovar Sala"). */
export function aprovarArtigo(artigoId: string, quem: string): ResultadoAcao {
  const artigo = acervo().conteudos.get(artigoId);
  if (!artigo?.revisao) return erro("este artigo não existe mais.");
  const t = transicao(artigo.status, "aprovar");
  if (!t.ok) return erro(t.erro);
  const sala = salaDoArtigo(artigo);
  if (sala?.status !== "publicado") {
    return erro("a Sala deste artigo ainda não foi publicada: aprove a Sala para publicar os artigos dela.");
  }
  const publicado = publicarArtigo(artigo, quem);
  liberarFontes([publicado]);
  const para = emailDoDono(artigo.revisao.donoId);
  if (para) {
    enviarEmail({
      para,
      assunto: `Seu artigo “${artigo.titulo}” foi publicado`,
      corpo: `Seu artigo “${artigo.titulo}” foi publicado na Sala “${sala.nome}”.`,
    });
  }
  return ok(undefined, "Artigo publicado.");
}

/** Reprovar um artigo: motivo obrigatório; volta ao anfitrião e os demais seguem na fila. */
export function reprovarArtigo(artigoId: string, motivo: string, quem: string): ResultadoAcao {
  const artigo = acervo().conteudos.get(artigoId);
  if (!artigo?.revisao) return erro("este artigo não existe mais.");
  const t = reprovar(artigo.status, motivo);
  if (!t.ok) return erro(t.erro);
  const texto = motivo.trim().replace(/\s+/g, " ");
  devolverArtigo(artigo, quem, texto);
  const para = emailDoDono(artigo.revisao.donoId);
  if (para) {
    enviarEmail({
      para,
      assunto: `Seu artigo “${artigo.titulo}” voltou para ajustes`,
      corpo: [
        `A curadoria revisou o artigo “${artigo.titulo}” e pediu ajustes antes da publicação.`,
        `Motivo: ${texto}`,
        "Corrija no seu painel de anfitrião e envie de novo quando quiser.",
      ].join("\n\n"),
    });
  }
  return ok(undefined, "Artigo devolvido ao anfitrião com o motivo.");
}

// ---------- comparação e assistente (§7) ----------

/** A "segunda chave": só o admin liga ou desliga. Desligar não despublica nada. */
export function definirNaComparacao(salaId: string, incluir: boolean, quem: string): ResultadoAcao {
  const sala = salaPorId(salaId);
  if (!sala) return erro("esta Sala não existe mais.");
  if (sala.naComparacao === incluir) return ok(undefined, "");
  acervo().salas.set(sala.id, { ...sala, naComparacao: incluir, atualizadoEm: agora(), atualizadoPor: quem });
  registrar({
    quem,
    acao: incluir ? "incluiu-na-comparacao" : "removeu-da-comparacao",
    tipoItem: "sala",
    itemId: sala.id,
    itemTitulo: sala.nome,
  });
  return ok(
    undefined,
    incluir
      ? "A Sala entra na grade comparativa e no acervo do assistente."
      : "A Sala saiu da grade comparativa e do assistente. Nada foi despublicado.",
  );
}

/** Despublicar uma Sala de anfitrião (por exemplo, congelada depois de um rebaixamento). Nada é apagado. */
export function arquivarSala(salaId: string, quem: string): ResultadoAcao {
  const sala = salaPorId(salaId);
  if (!sala) return erro("esta Sala não existe mais.");
  if (sala.status === "arquivado") return ok(undefined, "");
  acervo().salas.set(sala.id, { ...sala, status: "arquivado", atualizadoEm: agora(), atualizadoPor: quem });
  registrar({
    quem,
    acao: "despublicou",
    tipoItem: "sala",
    itemId: sala.id,
    itemTitulo: sala.nome,
    mudancas: [{ campo: "Status", antes: sala.status, depois: "arquivado" }],
  });
  return ok(undefined, "Sala arquivada e fora do ar. Nada foi apagado.");
}
