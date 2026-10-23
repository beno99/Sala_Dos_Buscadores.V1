import { redirecionarRotaAntiga, rotaDoVideo } from "@/server/admin/rotas";

/** Endereço antigo do editor de vídeo: leva ao vídeo dentro da Sala dele (308). */
export async function GET(pedido: Request, ctx: RouteContext<"/admin/videos/[id]">) {
  const { id } = await ctx.params;
  return redirecionarRotaAntiga(pedido, () => rotaDoVideo(id));
}
