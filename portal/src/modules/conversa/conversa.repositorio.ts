import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { mensagensCuradoria } from "./conversa.schema";

export type MensagemCuradoria = typeof mensagensCuradoria.$inferSelect;

export function mensagensDoAnfitriao(anfitriaoId: string): Promise<MensagemCuradoria[]> {
  return banco()
    .select()
    .from(mensagensCuradoria)
    .where(eq(mensagensCuradoria.anfitriaoId, anfitriaoId))
    .orderBy(asc(mensagensCuradoria.criadaEm));
}

/** Última mensagem de cada conversa, da mais recente para a mais antiga. */
export function ultimasMensagens(): Promise<MensagemCuradoria[]> {
  return banco()
    .selectDistinctOn([mensagensCuradoria.anfitriaoId])
    .from(mensagensCuradoria)
    .orderBy(mensagensCuradoria.anfitriaoId, desc(mensagensCuradoria.criadaEm))
    .then((linhas) => linhas.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)));
}

export async function incluirMensagem(mensagem: MensagemCuradoria): Promise<void> {
  await banco().insert(mensagensCuradoria).values(mensagem);
}
