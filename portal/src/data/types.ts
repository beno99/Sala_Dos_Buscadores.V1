import type { BlocoTexto } from "@/design-system/marcacao.mjs";
/**
 * Modelo de domínio do acervo (DRS, cap. 5.2 e 5.3).
 * O banco (modules/*) guarda estes formatos; as telas os recebem pelos
 * repositórios em src/data/repositorio.ts.
 */

/** Nível de aprofundamento: 1 iniciante, 2 intermediário, 3 avançado. */
export type Nivel = 1 | 2 | 3;

/** Proveniência do conteúdo (RF-12). "anfitriao": escrito por anfitrião e revisado pela curadoria. */
export type Proveniencia = "primaria" | "curado" | "especialista" | "comunidade" | "ia" | "anfitriao";

/** Formato de mídia (RF-11, RF-20). Áudio fica para uma próxima etapa. */
export type Formato = "texto" | "video";

export type TipoConteudo = "artigo" | "fonte-primaria" | "verbete" | "video";

/** Placa da marca usada como fundo de mídia (cards de Sala, vídeo e grade). */
export type Placa = "bordo" | "grafite" | "bege";

export type TemaSlug = "morte" | "alma" | "meditacao" | "origem-do-universo" | "conhecimento-interior";

/**
 * Endereço de uma Sala. As oficiais vêm do acervo de demonstração; as de
 * anfitriões nascem em tempo de execução, então o tipo é aberto.
 */
export type SalaSlug = string;

/** Quem mantém a Sala: a curadoria ou um anfitrião (com revisão da curadoria). */
export type OrigemSala = "oficial" | "anfitriao";

/** Assinatura pública de um anfitrião, levada à Sala e aos artigos dele. */
export interface AssinaturaAnfitriao {
  nome: string;
  credencial: string;
  /** Endereço da página pública do anfitrião (/anfitrioes/[slug]). */
  slug: string;
}

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
  origem: OrigemSala;
  /** Grade comparativa e acervo do assistente. Nas oficiais, sempre true; nas de anfitrião, só o admin liga. */
  naComparacao: boolean;
  /** Imagem da Sala (card e topo da página); sem ela, a placa da marca com a inicial. */
  imagem?: string;
  /** Link geral da Sala (site ou canal do anfitrião), só https. */
  link?: string;
  /** Nas Salas de anfitrião: quem responde por ela. */
  anfitriao?: AssinaturaAnfitriao;
}

export interface Autoria {
  nome: string;
  credencial: string;
}

/** Texto com marcações mínimas: *termo* vira <dfn>, ::obra:: vira <cite>. */
export type TextoMarcado = string;

/**
 * Um bloco do corpo do conteúdo (Corpo do artigo). O texto solto é um
 * parágrafo, e o primeiro bloco, sempre um parágrafo, é o lead.
 */
export type BlocoCorpo =
  | TextoMarcado // Leitura de dados legados; edições novas usam objetos.
  | BlocoTexto
  | { tipo: "imagem"; src: string; alt: string; credito: string; legenda?: string; midia?: string };

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
  corpo: BlocoCorpo[];
  citacao?: string;
  fontes: string[];
  /** Nota que apresenta as leituras divergentes do tema (RNF-DOM-03). */
  divergencia?: string;
  /** Artigo de anfitrião: um link só, vídeo do YouTube (player) ou site externo ("Ler no site"). */
  link?: LinkArtigo;
  /** Imagem do card (URL de /midia); sem ela, a placa da marca. */
  imagem?: string;
  /** Topo da página do artigo (URL de /midia); sem ela, a imagem do card ou a placa. */
  thumb?: string;
  /** Artigo de anfitrião: quem assina (leva à página pública do anfitrião). */
  anfitriao?: AssinaturaAnfitriao;
}

export type LinkArtigo = { tipo: "youtube"; url: string; youtubeId: string } | { tipo: "site"; url: string };

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
  fontes: {
    titulo: string;
    referencia: string;
    capa: Placa;
    inicial: string;
    href?: string;
    /** Leitura de anfitrião: a citação leva o selo. */
    proveniencia?: Proveniencia;
  }[];
  trechosLidos: number;
}

// ---------- Curadoria (área administrativa) ----------

/**
 * Ciclo de publicação: só "publicado" aparece no portal público.
 * A curadoria usa rascunho, publicado e arquivado. Os itens de anfitrião
 * passam também por "em_revisao" e "reprovado" (features/anfitriao/regras/ciclo.ts).
 */
export type StatusEditorial = "rascunho" | "em_revisao" | "publicado" | "reprovado" | "arquivado";

/** Uma decisão da curadoria sobre um envio de anfitrião. */
export interface DecisaoRevisao {
  quando: string;
  /** Pseudônimo de quem decidiu. */
  quem: string;
  decisao: "aprovado" | "reprovado";
  motivo?: string;
  /** O anfitrião já viu a decisão (contador de novidades). */
  vista: boolean;
}

/** Controle de revisão de uma Sala ou de um artigo de anfitrião. */
export interface RevisaoAnfitriao {
  /** Id da conta do anfitrião dono do item. */
  donoId: string;
  /** Já esteve no ar: não pode mais ser excluído, só retirado (arquivado). */
  jaPublicado: boolean;
  /** Último envio para revisão. */
  enviadoEm?: string;
  /** Aceite de direitos sobre imagens e textos, registrado no envio. */
  aceite?: { quem: string; quando: string };
  /** Motivo da última reprovação. */
  ultimoMotivo?: string;
  decisoes: DecisaoRevisao[];
  /** Conta rebaixada com "manter publicado e congelado": ninguém edita; o admin só despublica ou transfere. */
  congelado?: boolean;
}

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
  /** Só nos artigos de anfitrião: dono, envio e decisões. A curadoria não os edita. */
  revisao?: RevisaoAnfitriao;
  /** Ids de mídia das imagens enviadas pelo anfitrião (as URLs públicas ficam em `imagem` e `thumb`). */
  midias?: { card?: string; thumb?: string };
}

