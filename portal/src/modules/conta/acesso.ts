export const contaAtiva = (conta: { emailVerificadoEm: string | null } | null): boolean =>
  Boolean(conta?.emailVerificadoEm);

export const VALIDADE_VERIFICACAO_H = 24;
export const INTERVALO_VERIFICACAO_MS = 60_000;
export function podeEmitirVerificacao(expiracaoAnterior: string | null, agora: Date): boolean {
  return (
    !expiracaoAnterior ||
    agora.getTime() - (new Date(expiracaoAnterior).getTime() - VALIDADE_VERIFICACAO_H * 60 * 60_000) >=
      INTERVALO_VERIFICACAO_MS
  );
}
