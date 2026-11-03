import type { RevisaoAnfitriao, StatusEditorial } from "@/data/types";
import type { ItemChecklist } from "@/features/admin/regras/checklist";
import { normalizar } from "@/lib/texto";

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

/** Mesmo ciclo de Salas e artigos: rascunho → em revisão → publicado ou reprovado. */
export type StatusAnuncio = StatusEditorial;

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
  /** Envio, aceite e decisões da curadoria. Ausente em anúncios anteriores à revisão. */
  revisao?: RevisaoAnfitriao;
}

/** A revisão do anúncio, mesmo quando ele é anterior a ela. */
export function revisaoDoAnuncio(a: Anuncio): RevisaoAnfitriao {
  return a.revisao ?? { donoId: a.donoId, jaPublicado: Boolean(a.publicadoEm), decisoes: [] };
}

export interface FormAnuncio {
  id?: string | null;
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
  /** Versão lida pelo editor (CAS); o servidor recusa se outra aba salvou antes. */
  versaoEsperada?: string;
}

/**
 * "rascunho" confere só os limites; "publicar" confere também os
 * obrigatórios, exigidos para enviar à curadoria.
 */
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
  const versao = texto(f.versaoEsperada);
  return {
    ...(id ? { id } : {}),
    ...(versao ? { versaoEsperada: versao } : {}),
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

/*
 * Linguagem que a curadoria recusa em anúncio (DRS, Publicidade): promessa de
 * cura ou de resultado, manipulação religiosa e urgência. É um alerta para o
 * anfitrião revisar antes de enviar; quem decide é a curadoria.
 */
const EXPRESSOES_RECUSADAS: { expressao: string; motivo: string }[] = [
  { expressao: "cura", motivo: "promessa de cura" },
  { expressao: "curar", motivo: "promessa de cura" },
  { expressao: "garantido", motivo: "promessa de resultado" },
  { expressao: "garantia de resultado", motivo: "promessa de resultado" },
  { expressao: "milagre", motivo: "promessa de resultado" },
  { expressao: "milagroso", motivo: "promessa de resultado" },
  { expressao: "ultimas unidades", motivo: "urgência" },
  { expressao: "so hoje", motivo: "urgência" },
  { expressao: "corra", motivo: "urgência" },
  { expressao: "nao perca", motivo: "urgência" },
  { expressao: "salvacao", motivo: "manipulação religiosa" },
  { expressao: "abencoado por", motivo: "manipulação religiosa" },
];

/** Expressões que a curadoria costuma recusar, com o motivo. */
export function alertasDeLinguagem(f: Pick<FormAnuncio, "titulo" | "descricao" | "categoria" | "chamada">) {
  const t = ` ${normalizar([f.titulo, f.descricao, f.categoria, f.chamada].join(" "))} `;
  return EXPRESSOES_RECUSADAS.filter((e) => t.includes(` ${e.expressao} `));
}

const ITENS_ENVIO: { id: string; campo: string; rotulo: string; ajuda: string }[] = [
  { id: "imagem", campo: "campo-imagem", rotulo: "Imagem do produto", ajuda: "A imagem é obrigatória." },
  {
    id: "alternativo",
    campo: "campo-alt",
    rotulo: "Descrição da imagem",
    ajuda: "Quem usa leitor de tela ouve esta descrição no lugar da imagem.",
  },
  { id: "titulo", campo: "campo-titulo", rotulo: "Título", ajuda: "O nome do produto." },
  {
    id: "descricao",
    campo: "campo-descricao",
    rotulo: "Descrição",
    ajuda: "Diga o que é o produto, sem promessas.",
  },
  { id: "link", campo: "campo-href", rotulo: "Link do produto", ajuda: "Endereço completo, com https://." },
  {
    id: "anunciante",
    campo: "campo-anunciante",
    rotulo: "Nome do anunciante",
    ajuda: "O nome aparece sempre junto do anúncio.",
  },
];

/** O que falta para enviar à curadoria (o aceite de direitos vem no envio). */
export function checklistEnvioAnuncio(f: FormAnuncio): ItemChecklist[] {
  const erros = validarAnuncio(normalizarAnuncio(f), "publicar");
  const alertas = alertasDeLinguagem(f);
  return [
    ...ITENS_ENVIO.map(
      (i): ItemChecklist => ({
        id: i.id,
        rotulo: i.rotulo,
        estado: erros[i.campo] ? "pendente" : "ok",
        campo: i.campo,
        requisito: "Publicidade",
        ajuda: i.ajuda,
      }),
    ),
    {
      id: "linguagem",
      rotulo: "Linguagem do anúncio",
      estado: alertas.length ? "alerta" : "ok",
      campo: "campo-descricao",
      requisito: "Publicidade",
      ajuda: alertas.length
        ? `Revise: ${[...new Set(alertas.map((a) => a.motivo))].join(", ")}. A curadoria recusa anúncios assim.`
        : "Sem promessa de cura, manipulação religiosa ou urgência.",
    },
  ];
}
