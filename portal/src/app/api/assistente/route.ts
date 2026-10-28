import { validarPedido } from "@/features/assistente/contrato";
import { servicoAssistente } from "@/server/assistente";
import { membroAtual } from "@/server/sessao";
import { salasVisiveis } from "@/server/store";

export async function POST(request: Request) {
  const membro = await membroAtual();
  if (!membro) return Response.json({ ok: false, erro: "Erro: entre na sua conta." }, { status: 401 });
  let valor: unknown;
  try {
    valor = await request.json();
  } catch {
    return Response.json({ ok: false, erro: "Erro: envie uma pergunta válida." }, { status: 400 });
  }
  const pedido = validarPedido(
    valor,
    salasVisiveis().map((s) => s.slug),
  );
  if (!pedido)
    return Response.json(
      { ok: false, erro: "Erro: confira a pergunta, o modo e a Sala selecionada." },
      { status: 400 },
    );
  const resultado = await servicoAssistente.consultar(pedido, {
    membroId: membro.id,
    signal: request.signal,
  });
  return Response.json(resultado, {
    status: resultado.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
