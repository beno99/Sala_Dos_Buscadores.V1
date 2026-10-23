/*
 * Aparência do portal (diálogo "Aparência", layout do Figma): quatro temas da
 * biblioteca e a lateral opaca ou translúcida. As escolhas ficam em cookies
 * legíveis pelo servidor, para o HTML já sair no tema certo.
 */
export const COOKIE_TEMA = "sdb_tema";
export const COOKIE_LATERAL = "sdb_lateral";

export type Aparencia = "claro" | "escuro" | "vidro-claro" | "vidro-escuro";
export type TemaDoPortal = "solido-claro" | "solido-escuro" | "vidro-claro" | "vidro-escuro";

export const APARENCIAS: { valor: Aparencia; tema: TemaDoPortal; nome: string }[] = [
  { valor: "claro", tema: "solido-claro", nome: "Areia" },
  { valor: "escuro", tema: "solido-escuro", nome: "Escuro" },
  { valor: "vidro-claro", tema: "vidro-claro", nome: "Vidro claro" },
  { valor: "vidro-escuro", tema: "vidro-escuro", nome: "Vidro escuro" },
];

export function aparenciaDoCookie(valor: string | undefined): Aparencia {
  return APARENCIAS.find((a) => a.valor === valor)?.valor ?? "claro";
}

export function temaDoCookie(valor: string | undefined): TemaDoPortal {
  const a = aparenciaDoCookie(valor);
  return APARENCIAS.find((x) => x.valor === a)?.tema ?? "solido-claro";
}

export function lateralDoCookie(valor: string | undefined): boolean {
  return valor === "translucida";
}

const UM_ANO = "path=/; max-age=31536000; samesite=lax";

export function cookieDoTema(aparencia: Aparencia): string {
  return `${COOKIE_TEMA}=${aparencia}; ${UM_ANO}`;
}

export function cookieDaLateral(translucida: boolean): string {
  return `${COOKIE_LATERAL}=${translucida ? "translucida" : "opaca"}; ${UM_ANO}`;
}

/** Aplica no documento e grava as escolhas (lado do cliente). */
export function aplicarAparencia(aparencia: Aparencia, lateralTranslucida?: boolean) {
  const raiz = document.documentElement;
  raiz.dataset.theme = temaDoCookie(aparencia);
  // biome-ignore lint/suspicious/noDocumentCookie: preferência de aparência simples, lida também pelo servidor.
  document.cookie = cookieDoTema(aparencia);
  if (lateralTranslucida !== undefined) {
    if (lateralTranslucida) raiz.dataset.lateral = "translucida";
    else delete raiz.dataset.lateral;
    // biome-ignore lint/suspicious/noDocumentCookie: preferência de aparência simples, lida também pelo servidor.
    document.cookie = cookieDaLateral(lateralTranslucida);
  }
}
