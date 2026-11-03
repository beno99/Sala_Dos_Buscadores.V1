import { armazenamentoS3 } from "@/modules/midia/armazenamento.s3";
import { imagemVisivel } from "@/modules/publicidade/publicidade.repositorio";
import { membroAtual } from "@/server/sessao";

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const membro = await membroAtual();
    if (!membro) return new Response("Entre para ver esta imagem.", { status: 401 });
    const { id } = await params;
    const imagem = await imagemVisivel(id, membro.id);
    if (!imagem) return new Response("Imagem indisponível.", { status: 404 });
    const bytes = await armazenamentoS3.baixar(imagem.chave);
    if (!bytes) return new Response("Imagem indisponível.", { status: 404 });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": imagem.tipo,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Imagem temporariamente indisponível.", { status: 503 });
  }
}
