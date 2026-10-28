import "server-only";
import { urlDaMidia } from "./midia";
import { type PerfilBuscador, perfisBuscador } from "./store";

/*
 * Perfil do buscador (foto, capa e "Sobre a sua busca"), por conta, no banco
 * (tabela perfis_buscador). Privado: só a própria conta lê e grava.
 * As imagens são mídias enviadas pela própria conta (src/server/midia.ts).
 */

export type { PerfilBuscador } from "./store";

export function perfilDe(contaId: string): PerfilBuscador & { foto?: string; capa?: string } {
  const p = perfisBuscador().get(contaId) ?? { sobre: "" };
  return {
    ...p,
    ...(p.fotoId ? { foto: urlDaMidia(p.fotoId) } : {}),
    ...(p.capaId ? { capa: urlDaMidia(p.capaId) } : {}),
  };
}

export function gravarPerfil(contaId: string, perfil: PerfilBuscador) {
  perfisBuscador().set(contaId, { ...perfil });
}
