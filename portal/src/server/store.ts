import "server-only";
import { instalarRegistroSalas, instalarRegistroTemas } from "@/data/catalogo";
import type {
  Candidatura,
  Citacao,
  ConteudoEditorial,
  Convite,
  DadosComunidade,
  EmailEnviado,
  FonteEditorial,
  PerfilAnfitriao,
  ReacaoComunidade,
  RegistroAuditoria,
  Sala,
  SalaEditorial,
  SalvoComunidade,
  SeguirComunidade,
  Tema,
  TemaEditorial,
  VideoEditorial,
} from "@/data/types";
import { ordenarSalas, salaVisivel } from "@/features/anfitriao/regras/visibilidade";
import { instalarLeiturasDoAssistente, type LeituraParaAssistente } from "@/features/assistente/motor";
import { type EscolhaDestaques, VAGAS_VAZIAS } from "@/features/destaques/vagas";
import type { ProgressoEstudo } from "@/features/estudo/tipos";
import type {
  AcaoRelacao,
  AcervoRepositorio,
  Colecoes,
  DadosCarregados,
  Gravacao,
  MidiaGuardada,
  NomeColecao,
  PerfilBuscador,
} from "@/modules/acervo/acervo.contratos";
import { acervoRepositorio } from "@/modules/acervo/acervo.repositorio";
import type { Membro } from "@/modules/conta/conta.contratos";
import { aoMudarConta } from "@/modules/conta/conta.repositorio";

export type { MidiaGuardada, PerfilBuscador } from "@/modules/acervo/acervo.contratos";

/*
 * Snapshot do acervo no servidor, carregado do Postgres (modules/acervo).
 *
 * As regras de negócio leem e escrevem nos Maps abaixo de forma síncrona,
 * como antes; cada `set`/`delete` entra numa fila que grava no banco na
 * ordem em que aconteceu. As Server Actions esperam a fila esvaziar
 * (`aguardarGravacoes`) antes de responder, então um erro de banco chega a
 * quem agiu, e o snapshot é recarregado.
 *
 * Toda gravação soma 1 na versão dos dados. No começo de cada pedido,
 * `sincronizarAcervo` compara a versão do banco com a deste processo e
 * recarrega se outra instância gravou.
 *
 * ponytail: o acervo inteiro fica na memória de cada instância e a última
 * gravação vence entre instâncias; trocar por consultas paginadas no banco
 * quando o acervo passar de alguns milhares de itens.
 */

/** Map que grava cada mudança no banco. */
class MapPersistido<K extends NomeColecao> extends Map<string, Colecoes[K]> {
  readonly #colecao: K;

  constructor(colecao: K, inicial: Map<string, Colecoes[K]>) {
    super();
    this.#colecao = colecao;
    for (const [id, valor] of inicial) super.set(id, valor);
  }

