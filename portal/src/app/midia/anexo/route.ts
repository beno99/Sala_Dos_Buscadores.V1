import { LIMITE_IMAGEM_BYTES } from "@/features/anfitriao/regras/imagem";
import { guardarAnexo } from "@/server/midia";
import { membroAtual } from "@/server/sessao";

/*
 * Anexo de mensagem (POST multipart, campo "arquivo"): só anfitrião e curadoria.
 * Imagem (JPEG, PNG, WebP) ou PDF de até 5 MB, conferidos pelos magic bytes.
 */
export async function POST(pedido: Request) {
  const conta = await membroAtual();
  if (!conta) return Response.json({ ok: false, erro: "entre na sua conta para anexar." }, { status: 401 });
  if (conta.papel !== "anfitriao" && conta.papel !== "administrador")
    return Response.json(
      { ok: false, erro: "só anfitriões e a curadoria anexam arquivos." },
      { status: 403 },
    );
  if (Number(pedido.headers.get("content-length") ?? 0) > LIMITE_IMAGEM_BYTES + 64 * 1024)
    return Response.json({ ok: false, erro: "o arquivo passa do limite de 5 MB." }, { status: 413 });
  let arquivo: FormDataEntryValue | null = null;
  try {
    arquivo = (await pedido.formData()).get("arquivo");
  } catch {
    return Response.json({ ok: false, erro: "envie o arquivo no campo “arquivo”." }, { status: 400 });
  }
  if (!(arquivo instanceof Blob))
    return Response.json({ ok: false, erro: "escolha um arquivo para anexar." }, { status: 400 });
  const r = await guardarAnexo(new Uint8Array(await arquivo.arrayBuffer()), conta.id);
  return r.ok ? Response.json(r, { status: 201 }) : Response.json(r, { status: 422 });
}
