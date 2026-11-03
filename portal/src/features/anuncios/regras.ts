export const LIMITES_ANUNCIO = {
  alt: 200,
  categoria: 40,
  titulo: 80,
  descricao: 240,
  chamada: 30,
  anunciante: 80,
  href: 2000,
} as const;

export const CHAMADA_PADRAO = "Conhecer o produto";

export type StatusAnuncio = "rascunho" | "publicado";

export interface Anuncio {
  id: string;
  donoId: string;
  status: StatusAnuncio;
  midia: string | null;
  focoX: number;
  focoY: number;
  alt: string;
  categoria: string;
  titulo: string;
  descricao: string;
  href: string;
  chamada: string;
  anunciante: string;
  criadoEm: string;
  atualizadoEm: string;
  publicadoEm?: string;
}

export interface FormAnuncio {
  id?: string;
  midia: string | null;
  focoX: number;
  focoY: number;
  alt: string;
  categoria: string;
  titulo: string;
  descricao: string;
  href: string;
  chamada: string;
  anunciante: string;
}

export type ModoAnuncio = "rascunho" | "publicar";

export const CAMPOS_ANUNCIO = [
  "campo-imagem",
  "campo-alt",
  "campo-categoria",
  "campo-titulo",
  "campo-descricao",
  "campo-href",
  "campo-chamada",
  "campo-anunciante",
] as const;

const texto = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
const foco = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(100, Math.max(0, Math.round(v))) : 50;

export function linkValido(href: string): boolean {
  try {
    const u = new URL(href);
    return (u.protocol === "http:" || u.protocol === "https:") && Boolean(u.hostname);
  } catch {
    return false;
  }
}

export function normalizarAnuncio(f: Partial<Record<keyof FormAnuncio, unknown>>): FormAnuncio {
  const id = texto(f.id);
  return {
    ...(id ? { id } : {}),
    midia: texto(f.midia) || null,
    focoX: foco(f.focoX),
    focoY: foco(f.focoY),
    alt: texto(f.alt),
    categoria: texto(f.categoria),
    titulo: texto(f.titulo),
    descricao: texto(f.descricao),
    href: texto(f.href),
    chamada: texto(f.chamada),
    anunciante: texto(f.anunciante),
  };
}

export function validarAnuncio(f: FormAnuncio, modo: ModoAnuncio): Record<string, string> {
  const erros: Record<string, string> = {};
  const limite = (campo: string, valor: string, max: number) => {
    if (valor.length > max) erros[campo] = `use até ${max} caracteres (agora são ${valor.length}).`;
  };
  limite("campo-alt", f.alt, LIMITES_ANUNCIO.alt);
  limite("campo-categoria", f.categoria, LIMITES_ANUNCIO.categoria);
  limite("campo-titulo", f.titulo, LIMITES_ANUNCIO.titulo);
  limite("campo-descricao", f.descricao, LIMITES_ANUNCIO.descricao);
  limite("campo-href", f.href, LIMITES_ANUNCIO.href);
  limite("campo-chamada", f.chamada, LIMITES_ANUNCIO.chamada);
  limite("campo-anunciante", f.anunciante, LIMITES_ANUNCIO.anunciante);
  if (f.href && !erros["campo-href"] && !linkValido(f.href))
    erros["campo-href"] = "use um endereço completo, começando com http:// ou https://.";
  if (modo === "publicar") {
    const exigir = (campo: string, valor: unknown, mensagem: string) => {
      if (!valor && !erros[campo]) erros[campo] = mensagem;
    };
    exigir("campo-imagem", f.midia, "envie a imagem do produto.");
    exigir("campo-alt", f.alt, "descreva a imagem para quem usa leitor de tela.");
    exigir("campo-titulo", f.titulo, "escreva o título do anúncio.");
    exigir("campo-descricao", f.descricao, "explique brevemente o que você oferece.");
    exigir("campo-href", f.href, "informe o link do produto.");
    exigir("campo-anunciante", f.anunciante, "informe o nome do anunciante.");
  }
  return erros;
}

export function anuncioDoPortal<T extends Pick<Anuncio, "status">>(anuncios: Iterable<T>): T[] {
  return [...anuncios].filter((a) => a.status === "publicado");
}
