import type { Resultado } from "@/modules/conta/conta.contratos";

/* Ajudantes HTTP das rotas de conta: JSON de entrada e Resultado → Response. */

export async function lerJson(pedido: Request): Promise<Record<string, unknown> | null> {
  try {
    const corpo: unknown = await pedido.json();
    return corpo && typeof corpo === "object" ? (corpo as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function responder<T>(r: Resultado<T>, statusErro: number, statusOk = 200): Response {
  return Response.json(r, { status: r.ok ? statusOk : statusErro });
}

responder.invalido = () => Response.json({ ok: false, erro: "envie um JSON válido." }, { status: 400 });
