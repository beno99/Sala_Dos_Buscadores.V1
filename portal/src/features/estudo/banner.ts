/* Banner rotativo do Portal: ordem dos slides e quando ele pode girar (WCAG 2.2.2). */

export const INTERVALO_BANNER_MS = 7000;

/** Marca primeiro; depois episódios e anúncios alternados. */
export function intercalarSlides<T>(marca: T, episodios: T[], anuncios: T[]): T[] {
  const lista: T[] = [marca];
  const n = Math.max(episodios.length, anuncios.length);
  for (let i = 0; i < n; i++) {
    const e = episodios[i];
    const a = anuncios[i];
    if (e !== undefined) lista.push(e);
    if (a !== undefined) lista.push(a);
  }
  return lista;
}

export function proximoSlide(atual: number, total: number, direcao: 1 | -1 = 1): number {
  return (((atual + direcao) % total) + total) % total;
}

export interface CondicoesBanner {
  pausadoPeloUsuario: boolean;
  hover: boolean;
  foco: boolean;
  movimentoReduzido: boolean;
  abaOculta: boolean;
}

export function deveRodar(c: CondicoesBanner): boolean {
  return !(c.pausadoPeloUsuario || c.hover || c.foco || c.movimentoReduzido || c.abaOculta);
}
