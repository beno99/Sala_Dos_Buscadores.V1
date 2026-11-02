import type { Papel } from "@/modules/conta/conta.contratos";

/** P04/P15: comentários e reações conservam as regras existentes. */
export function podeCriarPublicacao(papel: Papel): boolean {
  return papel === "anfitriao" || papel === "administrador";
}
