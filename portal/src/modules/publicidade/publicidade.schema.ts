import { sql } from "drizzle-orm";
import { check, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { TipoImagem } from "@/features/anfitriao/regras/imagem";
import type { FormPublicidade } from "@/features/publicidade/tipos";
import { usuarios } from "@/modules/conta/conta.schema";

export const publicidadeImagens = pgTable(
  "publicidade_imagens",
  {
    id: text("id").primaryKey(),
    donoId: text("dono_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    chave: text("chave").notNull(),
    tipo: text("tipo").notNull().$type<TipoImagem>(),
    tamanho: integer("tamanho").notNull(),
    criadoEm: text("criado_em").notNull(),
  },
  (t) => [index("publicidade_imagens_dono_idx").on(t.donoId)],
).enableRLS();

export const anuncios = pgTable(
  "publicidade_anuncios",
  {
    id: text("id").primaryKey(),
    donoId: text("dono_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    status: text("status").notNull().$type<"rascunho" | "publicado">(),
    dados: jsonb("dados").notNull().$type<FormPublicidade>(),
    versao: integer("versao").notNull(),
    criadoEm: text("criado_em").notNull(),
    atualizadoEm: text("atualizado_em").notNull(),
  },
  (t) => [
    index("publicidade_anuncios_dono_idx").on(t.donoId),
    index("publicidade_anuncios_status_idx").on(t.status),
    check("publicidade_status_valido", sql`${t.status} in ('rascunho','publicado')`),
    check("publicidade_versao_positiva", sql`${t.versao} > 0`),
  ],
).enableRLS();
