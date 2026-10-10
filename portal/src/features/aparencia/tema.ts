/*
 * Aparência do portal: Sólido claro (padrão) ou Sólido escuro. A escolha fica
 * num cookie legível pelo servidor, para o HTML já sair no tema certo.
 */
export const COOKIE_TEMA = "sdb_tema";

export type Aparencia = "claro" | "escuro";
export type TemaDoPortal = "solido-claro" | "solido-escuro";

export function temaDoCookie(valor: string | undefined): TemaDoPortal {
  return valor === "escuro" ? "solido-escuro" : "solido-claro";
}

export function cookieDoTema(aparencia: Aparencia): string {
  return `${COOKIE_TEMA}=${aparencia}; path=/; max-age=31536000; samesite=lax`;
}

/** Aplica no documento e grava a escolha (lado do cliente). */
export function aplicarAparencia(aparencia: Aparencia) {
  document.documentElement.dataset.theme = temaDoCookie(aparencia);
  // biome-ignore lint/suspicious/noDocumentCookie: preferência de aparência simples, lida também pelo servidor.
  document.cookie = cookieDoTema(aparencia);
}
