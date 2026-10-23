import "server-only";
import { urlDaMidia } from "./midia";

/*
 * Perfil do buscador (foto, capa e "Sobre a sua busca"), por conta, em memória
 * no servidor como o progresso de estudo. Privado: só a própria conta lê e grava.
 * As imagens são mídias enviadas pela própria conta (src/server/midia.ts).
 */

export interface PerfilBuscador {
  fotoId?: string;
  capaId?: string;
  sobre: string;
}

const chave = Symbol.for("sala-dos-buscadores.perfil-buscador");
type ComEstado = typeof globalThis & { [chave]?: Map<string, PerfilBuscador> };

function estado(): Map<string, PerfilBuscador> {
  const g = globalThis as ComEstado;
  g[chave] ??= new Map();
  return g[chave];
}

export function perfilDe(contaId: string): PerfilBuscador & { foto?: string; capa?: string } {
  const p = estado().get(contaId) ?? { sobre: "" };
  return {
    ...p,
    ...(p.fotoId ? { foto: urlDaMidia(p.fotoId) } : {}),
    ...(p.capaId ? { capa: urlDaMidia(p.capaId) } : {}),
  };
}

export function gravarPerfil(contaId: string, perfil: PerfilBuscador) {
  estado().set(contaId, { ...perfil });
}

export function reiniciarPerfis() {
  estado().clear();
}

/** "Restaurar acervo de demonstração": a conta de demonstração volta sem foto, capa nem texto. */
export function restaurarPerfilDemonstracao(contaId: string) {
  estado().delete(contaId);
}
