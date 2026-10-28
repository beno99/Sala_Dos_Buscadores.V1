/*
 * Carrega o snapshot do acervo do Postgres antes do primeiro pedido
 * (src/server/store.ts). Sem banco, o servidor sobe assim mesmo e tenta de
 * novo a cada pedido.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { sincronizarAcervo } = await import("./server/store");
  try {
    await sincronizarAcervo();
  } catch (erro) {
    console.error(
      "Não foi possível carregar o acervo do banco. Confira o docker compose e o DATABASE_URL.",
      erro,
    );
  }
}
