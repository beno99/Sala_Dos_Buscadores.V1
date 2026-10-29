import { boolean, index, integer, jsonb, pgEnum, pgTable, text, unique } from "drizzle-orm/pg-core";
import type {
  AssinaturaAnfitriao,
  Autoria,
  BlocoCorpo,
  Citacao,
  LinkArtigo,
  RevisaoAnfitriao,
  SituacaoJuridica,
  TemaSlug,
} from "@/data/types";
import type { EscolhaDestaques } from "@/features/destaques/vagas";

/* Acervo editorial (DRS 5.2/5.3): Salas, conteúdos, citações, vídeos, fontes e a escolha de Destaques. */

export const placaEnum = pgEnum("placa", ["bordo", "grafite", "bege"]);
export const origemSalaEnum = pgEnum("origem_sala", ["oficial", "anfitriao"]);
export const statusEditorialEnum = pgEnum("status_editorial", [
  "rascunho",
  "em_revisao",
  "publicado",
  "reprovado",
  "arquivado",
]);
export const provenienciaEnum = pgEnum("proveniencia", [
  "primaria",
  "curado",
  "especialista",
  "comunidade",
  "ia",
  "anfitriao",
]);
export const tipoConteudoEnum = pgEnum("tipo_conteudo", ["artigo", "fonte-primaria", "verbete", "video"]);
export const formatoEnum = pgEnum("formato", ["texto", "video"]);

/** Datas como o domínio as usa: ISO em texto (instantes) ou AAAA-MM-DD (dias editoriais). */
const meta = {
  status: statusEditorialEnum("status").notNull(),
  criadoEm: text("criado_em").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
  criadoPor: text("criado_por").notNull(),
  atualizadoPor: text("atualizado_por").notNull(),
};

export const salas = pgTable(
  "salas",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    nome: text("nome").notNull(),
    tradicao: text("tradicao").notNull(),
    tradicaoCurta: text("tradicao_curta").notNull(),
    descricao: text("descricao").notNull(),
    periodo: text("periodo").notNull(),
    placa: placaEnum("placa").notNull(),
    atualizadaEm: text("atualizada_em").notNull(),
    inicial: text("inicial").notNull(),
    origem: origemSalaEnum("origem").notNull(),
    naComparacao: boolean("na_comparacao").notNull(),
    imagem: text("imagem"),
    link: text("link"),
    anfitriao: jsonb("anfitriao").$type<AssinaturaAnfitriao>(),
    ...meta,
    /** Dono da Sala de anfitrião (o mesmo de revisao.donoId), para consultas. */
    donoId: text("dono_id"),
    revisao: jsonb("revisao").$type<RevisaoAnfitriao>(),
    publicadaEm: text("publicada_em"),
    statusAntesDeArquivar: statusEditorialEnum("status_antes_de_arquivar"),
    midia: text("midia"),
  },
  (t) => [index("salas_dono_idx").on(t.donoId)],
).enableRLS();

export const conteudos = pgTable(
  "conteudos",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    /** Slug da Sala (o domínio endereça conteúdo por "sala/slug"). */
    sala: text("sala")
      .notNull()
      .references(() => salas.slug, { onUpdate: "cascade" }),
    tipo: tipoConteudoEnum("tipo").notNull(),
    titulo: text("titulo").notNull(),
    resumo: text("resumo").notNull(),
    temas: text("temas").array().notNull().$type<TemaSlug[]>(),
    periodo: text("periodo").notNull(),
    nivel: integer("nivel").notNull().$type<1 | 2 | 3>(),
    formato: formatoEnum("formato").notNull(),
    proveniencia: provenienciaEnum("proveniencia").notNull(),
    duracaoMin: integer("duracao_min").notNull(),
    autoria: jsonb("autoria").notNull().$type<Autoria>(),
    publicadoEm: text("publicado_em").notNull(),
    corpo: jsonb("corpo").notNull().$type<BlocoCorpo[]>(),
    citacao: text("citacao"),
    /** Ids de fontes, na ordem citada. */
    fontes: text("fontes").array().notNull(),
    link: jsonb("link").$type<LinkArtigo>(),
    imagem: text("imagem"),
    thumb: text("thumb"),
    anfitriao: jsonb("anfitriao").$type<AssinaturaAnfitriao>(),
    ...meta,
    situacaoJuridica: jsonb("situacao_juridica").$type<SituacaoJuridica>(),
    temaDivergente: boolean("tema_divergente").notNull(),
    notaDivergencia: text("nota_divergencia").notNull(),
    producaoIA: boolean("producao_ia").notNull(),
    donoId: text("dono_id"),
    revisao: jsonb("revisao").$type<RevisaoAnfitriao>(),
    midias: jsonb("midias").$type<{ card?: string; thumb?: string }>(),
  },
  (t) => [unique("conteudos_sala_slug_un").on(t.sala, t.slug), index("conteudos_dono_idx").on(t.donoId)],
).enableRLS();

