/*
 * Pedidos que qualquer tela faz à Moldura: abrir o assistente, as conquistas,
 * a explicação dos níveis ou o onboarding ("Refazer preferências").
 */
export type Abertura = "assistente" | "conquistas" | "niveis" | "preferencias";

export const EVENTO_ABRIR = "sdb:abrir";

export function abrirNaMoldura(abertura: Abertura) {
  window.dispatchEvent(new CustomEvent<Abertura>(EVENTO_ABRIR, { detail: abertura }));
}
