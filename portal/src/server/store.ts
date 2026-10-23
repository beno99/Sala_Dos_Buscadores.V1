import "server-only";
import { instalarRegistroSalas } from "@/data/catalogo";
import {
  artigosDeAnfitrioesIniciais,
  candidaturasIniciais,
  convitesIniciais,
  fontesPropostasIniciais,
  perfisIniciais,
  salasDeAnfitrioesIniciais,
} from "@/data/mock/anfitrioes";
import { CITACOES } from "@/data/mock/citacoes";
import { comunidadeInicial } from "@/data/mock/comunidade";
import { CONTEUDOS } from "@/data/mock/conteudos";
import { DESTAQUES_INICIAIS } from "@/data/mock/destaques";
import { FONTES } from "@/data/mock/fontes";
import { SALAS } from "@/data/mock/salas";
import { VIDEOS } from "@/data/mock/videos";
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
  Sala,
  SalaEditorial,
  SituacaoJuridica,
  VideoEditorial,
} from "@/data/types";
import { migrarTextoLegado } from "@/design-system/marcacao.mjs";
import type { TipoImagem } from "@/features/anfitriao/regras/imagem";
import { ordenarSalas, salaVisivel } from "@/features/anfitriao/regras/visibilidade";
import { instalarLeiturasDoAssistente, type LeituraParaAssistente } from "@/features/assistente/motor";
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
  comunidade: DadosComunidade;
  /** Salas oficiais e de anfitriões, pelo id (nas oficiais, o id é o próprio slug). */
  salas: Map<string, SalaEditorial>;
  conteudos: Map<string, ConteudoEditorial>;
  citacoes: Map<string, Citacao>;
  videos: Map<string, VideoEditorial>;
  fontes: Map<string, FonteEditorial>;
  /** Vagas da página Destaques escolhidas pela curadoria (null = automática). */
  destaques: EscolhaDestaques;
  /** Perfis públicos dos anfitriões, pelo id da conta. */
  perfis: Map<string, PerfilAnfitriao>;
  candidaturas: Map<string, Candidatura>;
  convites: Map<string, Convite>;
  /** Imagens enviadas por anfitriões (servidas por /midia/[id]). */
  midias: Map<string, MidiaGuardada>;
}

export interface MidiaGuardada {
  id: string;
  tipo: TipoImagem;
  bytes: Uint8Array;
  /** Id da conta que enviou. */
  donoId: string;
  criadoEm: string;
}

interface Store {
  versaoMarcacao?: 2;
  acervo: Acervo;
  /** Só inclusão (RNF-04). Ver src/server/auditoria.ts. */
  auditoria: RegistroAuditoria[];
  /** Caixa de saída simulada (src/server/caixa-saida.ts). Sobrevive a "Restaurar acervo". */
  caixaSaida: EmailEnviado[];
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
          temaDivergente: Boolean(c.divergencia),
          notaDivergencia: c.divergencia ?? "",
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
        artigos: (v.conteudos ?? []).map((slug) => `c-${slug}`),
      },
    ]),
  );
  const fontes = new Map<string, FonteEditorial>([
    ...FONTES.map((f): [string, FonteEditorial] => [
      f.id,
      {
        ...clone(f),
        criadoEm: "2026-06-01T09:00:00.000Z",
        atualizadoEm: "2026-06-01T09:00:00.000Z",
        criadoPor: AUTOR_IMPORTACAO,
        atualizadoPor: AUTOR_IMPORTACAO,
      },
    ]),
    ...fontesPropostasIniciais().map((f): [string, FonteEditorial] => [f.id, f]),
  ]);
  for (const c of artigosDeAnfitrioesIniciais()) conteudos.set(c.id, c);
  const citacoes = new Map<string, Citacao>(CITACOES.map((c) => [c.id, clone(c)]));
  const salas = new Map<string, SalaEditorial>(
    SALAS.map((s) => [
      s.slug,
      {
        ...clone(s),
        id: s.slug,
        status: "publicado",
        publicadaEm: s.atualizadaEm,
        criadoEm: `${s.atualizadaEm}T09:00:00.000Z`,
        atualizadoEm: `${s.atualizadaEm}T09:00:00.000Z`,
        criadoPor: AUTOR_IMPORTACAO,
        atualizadoPor: AUTOR_IMPORTACAO,
      },
    ]),
  );
  for (const s of salasDeAnfitrioesIniciais()) salas.set(s.id, s);
  return {
    comunidade: comunidadeInicial(),
    salas,
    conteudos,
    citacoes,
    videos,
    fontes,
    destaques: clone(DESTAQUES_INICIAIS),
    perfis: new Map(perfisIniciais().map((p) => [p.contaId, p])),
    candidaturas: new Map(candidaturasIniciais().map((c) => [c.id, c])),
    convites: new Map(convitesIniciais().map((c) => [c.id, c])),
    midias: new Map(),
  };
}

