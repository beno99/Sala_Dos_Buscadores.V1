import { tipoDoBloco } from "@/data/corpo";
import type { BlocoCorpo } from "@/data/types";

/*
 * Regras do corpo em blocos, conferidas no editor e na Server Action, da
 * curadoria e do anfitrião. As chaves são os ids dos campos do editor de
 * blocos (campo-corpo-{n}, campo-corpo-{n}-atribuicao, -alt, -credito), para
 * o erro levar ao bloco certo.
 */

export const campoDoBloco = (i: number, parte?: "atribuicao" | "alt" | "credito" | "legenda") =>
  parte ? `campo-corpo-${i}-${parte}` : `campo-corpo-${i}`;

const preenchido = (b: BlocoCorpo) =>
  typeof b === "string" ? !!b.trim() : b.tipo === "paragrafo" ? !!b.texto.trim() : true;

/** Mensagem de cada campo do corpo que impede publicar ou enviar (sem o prefixo "Erro:"). */
export function errosDoCorpo(corpo: readonly BlocoCorpo[]): Record<string, string> {
  const e: Record<string, string> = {};
  const primeiro = corpo.findIndex(preenchido);
  if (primeiro >= 0 && tipoDoBloco(corpo[primeiro] as BlocoCorpo) !== "paragrafo") {
    e[campoDoBloco(primeiro)] = "o texto começa por um parágrafo, que é o lead. Adicione um parágrafo antes.";
  }
  corpo.forEach((b, i) => {
    if (typeof b === "string") return;
    if (b.tipo === "destaque") {
      if (!b.texto.trim()) e[campoDoBloco(i)] = "escreva a frase do destaque.";
      if (!b.atribuicao.trim()) {
        e[campoDoBloco(i, "atribuicao")] = "diga de onde vem a frase. Ex.: O Caibalion, cap. II (1908).";
      }
    } else if (b.tipo === "imagem") {
      if (!b.src.trim()) e[campoDoBloco(i)] = "envie a imagem ou remova o bloco.";
      if (!b.alt.trim()) e[campoDoBloco(i, "alt")] = "descreva a imagem para quem não a vê.";
      if (!b.credito.trim()) {
        e[campoDoBloco(i, "credito")] = "escreva o crédito: autor, obra, data e licença ou domínio público.";
      }
    }
  });
  return e;
}

/** Rótulo do item do checklist para um campo do corpo com erro: "Atribuição do destaque (bloco 3)". */
export function rotuloDoErroDoCorpo(corpo: readonly BlocoCorpo[], campo: string): string {
  const m = /^campo-corpo-(\d+)(?:-(\w+))?$/.exec(campo);
  const i = Number(m?.[1] ?? 0);
  const parte = m?.[2];
  const b = corpo[i];
  const tipo = b === undefined ? "paragrafo" : tipoDoBloco(b);
  const rotulo =
    parte === "atribuicao"
      ? "Atribuição do destaque"
      : parte === "alt"
        ? "Texto alternativo da imagem"
        : parte === "credito"
          ? "Crédito da imagem"
          : tipo === "destaque"
            ? "Frase do destaque"
            : tipo === "imagem"
              ? "Arquivo da imagem"
              : "Texto começa pelo lead";
  return `${rotulo} (bloco ${i + 1})`;
}
