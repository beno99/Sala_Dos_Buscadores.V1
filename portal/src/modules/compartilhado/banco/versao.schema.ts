import { bigint, integer, pgTable } from "drizzle-orm/pg-core";

/**
 * Versão do conjunto de dados: toda gravação do acervo ou das contas soma 1.
 * Cada instância do servidor compara com a sua e recarrega o snapshot
 * (src/server/store.ts) quando outra gravou.
 */
export const versaoDados = pgTable("versao_dados", {
  id: integer("id").primaryKey().default(1),
  versao: bigint("versao", { mode: "number" }).notNull().default(0),
}).enableRLS();
