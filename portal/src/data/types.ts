/**
 * Modelo de domínio do acervo (DRS, cap. 5.2 e 5.3).
 * Os dados simulados em src/data/mock seguem estes tipos; um backend real
 * deve devolver o mesmo formato pelos repositórios em src/data/repositorio.ts.
 */

/** Nível de aprofundamento: 1 iniciante, 2 intermediário, 3 avançado. */
export type Nivel = 1 | 2 | 3;

/** Proveniência do conteúdo (RF-12). */
export type Proveniencia = "primaria" | "curado" | "especialista" | "comunidade" | "ia";

/** Formato de mídia (RF-11, RF-20). Áudio fica para uma próxima etapa. */
export type Formato = "texto" | "video";

export type TipoConteudo = "artigo" | "fonte-primaria" | "verbete" | "video";

/** Placa da marca usada como fundo de mídia (cards de Sala, vídeo e grade). */
export type Placa = "bordo" | "grafite" | "bege";

export type TemaSlug = "morte" | "alma" | "meditacao" | "origem-do-universo" | "conhecimento-interior";

export type SalaSlug =
  | "nag-hammadi"
  | "corpus-hermeticum"
  | "caibalion"
  | "apocrifos-cristianismo-primitivo"
  | "urantia";

export interface Tema {
  slug: TemaSlug;
  nome: string;
  /** Termos que, digitados na busca, levam a este tema (sem acento, minúsculos). */
  sinonimos: string[];
}

export interface Sala {
  slug: SalaSlug;
  nome: string;
  /** Tradição ou corpus em uma linha. */
  tradicao: string;
  /** Rótulo curto para a grade comparativa. */
  tradicaoCurta: string;
  descricao: string;
  periodo: string;
  placa: Placa;
  /** Data ISO da última atualização editorial. */
  atualizadaEm: string;
  /** Inicial usada nas capas compostas. */
  inicial: string;
}

export interface Autoria {
  nome: string;
  credencial: string;
}

/** Texto com marcações mínimas: *termo* vira <dfn>, _obra_ vira <cite>. */
export type TextoMarcado = string;

export interface Conteudo {
  slug: string;
  sala: SalaSlug;
  tipo: TipoConteudo;
  titulo: string;
  resumo: string;
  temas: TemaSlug[];
  periodo: string;
  nivel: Nivel;
  formato: Formato;
  proveniencia: Proveniencia;
  /** Tempo de leitura ou duração, em minutos. */
  duracaoMin: number;
  autoria: Autoria;
  publicadoEm: string;
  corpo: TextoMarcado[];
  citacao?: string;
  fontes: string[];
  /** Nota que apresenta as leituras divergentes do tema (RNF-DOM-03). */
  divergencia?: string;
}

export interface Citacao {
  id: string;
  sala: SalaSlug;
  obra: string;
  localizacao: string;
  proveniencia: Proveniencia;
  /** Rótulo do selo quando difere do padrão (ex.: "Tradução editorial"). */
  rotuloSelo?: string;
  original?: { texto: string; lang: string; idioma: string };
  traducao: string;
  rotuloTraducao?: string;
  referencia: string;
  capa: Placa;
  inicial: string;
}

export interface Verbete {
  termo: string;
  origem: string;
  /** Um parágrafo por Sala quando o termo muda de sentido entre tradições. */
  definicoes: { sala: SalaSlug; texto: TextoMarcado }[];
  redigidoPor: string;
}

export interface Video {
  id: string;
  sala: SalaSlug;
  titulo: string;
  /** mm:ss */
  duracao: string;
  tema: TemaSlug;
  nivel: Nivel;
  episodio: string;
  publicadoEm: string;
  url: string;
  placa: Placa;
  /** Slugs dos conteúdos da mesma Sala junto dos quais o vídeo aparece. */
  conteudos?: string[];
  /** Miniatura em public/imagens/episodios, quando existe; sem ela, a placa da marca. */
  imagem?: string;
}

export type TipoFonte = "Fonte primária" | "Tradução comentada" | "Estudo acadêmico" | "Edição crítica";

