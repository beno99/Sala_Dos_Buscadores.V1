import { boolean, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { Publicacao, TemaSlug } from "@/data/types";

/* Comunidade: publicações, comentários, reações, quem segue quem, salvos e denúncias. */

export const publicacoes = pgTable("publicacoes", {
  id: text("id").primaryKey(),
  autorId: text("autor_id").notNull(),
  tipo: text("tipo").notNull().$type<Publicacao["tipo"]>(),
  texto: text("texto").notNull(),
  salaSlug: text("sala_slug"),
  temas: text("temas").array().notNull().$type<TemaSlug[]>(),
  imagem: jsonb("imagem").$type<NonNullable<Publicacao["imagem"]>>(),
  citacao: jsonb("citacao").$type<NonNullable<Publicacao["citacao"]>>(),
  conteudoId: text("conteudo_id"),
  perguntaDirigidaA: text("pergunta_dirigida_a"),
  respostaQueAjudouId: text("resposta_que_ajudou_id"),
  fixada: boolean("fixada").notNull(),
  estado: text("estado").notNull().$type<Publicacao["estado"]>(),
  criadaEm: text("criada_em").notNull(),
  editadaEm: text("editada_em"),
}).enableRLS();

export const comentarios = pgTable("comentarios", {
  id: text("id").primaryKey(),
  publicacaoId: text("publicacao_id")
    .notNull()
    .references(() => publicacoes.id, { onDelete: "cascade" }),
  autorId: text("autor_id").notNull(),
  paiId: text("pai_id"),
  texto: text("texto").notNull(),
  imagem: jsonb("imagem").$type<{ src: string; alt: string }>(),
  estado: text("estado").notNull().$type<Publicacao["estado"]>(),
  criadaEm: text("criada_em").notNull(),
}).enableRLS();

export const reacoes = pgTable(
  "reacoes",
  {
    alvoTipo: text("alvo_tipo").notNull().$type<"publicacao" | "comentario">(),
    alvoId: text("alvo_id").notNull(),
    pessoa: text("pessoa").notNull(),
    tipo: text("tipo").notNull().$type<"curtir" | "util" | "pensar" | "aprofundar">(),
  },
  (t) => [primaryKey({ columns: [t.alvoTipo, t.alvoId, t.pessoa, t.tipo] })],
).enableRLS();

export const seguindo = pgTable(
  "seguindo",
  {
    seguidor: text("seguidor").notNull(),
    alvoTipo: text("alvo_tipo").notNull().$type<"pessoa" | "sala">(),
    alvoId: text("alvo_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.seguidor, t.alvoTipo, t.alvoId] })],
).enableRLS();

export const salvos = pgTable(
  "salvos",
  {
    pessoa: text("pessoa").notNull(),
    publicacaoId: text("publicacao_id").notNull(),
    criadoEm: text("criado_em").notNull(),
  },
  (t) => [primaryKey({ columns: [t.pessoa, t.publicacaoId] })],
).enableRLS();

export const denuncias = pgTable("denuncias", {
  id: text("id").primaryKey(),
  denuncianteId: text("denunciante_id").notNull(),
  alvoTipo: text("alvo_tipo").notNull().$type<"publicacao" | "comentario">(),
  alvoId: text("alvo_id").notNull(),
  motivo: text("motivo").notNull(),
  nota: text("nota"),
  estado: text("estado").notNull().$type<"pendente" | "procedente" | "improcedente">(),
  criadaEm: text("criada_em").notNull(),
  decididaPor: text("decidida_por"),
  motivoDecisao: text("motivo_decisao"),
}).enableRLS();
