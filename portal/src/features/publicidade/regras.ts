import type { ItemChecklist } from "@/features/admin/regras/checklist";
import { validarLinkHttps } from "@/features/anfitriao/regras/artigo";
import { normalizar } from "@/lib/texto";

/*
 * Anúncio de anfitrião: formulário, limites e o que falta para enviar à
 * curadoria. Funções puras, usadas pelo editor (resposta imediata) e pelo
 * servidor (que confere tudo de novo).
 */

export interface FormAnuncio {
  id: string | null;
  titulo: string;
  descricao: string;
  categoria: string;
  href: string;
  anunciante: string;
  chamada: string;
  textoAlternativo: string;
  /** Id da imagem enviada por /midia. */
  midia: string | null;
  /** Versão lida pelo editor (CAS); o servidor recusa se outra aba salvou antes. */
  versaoEsperada?: string;
}

export const anuncioVazio = (): FormAnuncio => ({
  id: null,
  titulo: "",
  descricao: "",
  categoria: "",
  href: "",
  anunciante: "",
  chamada: "",
  textoAlternativo: "",
  midia: null,
});

export const LIMITES_ANUNCIO = {
  titulo: 80,
  descricao: 240,
  categoria: 40,
  anunciante: 80,
  chamada: 40,
  textoAlternativo: 160,
} as const;

/** Texto do link quando o anfitrião não escolhe outro. */
export const CHAMADA_PADRAO = "Conhecer o produto";

type Campo = keyof typeof LIMITES_ANUNCIO;
const ROTULOS: Record<Campo, string> = {
  titulo: "o título",
  descricao: "a descrição",
  categoria: "a categoria",
  anunciante: "o nome do anunciante",
  chamada: "o texto do link",
  textoAlternativo: "a descrição da imagem",
};

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
  const texto = ` ${normalizar([f.titulo, f.descricao, f.categoria, f.chamada].join(" "))} `;
  return EXPRESSOES_RECUSADAS.filter((e) => texto.includes(` ${e.expressao} `));
}

/** O que impede salvar o rascunho: só o título e os limites. */
export function validarAnuncioParaSalvar(f: FormAnuncio): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-titulo"] = "escreva o título para salvar o rascunho.";
  for (const campo of Object.keys(LIMITES_ANUNCIO) as Campo[]) {
    const limite = LIMITES_ANUNCIO[campo];
    if (f[campo].trim().length > limite)
      erros[`campo-${campo}`] = `${ROTULOS[campo]} passa de ${limite} caracteres.`;
  }
  const erroLink = validarLinkHttps(f.href);
  if (erroLink) erros["campo-href"] = erroLink;
  return erros;
}

const item = (id: string, ok: boolean, rotulo: string, campo: string, ajuda: string): ItemChecklist => ({
  id,
  rotulo,
  estado: ok ? "ok" : "pendente",
  campo,
  requisito: "Publicidade",
  ajuda,
});

/** O que falta para enviar à curadoria (o aceite de direitos vem no envio). */
export function checklistEnvioAnuncio(f: FormAnuncio): ItemChecklist[] {
  const alertas = alertasDeLinguagem(f);
  return [
    item("imagem", Boolean(f.midia), "Imagem do produto", "campo-imagem", "A imagem é obrigatória."),
    item(
      "textos",
      Boolean(f.titulo.trim() && f.descricao.trim()),
      "Título e descrição",
      f.titulo.trim() ? "campo-descricao" : "campo-titulo",
      "Diga o que é o produto, sem promessas.",
    ),
    item(
      "link",
      Boolean(f.href.trim()) && !validarLinkHttps(f.href),
      "Link do produto",
      "campo-href",
      "Um endereço completo, começando por https://",
    ),
    item(
      "anunciante",
      Boolean(f.anunciante.trim()),
      "Nome do anunciante",
      "campo-anunciante",
      "O nome aparece sempre junto do anúncio.",
    ),
    item(
      "alternativo",
      Boolean(f.textoAlternativo.trim()),
      "Descrição da imagem",
      "campo-textoAlternativo",
      "Quem usa leitor de tela ouve esta descrição no lugar da imagem.",
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
