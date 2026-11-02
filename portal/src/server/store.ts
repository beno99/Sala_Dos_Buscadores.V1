import { AsyncLocalStorage } from "node:async_hooks";
import type { PedidoLixeiraArtigo } from "@/features/artigos/lixeira";
import type { OperacaoContaNoLote } from "@/modules/acervo/contas-no-lote";
import { type PedidoEditorial, proximoInstante } from "@/modules/acervo/editorial-atomico";
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
import type { PedidoExclusaoPermanenteSala, PedidoLixeiraSala } from "@/features/salas/lixeira";
import type {
  AcaoRelacao,
  AcervoRepositorio,
  Colecoes,
  DadosCarregados,
  Gravacao,
  MidiaGuardada,
  NomeColecao,
  OperacaoLote,
  PerfilBuscador,
} from "@/modules/acervo/acervo.contratos";
import { acervoRepositorio } from "@/modules/acervo/acervo.repositorio";
import type { Membro } from "@/modules/conta/conta.contratos";
import { aoApagarConta, aoMudarConta } from "@/modules/conta/conta.repositorio";

export type { MidiaGuardada, PerfilBuscador } from "@/modules/acervo/acervo.contratos";

/*
 * Snapshot de leitura do acervo. Escritas de rotas e Server Actions usam
 * comGravacoesDoPedido: cada chamada ganha snapshot isolado, plano e promessa
 * próprios. O plano inteiro (incluindo auditoria e caixa de saída) é aplicado
 * em uma transação; só depois o snapshot público é recarregado.
 *
 * A fila global apenas ordena commits. Não armazena nem distribui erros:
 * cada pedido aguarda sua tarefa e recebe sua própria falha. Edições usam
 * CAS; relações são relidas sob lock pelo repositório.
 * Utilitários internos legados aguardam somente tarefas do seu contexto.
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
    const anterior = super.get(id);
    const editorial = ["salas", "conteudos", "videos"].includes(this.#colecao);
    const esperado = anterior && "atualizadoEm" in anterior ? String(anterior.atualizadoEm) : null;
    if (
      editorial &&
      anterior &&
      "atualizadoEm" in anterior &&
      "atualizadoEm" in valor &&
      Date.parse(String(valor.atualizadoEm)) <= Date.parse(String(anterior.atualizadoEm))
    ) {
      valor = { ...valor, atualizadoEm: proximoInstante(String(anterior.atualizadoEm)) };
    }
    super.set(id, valor);
    enfileirar({
      tipo: "gravar",
      colecao: this.#colecao,
      id,
      valor: structuredClone(valor),
      ...(editorial ? { esperado } : {}),
    } as Gravacao);
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
}

const chave = Symbol.for("sala-dos-buscadores.store");
type ComEstado = typeof globalThis & { [chave]?: Estado };

function estado(): Estado {
  const g = globalThis as ComEstado;
  g[chave] ??= { repositorio: acervoRepositorio, fila: Promise.resolve() };
  return g[chave];
}

interface EscopoGravacoes {
  modo: "pedido" | "legado";
  store: Store;
  operacoes: OperacaoLote[];
  tarefas: Promise<void>[];
  efeitos: (() => void)[];
}
const contextoGravacoes = new AsyncLocalStorage<EscopoGravacoes>();

/** Isola snapshot e confirmação de um pedido; todas as gravações do plano fazem um só commit. */
export async function comGravacoesDoPedido<T>(executar: () => T | Promise<T>): Promise<T> {
  if (contextoGravacoes.getStore()?.modo === "pedido") return executar();
  await sincronizarAcervo();
  const local = montar(snapshotDoStore(store()));
  const escopo: EscopoGravacoes = { modo: "pedido", store: local, operacoes: [], tarefas: [], efeitos: [] };
  return contextoGravacoes.run(escopo, async () => {
    const r = await executar();
    if (r && typeof r === "object" && "ok" in r && r.ok === false) return r;
    await confirmarEscopo(escopo);
    for (const efeito of escopo.efeitos) {
      try {
        efeito();
      } catch {
        process.stderr.write("Não foi possível agendar um efeito após a confirmação do pedido.\n");
      }
    }
    return r;
  });
}
/** Efeitos externos só são agendados quando o banco confirmou o pedido. */
export function aposConfirmarPedido(efeito: () => void): void {
  const escopo = contextoGravacoes.getStore();
  if (escopo?.modo === "pedido") escopo.efeitos.push(efeito);
  else efeito();
}
/** Operações de conta são apenas planejadas; não há commit fora do lote editorial. */
export function planejarContaNoPedido(op: OperacaoContaNoLote): void {
  const escopo = contextoGravacoes.getStore();
  if (escopo?.modo !== "pedido") throw new Error("Alteração de conta exige um pedido transacional.");
  escopo.operacoes.push(structuredClone(op));
}

