import type { StatusEditorial } from "@/data/types";

/*
 * Ciclo de vida das Salas e dos artigos de anfitrião (§4.1). Funções puras:
 * as operações do servidor só as chamam e gravam o resultado.
 *
 *   rascunho ──enviar──▶ em_revisao ──aprovar──▶ publicado
 *       ▲                    │
 *       │                 reprovar (motivo obrigatório)
 *       │                    ▼
 *       └────editar──── reprovado
 *
 *   publicado ──anfitrião edita──▶ rascunho (sai do ar na hora)
 *   publicado ──anfitrião retira──▶ arquivado
 *
 * Em revisão, o item fica travado: o anfitrião espera a decisão.
 * Arquivado volta a rascunho se o anfitrião editar, e então pode ser reenviado.
 */

export type EventoCiclo = "editar" | "enviar" | "aprovar" | "reprovar" | "retirar";

export type Transicao = { ok: true; para: StatusEditorial } | { ok: false; erro: string };

/** Mínimo de caracteres do motivo de reprovação (§6). */
export const MOTIVO_MINIMO = 20;

const TRANSICOES: Record<EventoCiclo, Partial<Record<StatusEditorial, StatusEditorial>>> = {
  editar: { rascunho: "rascunho", reprovado: "rascunho", publicado: "rascunho", arquivado: "rascunho" },
  enviar: { rascunho: "em_revisao", reprovado: "em_revisao" },
  aprovar: { em_revisao: "publicado" },
  reprovar: { em_revisao: "reprovado" },
  retirar: { publicado: "arquivado" },
};

const ROTULO: Record<StatusEditorial, string> = {
  rascunho: "rascunho",
  em_revisao: "em revisão",
  publicado: "publicado",
  reprovado: "reprovado",
  arquivado: "arquivado",
};

const ERRO: Record<EventoCiclo, (de: StatusEditorial) => string> = {
  editar: () => "este item está em revisão. Espere a decisão da curadoria para editar.",
  enviar: (de) => `só rascunho ou item reprovado vai para revisão; este está ${ROTULO[de]}.`,
  aprovar: (de) => `só item em revisão pode ser aprovado; este está ${ROTULO[de]}.`,
  reprovar: (de) => `só item em revisão pode ser reprovado; este está ${ROTULO[de]}.`,
  retirar: (de) => `só item publicado pode ser retirado do ar; este está ${ROTULO[de]}.`,
};

export function transicao(de: StatusEditorial, evento: EventoCiclo): Transicao {
  const para = TRANSICOES[evento][de];
  return para ? { ok: true, para } : { ok: false, erro: ERRO[evento](de) };
}

/** Motivo de reprovação: obrigatório, com pelo menos MOTIVO_MINIMO caracteres úteis. */
export function validarMotivo(motivo: string | undefined | null): string | null {
  const texto = (motivo ?? "").trim().replace(/\s+/g, " ");
  if (!texto) return "escreva o motivo da reprovação; o anfitrião vai lê-lo para corrigir.";
  if (texto.length < MOTIVO_MINIMO) {
    return `explique um pouco mais: o motivo precisa de pelo menos ${MOTIVO_MINIMO} caracteres.`;
  }
  return null;
}

export function reprovar(de: StatusEditorial, motivo: string | undefined | null): Transicao {
  const erroMotivo = validarMotivo(motivo);
  if (erroMotivo) return { ok: false, erro: erroMotivo };
  return transicao(de, "reprovar");
}

/** Salvar uma edição: tira do ar o que estava publicado (§4.1). */
export function editar(de: StatusEditorial): Transicao & { saiDoAr?: boolean } {
  const t = transicao(de, "editar");
  return t.ok ? { ...t, saiDoAr: de === "publicado" } : t;
}

/** Só se exclui o que nunca foi ao ar; o que já foi publicado só é retirado (arquivado). */
export function podeExcluir(item: { status: StatusEditorial; jaPublicado: boolean }): string | null {
  if (item.jaPublicado) return "o que já foi publicado não é excluído; retire do ar para arquivar.";
  if (item.status === "em_revisao") return "este item está em revisão. Espere a decisão da curadoria.";
  return null;
}

// ---------- regras entre Sala e artigos (§4.2, §4.3) ----------

export interface ArtigoDaSala {
  id: string;
  status: StatusEditorial;
}

/**
 * Envio da Sala para revisão. No primeiro envio (Sala nunca publicada), vai
 * com pelo menos um artigo escolhido entre os rascunhos e reprovados dela.
 * Numa Sala que já foi publicada, os artigos seguem um a um; a Sala pode ir
 * sozinha (por exemplo depois de mudar o nome).
 */
export function planejarEnvioSala(
  sala: { status: StatusEditorial; jaPublicado: boolean },
  artigos: ArtigoDaSala[],
  escolhidos: string[],
): { ok: true; artigos: string[] } | { ok: false; erro: string } {
  const t = transicao(sala.status, "enviar");
  if (!t.ok) return t;
  const enviaveis = new Set(artigos.filter((a) => transicao(a.status, "enviar").ok).map((a) => a.id));
  const invalidos = escolhidos.filter((id) => !enviaveis.has(id));
  if (invalidos.length) return { ok: false, erro: "só rascunhos e artigos reprovados desta Sala vão junto." };
  const unicos = [...new Set(escolhidos)];
  const temPublicado = artigos.some((a) => a.status === "publicado");
  if (!sala.jaPublicado && !temPublicado && unicos.length === 0) {
    return { ok: false, erro: "escolha pelo menos um artigo para ir junto com a Sala no primeiro envio." };
  }
  return { ok: true, artigos: unicos };
}

/** Artigo enviado sozinho: só numa Sala já publicada (no primeiro envio, ele vai com a Sala). */
export function podeEnviarArtigoAvulso(salaStatus: StatusEditorial): string | null {
  if (salaStatus === "publicado") return null;
  if (salaStatus === "em_revisao")
    return "a Sala está em revisão; espere a decisão para enviar outro artigo.";
  return "a Sala ainda não está publicada: envie a Sala com este artigo.";
}

/**
 * "Aprovar Sala" publica a Sala e os artigos dela ainda em revisão (os que
 * foram reprovados nesta revisão já saíram de em_revisao). Fica bloqueado se
 * não sobrar nenhum artigo no ar depois da aprovação.
 */
export function planejarAprovacaoSala(
  sala: { status: StatusEditorial },
  artigos: ArtigoDaSala[],
): { ok: true; publicar: string[] } | { ok: false; erro: string } {
  const t = transicao(sala.status, "aprovar");
  if (!t.ok) return t;
  const publicar = artigos.filter((a) => a.status === "em_revisao").map((a) => a.id);
  const jaNoAr = artigos.some((a) => a.status === "publicado");
  if (!publicar.length && !jaNoAr) {
    return {
      ok: false,
      erro: "nenhum artigo desta Sala ficou aprovado. Uma Sala só vai ao ar com pelo menos um artigo.",
    };
  }
  return { ok: true, publicar };
}

/** "Reprovar Sala": a Sala e todos os artigos dela em revisão voltam ao anfitrião com o mesmo motivo. */
export function planejarReprovacaoSala(
  sala: { status: StatusEditorial },
  artigos: ArtigoDaSala[],
  motivo: string | undefined | null,
): { ok: true; devolver: string[] } | { ok: false; erro: string } {
  const t = reprovar(sala.status, motivo);
  if (!t.ok) return t;
  return { ok: true, devolver: artigos.filter((a) => a.status === "em_revisao").map((a) => a.id) };
}
