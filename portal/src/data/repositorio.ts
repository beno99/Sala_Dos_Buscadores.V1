import "server-only";
import { escolherRelacionados } from "@/features/acervo/relacionados";
import type { ConteudoBuscavel } from "@/features/busca/sugestoes";
import { ordenarRanking } from "@/features/destaques/ranking";
import { type Candidato, type GrupoVaga, montarVagas } from "@/features/destaques/vagas";
import type { ItemAcervo } from "@/features/estudo/tipos";
import { imagem, imagemDoCard } from "@/server/imagens";
import { acervo } from "@/server/store";
import { salaPorSlug, todasAsSalas } from "./catalogo";
import { copiarCorpo } from "./corpo";
import { BUSCAS_30_DIAS } from "./mock/buscas";
import type {
  Citacao,
  Conteudo,
  ConteudoEditorial,
  Fonte,
  Nivel,
  Placa,
  Sala,
  SalaSlug,
  TemaSlug,
  Video,
  VideoEditorial,
} from "./types";

/*
 * Repositório público do acervo: tudo o que o portal mostra passa por aqui,
 * e só itens com status "publicado" saem daqui (Salas, conteúdo, busca,
 * contadores e nível predominante).
 *
 * Hoje lê o store em memória do servidor (src/server/store.ts). Para ligar
 * a um backend real, troque o corpo destas funções por chamadas à API,
 * mantendo os tipos de retorno, que são os contratos das telas.
 */

export interface SalaResumo extends Sala {
  totalConteudos: number;
  nivelPredominante: Nivel;
  /** Data (AAAA-MM-DD) da primeira publicação: a da Sala editorial nas oficiais; a da primeira aprovação nas de anfitrião. */
  publicadaEm?: string;
}

/** O acervo publicado, no formato que a busca comparativa consome. */
export interface AcervoPublico {
  conteudos: Conteudo[];
  videos: Video[];
}

// ---------- conversão do registro editorial para o contrato público ----------

function paraPublico(c: ConteudoEditorial): Conteudo {
  const publico: Conteudo = {
    slug: c.slug,
    sala: c.sala,
    tipo: c.tipo,
    titulo: c.titulo,
    resumo: c.resumo,
    temas: [...c.temas],
    periodo: c.periodo,
    nivel: c.nivel,
    formato: c.formato,
    proveniencia: c.proveniencia,
    duracaoMin: c.duracaoMin,
    autoria: { ...c.autoria },
    publicadoEm: c.publicadoEm,
    corpo: copiarCorpo(c.corpo),
    fontes: [...c.fontes],
  };
  if (c.citacao) publico.citacao = c.citacao;
  if (c.link) publico.link = { ...c.link };
  if (c.imagem) publico.imagem = c.imagem;
  if (c.thumb) publico.thumb = c.thumb;
  if (c.anfitriao) publico.anfitriao = { ...c.anfitriao };
  // RNF-DOM-03: a divergência entre leituras aparece de forma explícita na página pública.
  if (c.temaDivergente && c.notaDivergencia.trim()) publico.divergencia = c.notaDivergencia.trim();
  return publico;
}

export function conteudoParaPublico(c: ConteudoEditorial): Conteudo {
  return paraPublico(c);
}

export function videoParaPublico(v: VideoEditorial): Video {
  const slugs = v.artigos
    .map((id) => acervo().conteudos.get(id))
    .filter((c): c is ConteudoEditorial => c?.status === "publicado" && c.sala === v.sala)
    .map((c) => c.slug);
  return {
    id: v.id,
    sala: v.sala,
    titulo: v.titulo,
    duracao: v.duracao,
    tema: v.tema,
    nivel: v.nivel,
    episodio: v.episodio,
    publicadoEm: v.publicadoEm,
    url: v.url,
    placa: v.placa,
    conteudos: slugs,
    imagem: imagem("episodios", v.id),
  };
}

/**
 * Conteúdo no ar: publicado e numa Sala visível. Um artigo de anfitrião
 * publicado some junto quando a Sala dele sai do ar (editada, retirada ou
 * arquivada), sem perder o próprio status.
 */
const publicados = () => {
  const visiveis = new Set(todasAsSalas().map((s) => s.slug));
  return [...acervo().conteudos.values()].filter((c) => c.status === "publicado" && visiveis.has(c.sala));
};
/** Vídeo no ar: publicado e numa Sala visível (Sala arquivada leva os vídeos dela junto). */
const videosPublicados = () => {
  const visiveis = new Set(todasAsSalas().map((s) => s.slug));
  return [...acervo().videos.values()].filter((v) => v.status === "publicado" && visiveis.has(v.sala));
};

// ---------- leitura pública ----------

