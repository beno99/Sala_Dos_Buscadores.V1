import { revalidatePath } from "next/cache";
import { salvarAnuncio } from "@/modules/publicidade/publicidade.repositorio";
import { membroAtual } from "@/server/sessao";
import { indisponivel, mesmaOrigem } from "./http";

export async function POST(pedido: Request) {
  if (!mesmaOrigem(pedido))
    return Response.json({ ok: false, mensagem: "Origem do pedido inválida." }, { status: 403 });
  try {
    const membro = await membroAtual();
    if (membro?.papel !== "anfitriao")
      return Response.json({ ok: false, mensagem: "Entre com sua conta de anfitrião." }, { status: 403 });
    let entrada: unknown;
    try {
      entrada = await pedido.json();
    } catch {
      return Response.json({ ok: false, mensagem: "Pedido inválido." }, { status: 400 });
    }
    const r = await salvarAnuncio(membro.id, entrada);
    if (r.ok) {
      revalidatePath("/");
      revalidatePath("/anfitriao/publicidade");
      revalidatePath(`/anfitriao/publicidade/${r.anuncio.id}`);
    }
    return Response.json(r, { status: r.ok ? 200 : 422 });
  } catch {
    return indisponivel();
  }
}
