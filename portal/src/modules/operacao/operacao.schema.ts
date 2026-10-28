import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { AcaoAuditada, RegistroAuditoria, TipoItemAuditado } from "@/data/types";

/* Histórico de auditoria (RNF-04, só inclusão) e caixa de saída de e-mails. */

export const auditoria = pgTable(
  "auditoria",
  {
    id: text("id").primaryKey(),
    quando: text("quando").notNull(),
    quem: text("quem").notNull(),
    acao: text("acao").notNull().$type<AcaoAuditada>(),
    tipoItem: text("tipo_item").notNull().$type<TipoItemAuditado>(),
    itemId: text("item_id").notNull(),
    itemTitulo: text("item_titulo").notNull(),
    mudancas: jsonb("mudancas").$type<NonNullable<RegistroAuditoria["mudancas"]>>(),
  },
  (t) => [index("auditoria_item_idx").on(t.itemId)],
).enableRLS();

export const emailsEnviados = pgTable("emails_enviados", {
  id: text("id").primaryKey(),
  para: text("para").notNull(),
  assunto: text("assunto").notNull(),
  corpo: text("corpo").notNull(),
  quando: text("quando").notNull(),
}).enableRLS();
