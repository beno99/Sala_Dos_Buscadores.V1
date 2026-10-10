/*
 * Slugs de conteúdo: gerados do título, sem acento, únicos por Sala.
 * Editáveis enquanto o item é rascunho; depois da primeira publicação ficam
 * travados para não quebrar links (a regra de trava está em podeEditarSlug).
 */

export function gerarSlug(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Acrescenta -2, -3… até não colidir com os slugs já usados na mesma Sala. */
export function slugUnico(base: string, usados: Iterable<string>): string {
  const ocupados = new Set(usados);
  const raiz = base || "sem-titulo";
  if (!ocupados.has(raiz)) return raiz;
  let n = 2;
  while (ocupados.has(`${raiz}-${n}`)) n += 1;
  return `${raiz}-${n}`;
}

export function validarSlug(slug: string): string | null {
  if (!slug) return "escreva o endereço do conteúdo ou gere a partir do título.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return "use só letras minúsculas sem acento, números e hífens. Ex.: poimandres-a-mente-que-fala";
  }
  return null;
}

/** Depois de publicado uma vez, o endereço não muda mais. */
export function podeEditarSlug(item: { publicadoEm: string } | null | undefined): boolean {
  return !item?.publicadoEm;
}
