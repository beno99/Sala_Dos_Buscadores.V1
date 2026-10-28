import "server-only";
import {
  ASSISTENTE_INDISPONIVEL,
  type PedidoAssistente,
  type ResultadoAssistente,
} from "@/features/assistente/contrato";

/**
 * Ponto de integração RAG. O futuro adaptador recebe o contexto validado e o
 * identificador obtido da sessão, nunca do corpo enviado pelo cliente.
 * Deve recuperar somente fontes publicadas, devolver trechos/referências reais
 * e propagar AbortSignal. Não existe provedor ou persistência neste checkout.
 */
export interface ServicoAssistente {
  consultar(
    pedido: PedidoAssistente,
    contexto: { membroId: string; signal: AbortSignal },
  ): Promise<ResultadoAssistente>;
}

export const servicoAssistente: ServicoAssistente = {
  async consultar() {
    return { ok: false, erro: ASSISTENTE_INDISPONIVEL };
  },
};
