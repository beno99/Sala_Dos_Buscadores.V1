import { entrar } from "@/modules/conta/conta.controller";
import { lerJson, responder } from "../http";

/** POST { email, senha } → abre a sessão (cookie httpOnly) e devolve a conta. */
export async function POST(pedido: Request) {
  const corpo = await lerJson(pedido);
  return corpo ? responder(await entrar(corpo.email, corpo.senha), 401) : responder.invalido();
}
