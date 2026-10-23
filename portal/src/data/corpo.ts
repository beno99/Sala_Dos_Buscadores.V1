import type { BlocoCorpo } from "./types";

/*
 * Corpo em blocos (Corpo do artigo): lead, parágrafo, intertítulo, destaque e
 * imagem. Funções puras, usadas pelas páginas, pelos editores e pelo servidor.
 */

export type TipoBloco = "paragrafo" | "intertitulo" | "destaque" | "imagem" | "lista";
export type BlocoImagem = Extract<BlocoCorpo, { tipo: "imagem" }>;
export type BlocoDestaque = Extract<BlocoCorpo, { tipo: "destaque" }>;

export const tipoDoBloco = (b: BlocoCorpo): TipoBloco => (typeof b === "string" ? "paragrafo" : b.tipo);

export const ROTULO_BLOCO: Record<TipoBloco, string> = {
  paragrafo: "Parágrafo",
  intertitulo: "Intertítulo",
  destaque: "Destaque",
  imagem: "Imagem",
  lista: "Lista",
};

export function blocoVazio(tipo: TipoBloco): BlocoCorpo {
  if (tipo === "intertitulo") return { tipo, texto: "" };
  if (tipo === "destaque") return { tipo, texto: "", atribuicao: "" };
  if (tipo === "imagem") return { tipo, src: "", alt: "", credito: "", legenda: "" };
  if (tipo === "lista") return { tipo, itens: [""], ordenada: false };
  return { tipo: "paragrafo", texto: "" };
}

/** O texto do corpo, bloco a bloco: parágrafos, intertítulos e destaques. Imagens não contam texto. */
export function textoDoCorpo(corpo: readonly BlocoCorpo[]): string[] {
  return corpo.flatMap((b) => {
    if (typeof b === "string") return [b];
    if (b.tipo === "imagem") return [];
    return b.tipo === "lista" ? b.itens : [b.texto];
  });
}

/** Só os parágrafos (o primeiro é o lead e vira o resumo do anfitrião). */
export const paragrafosDoCorpo = (corpo: readonly BlocoCorpo[]): string[] =>
  corpo.flatMap((b) => (typeof b === "string" ? [b] : b.tipo === "paragrafo" ? [b.texto] : []));

export function copiarBloco(b: BlocoCorpo): BlocoCorpo {
  return typeof b === "string" ? b : b.tipo === "lista" ? { ...b, itens: [...b.itens] } : { ...b };
}

export const copiarCorpo = (corpo: readonly BlocoCorpo[]): BlocoCorpo[] => corpo.map(copiarBloco);

/**
 * Corpo pronto para gravar: textos aparados; somem parágrafos e intertítulos
 * vazios, destaques sem texto nem atribuição e imagens sem arquivo.
 */
export function limparCorpo(corpo: readonly BlocoCorpo[]): BlocoCorpo[] {
  const limpo: BlocoCorpo[] = [];
  for (const b of corpo) {
    if (typeof b === "string") {
      if (b.trim()) limpo.push(b.trim());
    } else if (b.tipo === "lista") {
      if (b.itens.some((item) => item.trim()))
        limpo.push({ ...b, itens: b.itens.map((item) => item.trim()) });
    } else if (b.tipo === "paragrafo") {
      if (b.texto.trim()) limpo.push({ ...b, texto: b.texto.trim() });
    } else if (b.tipo === "intertitulo") {
      if (b.texto.trim()) limpo.push({ ...b, texto: b.texto.trim() });
    } else if (b.tipo === "destaque") {
      if (b.texto.trim() || b.atribuicao.trim()) {
        limpo.push({ tipo: "destaque", texto: b.texto.trim(), atribuicao: b.atribuicao.trim() });
      }
    } else if (b.src.trim()) {
      const imagem: BlocoImagem = {
        tipo: "imagem",
        src: b.src.trim(),
        alt: b.alt.trim(),
        credito: b.credito.trim(),
      };
      if (b.legenda?.trim()) imagem.legenda = b.legenda.trim();
      if (b.midia) imagem.midia = b.midia;
      limpo.push(imagem);
    }
  }
  return limpo;
}

/** Corpo do formulário: nunca vazio, para o editor sempre ter o primeiro parágrafo. */
export const corpoParaForm = (corpo: readonly BlocoCorpo[]): BlocoCorpo[] =>
  corpo.length ? copiarCorpo(corpo) : [""];
