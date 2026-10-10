import { normalizar } from "@/lib/texto";

/*
 * Revisão de voz da curadoria: aponta expressões de verdade absoluta ou de
 * tom de conversão e sugere a forma atribuída. Alerta, não bloqueia.
 * Para acrescentar expressões, edite EXPRESSOES_DE_VOZ (sem acento, minúsculas).
 */

export interface ExpressaoDeVoz {
  expressao: string;
  motivo: "verdade absoluta" | "tom de conversão" | "sensacionalismo";
  sugestao: string;
}

const ATRIBUIR = "Atribua a afirmação: “Segundo o Poimandres…”, “O texto afirma…”, “Para os editores…”.";

export const EXPRESSOES_DE_VOZ: ExpressaoDeVoz[] = [
  { expressao: "a verdade e", motivo: "verdade absoluta", sugestao: ATRIBUIR },
  { expressao: "a unica verdade", motivo: "verdade absoluta", sugestao: ATRIBUIR },
  {
    expressao: "comprovadamente",
    motivo: "verdade absoluta",
    sugestao: "Diga quem comprovou e onde: “Segundo o estudo de…”.",
  },
  {
    expressao: "esta comprovado",
    motivo: "verdade absoluta",
    sugestao: "Diga quem comprovou e onde: “Segundo o estudo de…”.",
  },
  { expressao: "e fato que", motivo: "verdade absoluta", sugestao: ATRIBUIR },
  { expressao: "sem sombra de duvida", motivo: "verdade absoluta", sugestao: ATRIBUIR },
  {
    expressao: "inquestionavel",
    motivo: "verdade absoluta",
    sugestao: "Mostre as leituras que existem, mesmo quando uma predomina.",
  },
  {
    expressao: "todos sabem",
    motivo: "verdade absoluta",
    sugestao: "Cite a fonte ou o consenso acadêmico, com nome.",
  },
  {
    expressao: "o unico caminho",
    motivo: "tom de conversão",
    sugestao: "Descreva o caminho como o texto o apresenta: “Para o Caibalion, o caminho é…”.",
  },
  {
    expressao: "voce precisa acreditar",
    motivo: "tom de conversão",
    sugestao: "O portal descreve, não prescreve: “A tradição ensina que…”.",
  },
  {
    expressao: "voce deve acreditar",
    motivo: "tom de conversão",
    sugestao: "O portal descreve, não prescreve: “A tradição ensina que…”.",
  },
  {
    expressao: "a religiao verdadeira",
    motivo: "tom de conversão",
    sugestao: "Nenhuma tradição é apresentada como a verdadeira. Descreva a posição do texto.",
  },
  {
    expressao: "a fe verdadeira",
    motivo: "tom de conversão",
    sugestao: "Nenhuma tradição é apresentada como a verdadeira. Descreva a posição do texto.",
  },
  {
    expressao: "desperte",
    motivo: "sensacionalismo",
    sugestao: "Descreva, não prometa: evite chamadas de despertar.",
  },
  {
    expressao: "segredos revelados",
    motivo: "sensacionalismo",
    sugestao: "Descreva o conteúdo sem promessa de revelação.",
  },
];

export interface AchadoDeVoz extends ExpressaoDeVoz {
  /** Onde apareceu: "resumo", "título" ou "parágrafo n". */
  onde: string;
}

/** Revisa textos rotulados e devolve cada expressão encontrada, uma vez por lugar. */
export function revisarVoz(textos: { onde: string; texto: string }[]): AchadoDeVoz[] {
  const achados: AchadoDeVoz[] = [];
  for (const { onde, texto } of textos) {
    const n = ` ${normalizar(texto)} `;
    for (const e of EXPRESSOES_DE_VOZ) {
      if (
        n.includes(` ${e.expressao} `) ||
        (e.expressao.split(" ").length === 1 && n.includes(` ${e.expressao}`))
      ) {
        achados.push({ ...e, onde });
      }
    }
  }
  return achados;
}
