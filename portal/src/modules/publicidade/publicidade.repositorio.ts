import "server-only";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { validarPublicidade } from "@/features/publicidade/regras";
import type { Anuncio, AnuncioPublico, ResultadoPublicidade } from "@/features/publicidade/tipos";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { usuarios } from "@/modules/conta/conta.schema";
import { anuncios, publicidadeImagens } from "./publicidade.schema";

const recusa = (mensagem: string, erros?: Record<string, string>): ResultadoPublicidade => ({
  ok: false,
  mensagem,
  erros,
});
const anfitriaoAtivo = and(eq(usuarios.papel, "anfitriao"), isNotNull(usuarios.emailVerificadoEm));
const dominio = (linha: typeof anuncios.$inferSelect): Anuncio => {
  const { dados, ...meta } = linha;
  return { ...dados, ...meta };
};
export async function listarDoDono(donoId: string): Promise<Anuncio[]> {
  return (
    await banco()
      .select()
      .from(anuncios)
      .where(eq(anuncios.donoId, donoId))
      .orderBy(desc(anuncios.atualizadoEm))
  ).map(dominio);
}
export async function obterDoDono(id: string, donoId: string): Promise<Anuncio | undefined> {
  const [r] = await banco()
    .select()
    .from(anuncios)
    .where(and(eq(anuncios.id, id), eq(anuncios.donoId, donoId)));
  return r ? dominio(r) : undefined;
}
export async function listarPublicados(): Promise<AnuncioPublico[]> {
  const rows = await banco()
    .select({ id: anuncios.id, dados: anuncios.dados })
    .from(anuncios)
    .innerJoin(usuarios, eq(anuncios.donoId, usuarios.id))
    .where(and(eq(anuncios.status, "publicado"), anfitriaoAtivo))
    .orderBy(desc(anuncios.atualizadoEm));
  return rows.flatMap(({ id, dados }) =>
    Object.keys(validarPublicidade(dados, true).erros).length ? [] : [{ ...dados, id }],
  );
}
/** A URL aleatória não substitui a autorização: rascunhos e uploads soltos são privados. */
export async function imagemVisivel(id: string, leitorId: string) {
  const db = banco();
  const [imagem] = await db.select().from(publicidadeImagens).where(eq(publicidadeImagens.id, id));
  if (!imagem) return undefined;
  if (imagem.donoId === leitorId) return imagem;
  const [publicado] = await db
    .select({ id: anuncios.id })
    .from(anuncios)
    .innerJoin(usuarios, eq(anuncios.donoId, usuarios.id))
    .where(
      and(
        eq(anuncios.status, "publicado"),
        eq(anuncios.donoId, imagem.donoId),
        anfitriaoAtivo,
        sql`${anuncios.dados}->>'imagemId' = ${id}`,
      ),
    )
    .limit(1);
  return publicado ? imagem : undefined;
}
/** Sessão fornece donoId. O papel e a posse são reconferidos dentro da transação. */
export async function salvarAnuncio(donoId: string, entrada: unknown): Promise<ResultadoPublicidade> {
  if (!entrada || typeof entrada !== "object") return recusa("Pedido inválido.");
  const p = entrada as Record<string, unknown>;
  if (
    typeof p.id !== "string" ||
    !/^[a-zA-Z0-9_-]{16,100}$/.test(p.id) ||
    !Number.isInteger(p.versao) ||
    Number(p.versao) < 0 ||
    !["rascunho", "publicar", "salvar"].includes(String(p.acao))
  )
    return recusa("Pedido inválido. Reabra o editor.");
  const id = p.id;
  return banco().transaction(async (tx) => {
    // A linha da conta serializa gravações do mesmo dono, inclusive duas criações com o mesmo id.
    const [conta] = await tx.select().from(usuarios).where(eq(usuarios.id, donoId)).for("update");
    if (conta?.papel !== "anfitriao" || !conta.emailVerificadoEm)
      return recusa("Acesso restrito a anfitriões com conta confirmada.");
    const [anterior] = await tx.select().from(anuncios).where(eq(anuncios.id, id));
    if (anterior && anterior.donoId !== donoId) return recusa("Anúncio indisponível para esta conta.");
    if ((anterior?.versao ?? 0) !== p.versao)
      return recusa(
        "Este anúncio mudou em outra aba. Reabra a edição para carregar a versão atual; seu texto continua neste formulário.",
      );
    const publicar = p.acao === "publicar" || (p.acao === "salvar" && anterior?.status === "publicado");
    const { form, erros } = validarPublicidade(p.form, publicar);
    if (form.imagemId) {
      const [imagem] = await tx
        .select()
        .from(publicidadeImagens)
        .where(and(eq(publicidadeImagens.id, form.imagemId), eq(publicidadeImagens.donoId, donoId)));
      if (!imagem) erros.imagemId = "Envie uma imagem pela sua própria conta.";
    }
    if (Object.keys(erros).length)
      return recusa("Revise os campos indicados. Seus dados foram preservados.", erros);
    const agora = new Date().toISOString();
    const linha = {
      id,
      donoId,
      status: publicar ? ("publicado" as const) : ("rascunho" as const),
      dados: form,
      versao: Number(p.versao) + 1,
      criadoEm: anterior?.criadoEm ?? agora,
      atualizadoEm: agora,
    };
    if (anterior)
      await tx
        .update(anuncios)
        .set(linha)
        .where(and(eq(anuncios.id, id), eq(anuncios.donoId, donoId)));
    else {
      const inserted = await tx
        .insert(anuncios)
        .values(linha)
        .onConflictDoNothing()
        .returning({ id: anuncios.id });
      if (!inserted.length) return recusa("Não foi possível criar este anúncio. Reabra o formulário.");
    }
    return {
      ok: true,
      anuncio: dominio(linha),
      mensagem: publicar ? "Anúncio publicado no Portal." : "Rascunho salvo. Só você pode vê-lo.",
    };
  });
}
