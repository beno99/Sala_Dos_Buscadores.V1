import type { Escopo, Resposta } from "./motor";

export const MODOS_ESTUDO = {
  explorar: { nome: "Explorar", descricao: "Para entender conceitos e descobrir conexões no acervo." },
  comparar: { nome: "Comparar", descricao: "Para examinar semelhanças e diferenças entre tradições." },
  leitura: { nome: "Leitura guiada", descricao: "Para acompanhar a interpretação e o contexto de um texto." },
} as const;
export type ModoEstudo = keyof typeof MODOS_ESTUDO;
export type AparenciaEsfera = "gold" | "dark";

export interface PedidoAssistente {
  pergunta: string;
  modo: ModoEstudo;
  escopo: Escopo;
}

export const ASSISTENTE_INDISPONIVEL =
  "Erro: o serviço de IA ainda não está conectado. Sua pergunta foi preservada; você pode editá-la ou tentar novamente depois.";

/** Contrato da integração autenticada. Nunca devolve respostas demonstrativas. */
export type ResultadoAssistente = { ok: true; resposta: Resposta } | { ok: false; erro: string };

export function validarPedido(valor: unknown, salas: readonly string[]): PedidoAssistente | null {
  if (!valor || typeof valor !== "object") return null;
  const p = valor as Record<string, unknown>;
  if (
    typeof p.pergunta !== "string" ||
    !p.pergunta.trim() ||
    p.pergunta.length > 2000 ||
    typeof p.modo !== "string" ||
    !Object.hasOwn(MODOS_ESTUDO, p.modo) ||
    typeof p.escopo !== "string" ||
    (p.escopo !== "todo" && !salas.includes(p.escopo))
  )
    return null;
  return { pergunta: p.pergunta.trim(), modo: p.modo as ModoEstudo, escopo: p.escopo };
}