const chave = Symbol.for("sala-dos-buscadores.store");
type ComStore = typeof globalThis & { [chave]?: Store };

function store(): Store {
  const g = globalThis as ComStore;
  g[chave] ??= { acervo: acervoInicial(), auditoria: [], caixaSaida: [], versaoMarcacao: 2 };
  // Um store criado por uma versão anterior do código (recarga em `next dev`) volta ao acervo
  // de demonstração quando o formato mudou (Salas e anfitriões chegaram depois).
  if (!g[chave].acervo.salas || !g[chave].acervo.perfis) g[chave].acervo = acervoInicial();
  if (g[chave].versaoMarcacao !== 2) {
    // Migra uma única vez o acervo vivo de uma versão anterior, sem reiniciar nem apagar rascunhos.
    for (const c of g[chave].acervo.conteudos.values()) {
      c.corpo = c.corpo.map((b) => {
        if (typeof b === "string") return { tipo: "paragrafo", texto: migrarTextoLegado(b) };
        if (b.tipo === "imagem") return b;
        if (b.tipo === "lista") return { ...b, itens: b.itens.map(migrarTextoLegado) };
        if (b.tipo === "destaque")
          return { ...b, texto: migrarTextoLegado(b.texto), atribuicao: migrarTextoLegado(b.atribuicao) };
        return { ...b, texto: migrarTextoLegado(b.texto) };
      });
    }
    g[chave].versaoMarcacao = 2;
  }
  // Migração aditiva: preserva os rascunhos e as edições da sessão.
  if (!g[chave].acervo.comunidade) {
    g[chave].acervo.comunidade = comunidadeInicial();
    for (const perfil of perfisIniciais()) {
      if (!g[chave].acervo.perfis.has(perfil.contaId)) g[chave].acervo.perfis.set(perfil.contaId, perfil);
    }
  }
  g[chave].caixaSaida ??= [];
  return g[chave];
}

/** Só os campos públicos da Sala (sem status nem autoria editorial). */
export function salaParaPublico(s: SalaEditorial): Sala {
  const publico: Sala = {
    slug: s.slug,
    nome: s.nome,
    tradicao: s.tradicao,
    tradicaoCurta: s.tradicaoCurta,
    descricao: s.descricao,
    periodo: s.periodo,
    placa: s.placa,
    atualizadaEm: s.atualizadaEm,
    inicial: s.inicial,
    origem: s.origem,
    naComparacao: s.naComparacao,
  };
  if (s.imagem) publico.imagem = s.imagem;
  if (s.link) publico.link = s.link;
  if (s.anfitriao) publico.anfitriao = { ...s.anfitriao };
  return publico;
}

/** Salas que o público vê agora (regra em features/anfitriao/regras/visibilidade.ts). */
export function salasVisiveis(): Sala[] {
  const { salas, conteudos } = store().acervo;
  const artigos = [...conteudos.values()];
  return ordenarSalas([...salas.values()].filter((s) => salaVisivel(s, artigos)).map(salaParaPublico));
}

/** Artigos publicados das Salas de anfitrião no ar (o motor filtra as que estão na comparação). */
export function leiturasParaAssistente(): LeituraParaAssistente[] {
  const salas = salasVisiveis().filter((s) => s.origem === "anfitriao");
  const porSlug = new Map(salas.map((s) => [s.slug, s]));
  return [...store().acervo.conteudos.values()]
    .filter((c) => c.status === "publicado" && c.revisao && porSlug.has(c.sala))
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
    .map((c) => ({
      sala: c.sala,
      salaNome: porSlug.get(c.sala)?.nome ?? c.sala,
      slug: c.slug,
      titulo: c.titulo,
      resumo: c.resumo,
      temas: [...c.temas],
      autoria: `${c.autoria.nome} · ${c.autoria.credencial}`,
    }));
}

// O catálogo (src/data/catalogo.ts) lê as Salas visíveis daqui, no servidor; o assistente, as leituras.
instalarRegistroSalas(salasVisiveis);
instalarLeiturasDoAssistente(leiturasParaAssistente);

export function acervo(): Acervo {
  return store().acervo;
}

export function auditoriaBruta(): RegistroAuditoria[] {
  return store().auditoria;
}

export function caixaSaidaBruta(): EmailEnviado[] {
  return store().caixaSaida;
}

/** Volta o acervo aos dados de demonstração. O histórico de auditoria é mantido. */
export function restaurarAcervoInicial(): void {
  store().acervo = acervoInicial();
}
