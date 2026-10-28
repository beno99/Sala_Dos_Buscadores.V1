import { integer, pgTable, text } from "drizzle-orm/pg-core";
import type { TipoImagem } from "@/features/anfitriao/regras/imagem";

/* Metadados das imagens enviadas. Os bytes ficam no armazenamento S3 (Supabase Storage), pela chave. */
export const midias = pgTable("midias", {
  id: text("id").primaryKey(),
  /** Chave do objeto no bucket. */
  chave: text("chave").notNull(),
  tipo: text("tipo").notNull().$type<TipoImagem>(),
  tamanho: integer("tamanho").notNull(),
  /** Id da conta que enviou. */
  donoId: text("dono_id").notNull(),
  criadoEm: text("criado_em").notNull(),
}).enableRLS();
