import { cadastrar } from "@/modules/conta/conta.controller";
import { lerJson, responder } from "../http";

/** POST { pseudonimo, email, senha } → cria a conta de membro e abre a sessão. */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  return corpo ? responder(await cadastrar(corpo), 422, 201) : responder.invalido();
}
