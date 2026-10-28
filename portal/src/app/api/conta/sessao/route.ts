import { membroAtual } from "@/modules/conta/conta.controller";

/** GET → a conta da sessão, ou 401. */
export async function GET() {
  const membro = await membroAtual();
  return membro ? Response.json({ ok: true, valor: membro }) : Response.json({ ok: false }, { status: 401 });
}
