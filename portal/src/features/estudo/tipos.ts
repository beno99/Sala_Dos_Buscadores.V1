import type { Nivel, SalaSlug, TemaSlug, TipoConteudo } from "@/data/types";

/* Progresso de estudo de uma conta. Privado: nunca aparece para outras pessoas. */

export interface Leitura {
  sala: SalaSlug;
  slug: string;
  /** 0 a 100, acompanha a rolagem do texto. */
  pct: number;
  atualizadaEm: string;
  /** Preenchido quando a pessoa chega ao fim do texto. */
  concluidaEm?: string;
}

export type ConquistaId =
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
}

/** O mínimo de um conteúdo publicado que as regras de estudo precisam. */
export interface ItemAcervo {
  sala: SalaSlug;
  slug: string;
  temas: TemaSlug[];
  tipo: TipoConteudo;
  nivel: Nivel;
  publicadoEm: string;
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
  | { tipo: "fontes" };