async function confirmarEscopo(escopo: EscopoGravacoes): Promise<void> {
  if (!escopo.operacoes.length) return;
  const ops = escopo.operacoes.splice(0);
  const e = estado();
  const tarefa = e.fila.then(async () => {
    await e.repositorio.aplicarLote(ops);
    e.store = montar(await e.repositorio.carregar());
  });
  e.fila = tarefa.catch(() => {
    if (e.store) e.store.desatualizado = true;
  });
  await tarefa;
}
function enfileirar(gravacao: Gravacao) {
  let escopo = contextoGravacoes.getStore();
  if (escopo?.modo === "pedido") {
    escopo.operacoes.push(structuredClone(gravacao));
    return;
  }
  // Compatibilidade para utilitários/testes internos; rotas de escrita usam escopo próprio.
  const e = estado();
  const alvo = e.store;
  if (!escopo) {
    escopo = { modo: "legado", store: store(), operacoes: [], tarefas: [], efeitos: [] };
    contextoGravacoes.enterWith(escopo);
  }
  const tarefa = e.fila.then(async () => {
    const nova = await e.repositorio.aplicar(gravacao);
    if (alvo) {
      if (nova === alvo.versao + 1) alvo.versao = nova;
      else alvo.desatualizado = true;
    }
  });
  e.fila = tarefa.catch(() => {
    if (alvo) alvo.desatualizado = true;
  });
  escopo.tarefas.push(tarefa);
}

/** Gravação atômica com CAS; o Map é apenas uma prévia local, nunca a fonte dos vínculos. */
export function gravarEditorialNoAcervo(pedido: PedidoEditorial): Promise<void> {
  const e = estado();
  const alvo = store();
  const mapa = alvo.acervo[pedido.colecao];
  const anterior = mapa.get(pedido.valor.id);
  pedido.valor.atualizadoEm = proximoInstante(anterior?.atualizadoEm);
  const copia = structuredClone(pedido);
  const escopo = contextoGravacoes.getStore();
  if (escopo?.modo === "pedido") {
    escopo.operacoes.push({ tipo: "editorial", pedido: copia });
    Map.prototype.set.call(mapa, pedido.valor.id, structuredClone(pedido.valor));
    if (pedido.citacao)
      Map.prototype.set.call(alvo.acervo.citacoes, pedido.citacao.id, structuredClone(pedido.citacao));
    return Promise.resolve();
  }
  const tarefa = e.fila.then(async () => {
    const r = await e.repositorio.salvarEditorial(copia);
    Map.prototype.set.call(alvo.acervo[r.colecao], r.valor.id, structuredClone(r.valor));
    for (const v of r.videos) Map.prototype.set.call(alvo.acervo.videos, v.id, structuredClone(v));
    if (r.citacao) Map.prototype.set.call(alvo.acervo.citacoes, r.citacao.id, structuredClone(r.citacao));
    if (r.versao === alvo.versao + 1) alvo.versao = r.versao;
    else alvo.desatualizado = true;
  });
  e.fila = tarefa.catch(() => {
    alvo.desatualizado = true;
  });
  return tarefa;
}

/**
 * A criação precisa devolver o slug confirmado pelo banco, antes de expor a
 * Sala no snapshot. A fila mantém a ordem com auditoria e demais gravações.
 */
export async function criarSalaNoAcervo(sala: SalaEditorial): Promise<SalaEditorial> {
  const e = estado();
  const tarefa = e.fila.then(async () => {
    const alvo = store();
    const criada = await e.repositorio.criarSala(structuredClone(sala));
    // Já foi persistida: não repetir o INSERT através de MapPersistido.set.
    Map.prototype.set.call(alvo.acervo.salas, criada.sala.id, structuredClone(criada.sala));
    if (criada.versao === alvo.versao + 1) alvo.versao = criada.versao;
    else alvo.desatualizado = true;
    return criada.sala;
  });
  // A falha chega diretamente a quem criou; a fila continua disponível.
  e.fila = tarefa.then(
    () => {},
    () => {
      if (e.store) e.store.desatualizado = true;
    },
  );
  return tarefa;
}

