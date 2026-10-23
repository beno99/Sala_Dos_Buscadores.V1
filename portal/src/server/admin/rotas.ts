import "server-only";
import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { acervo } from "../store";

/*
 * Endereços da curadoria a partir da Sala. Artigos e vídeos vivem dentro da
 * Sala (/admin/salas/[slug]/…); as rotas antigas (/admin/artigos, /admin/videos)
 * redirecionam para cá. Item de anfitrião vai para a revisão, nunca para um editor.
 */

export const rotaDaSala = (slug: string) => `/admin/salas/${slug}`;

function revisaoDoAnfitriao(salaSlug: string): string | null {
  const sala = [...acervo().salas.values()].find((s) => s.slug === salaSlug);
  return sala?.revisao ? `/admin/anfitrioes/${sala.revisao.donoId}/salas/${sala.id}` : null;
}

export function rotaDoArtigo(id: string, previa = false): string | null {
  const a = acervo().conteudos.get(id);
  if (!a) return null;
  if (a.revisao) return revisaoDoAnfitriao(a.sala);
  return `${rotaDaSala(a.sala)}/artigos/${id}${previa ? "/previa" : ""}`;
}

export function rotaDoVideo(id: string): string | null {
  const v = acervo().videos.get(id);
  return v ? `${rotaDaSala(v.sala)}/videos/${id}` : null;
}

/**
 * A Sala oficial da rota /admin/salas/[slug]/…: inexistente é 404; de
 * anfitrião vai para a revisão (somente leitura), nunca para um editor.
 */
export function salaOficialDaRota(slug: string) {
  const sala = [...acervo().salas.values()].find((s) => s.slug === slug);
  if (!sala) notFound();
  if (sala.origem !== "oficial") {
    const revisao = revisaoDoAnfitriao(slug);
    if (revisao) redirect(revisao as Route);
    notFound();
  }
  return structuredClone(sala);
}

/**
 * Resposta das rotas antigas (/admin/artigos…, /admin/videos…): redirecionamento
 * permanente (308) no servidor. Sem papel de administrador, vai para /admin
 * (que mostra "Acesso restrito"), sem revelar em que Sala o item está.
 */
export async function redirecionarRotaAntiga(
  pedido: Request,
  destino: () => string | null,
): Promise<Response> {
  const { membroAtual } = await import("../sessao");
  const conta = await membroAtual();
  const alvo = conta?.papel === "administrador" ? destino() : "/admin";
  if (!alvo) return new Response("Erro: este item não existe mais.", { status: 404 });
  return Response.redirect(new URL(alvo, pedido.url), 308);
}
