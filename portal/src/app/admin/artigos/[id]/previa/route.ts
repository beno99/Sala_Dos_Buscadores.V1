import { redirecionarRotaAntiga, rotaDoArtigo } from "@/server/admin/rotas";

/** Endereço antigo da prévia: leva à prévia dentro da Sala (308). */
export async function GET(pedido: Request, ctx: RouteContext<"/admin/artigos/[id]/previa">) {
  const { id } = await ctx.params;
  return redirecionarRotaAntiga(pedido, () => rotaDoArtigo(id, true));
}
