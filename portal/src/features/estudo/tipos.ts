import type { Nivel, SalaSlug, TemaSlug, TipoConteudo } from "@/data/types";

/* Progresso de estudo de uma conta. Privado: nunca aparece para outras pessoas. */

export interface Leitura {
  sala: SalaSlug;
  slug: string;
  /** 0 a 100, acompanha a rolagem do texto. */
  pct: number;
  atualizadaEm: string;
  /**
   * Conclusão da leitura. Desde a Jornada do Buscador (03/11/2026) só vale a
   * declarada ("Marcar leitura como concluída"); as anteriores, pela rolagem,
   * ficam como importadas.
   */
  concluidaEm?: string;
  origem?: "declarada";
  /** Temas do conteúdo no momento da conclusão (mudança editorial depois não reescreve). */
  temas?: TemaSlug[];
}

export interface VideoConcluido {
  id: string;
  sala: SalaSlug;
  temas: TemaSlug[];
  em: string;
}

/** Correção de uma marcação (desmarcar), guardada no histórico. */
export interface AjusteJornada {
  alvo: string;
  acao: "desmarcou";
  em: string;
}

export type ConquistaId =
  | "primeiro-passo"
  | "palavra-por-palavra"
  | "alem-da-primeira-leitura"
  | "entre-salas"
  | "leitura-atenta"
  | "caminho-percorrido"
  // IDs legados continuam aceitos para preservar o histórico já registrado.
  | "porta-aberta"
  | "cinco-salas"
  | "lado-a-lado"
  | "na-fonte"
  | "vocabulario"
  | "com-as-fontes"
  | "degrau-iii";

export interface ItemEstante {
  tipo: "sala" | "conteudo" | "video";
  /** Slug da Sala, "sala/slug" do conteúdo ou o id do vídeo. */
  ref: string;
  em: string;
}

export interface ProgressoEstudo {
  salasVisitadas: SalaSlug[];
  leituras: Leitura[];
  temasComparados: TemaSlug[];
  verbetesAbertos: string[];
  fontesConferidas: number;
  /** Degraus concluídos por trilha (uma trilha por Sala). */
  trilhas: Partial<Record<SalaSlug, number>>;
  estante: ItemEstante[];
  conquistas: Partial<Record<ConquistaId, string>>;
  /** Leitura cujo "Continuar" a pessoa dispensou ("sala/slug"). */
  continuarDispensado: string | null;
  mostrarNiveis: boolean;
  /** Jornada do Buscador. Opcionais: progressos anteriores não têm. */
  videosConcluidos?: VideoConcluido[];
  /** Gemas concedidas: código (ou "código:tema") → data. Nunca são retiradas. */
  gemas?: Record<string, string>;
  /** Títulos por tema: tema → título → data. */
  titulos?: Record<string, Record<string, string>>;
  ajustes?: AjusteJornada[];
}

/** O mínimo de um conteúdo publicado que as regras de estudo precisam. */
export interface ItemAcervo {
  sala: SalaSlug;
  slug: string;
  temas: TemaSlug[];
  tipo: TipoConteudo;
  nivel: Nivel;
  publicadoEm: string;
  /** Conta do anfitrião autor; conteúdo próprio não gera crédito de estudo. */
  donoId?: string;
}

/** Vídeo publicado, para as regras de estudo. */
export interface ItemVideo {
  id: string;
  sala: SalaSlug;
  temas: TemaSlug[];
  donoId?: string;
}

export const chaveLeitura = (sala: string, slug: string) => `${sala}/${slug}`;

export function progressoVazio(): ProgressoEstudo {
  return {
    salasVisitadas: [],
    leituras: [],
    temasComparados: [],
    verbetesAbertos: [],
    fontesConferidas: 0,
    trilhas: {},
    estante: [],
    conquistas: {},
    continuarDispensado: null,
    mostrarNiveis: true,
  };
}

/** Eventos de estudo que o cliente emite e o servidor grava. */
export type EventoEstudo =
  | { tipo: "sala"; sala: SalaSlug }
  | { tipo: "leitura"; sala: SalaSlug; slug: string; pct: number }
  | { tipo: "comparacao"; tema: TemaSlug }
  | { tipo: "verbete"; termo: string }
  | { tipo: "fontes" }
  | { tipo: "concluir"; sala: SalaSlug; slug: string }
  | { tipo: "desmarcar"; sala: SalaSlug; slug: string }
  | { tipo: "concluir-video"; id: string }
  | { tipo: "desmarcar-video"; id: string };