export interface Fonte {
  id: string;
  titulo: string;
  autor: string;
  tradicao: string;
  tipo: TipoFonte;
  referencia: string;
  url?: string;
  capa: Placa;
  inicial: string;
}

export type RespostaComparada =
  | {
      sala: SalaSlug;
      vazia?: false;
      resposta: TextoMarcado;
      nivel: Nivel;
      proveniencia: Proveniencia;
      referencia: string;
      conteudo?: string;
    }
  | {
      sala: SalaSlug;
      vazia: true;
      nota: string;
      linkRotulo: string;
      conteudo?: string;
    };

export interface Comparacao {
  tema: TemaSlug;
  pergunta: string;
  temasLigados: TemaSlug[];
  respostas: RespostaComparada[];
}

/** Trecho da resposta do assistente (RF-29). */
export interface TrechoResposta {
  tipo: "doc" | "editorial" | "ai";
  rotulo: string;
  texto: TextoMarcado;
  /** Números das fontes citadas, na ordem de `fontes`. */
  refs: number[];
  sala?: SalaSlug;
}

export interface RespostaAssistente {
  id: string;
  /** Pergunta de exemplo, usada nas sugestões. */
  exemplo: string;
  /** Termos que ativam esta resposta (sem acento, minúsculos). */
  gatilhos: string[];
  salas: SalaSlug[];
  trechos: TrechoResposta[];
  /** Fontes citadas, numeradas a partir de 1. */
  fontes: { titulo: string; referencia: string; capa: Placa; inicial: string; href?: string }[];
  trechosLidos: number;
}

// ---------- Curadoria (área administrativa) ----------

/** Ciclo de publicação: só "publicado" aparece no portal público. */
export type StatusEditorial = "rascunho" | "publicado" | "arquivado";

/** Situação jurídica declarada do texto (RF-15, RNF-DOM-04). */
export type SituacaoJuridica =
  | { tipo: "dominio-publico" }
  | { tipo: "licenca"; licenca: string }
  | { tipo: "cessao"; registro: string }
  | { tipo: "trecho-permitido" };

/** Campos de controle editorial comuns a artigos e vídeos. */
export interface MetaEditorial {
  id: string;
  status: StatusEditorial;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: string;
  atualizadoPor: string;
}

/**
 * Conteúdo como a curadoria o vê: o contrato público `Conteudo` mais os
 * campos editoriais. `publicadoEm` fica vazio até a primeira publicação.
 */
export interface ConteudoEditorial extends Conteudo, MetaEditorial {
  situacaoJuridica: SituacaoJuridica | null;
  temaDivergente: boolean;
  notaDivergencia: string;
  /** Texto produzido com auxílio de IA: a proveniência só pode ser "ia". */
  producaoIA: boolean;
}

export interface VideoEditorial extends Video, MetaEditorial {
  /** ID extraído da URL do YouTube; vazio quando a URL é provisória. */
  youtubeId: string;
  /** IDs dos conteúdos da mesma Sala ligados ao vídeo. */
  artigos: string[];
}

export interface FonteEditorial extends Fonte {
  criadoEm: string;
  atualizadoEm: string;
  criadoPor: string;
  atualizadoPor: string;
}

export type TipoItemAuditado = "artigo" | "video" | "fonte" | "acervo" | "destaques";

export type AcaoAuditada =
  | "criou"
  | "editou"
  | "publicou"
  | "despublicou"
  | "arquivou"
  | "restaurou"
  | "duplicou"
  | "excluiu"
  | "alterou-proveniencia"
  | "alterou-situacao-juridica"
  | "restaurou-acervo";

/** Registro do histórico de auditoria (RNF-04). Só inclusão, nunca edição. */
export interface RegistroAuditoria {
  id: string;
  quando: string;
  quem: string;
  acao: AcaoAuditada;
  tipoItem: TipoItemAuditado;
  itemId: string;
  itemTitulo: string;
  mudancas?: { campo: string; antes: string; depois: string }[];
}
