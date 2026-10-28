import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { usuarios } from "@/modules/conta/conta.schema";

/* Anfitriões: perfil público, candidaturas e convites. */

export const statusCandidaturaEnum = pgEnum("status_candidatura", ["pendente", "aprovada", "recusada"]);
export const statusConviteEnum = pgEnum("status_convite", ["pendente", "usado", "revogado"]);

export const perfisAnfitriao = pgTable("perfis_anfitriao", {
  contaId: text("conta_id")
    .primaryKey()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  slug: text("slug").notNull().unique(),
  credencial: text("credencial").notNull(),
  apresentacao: text("apresentacao").notNull(),
  avatar: text("avatar"),
  link: text("link"),
  atualizadoEm: text("atualizado_em").notNull(),
}).enableRLS();

export const candidaturas = pgTable("candidaturas", {
  id: text("id").primaryKey(),
  contaId: text("conta_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  nome: text("nome").notNull(),
  credencial: text("credencial").notNull(),
  apresentacao: text("apresentacao").notNull(),
  link: text("link"),
  status: statusCandidaturaEnum("status").notNull(),
  enviadaEm: text("enviada_em").notNull(),
  decididaEm: text("decidida_em"),
  decididaPor: text("decidida_por"),
  motivo: text("motivo"),
}).enableRLS();

export const convites = pgTable("convites", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  criadoEm: text("criado_em").notNull(),
  expiraEm: text("expira_em").notNull(),
  criadoPor: text("criado_por").notNull(),
  status: statusConviteEnum("status").notNull(),
  usadoEm: text("usado_em"),
  revogadoEm: text("revogado_em"),
}).enableRLS();
