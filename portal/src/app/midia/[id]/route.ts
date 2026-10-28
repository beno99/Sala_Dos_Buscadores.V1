import { obterMidia } from "@/server/midia";
import { membroAtual } from "@/server/sessao";

/*
 * Serve as imagens enviadas por anfitriões. Como todo o portal, exige conta
 * (o proxy já manda quem não tem sessão para /entrar). O id é aleatório e
 * longo; o tipo servido é o que os magic bytes indicaram no envio.
 */
export async function GET(_pedido: Request, { params }: RouteContext<"/midia/[id]">) {
  if (!(await membroAtual())) return new Response("Erro: entre para ver esta imagem.", { status: 401 });
  const { id } = await params;
  const midia = await obterMidia(id);
  if (!midia) return new Response("Erro: imagem não encontrada.", { status: 404 });
  return new Response(new Uint8Array(midia.bytes), {
    headers: {
      "Content-Type": midia.tipo,
      "Content-Length": String(midia.bytes.byteLength),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