export const citacoes = pgTable("citacoes", {
  id: text("id").primaryKey(),
  sala: text("sala")
    .notNull()
    .references(() => salas.slug, { onUpdate: "cascade" }),
  obra: text("obra").notNull(),
  localizacao: text("localizacao").notNull(),
  proveniencia: provenienciaEnum("proveniencia").notNull(),
  rotuloSelo: text("rotulo_selo"),
  original: jsonb("original").$type<NonNullable<Citacao["original"]>>(),
  traducao: text("traducao").notNull(),
  rotuloTraducao: text("rotulo_traducao"),
  referencia: text("referencia").notNull(),
  capa: placaEnum("capa").notNull(),
  inicial: text("inicial").notNull(),
}).enableRLS();

export const videos = pgTable("videos", {
  id: text("id").primaryKey(),
  sala: text("sala")
    .notNull()
    .references(() => salas.slug, { onUpdate: "cascade" }),
  titulo: text("titulo").notNull(),
  duracao: text("duracao").notNull(),
  tema: text("tema").notNull().$type<TemaSlug>(),
  nivel: integer("nivel").notNull().$type<1 | 2 | 3>(),
  episodio: text("episodio").notNull(),
  publicadoEm: text("publicado_em").notNull(),
  url: text("url").notNull(),
  placa: placaEnum("placa").notNull(),
  imagem: text("imagem"),
  youtubeId: text("youtube_id").notNull(),
  /** Ids dos conteúdos da mesma Sala ligados ao vídeo. */
  artigos: text("artigos").array().notNull(),
  ...meta,
}).enableRLS();

export const temas = pgTable("temas", {
  slug: text("slug").primaryKey(),
  nome: text("nome").notNull(),
  sinonimos: text("sinonimos").array().notNull(),
  criadoEm: text("criado_em").notNull(),
  criadoPor: text("criado_por").notNull(),
}).enableRLS();

export const fontes = pgTable("fontes", {
  id: text("id").primaryKey(),
  titulo: text("titulo").notNull(),
  autor: text("autor").notNull(),
  tradicao: text("tradicao").notNull(),
  tipo: text("tipo").notNull(),
  referencia: text("referencia").notNull(),
  url: text("url"),
  capa: placaEnum("capa").notNull(),
  inicial: text("inicial").notNull(),
  criadoEm: text("criado_em").notNull(),
  atualizadoEm: text("atualizado_em").notNull(),
  criadoPor: text("criado_por").notNull(),
  atualizadoPor: text("atualizado_por").notNull(),
  /** Fonte proposta por anfitrião (só ele a vê até o artigo que a usa ser aprovado). */
  proposta: jsonb("proposta").$type<{ donoId: string; pendente: boolean }>(),
}).enableRLS();

/** Escolha da curadoria para as vagas de Destaques (linha única). */
export const destaques = pgTable("destaques", {
  id: integer("id").primaryKey().default(1),
  escolha: jsonb("escolha").notNull().$type<EscolhaDestaques>(),
}).enableRLS();
