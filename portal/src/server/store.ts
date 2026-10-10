import "server-only";
import { CITACOES } from "@/data/mock/citacoes";
import { CONTEUDOS } from "@/data/mock/conteudos";
import { DESTAQUES_INICIAIS } from "@/data/mock/destaques";
import { FONTES } from "@/data/mock/fontes";
import { VIDEOS } from "@/data/mock/videos";
import type {
  Citacao,
  ConteudoEditorial,
  FonteEditorial,
  RegistroAuditoria,
  SituacaoJuridica,
  VideoEditorial,
} from "@/data/types";
import type { EscolhaDestaques } from "@/features/destaques/vagas";

/*
 * Store do acervo em memória, no servidor. Começa com uma cópia dos dados
 * de demonstração e se perde ao reiniciar o servidor.
 *
 * Fica em globalThis para ser o mesmo objeto para páginas, Server Actions e
 * Route Handlers (e sobreviver ao recarregamento do código em `next dev`).
 * Só funciona com um único processo Node (`next dev` ou `next start`); em
 * ambiente serverless cada instância teria o seu. Para produção, troque este
 * módulo por um banco mantendo as funções de src/data/repositorio.ts e
 * src/server/admin/.
 */

export interface Acervo {
  conteudos: Map<string, ConteudoEditorial>;
  citacoes: Map<string, Citacao>;
  videos: Map<string, VideoEditorial>;
  fontes: Map<string, FonteEditorial>;
  /** Vagas da página Destaques escolhidas pela curadoria (null = automática). */
  destaques: EscolhaDestaques;
}

interface Store {
  acervo: Acervo;
  /** Só inclusão (RNF-04). Ver src/server/auditoria.ts. */
  auditoria: RegistroAuditoria[];
}

export const AUTOR_IMPORTACAO = "Importação do acervo de demonstração";

/** Situação jurídica dos textos de demonstração: trechos curtos com referência. */
const SITUACAO_DEMO: SituacaoJuridica = { tipo: "trecho-permitido" };

function acervoInicial(): Acervo {
  const clone = <T>(v: T): T => structuredClone(v);
  const conteudos = new Map<string, ConteudoEditorial>(
    CONTEUDOS.map((c) => {
      const id = `c-${c.slug}`;
      return [
        id,
        {
          ...clone(c),
          id,
          status: "publicado",
          criadoEm: `${c.publicadoEm}T09:00:00.000Z`,
          atualizadoEm: `${c.publicadoEm}T09:00:00.000Z`,
          criadoPor: AUTOR_IMPORTACAO,
          atualizadoPor: AUTOR_IMPORTACAO,
          situacaoJuridica:
            c.proveniencia === "primaria" && c.sala === "caibalion"
              ? { tipo: "dominio-publico" }
              : SITUACAO_DEMO,
          temaDivergente: false,
          notaDivergencia: "",
          producaoIA: c.proveniencia === "ia",
        },
      ];
    }),
  );
  const videos = new Map<string, VideoEditorial>(
    VIDEOS.map((v) => [
      v.id,
      {
        ...clone(v),
        status: "publicado",
        criadoEm: `${v.publicadoEm}T09:00:00.000Z`,
        atualizadoEm: `${v.publicadoEm}T09:00:00.000Z`,
        criadoPor: AUTOR_IMPORTACAO,
        atualizadoPor: AUTOR_IMPORTACAO,
        // As URLs de demonstração são buscas provisórias no YouTube, sem ID de vídeo.
        youtubeId: "",
        artigos: [],
      },
    ]),
  );
  const fontes = new Map<string, FonteEditorial>(
    FONTES.map((f) => [
      f.id,
      {
        ...clone(f),
        criadoEm: "2026-06-01T09:00:00.000Z",
        atualizadoEm: "2026-06-01T09:00:00.000Z",
        criadoPor: AUTOR_IMPORTACAO,
        atualizadoPor: AUTOR_IMPORTACAO,
      },
    ]),
  );
  const citacoes = new Map<string, Citacao>(CITACOES.map((c) => [c.id, clone(c)]));
  return { conteudos, citacoes, videos, fontes, destaques: clone(DESTAQUES_INICIAIS) };
}

const chave = Symbol.for("sala-dos-buscadores.store");
type ComStore = typeof globalThis & { [chave]?: Store };

function store(): Store {
  const g = globalThis as ComStore;
  g[chave] ??= { acervo: acervoInicial(), auditoria: [] };
  // Um store criado por uma versão anterior do código (recarga em `next dev`) ganha os campos novos.
  g[chave].acervo.destaques ??= structuredClone(DESTAQUES_INICIAIS);
  return g[chave];
}

export function acervo(): Acervo {
  return store().acervo;
}

export function auditoriaBruta(): RegistroAuditoria[] {
  return store().auditoria;
}

/** Volta o acervo aos dados de demonstração. O histórico de auditoria é mantido. */
export function restaurarAcervoInicial(): void {
  store().acervo = acervoInicial();
}
