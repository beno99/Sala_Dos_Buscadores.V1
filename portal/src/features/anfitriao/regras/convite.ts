import type { Convite, StatusConvite } from "@/data/types";

/*
 * Convite para ser anfitrião (§2.3): vale 7 dias e só pode ser usado uma vez.
 * "Expirado" não é guardado; sai da data de validade.
 */

export const DIAS_VALIDADE_CONVITE = 7;

export function expiraEm(criadoEm: Date): Date {
  return new Date(criadoEm.getTime() + DIAS_VALIDADE_CONVITE * 86_400_000);
}

export function statusDoConvite(c: Pick<Convite, "status" | "expiraEm">, agora = new Date()): StatusConvite {
  if (c.status !== "pendente") return c.status;
  return agora.getTime() >= new Date(c.expiraEm).getTime() ? "expirado" : "pendente";
}

/** Por que o convite não serve para cadastrar; null quando serve. */
export function erroDoConvite(
  c: Pick<Convite, "status" | "expiraEm"> | undefined,
  agora = new Date(),
): string | null {
  if (!c) return "este convite não existe. Confira o link do e-mail ou peça um novo convite.";
  switch (statusDoConvite(c, agora)) {
    case "usado":
      return "este convite já foi usado. Entre com a conta criada por ele.";
    case "revogado":
      return "este convite foi revogado pela curadoria.";
    case "expirado":
      return `este convite venceu: ele vale ${DIAS_VALIDADE_CONVITE} dias. Peça um novo à curadoria.`;
    default:
      return null;
  }
}
