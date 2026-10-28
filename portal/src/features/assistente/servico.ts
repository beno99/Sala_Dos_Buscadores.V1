import type { PedidoAssistente, ResultadoAssistente } from "./contrato";
import type { OpcoesConsulta, Resposta } from "./motor";

/** Transporte real; o servidor responde 503 enquanto não houver provedor de IA. */
export async function consultarAcervo(pergunta: string, opcoes: OpcoesConsulta): Promise<Resposta> {
  const pedido: PedidoAssistente = {
    pergunta,
    modo: opcoes.modo ?? "explorar",
    escopo: opcoes.escopo ?? "todo",
  };
  const r = await fetch("/api/assistente", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
    signal: opcoes.signal,
  });
  if (r.redirected || r.status === 401)
    throw new Error("Erro: entre novamente na sua conta para consultar o acervo.");
  const resultado: ResultadoAssistente = await r.json();
  if (!resultado.ok) throw new Error(resultado.erro);
  if (!r.ok) throw new Error("Erro: não foi possível consultar o acervo. Tente novamente.");
  return resultado.resposta;
}
