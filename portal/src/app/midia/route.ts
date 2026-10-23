import { LIMITE_IMAGEM_BYTES } from "@/features/anfitriao/regras/imagem";
import { guardarImagem } from "@/server/midia";
import { membroAtual } from "@/server/sessao";

/*
 * Envio de imagem (POST multipart com o campo "arquivo"): o anfitrião, para as
 * Salas e artigos dele; a curadoria, para as Salas oficiais; e qualquer conta,
 * para a própria foto e capa do Perfil. A imagem fica guardada com o dono e só
 * entra num item da mesma conta (midiaDoDono). O tipo e o tamanho são
 * conferidos no servidor pelos magic bytes (src/features/anfitriao/regras/imagem.ts).
 */
export async function POST(pedido: Request) {
  const conta = await membroAtual();
  if (!conta) {
    return Response.json({ ok: false, erro: "entre na sua conta para enviar imagens." }, { status: 401 });
  }
  const donoId = conta.id;
  // Recusa cedo um corpo bem maior que o limite, antes de ler o arquivo (a conferência fina vem depois).
  if (Number(pedido.headers.get("content-length") ?? 0) > LIMITE_IMAGEM_BYTES + 64 * 1024) {
    return Response.json({ ok: false, erro: "a imagem passa do limite de 5 MB." }, { status: 413 });
  }
  let arquivo: FormDataEntryValue | null = null;
  try {
    arquivo = (await pedido.formData()).get("arquivo");
  } catch {
    return Response.json({ ok: false, erro: "envie a imagem no campo “arquivo”." }, { status: 400 });
  }
  if (!(arquivo instanceof Blob)) {
    return Response.json({ ok: false, erro: "escolha uma imagem para enviar." }, { status: 400 });
  }
  const r = guardarImagem(new Uint8Array(await arquivo.arrayBuffer()), donoId);
  return r.ok ? Response.json(r, { status: 201 }) : Response.json(r, { status: 422 });
}