export function conteudosDaSala(sala: SalaSlug): Conteudo[] {
  return publicados()
    .filter((c) => c.sala === sala)
    .map(paraPublico);
}

function nivelPredominante(conteudos: Conteudo[]): Nivel {
  const contagem: Record<Nivel, number> = { 1: 0, 2: 0, 3: 0 };
  for (const c of conteudos) contagem[c.nivel] += 1;
  const maximo = Math.max(...Object.values(contagem));
  const empatados = ([1, 2, 3] as const).filter((n) => contagem[n] === maximo);
  if (empatados.length === 1) return empatados[0] ?? 1;
  // Em empate vale a mediana dos níveis publicados; sem conteúdo, iniciante.
  const ordenados = conteudos.map((c) => c.nivel).sort();
  return ordenados[Math.floor((ordenados.length - 1) / 2)] ?? 1;
}

/** Só a data da primeira publicação sai do registro editorial; os outros campos editoriais ficam no servidor. */
function dataDePublicacao(slug: SalaSlug): string | undefined {
  const editorial = [...acervo().salas.values()].find((s) => s.slug === slug);
  if (!editorial) return undefined;
  const data = editorial.revisao
    ? editorial.revisao.decisoes
        .filter((d) => d.decisao === "aprovado")
        .map((d) => d.quando)
        .sort()[0]
    : editorial.publicadaEm;
  return data?.slice(0, 10);
}

export function resumirSala(sala: Sala): SalaResumo {
  const conteudos = conteudosDaSala(sala.slug);
  const resumo: SalaResumo = {
    ...sala,
    totalConteudos: conteudos.length,
    nivelPredominante: nivelPredominante(conteudos),
  };
  const publicadaEm = dataDePublicacao(sala.slug);
  if (publicadaEm) resumo.publicadaEm = publicadaEm;
  return resumo;
}

export function citacaoPorId(id: string): Citacao | undefined {
  const c = acervo().citacoes.get(id);
  return c ? structuredClone(c) : undefined;
}

/** Primeira citação ligada a um conteúdo publicado da Sala. */
export function citacaoDestaque(sala: SalaSlug): Citacao | undefined {
  const id = publicados().find((c) => c.sala === sala && c.citacao)?.citacao;
  return id ? citacaoPorId(id) : undefined;
}

export function videosDaSala(sala: SalaSlug): Video[] {
  return videosPublicados()
    .filter((v) => v.sala === sala)
    .map(videoParaPublico);
}

/** Vídeos publicados ligados a um conteúdo (RF-16). */
export function videosDoConteudo(sala: SalaSlug, slug: string): Video[] {
  return videosDaSala(sala).filter((v) => v.conteudos?.includes(slug));
}

/** Fontes do catálogo público. As propostas por anfitriões só aparecem depois da aprovação do artigo. */
export function fontesPorId(ids: string[]): Fonte[] {
  return ids
    .map((id) => acervo().fontes.get(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f) && !f?.proposta?.pendente)
    .map(({ criadoEm: _a, atualizadoEm: _b, criadoPor: _c, atualizadoPor: _d, proposta: _e, ...f }) => f);
}

export function fontesDaSala(sala: SalaSlug): Fonte[] {
  const ids = new Set(conteudosDaSala(sala).flatMap((c) => c.fontes));
  return fontesPorId([...ids]);
}

/** Temas que aparecem no que está publicado na Sala. */
export function temasDaSala(sala: SalaSlug): TemaSlug[] {
  return [...new Set(conteudosDaSala(sala).flatMap((c) => c.temas))];
}

/** Quantos conteúdos e vídeos publicados tratam de cada tema, e em quantas Salas. */
export function alcanceDoTema(tema: TemaSlug): { itens: number; salas: number } {
  const conteudos = publicados().filter((c) => c.temas.includes(tema));
  const videos = videosPublicados().filter((v) => v.tema === tema);
  const salas = new Set([...conteudos.map((c) => c.sala), ...videos.map((v) => v.sala)]);
  return { itens: conteudos.length + videos.length, salas: salas.size };
}

export function acervoPublico(): AcervoPublico {
  return { conteudos: publicados().map(paraPublico), videos: videosPublicados().map(videoParaPublico) };
}

/** O acervo publicado no formato das regras de estudo (níveis, conquistas, recomendação). */
export function acervoDeEstudo(): ItemAcervo[] {
  return publicados().map((c) => ({
    sala: c.sala,
    slug: c.slug,
    temas: [...c.temas],
    tipo: c.tipo,
    nivel: c.nivel,
    publicadoEm: c.publicadoEm,
  }));
}

