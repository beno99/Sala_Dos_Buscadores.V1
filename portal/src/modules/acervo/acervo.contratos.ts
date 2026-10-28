import type {
  Candidatura,
  Citacao,
  ConteudoEditorial,
  Convite,
  DadosComunidade,
  EmailEnviado,
  FonteEditorial,
  PerfilAnfitriao,
  RegistroAuditoria,
  SalaEditorial,
  VideoEditorial,
} from "@/data/types";
import type { TipoImagem } from "@/features/anfitriao/regras/imagem";
import type { EscolhaDestaques } from "@/features/destaques/vagas";
import type { ProgressoEstudo } from "@/features/estudo/tipos";
import type { Membro } from "@/modules/conta/conta.contratos";

/*
 * Contratos da persistência do acervo. O servidor trabalha sobre um snapshot
 * em memória (src/server/store.ts) carregado deste repositório; cada mudança
 * no snapshot vira uma `Gravacao` aplicada no banco, na ordem em que ocorreu.
 */

/** Metadados de uma imagem enviada; os bytes ficam no armazenamento de arquivos (S3). */
export interface MidiaGuardada {
  id: string;
  chave: string;
  tipo: TipoImagem;
  tamanho: number;
  /** Id da conta que enviou. */
  donoId: string;
  criadoEm: string;
}

export interface PerfilBuscador {
  fotoId?: string;
  capaId?: string;
  sobre: string;
}

/** Coleções endereçadas por id: cada uma é uma tabela. */
export interface Colecoes {
  salas: SalaEditorial;
  conteudos: ConteudoEditorial;
  citacoes: Citacao;
  videos: VideoEditorial;
  fontes: FonteEditorial;
  perfis: PerfilAnfitriao;
  candidaturas: Candidatura;
  convites: Convite;
  midias: MidiaGuardada;
  progresso: ProgressoEstudo;
  perfisBuscador: PerfilBuscador;
}

export type NomeColecao = keyof Colecoes;

export interface DadosCarregados {
  versao: number;
  /** Diretório só de leitura; as contas mudam pelo módulo de conta, que soma a versão. */
  contas: Map<string, Membro>;
  colecoes: { [K in NomeColecao]: Map<string, Colecoes[K]> };
  destaques: EscolhaDestaques | null;
  comunidade: DadosComunidade;
  auditoria: RegistroAuditoria[];
  caixaSaida: EmailEnviado[];
}

export type Gravacao =
  | { [K in NomeColecao]: { tipo: "gravar"; colecao: K; id: string; valor: Colecoes[K] } }[NomeColecao]
  | { tipo: "apagar"; colecao: NomeColecao; id: string }
  | { tipo: "destaques"; valor: EscolhaDestaques }
  | { tipo: "auditoria"; valor: RegistroAuditoria }
  | { tipo: "email"; valor: EmailEnviado };

export interface AcervoRepositorio {
  versao(): Promise<number>;
  carregar(): Promise<DadosCarregados>;
  /** Aplica a gravação e devolve a nova versão dos dados. */
  aplicar(gravacao: Gravacao): Promise<number>;
}