export async function mudarLixeiraArtigoNoAcervo(pedido: PedidoLixeiraArtigo, permanente = false) {
  const e = estado();
  const tarefa = e.fila.then(async () => {
    const alvo = store();
    if (permanente) {
      const resultado = await e.repositorio.excluirArtigoPermanentemente(pedido);
      Map.prototype.delete.call(alvo.acervo.conteudos, pedido.id);
      alvo.auditoria.push(resultado.registro);
      alvo.desatualizado = true;
    } else {
      const resultado = await e.repositorio.mudarLixeiraArtigo(pedido);
      Map.prototype.set.call(alvo.acervo.conteudos, pedido.id, structuredClone(resultado.artigo));
      alvo.auditoria.push(resultado.registro);
      alvo.desatualizado = true;
    }
  });
  e.fila = tarefa.then(
    () => {},
    () => {
      if (e.store) e.store.desatualizado = true;
    },
  );
  return tarefa;
}

/** A Sala e sua auditoria são persistidas na mesma transação, antes de atualizar o snapshot. */
export async function mudarLixeiraSalaNoAcervo(pedido: PedidoLixeiraSala) {
  const e = estado();
  const tarefa = e.fila.then(async () => {
    const alvo = store();
    const resultado = await e.repositorio.mudarLixeiraSala(pedido);
    Map.prototype.set.call(alvo.acervo.salas, resultado.sala.id, structuredClone(resultado.sala));
    alvo.auditoria.push(resultado.registro);
    if (resultado.versao === alvo.versao + 1) alvo.versao = resultado.versao;
    else alvo.desatualizado = true;
    return resultado.sala;
  });
  e.fila = tarefa.then(
    () => {},
    () => {
      if (e.store) e.store.desatualizado = true;
    },
  );
  return tarefa;
}

/** A Sala e os conteúdos, vídeos e citações dela saem do banco na mesma transação, antes do snapshot. */
export async function excluirSalaPermanentementeNoAcervo(pedido: PedidoExclusaoPermanenteSala) {
  const e = estado();
  const tarefa = e.fila.then(async () => {
    const alvo = store();
    const resultado = await e.repositorio.excluirSalaPermanentemente(pedido);
    for (const id of resultado.conteudosIds) Map.prototype.delete.call(alvo.acervo.conteudos, id);
    for (const id of resultado.videosIds) Map.prototype.delete.call(alvo.acervo.videos, id);
    for (const id of resultado.citacoesIds) Map.prototype.delete.call(alvo.acervo.citacoes, id);
    Map.prototype.delete.call(alvo.acervo.salas, pedido.id);
    alvo.auditoria.push(resultado.registro);
    if (resultado.versao === alvo.versao + 1) alvo.versao = resultado.versao;
    else alvo.desatualizado = true;
  });
  e.fila = tarefa.then(
    () => {},
    () => {
      if (e.store) e.store.desatualizado = true;
    },
  );
  return tarefa;
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

function snapshotDoStore(s: Store): DadosCarregados {
  const a = s.acervo;
  return structuredClone({
    versao: s.versao,
    contas: s.contas,
    colecoes: {
      salas: a.salas,
      conteudos: a.conteudos,
      citacoes: a.citacoes,
      videos: a.videos,
      fontes: a.fontes,
      perfis: a.perfis,
      candidaturas: a.candidaturas,
      convites: a.convites,
      midias: a.midias,
      temas: a.temas,
      progresso: s.progresso,
      perfisBuscador: s.perfisBuscador,
      publicacoes: a.comunidade.publicacoes,
      comentarios: a.comunidade.comentarios,
      denuncias: a.comunidade.denuncias,
    },
    destaques: a.destaques,
    comunidade: {
      reacoes: a.comunidade.reacoes,
      seguindo: a.comunidade.seguindo,
      salvos: a.comunidade.salvos,
    },
    auditoria: s.auditoria,
    caixaSaida: s.caixaSaida,
  });
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

/** Utilitários internos: espera somente tarefas deste contexto. Pedidos confirmam o plano ao sair. */
export async function aguardarGravacoes(): Promise<void> {
  const escopo = contextoGravacoes.getStore();
  if (escopo?.modo === "pedido") return; // confirmação única ao sair do pedido, nunca no meio do plano
  const tarefas = escopo?.tarefas.splice(0) ?? [];
  await Promise.all(tarefas);
}

function store(): Store {
  const contexto = contextoGravacoes.getStore();
  const s = contexto?.modo === "pedido" ? contexto.store : estado().store;
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
  if (s.imagemCard) publico.imagemCard = s.imagemCard;
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
    .filter((c) => !c.lixeira && c.status === "publicado" && c.revisao && porSlug.has(c.sala))
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
aoApagarConta((id) => estado().store?.contas.delete(id));

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
