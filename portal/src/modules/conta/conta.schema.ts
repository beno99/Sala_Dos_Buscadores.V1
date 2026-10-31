import { index, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import type { Preferencias } from "@/features/onboarding/preferencias";

export const papelEnum = pgEnum("papel", ["membro", "anfitriao", "administrador"]);

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  /** Sempre minúsculo e sem espaços (normalizado no repositório). */
  email: text("email").notNull().unique(),
  senhaHash: text("senha_hash").notNull(),
  pseudonimo: text("pseudonimo").notNull(),
  papel: papelEnum("papel").notNull().default("membro"),
  membroDesde: timestamp("membro_desde", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  /** null até o onboarding; a convicção só entra com consentimento (LGPD art. 11). */
  preferencias: jsonb("preferencias").$type<Preferencias>(),
  /** null até confirmar o e-mail; o cadastro é obrigatório, mas o acesso ao app também é (RF-01). */
  emailVerificadoEm: timestamp("email_verificado_em", { withTimezone: true, mode: "string" }),
}).enableRLS();

export const sessoes = pgTable(
  "sessoes",
  {
    /** sha256 do token do cookie: o banco nunca guarda o token em si. */
    tokenHash: text("token_hash").primaryKey(),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    criadaEm: timestamp("criada_em", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    expiraEm: timestamp("expira_em", { withTimezone: true, mode: "string" }).notNull(),
  },
  (t) => [index("sessoes_usuario_idx").on(t.usuarioId)],
).enableRLS();

export const redefinicoesSenha = pgTable(
  "redefinicoes_senha",
  {
    tokenHash: text("token_hash").primaryKey(),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    expiraEm: timestamp("expira_em", { withTimezone: true, mode: "string" }).notNull(),
  },
  (t) => [index("redefinicoes_usuario_idx").on(t.usuarioId)],
).enableRLS();

export const verificacoesEmail = pgTable(
  "verificacoes_email",
  {
    tokenHash: text("token_hash").primaryKey(),
    usuarioId: text("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    expiraEm: timestamp("expira_em", { withTimezone: true, mode: "string" }).notNull(),
  },
  (t) => [index("verificacoes_usuario_idx").on(t.usuarioId)],
).enableRLS();
