import { sql } from "drizzle-orm";
import type { Banco } from "./cliente";
import { versaoDados } from "./versao.schema";

/** Soma 1 na versão dos dados (na mesma transação da gravação) e devolve a nova. */
export async function somarVersao(tx: Pick<Banco, "insert">): Promise<number> {
  const [linha] = await tx
    .insert(versaoDados)
    .values({ id: 1, versao: 1 })
    .onConflictDoUpdate({ target: versaoDados.id, set: { versao: sql`${versaoDados.versao} + 1` } })
    .returning();
  return linha?.versao ?? 0;
}