/** Títulos publicados para as sugestões do Painel de busca. */
export function listarConteudosBuscaveis(): ConteudoBuscavel[] {
  return publicados().map((c) => ({
    titulo: c.titulo,
    salaNome: salaPorSlug(c.sala)?.nome ?? c.sala,
    href: `/salas/${c.sala}/${c.slug}`,
    tipo: c.tipo,
  }));
}

// ---------- API assíncrona usada pelas páginas ----------

export async function listarSalas(): Promise<SalaResumo[]> {
  return todasAsSalas().map(resumirSala);
}

export async function obterSala(slug: string): Promise<SalaResumo | undefined> {
  const sala = salaPorSlug(slug);
  return sala ? resumirSala(sala) : undefined;
}

/** "Continuar a busca": publicados com tema em comum, das outras Salas primeiro (até 8). */
export function relacionadosDoConteudo(
  c: Pick<Conteudo, "sala" | "slug" | "temas" | "publicadoEm">,
): Conteudo[] {
  return escolherRelacionados(c, publicados()).map(paraPublico);
}

export async function obterConteudo(sala: string, slug: string): Promise<Conteudo | undefined> {
  const c = publicados().find((x) => x.sala === sala && x.slug === slug);
  return c ? paraPublico(c) : undefined;
}

// ---------- Destaques: escolha editorial e ranking de buscas ----------

/** Conteúdo pronto para os cards de vitrine: imagem própria, ou a capa da Sala numa fonte primária. */
export interface ConteudoVitrine {
  conteudo: Conteudo;
  imagem?: string;
  placa: Placa;
}

export interface DestaquesPublicos {
  video?: Video;
  /** Quatro cards; o primeiro é o vertical alto. */
  cards: ConteudoVitrine[];
  /** Cinco artigos; o primeiro vai para o centro do mosaico. */
  artigos: ConteudoVitrine[];
}

export interface ItemMaisPesquisado extends ConteudoVitrine {
  buscas: number;
}

function imagemDoConteudo(c: { slug: string; sala: SalaSlug; tipo: Conteudo["tipo"] }): string | undefined {
  return imagemDoCard(c) ?? (c.tipo === "fonte-primaria" ? imagem("salas", c.sala) : undefined);
}

function paraVitrine(c: ConteudoEditorial): ConteudoVitrine {
  return {
    conteudo: paraPublico(c),
    imagem: c.imagem ?? imagemDoConteudo(c),
    placa: salaPorSlug(c.sala)?.placa ?? "bordo",
  };
}

/** O que pode ocupar cada grupo de vagas: só o publicado. Artigos em destaque são textos. */
export function candidatosDestaques(): Candidato[] {
  return [
    ...videosPublicados().map((v) => ({
      id: v.id,
      titulo: v.titulo,
      publicadoEm: v.publicadoEm,
      grupos: ["video"] as GrupoVaga[],
    })),
    ...publicados().map((c) => ({
      id: c.id,
      titulo: c.titulo,
      publicadoEm: c.publicadoEm,
      grupos: (c.tipo === "artigo" || c.tipo === "fonte-primaria"
        ? ["cards", "artigos"]
        : ["cards"]) as GrupoVaga[],
    })),
  ];
}

export function vagasDestaques() {
  return montarVagas(acervo().destaques, candidatosDestaques());
}

export async function obterDestaques(): Promise<DestaquesPublicos> {
  const vagas = vagasDestaques();
  const conteudo = (id: string | null) => (id ? acervo().conteudos.get(id) : undefined);
  const textos = (lista: { id: string | null }[]) =>
    lista.flatMap(({ id }) => {
      const c = conteudo(id);
      return c?.status === "publicado" ? [paraVitrine(c)] : [];
    });
  const idVideo = vagas.video[0]?.id;
  const video = idVideo ? acervo().videos.get(idVideo) : undefined;
  return {
    video: video?.status === "publicado" ? videoParaPublico(video) : undefined,
    cards: textos(vagas.cards),
    artigos: textos(vagas.artigos),
  };
}

/** "Mais pesquisados": conteúdos publicados com buscas nos últimos 30 dias, do mais buscado ao menos. */
export async function listarMaisPesquisados(): Promise<ItemMaisPesquisado[]> {
  return ordenarRanking(
    publicados().map((c) => ({
      ...paraVitrine(c),
      titulo: c.titulo,
      buscas: BUSCAS_30_DIAS[`${c.sala}/${c.slug}`] ?? 0,
    })),
  ).map(({ titulo: _t, ...item }) => item);
}

// Comunidade: contrato público separado do conteúdo editorial; só registros visíveis.
export {
  pessoaPublicaComunidade,
  pessoasPublicasComunidade,
  publicacaoComunidadePorId,
  publicacoesVisiveisComunidade,
} from "./repositorio-comunidade";
