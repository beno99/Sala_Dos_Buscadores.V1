import "server-only";
import type { DecisaoRevisao, RevisaoAnfitriao } from "@/data/types";
import type { ResultadoAcao } from "../admin/editorial";
import { AcessoNegado } from "../sessao";

/* Peças comuns às operações de anfitriões (anfitrião, curadoria e usuários). */

export type { ResultadoAcao };

export const agora = () => new Date().toISOString();
export const hoje = () => agora().slice(0, 10);
export const novoId = (prefixo: string) =>
  `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const falha = (mensagem: string, erros?: Record<string, string>) =>
  ({ ok: false, mensagem, erros }) as const;

export const ok = <T>(valor: T, mensagem: string) => ({ ok: true, valor, mensagem }) as const;

/** Erro com "Erro:" no começo e a primeira letra da regra em minúscula, como no resto da curadoria. */
export const erro = (regra: string) => falha(`Erro: ${regra}`);

/** Transforma a recusa de posse em resposta de ação (sem revelar se o item existe). */
export function comPosse<T>(fazer: () => ResultadoAcao<T>): ResultadoAcao<T> {
  try {
    return fazer();
  } catch (e) {
    if (e instanceof AcessoNegado) return falha(`Erro: ${e.message}`);
    throw e;
  }
}

export function novaDecisao(
  quem: string,
  decisao: DecisaoRevisao["decisao"],
  motivo?: string,
): DecisaoRevisao {
  const d: DecisaoRevisao = { quando: agora(), quem, decisao, vista: false };
  if (motivo) d.motivo = motivo.trim().replace(/\s+/g, " ");
  return d;
}

/** Registra uma decisão na revisão (sem mutar a original). */
export function comDecisao(r: RevisaoAnfitriao, d: DecisaoRevisao): RevisaoAnfitriao {
  const revisao: RevisaoAnfitriao = { ...r, decisoes: [...r.decisoes, d] };
  if (d.decisao === "reprovado") revisao.ultimoMotivo = d.motivo;
  else revisao.jaPublicado = true;
  return revisao;
}
