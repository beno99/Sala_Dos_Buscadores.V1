import { LIMITE_IMAGEM_BYTES } from "@/features/anfitriao/regras/imagem";
import { enviarImagemPublicidade } from "@/modules/publicidade/imagens";
import { membroAtual } from "@/server/sessao";
import { indisponivel, mesmaOrigem } from "../http";

export async function POST(pedido: Request) {
  if (!mesmaOrigem(pedido))
    return Response.json({ ok: false, mensagem: "Origem do pedido inválida." }, { status: 403 });
  try {
    const membro = await membroAtual();
    if (membro?.papel !== "anfitriao")
      return Response.json({ ok: false, mensagem: "Entre com sua conta de anfitrião." }, { status: 403 });
    if (Number(pedido.headers.get("content-length") ?? 0) > LIMITE_IMAGEM_BYTES + 65536)
      return Response.json({ ok: false, mensagem: "O arquivo ultrapassa 5 MB." }, { status: 413 });
    let arquivo: FormDataEntryValue | null;
    try {
      arquivo = (await pedido.formData()).get("arquivo");
    } catch {
      return Response.json({ ok: false, mensagem: "Escolha uma imagem válida." }, { status: 400 });
    }
    if (!(arquivo instanceof Blob))
      return Response.json({ ok: false, mensagem: "Escolha a imagem do produto." }, { status: 400 });
    if (arquivo.size > LIMITE_IMAGEM_BYTES)
      return Response.json({ ok: false, mensagem: "O arquivo ultrapassa 5 MB." }, { status: 413 });
    const r = await enviarImagemPublicidade(new Uint8Array(await arquivo.arrayBuffer()), membro.id);
    return Response.json(r, { status: r.ok ? 201 : 422 });
  } catch {
    return indisponivel();
  }
}
