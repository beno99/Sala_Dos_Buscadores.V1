import { index, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { Anexo } from "@/features/conversa/regras/mensagem";
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
    anexos: jsonb("anexos").notNull().default([]).$type<Anexo[]>(),
    criadaEm: text("criada_em").notNull(),
  },
  (t) => [index("mensagens_curadoria_anfitriao_idx").on(t.anfitriaoId, t.criadaEm)],
).enableRLS();

/* Mensagens diretas entre duas contas quaisquer. `conversa` é o par de ids em ordem ("a:b"). Só os dois leem. */
export const mensagensDiretas = pgTable(
  "mensagens_diretas",
  {
    id: text("id").primaryKey(),
    conversa: text("conversa").notNull(),
    remetenteId: text("remetente_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    destinatarioId: text("destinatario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    texto: text("texto").notNull(),
    anexos: jsonb("anexos").notNull().default([]).$type<Anexo[]>(),
    criadaEm: text("criada_em").notNull(),
    lidaEm: text("lida_em"),
  },
  (t) => [
    index("mensagens_diretas_conversa_idx").on(t.conversa, t.criadaEm),
    index("mensagens_diretas_destinatario_idx").on(t.destinatarioId, t.lidaEm),
    index("mensagens_diretas_remetente_idx").on(t.remetenteId, t.criadaEm),
  ],
).enableRLS();

/* Quem bloqueou quem: nenhum dos dois manda mensagem direta ao outro enquanto existir. */
export const bloqueiosMensagens = pgTable(
  "bloqueios_mensagens",
  {
    quemId: text("quem_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    bloqueadoId: text("bloqueado_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    criadoEm: text("criado_em").notNull(),
  },
  (t) => [primaryKey({ columns: [t.quemId, t.bloqueadoId] })],
).enableRLS();
