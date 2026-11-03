import { index, pgTable, text } from "drizzle-orm/pg-core";
import { usuarios } from "@/modules/conta/conta.schema";

/* Conversa entre cada anfitrião e a curadoria: uma linha por mensagem, sem edição nem exclusão. */

export const mensagensCuradoria = pgTable(
  "mensagens_curadoria",
  {
    id: text("id").primaryKey(),
    anfitriaoId: text("anfitriao_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    autorId: text("autor_id").notNull(),
    texto: text("texto").notNull(),
    criadaEm: text("criada_em").notNull(),
  },
  (t) => [index("mensagens_curadoria_anfitriao_idx").on(t.anfitriaoId, t.criadaEm)],
).enableRLS();
