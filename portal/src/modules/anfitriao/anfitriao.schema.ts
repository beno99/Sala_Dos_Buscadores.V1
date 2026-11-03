import { index, integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
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

export const statusAnuncioEnum = pgEnum("status_anuncio", ["rascunho", "publicado"]);

/* Publicidade do anfitrião no Portal. Rascunho só o dono vê; publicado aparece no Portal. */
export const anuncios = pgTable(
  "anuncios",
  {
    id: text("id").primaryKey(),
    donoId: text("dono_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    status: statusAnuncioEnum("status").notNull(),
    midia: text("midia"),
    focoX: integer("foco_x").notNull().default(50),
    focoY: integer("foco_y").notNull().default(50),
    alt: text("alt").notNull().default(""),
    categoria: text("categoria").notNull().default(""),
    titulo: text("titulo").notNull().default(""),
    descricao: text("descricao").notNull().default(""),
    href: text("href").notNull().default(""),
    chamada: text("chamada").notNull().default(""),
    anunciante: text("anunciante").notNull().default(""),
    criadoEm: text("criado_em").notNull(),
    atualizadoEm: text("atualizado_em").notNull(),
    publicadoEm: text("publicado_em"),
  },
  (t) => [index("anuncios_dono_idx").on(t.donoId)],
).enableRLS();
