import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { ProgressoEstudo } from "@/features/estudo/tipos";
import { usuarios } from "@/modules/conta/conta.schema";

/* Dados privados de cada conta: progresso de estudo e perfil do buscador. */

export const progressoEstudo = pgTable("progresso_estudo", {
  usuarioId: text("usuario_id")
    .primaryKey()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  // ponytail: o progresso inteiro num jsonb (só a própria conta lê e grava, sempre inteiro); normalizar se houver relatório entre contas.
  dados: jsonb("dados").notNull().$type<ProgressoEstudo>(),
}).enableRLS();

export const perfisBuscador = pgTable("perfis_buscador", {
  usuarioId: text("usuario_id")
    .primaryKey()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  fotoId: text("foto_id"),
  capaId: text("capa_id"),
  sobre: text("sobre").notNull().default(""),
}).enableRLS();
