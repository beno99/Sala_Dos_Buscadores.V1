import "server-only";
import { and, asc, count, desc, eq, gte, isNull, or } from "drizzle-orm";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { bloqueiosMensagens, mensagensCuradoria, mensagensDiretas } from "./conversa.schema";

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

export async function incluirMensagem(mensagem: typeof mensagensCuradoria.$inferInsert): Promise<void> {
  await banco().insert(mensagensCuradoria).values(mensagem);
}

export type MensagemDireta = typeof mensagensDiretas.$inferSelect;

export function mensagensDaConversa(conversa: string): Promise<MensagemDireta[]> {
  return banco()
    .select()
    .from(mensagensDiretas)
    .where(eq(mensagensDiretas.conversa, conversa))
    .orderBy(asc(mensagensDiretas.criadaEm));
}

/** Última mensagem de cada conversa da conta, da mais recente para a mais antiga. */
export function ultimasDiretasDaConta(contaId: string): Promise<MensagemDireta[]> {
  return banco()
    .selectDistinctOn([mensagensDiretas.conversa])
    .from(mensagensDiretas)
    .where(or(eq(mensagensDiretas.remetenteId, contaId), eq(mensagensDiretas.destinatarioId, contaId)))
    .orderBy(mensagensDiretas.conversa, desc(mensagensDiretas.criadaEm))
    .then((linhas) => linhas.sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)));
}

/** Não lidas pela conta, por remetente. */
export async function naoLidasPorRemetente(contaId: string): Promise<Map<string, number>> {
  const linhas = await banco()
    .select({ remetenteId: mensagensDiretas.remetenteId, total: count() })
    .from(mensagensDiretas)
    .where(and(eq(mensagensDiretas.destinatarioId, contaId), isNull(mensagensDiretas.lidaEm)))
    .groupBy(mensagensDiretas.remetenteId);
  return new Map(linhas.map((l) => [l.remetenteId, Number(l.total)]));
}

export async function enviadasDesde(remetenteId: string, desde: string): Promise<number> {
  const [linha] = await banco()
    .select({ total: count() })
    .from(mensagensDiretas)
    .where(and(eq(mensagensDiretas.remetenteId, remetenteId), gte(mensagensDiretas.criadaEm, desde)));
  return Number(linha?.total ?? 0);
}

export async function incluirMensagemDireta(m: MensagemDireta): Promise<void> {
  await banco().insert(mensagensDiretas).values(m);
}

export async function marcarLidas(conversa: string, destinatarioId: string): Promise<void> {
  await banco()
    .update(mensagensDiretas)
    .set({ lidaEm: new Date().toISOString() })
    .where(
      and(
        eq(mensagensDiretas.conversa, conversa),
        eq(mensagensDiretas.destinatarioId, destinatarioId),
        isNull(mensagensDiretas.lidaEm),
      ),
    );
}

export async function mensagemDireta(id: string): Promise<MensagemDireta | undefined> {
  const [m] = await banco().select().from(mensagensDiretas).where(eq(mensagensDiretas.id, id));
  return m;
}

/** Algum dos dois bloqueou o outro. */
export async function haBloqueio(a: string, b: string): Promise<boolean> {
  const [linha] = await banco()
    .select({ quemId: bloqueiosMensagens.quemId })
    .from(bloqueiosMensagens)
    .where(
      or(
        and(eq(bloqueiosMensagens.quemId, a), eq(bloqueiosMensagens.bloqueadoId, b)),
        and(eq(bloqueiosMensagens.quemId, b), eq(bloqueiosMensagens.bloqueadoId, a)),
      ),
    )
    .limit(1);
  return Boolean(linha);
}

export async function bloqueou(quemId: string, bloqueadoId: string): Promise<boolean> {
  const [linha] = await banco()
    .select({ quemId: bloqueiosMensagens.quemId })
    .from(bloqueiosMensagens)
    .where(and(eq(bloqueiosMensagens.quemId, quemId), eq(bloqueiosMensagens.bloqueadoId, bloqueadoId)))
    .limit(1);
  return Boolean(linha);
}

export async function definirBloqueio(quemId: string, bloqueadoId: string, bloquear: boolean): Promise<void> {
  if (bloquear)
    await banco()
      .insert(bloqueiosMensagens)
      .values({ quemId, bloqueadoId, criadoEm: new Date().toISOString() })
      .onConflictDoNothing();
  else
    await banco()
      .delete(bloqueiosMensagens)
      .where(and(eq(bloqueiosMensagens.quemId, quemId), eq(bloqueiosMensagens.bloqueadoId, bloqueadoId)));
}
