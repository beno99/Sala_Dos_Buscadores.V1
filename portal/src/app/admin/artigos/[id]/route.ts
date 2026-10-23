import { redirecionarRotaAntiga, rotaDoArtigo } from "@/server/admin/rotas";

/** Endereço antigo do editor de artigo: leva ao artigo dentro da Sala dele (308). */
export async function GET(pedido: Request, ctx: RouteContext<"/admin/artigos/[id]">) {
  const { id } = await ctx.params;
  return redirecionarRotaAntiga(pedido, () => rotaDoArtigo(id));
}
