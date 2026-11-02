import "server-only";
import { asc, eq } from "drizzle-orm";
import type { ProgressoEstudo } from "@/features/estudo/tipos";
import type { Banco } from "@/modules/compartilhado/banco/cliente";
import { publicacoes } from "@/modules/comunidade/comunidade.schema";
import { progressoEstudo } from "@/modules/estudo/estudo.schema";
import type { Gravacao } from "./acervo.contratos";
import { conteudos, destaques, salas, videos } from "./acervo.schema";

/** Protocolo único de escrita de referências e remoção: Sala → artigo → vídeo. */
export async function bloquearAcervoReferenciado(tx: Pick<Banco, "select">) {
  const ss = await tx.select().from(salas).orderBy(asc(salas.id)).for("update");
  const cs = await tx.select().from(conteudos).orderBy(asc(conteudos.id)).for("update");
  const vs = await tx.select().from(videos).orderBy(asc(videos.id)).for("update");
  return { ss, cs, vs };
}

type Referencia = { tipo: "sala" | "conteudo" | "video"; ref: string };
export function referenciasProgresso(dados: ProgressoEstudo): Referencia[] {
  return [
    ...(dados.salasVisitadas ?? []).map((ref) => ({ tipo: "sala" as const, ref })),
    ...Object.keys(dados.trilhas ?? {}).map((ref) => ({ tipo: "sala" as const, ref })),
    ...(dados.leituras ?? []).map((l) => ({ tipo: "conteudo" as const, ref: `${l.sala}/${l.slug}` })),
    ...(dados.estante ?? []),
    ...(dados.continuarDispensado ? [{ tipo: "conteudo" as const, ref: dados.continuarDispensado }] : []),
  ];
}
export function progressoReferenciaArtigo(
  dados: ProgressoEstudo,
  artigo: { id: string; sala: string; slug: string },
) {
  return (
    referenciasProgresso(dados).some(
      (r) => r.tipo === "conteudo" && r.ref === `${artigo.sala}/${artigo.slug}`,
    ) || JSON.stringify(dados).includes(artigo.id)
  );
}
export function progressoReferenciaSala(dados: ProgressoEstudo, slug: string) {
  return (
    referenciasProgresso(dados).some(
      (r) => (r.tipo === "sala" && r.ref === slug) || (r.tipo === "conteudo" && r.ref.startsWith(`${slug}/`)),
    ) || JSON.stringify(dados).includes(slug)
  );
}

/** Valida apenas referências adicionadas; histórico oculto não impede editar/moderar/remover. */
export async function validarNovasReferencias(tx: Pick<Banco, "select">, g: Gravacao) {
  if (
    !(g.tipo === "gravar" && (g.colecao === "progresso" || g.colecao === "publicacoes")) &&
    !(g.tipo === "seguir" && g.acao === "incluir" && g.valor.alvo.tipo === "sala") &&
    g.tipo !== "destaques"
  )
    return;
  const { ss, cs, vs } = await bloquearAcervoReferenciado(tx);
  const salaVisivel = (slug: string) =>
    ss.some((s) => s.slug === slug && !s.lixeira && s.status === "publicado") &&
    cs.some((c) => c.sala === slug && !c.lixeira && c.status === "publicado");
  const conferir = (r: Referencia) => {
    const valido =
      r.tipo === "sala"
        ? salaVisivel(r.ref)
        : r.tipo === "video"
          ? vs.some((v) => v.id === r.ref && v.status === "publicado" && salaVisivel(v.sala))
          : cs.some(
              (c) =>
                `${c.sala}/${c.slug}` === r.ref &&
                !c.lixeira &&
                c.status === "publicado" &&
                salaVisivel(c.sala),
            );
    if (!valido)
      throw new Error("A referência não está mais disponível. Atualize a página antes de continuar.");
  };
  if (g.tipo === "seguir") {
    conferir({ tipo: "sala", ref: g.valor.alvo.id });
    return;
  }
  if (g.tipo === "gravar" && g.colecao === "progresso") {
    const [anterior] = await tx
      .select()
      .from(progressoEstudo)
      .where(eq(progressoEstudo.usuarioId, g.id))
      .for("update");
    const antigas = new Set(
      anterior ? referenciasProgresso(anterior.dados).map((r) => `${r.tipo}:${r.ref}`) : [],
    );
    for (const r of referenciasProgresso(g.valor)) if (!antigas.has(`${r.tipo}:${r.ref}`)) conferir(r);
  }
  if (g.tipo === "gravar" && g.colecao === "publicacoes") {
    const [anterior] = await tx.select().from(publicacoes).where(eq(publicacoes.id, g.id)).for("update");
    if (g.valor.salaSlug && g.valor.salaSlug !== anterior?.salaSlug)
      conferir({ tipo: "sala", ref: g.valor.salaSlug });
    if (g.valor.conteudoId && g.valor.conteudoId !== anterior?.conteudoId) {
      const c = cs.find((c) => c.id === g.valor.conteudoId);
      if (!c) throw new Error("O artigo relacionado não existe mais.");
      conferir({ tipo: "conteudo", ref: `${c.sala}/${c.slug}` });
    }
    if (g.valor.videoId && g.valor.videoId !== anterior?.videoId)
      conferir({ tipo: "video", ref: g.valor.videoId });
  }
  if (g.tipo === "destaques") {
    const [anterior] = await tx.select().from(destaques).where(eq(destaques.id, 1)).for("update");
    const antigos = new Set(Object.values(anterior?.escolha ?? {}).flat());
    for (const id of [...g.valor.artigos, ...g.valor.cards].filter((id): id is string => Boolean(id))) {
      if (antigos.has(id)) continue;
      const c = cs.find((c) => c.id === id);
      if (!c) throw new Error("O conteúdo de destaque não existe mais.");
      conferir({ tipo: "conteudo", ref: `${c.sala}/${c.slug}` });
    }
    for (const id of g.valor.video) if (id && !antigos.has(id)) conferir({ tipo: "video", ref: id });
  }
}