  override set(id: string, valor: Colecoes[K]): this {
    super.set(id, valor);
    enfileirar({ tipo: "gravar", colecao: this.#colecao, id, valor: structuredClone(valor) } as Gravacao);
    return this;
  }

  override delete(id: string): boolean {
    const tinha = super.delete(id);
    if (tinha) enfileirar({ tipo: "apagar", colecao: this.#colecao, id });
    return tinha;
  }

  override clear(): never {
    throw new Error("o acervo não é apagado em bloco.");
  }
}

export interface Acervo {
  comunidade: DadosComunidade;
  /** Salas oficiais e de anfitriões, pelo id (nas oficiais, o id é o próprio slug). */
  salas: Map<string, SalaEditorial>;
  conteudos: Map<string, ConteudoEditorial>;
  citacoes: Map<string, Citacao>;
  videos: Map<string, VideoEditorial>;
  fontes: Map<string, FonteEditorial>;
  /** Vagas da página Destaques escolhidas pela curadoria (null = automática). Atribuir grava. */
  destaques: EscolhaDestaques;
  /** Perfis públicos dos anfitriões, pelo id da conta. */
  perfis: Map<string, PerfilAnfitriao>;
  candidaturas: Map<string, Candidatura>;
  convites: Map<string, Convite>;
  /** Imagens enviadas (metadados; os bytes ficam no armazenamento S3). */
  midias: Map<string, MidiaGuardada>;
  temas: Map<string, TemaEditorial>;
}

interface Store {
  versao: number;
  /** Diretório de contas, só de leitura (as contas mudam por modules/conta). */
  contas: Map<string, Membro>;
  /** Uma gravação falhou ou outra instância gravou entre as nossas: recarregar no próximo pedido. */
  desatualizado: boolean;
  acervo: Acervo;
  /** Progresso de estudo, pelo id da conta. Privado. */
  progresso: Map<string, ProgressoEstudo>;
  /** Perfil do buscador (foto, capa, "Sobre"), pelo id da conta. Privado. */
  perfisBuscador: Map<string, PerfilBuscador>;
  /** Só inclusão (RNF-04). Ver src/server/auditoria.ts. */
  auditoria: RegistroAuditoria[];
  /** Caixa de saída (src/server/caixa-saida.ts). */
  caixaSaida: EmailEnviado[];
}

interface Estado {
  repositorio: AcervoRepositorio;
  store?: Store;
  carregando?: Promise<void>;
  fila: Promise<void>;
  erros: unknown[];
}

const chave = Symbol.for("sala-dos-buscadores.store");
type ComEstado = typeof globalThis & { [chave]?: Estado };

function estado(): Estado {
  const g = globalThis as ComEstado;
  g[chave] ??= { repositorio: acervoRepositorio, fila: Promise.resolve(), erros: [] };
  return g[chave];
}

function enfileirar(gravacao: Gravacao) {
  const e = estado();
  const alvo = e.store;
  e.fila = e.fila
    .then(async () => {
      const nova = await e.repositorio.aplicar(gravacao);
      if (!alvo) return;
      if (nova === alvo.versao + 1) alvo.versao = nova;
      else alvo.desatualizado = true;
    })
    .catch((erro) => {
      console.error("Falha ao gravar no banco; o acervo será recarregado.", erro);
      if (alvo) alvo.desatualizado = true;
      e.erros.push(erro);
    });
}

/** Liga ou desliga uma relação da comunidade (reação, seguir, salvo). Devolve se ficou ligada. */
function alternar<T>(
  lista: T[],
  valor: T,
  igual: (item: T) => boolean,
  gravacao: (acao: AcaoRelacao) => Gravacao,
): boolean {
  const i = lista.findIndex(igual);
  if (i >= 0) lista.splice(i, 1);
  else lista.push(valor);
  enfileirar(gravacao(i >= 0 ? "remover" : "incluir"));
  return i < 0;
}

export function alternarReacao(r: ReacaoComunidade): boolean {
  return alternar(
    store().acervo.comunidade.reacoes,
    r,
    (x) =>
      x.alvo.tipo === r.alvo.tipo && x.alvo.id === r.alvo.id && x.pessoa === r.pessoa && x.tipo === r.tipo,
    (acao) => ({ tipo: "reacao", acao, valor: r }),
  );
}

export function alternarSeguir(s: SeguirComunidade): boolean {
  return alternar(
    store().acervo.comunidade.seguindo,
    s,
    (x) => x.seguidor === s.seguidor && x.alvo.tipo === s.alvo.tipo && x.alvo.id === s.alvo.id,
    (acao) => ({ tipo: "seguir", acao, valor: s }),
  );
}

export function alternarSalvo(s: SalvoComunidade): boolean {
  return alternar(
    store().acervo.comunidade.salvos,
    s,
    (x) => x.pessoa === s.pessoa && x.publicacaoId === s.publicacaoId,
    (acao) => ({ tipo: "salvo", acao, valor: s }),
  );
}

function montar(d: DadosCarregados): Store {
  const c = d.colecoes;
  let destaques = d.destaques ?? structuredClone(VAGAS_VAZIAS);
  const acervo: Acervo = {
    comunidade: {
      ...d.comunidade,
      publicacoes: new MapPersistido("publicacoes", c.publicacoes),
      comentarios: new MapPersistido("comentarios", c.comentarios),
      denuncias: new MapPersistido("denuncias", c.denuncias),
    },
    destaques,
    salas: new MapPersistido("salas", c.salas),
    conteudos: new MapPersistido("conteudos", c.conteudos),
    citacoes: new MapPersistido("citacoes", c.citacoes),
    videos: new MapPersistido("videos", c.videos),
    fontes: new MapPersistido("fontes", c.fontes),
    perfis: new MapPersistido("perfis", c.perfis),
    candidaturas: new MapPersistido("candidaturas", c.candidaturas),
    convites: new MapPersistido("convites", c.convites),
    midias: new MapPersistido("midias", c.midias),
    temas: new MapPersistido("temas", c.temas),
  };
  Object.defineProperty(acervo, "destaques", {
    enumerable: true,
    get: () => destaques,
    set: (nova: EscolhaDestaques) => {
      destaques = nova;
      enfileirar({ tipo: "destaques", valor: structuredClone(nova) });
    },
  });
  return {
    versao: d.versao,
    contas: d.contas,
    desatualizado: false,
    acervo,
    progresso: new MapPersistido("progresso", c.progresso),
    perfisBuscador: new MapPersistido("perfisBuscador", c.perfisBuscador),
    auditoria: d.auditoria,
    caixaSaida: d.caixaSaida,
  };
}

/**
 * Garante o snapshot em dia com o banco. Chamado no começo de cada pedido
 * (src/server/sessao.ts, rotas de mídia, layout raiz).
 */
export async function sincronizarAcervo(): Promise<void> {
  const e = estado();
  await e.fila;
  if (e.store && !e.store.desatualizado && (await e.repositorio.versao()) === e.store.versao) return;
  e.carregando ??= e.repositorio
    .carregar()
    .then((d) => {
      e.store = montar(d);
    })
    .finally(() => {
      e.carregando = undefined;
    });
  await e.carregando;
}

/** Espera as gravações pendentes; repassa a primeira falha. */
export async function aguardarGravacoes(): Promise<void> {
  const e = estado();
  await e.fila;
  const [erro] = e.erros.splice(0);
  if (erro) throw erro;
}

function store(): Store {
  const s = estado().store;
  if (!s) throw new Error("Acervo não carregado: chame sincronizarAcervo() no começo do pedido.");
  return s;
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

// Contas mudam pelo módulo de conta; o diretório deste processo acompanha na hora.
aoMudarConta((membro) => estado().store?.contas.set(membro.id, membro));

// O catálogo (src/data/catalogo.ts) lê as Salas visíveis daqui, no servidor; o assistente, as leituras.
instalarRegistroSalas(salasVisiveis);
instalarRegistroTemas(temasDoAcervo);
instalarLeiturasDoAssistente(leiturasParaAssistente);

export function temasDoAcervo(): Tema[] {
  return [...store().acervo.temas.values()]
    .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm) || a.nome.localeCompare(b.nome, "pt-BR"))
    .map(({ slug, nome, sinonimos }) => ({ slug, nome, sinonimos: [...sinonimos] }));
}

export function acervo(): Acervo {
  return store().acervo;
}

/** Conta pelo id, do diretório do snapshot (para leituras síncronas; quem age usa modules/conta). */
export function contaNoDiretorio(id: string): Membro | null {
  return store().contas.get(id) ?? null;
}

export function contasDoDiretorio(): Membro[] {
  return [...store().contas.values()];
}

export function progressos(): Map<string, ProgressoEstudo> {
  return store().progresso;
}

export function perfisBuscador(): Map<string, PerfilBuscador> {
  return store().perfisBuscador;
}

export function auditoriaBruta(): readonly RegistroAuditoria[] {
  return store().auditoria;
}

export function incluirAuditoria(registro: RegistroAuditoria) {
  store().auditoria.push(registro);
  enfileirar({ tipo: "auditoria", valor: registro });
}

export function caixaSaidaBruta(): readonly EmailEnviado[] {
  return store().caixaSaida;
}

export function incluirEmail(email: EmailEnviado) {
  store().caixaSaida.push(email);
  enfileirar({ tipo: "email", valor: email });
}

/** Só para testes: troca o repositório (o snapshot é recarregado no próximo sincronizarAcervo). */
export function usarRepositorioDoAcervo(repositorio: AcervoRepositorio) {
  const e = estado();
  e.repositorio = repositorio;
  e.store = undefined;
}

/** Só para testes: força recarregar do banco. */
export function esquecerAcervo() {
  estado().store = undefined;
}
