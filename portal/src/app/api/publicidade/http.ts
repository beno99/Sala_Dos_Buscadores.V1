/** POSTs originados pelo editor têm Origin. Recusa formulários de outros sites. */
export function mesmaOrigem(pedido: Request): boolean {
  return pedido.headers.get("origin") === new URL(pedido.url).origin;
}
export const indisponivel = () =>
  Response.json(
    {
      ok: false,
      mensagem:
        "Publicidade indisponível no momento. Não foi possível confirmar a gravação. Seus dados continuam no formulário; tente novamente.",
    },
    { status: 503 },
  );
