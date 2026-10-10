/*
 * Ranking "Mais pesquisados": ordem só pela contagem de buscas, nunca por
 * juízo de valor. É ranking de conteúdo, nunca de pessoas.
 */

export function ordenarRanking<T extends { titulo: string; buscas: number }>(itens: T[]): T[] {
  return itens
    .filter((i) => i.buscas > 0)
    .sort((a, b) => b.buscas - a.buscas || a.titulo.localeCompare(b.titulo, "pt-BR"));
}

export function paginar<T>(itens: T[], pagina: number, porPagina: number) {
  const total = Math.max(1, Math.ceil(itens.length / porPagina));
  const atual = Math.min(Math.max(1, pagina), total);
  return { itens: itens.slice((atual - 1) * porPagina, atual * porPagina), pagina: atual, total };
}
