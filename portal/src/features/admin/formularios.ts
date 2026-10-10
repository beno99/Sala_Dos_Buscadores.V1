import type {
  Autoria,
  Citacao,
  ConteudoEditorial,
  FonteEditorial,
  Nivel,
  Placa,
  Proveniencia,
  SalaSlug,
  SituacaoJuridica,
  TemaSlug,
  TipoFonte,
  VideoEditorial,
} from "@/data/types";

/*
 * Formato dos formulários da curadoria. É o que viaja entre o navegador e as
 * Server Actions; o servidor converte para os tipos do acervo (types.ts).
 */

export type TipoArtigo = "artigo" | "fonte-primaria";

export interface FormCitacao {
  obra: string;
  localizacao: string;
  originalTexto: string;
  originalIdioma: string;
  originalLang: string;
  traducao: string;
  rotuloTraducao: string;
  referencia: string;
}

export interface FormArtigo {
  id: string | null;
  sala: SalaSlug | "";
  tipo: TipoArtigo;
  titulo: string;
  slug: string;
  resumo: string;
  temas: TemaSlug[];
  nivel: Nivel | null;
  periodo: string;
  duracaoMin: number | null;
  proveniencia: Proveniencia | null;
  producaoIA: boolean;
  autoriaNaoIdentificada: boolean;
  autoria: Autoria;
  corpo: string[];
  temCitacao: boolean;
  citacao: FormCitacao;
  fontes: string[];
  situacaoJuridica: SituacaoJuridica | null;
  temaDivergente: boolean;
  notaDivergencia: string;
}

export interface FormVideo {
  id: string | null;
  sala: SalaSlug | "";
  titulo: string;
  url: string;
  duracao: string;
  tema: TemaSlug | "";
  nivel: Nivel | null;
  episodio: string;
  publicadoEm: string;
  placa: Placa;
  artigos: string[];
}

export interface FormFonte {
  id: string | null;
  titulo: string;
  autor: string;
  tradicao: string;
  tipo: TipoFonte;
  referencia: string;
  url: string;
  capa: Placa;
  inicial: string;
}

export const AUTORIA_NAO_IDENTIFICADA = "Autoria não identificada";

export const CITACAO_VAZIA: FormCitacao = {
  obra: "",
  localizacao: "",
  originalTexto: "",
  originalIdioma: "",
  originalLang: "",
  traducao: "",
  rotuloTraducao: "",
  referencia: "",
};

export function artigoVazio(sala: SalaSlug | "" = ""): FormArtigo {
  return {
    id: null,
    sala,
    tipo: "artigo",
    titulo: "",
    slug: "",
    resumo: "",
    temas: [],
    nivel: null,
    periodo: "",
    duracaoMin: null,
    proveniencia: null,
    producaoIA: false,
    autoriaNaoIdentificada: false,
    autoria: { nome: "", credencial: "" },
    corpo: [""],
    temCitacao: false,
    citacao: { ...CITACAO_VAZIA },
    fontes: [],
    situacaoJuridica: null,
    temaDivergente: false,
    notaDivergencia: "",
  };
}

export function videoVazio(): FormVideo {
  return {
    id: null,
    sala: "",
    titulo: "",
    url: "",
    duracao: "",
    tema: "",
    nivel: null,
    episodio: "",
    publicadoEm: "",
    placa: "grafite",
    artigos: [],
  };
}

export function fonteVazia(): FormFonte {
  return {
    id: null,
    titulo: "",
    autor: "",
    tradicao: "",
    tipo: "Estudo acadêmico",
    referencia: "",
    url: "",
    capa: "bordo",
    inicial: "",
  };
}

/** Registro editorial (+ citação) → formulário. */
export function artigoParaForm(c: ConteudoEditorial, citacao?: Citacao): FormArtigo {
  const tipo: TipoArtigo = c.tipo === "fonte-primaria" ? "fonte-primaria" : "artigo";
  return {
    id: c.id,
    sala: c.sala,
    tipo,
    titulo: c.titulo,
    slug: c.slug,
    resumo: c.resumo,
    temas: [...c.temas],
    nivel: c.nivel,
    periodo: c.periodo,
    duracaoMin: c.duracaoMin,
    proveniencia: c.proveniencia,
    producaoIA: c.producaoIA,
    autoriaNaoIdentificada: c.autoria.nome === AUTORIA_NAO_IDENTIFICADA,
    autoria: { ...c.autoria },
    corpo: c.corpo.length ? [...c.corpo] : [""],
    temCitacao: Boolean(citacao),
    citacao: citacao
      ? {
          obra: citacao.obra,
          localizacao: citacao.localizacao,
          originalTexto: citacao.original?.texto ?? "",
          originalIdioma: citacao.original?.idioma ?? "",
          originalLang: citacao.original?.lang ?? "",
          traducao: citacao.traducao,
          rotuloTraducao: citacao.rotuloTraducao ?? "",
          referencia: citacao.referencia,
        }
      : { ...CITACAO_VAZIA },
    fontes: [...c.fontes],
    situacaoJuridica: c.situacaoJuridica ? { ...c.situacaoJuridica } : null,
    temaDivergente: c.temaDivergente,
    notaDivergencia: c.notaDivergencia,
  };
}

export function videoParaForm(v: VideoEditorial): FormVideo {
  return {
    id: v.id,
    sala: v.sala,
    titulo: v.titulo,
    url: v.url,
    duracao: v.duracao,
    tema: v.tema,
    nivel: v.nivel,
    episodio: v.episodio,
    publicadoEm: v.publicadoEm,
    placa: v.placa,
    artigos: [...v.artigos],
  };
}

export function fonteParaForm(f: FonteEditorial): FormFonte {
  return {
    id: f.id,
    titulo: f.titulo,
    autor: f.autor,
    tradicao: f.tradicao,
    tipo: f.tipo,
    referencia: f.referencia,
    url: f.url ?? "",
    capa: f.capa,
    inicial: f.inicial,
  };
}
