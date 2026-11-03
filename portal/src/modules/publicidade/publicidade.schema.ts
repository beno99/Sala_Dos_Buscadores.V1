import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import type { RevisaoAnfitriao } from "@/data/types";
import { statusEditorialEnum } from "@/modules/acervo/acervo.schema";

/*
 * Anúncios enviados por anfitriões. Nada vai ao ar sem a aprovação da
 * curadoria; a decisão fica em `revisao`, como nas Salas e nos artigos.
 */
export const anuncios = pgTable(
  "anuncios",
  {
    id: text("id").primaryKey(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull(),
    categoria: text("categoria"),
    href: text("href").notNull(),
    anunciante: text("anunciante").notNull(),
    chamada: text("chamada").notNull(),
    textoAlternativo: text("texto_alternativo").notNull(),
    /** Id da mídia enviada (S3) e o endereço servido por /midia/[id]. */
    midia: text("midia"),
    imagem: text("imagem"),
    publicadoEm: text("publicado_em"),
    status: statusEditorialEnum("status").notNull(),
    criadoEm: text("criado_em").notNull(),
    atualizadoEm: text("atualizado_em").notNull(),
    criadoPor: text("criado_por").notNull(),
    atualizadoPor: text("atualizado_por").notNull(),
    /** O mesmo de revisao.donoId, para consultas. */
    donoId: text("dono_id").notNull(),
    revisao: jsonb("revisao").notNull().$type<RevisaoAnfitriao>(),
  },
  (t) => [index("anuncios_dono_idx").on(t.donoId), index("anuncios_status_idx").on(t.status)],
).enableRLS();