/** Sala como a curadoria e o anfitrião a veem: o contrato público mais os campos editoriais. */
export interface SalaEditorial extends Sala, MetaEditorial {
  /** Só nas Salas de anfitrião. */
  revisao?: RevisaoAnfitriao;
  /** Sala oficial: data da primeira publicação. Depois dela, o slug fica travado. */
  publicadaEm?: string;
  /** Sala oficial arquivada: o status de antes, para "Restaurar" devolver tudo como estava. */
  statusAntesDeArquivar?: StatusEditorial;
  /** Id de mídia da imagem enviada pelo anfitrião. */
  midia?: string;
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
  /**
   * Fonte proposta por anfitrião: só ele a vê até o artigo que a usa ser
   * aprovado; então entra no catálogo público.
   */
  proposta?: { donoId: string; pendente: boolean };
}

// ---------- Anfitriões ----------

/** Perfil público do anfitrião (/anfitrioes/[slug]). Editar não passa por revisão, mas fica na auditoria. */
export interface PerfilAnfitriao {
  /** Id da conta. */
  contaId: string;
  nome: string;
  slug: string;
  credencial: string;
  apresentacao: string;
  /** Id de mídia do avatar. */
  avatar?: string;
  link?: string;
  atualizadoEm: string;
}

export type StatusCandidatura = "pendente" | "aprovada" | "recusada";

export interface Candidatura {
  id: string;
  contaId: string;
  email: string;
  nome: string;
  credencial: string;
  apresentacao: string;
  link?: string;
  status: StatusCandidatura;
  enviadaEm: string;
  decididaEm?: string;
  decididaPor?: string;
  /** Obrigatório na recusa; o membro vê e pode se candidatar de novo. */
  motivo?: string;
}

/** "expirado" não é guardado: sai da data (features/anfitriao/regras/convite.ts). */
export type StatusConviteGuardado = "pendente" | "usado" | "revogado";
export type StatusConvite = StatusConviteGuardado | "expirado";

export interface Convite {
  id: string;
  token: string;
  email: string;
  criadoEm: string;
  expiraEm: string;
  criadoPor: string;
  status: StatusConviteGuardado;
  usadoEm?: string;
  revogadoEm?: string;
}

/** E-mail registrado na caixa de saída simulada (src/server/caixa-saida.ts). */
export interface EmailEnviado {
  id: string;
  para: string;
  assunto: string;
  corpo: string;
  quando: string;
}

export type TipoItemAuditado =
  | "artigo"
  | "video"
  | "fonte"
  | "acervo"
  | "destaques"
  | "sala"
  | "usuario"
  | "candidatura"
  | "convite";

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
  | "restaurou-acervo"
  | "enviou-para-revisao"
  | "aprovou"
  | "reprovou"
  | "promoveu"
  | "rebaixou"
  | "convidou"
  | "revogou-convite"
  | "transferiu"
  | "incluiu-na-comparacao"
  | "removeu-da-comparacao"
  | "editou-perfil";

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

// ---------- Comunidade (autoria de pessoas, sem revisão editorial) ----------
export type TipoPublicacao = "reflexao" | "citacao" | "pergunta" | "achado";
export type EstadoComunidade = "visivel" | "oculta" | "removida";
export interface Publicacao {
  id: string;
  autorId: string;
  tipo: TipoPublicacao;
  texto: string;
  salaSlug?: SalaSlug;
  temas: TemaSlug[];
  imagem?: { src: string; alt: string; credito?: string };
  citacao?: { trecho: string; obra: string; passagem: string };
  conteudoId?: string;
  perguntaDirigidaA?: string;
  respostaQueAjudouId?: string;
  fixada: boolean;
  estado: EstadoComunidade;
  criadaEm: string;
  editadaEm?: string;
}
export interface ComentarioComunidade {
  id: string;
  publicacaoId: string;
  autorId: string;
  paiId?: string;
  texto: string;
  imagem?: { src: string; alt: string };
  estado: EstadoComunidade;
  criadaEm: string;
}
export type AlvoComunidade = { tipo: "publicacao" | "comentario"; id: string };
export type TipoReacaoComunidade = "curtir" | "util" | "pensar" | "aprofundar";
export interface ReacaoComunidade {
  alvo: AlvoComunidade;
  pessoa: string;
  tipo: TipoReacaoComunidade;
}
export interface SeguirComunidade {
  seguidor: string;
  alvo: { tipo: "pessoa" | "sala"; id: string };
}
export interface SalvoComunidade {
  pessoa: string;
  publicacaoId: string;
  criadoEm: string;
}
export type MotivoDenunciaComunidade =
  | "desrespeito"
  | "proselitismo"
  | "saude"
  | "dados-pessoais"
  | "sem-fonte";
export interface DenunciaComunidade {
  id: string;
  denuncianteId: string;
  alvo: AlvoComunidade;
  motivo: MotivoDenunciaComunidade;
  nota?: string;
  estado: "pendente" | "procedente" | "improcedente";
  criadaEm: string;
  decididaPor?: string;
  motivoDecisao?: string;
}
export interface DadosComunidade {
  publicacoes: Map<string, Publicacao>;
  comentarios: Map<string, ComentarioComunidade>;
  reacoes: ReacaoComunidade[];
  seguindo: SeguirComunidade[];
  salvos: SalvoComunidade[];
  denuncias: Map<string, DenunciaComunidade>;
}
