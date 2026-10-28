import { sair } from "@/modules/conta/conta.controller";

/** POST → encerra a sessão. */
export async function POST() {
  await sair();
  return new Response(null, { status: 204 });
}
