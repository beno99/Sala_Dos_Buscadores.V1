import "server-only";
import type {
  AnuncioEditorial,
  Candidatura,
  Convite,
  DecisaoRevisao,
  FonteEditorial,
  PerfilAnfitriao,
  SalaEditorial,
  StatusConvite,
  StatusEditorial,
  VideoEditorial,
} from "@/data/types";
import { statusDoConvite } from "@/features/anfitriao/regras/convite";
import type { Membro } from "@/modules/conta/conta.contratos";
import { salaNaLixeira } from "../salas/lixeira";
import { artigoDoDono, salaDoDono } from "../sessao";
import { acervo, contasDoDiretorio } from "../store";

/*
 * Leitura do que é de anfitriões. Dois lados:
 * - o anfitrião lê só o que é dele (as funções recebem o id dele e conferem a posse);
 * - a curadoria lê tudo, para revisar (quem chama já conferiu o papel de administrador).
 */

const clone = <T>(v: T): T => structuredClone(v);

const salasDe = (donoId: string) =>
  [...acervo().salas.values()].filter(
    (s) => !s.lixeira && s.origem === "anfitriao" && s.revisao?.donoId === donoId,
  );

const artigosDe = (donoId: string) =>
  [...acervo().conteudos.values()].filter(
    (c) => !c.lixeira && !salaNaLixeira(c.sala) && c.revisao?.donoId === donoId,
  );

const videosDe = (donoId: string) =>
  [...acervo().videos.values()].filter((v) => !salaNaLixeira(v.sala) && v.revisao?.donoId === donoId);

const anunciosDe = (donoId: string) =>
  [...acervo().anuncios.values()].filter((a) => a.revisao.donoId === donoId);

const artigosDaSala = (sala: SalaEditorial) =>
  [...acervo().conteudos.values()].filter((c) => !c.lixeira && c.sala === sala.slug && c.revisao);

function contar(artigos: { status: StatusEditorial }[]) {
  const n = (s: StatusEditorial) => artigos.filter((a) => a.status === s).length;
  return {
    publicados: n("publicado"),
    emRevisao: n("em_revisao"),
    reprovados: n("reprovado"),
    rascunhos: n("rascunho"),
    arquivados: n("arquivado"),
  };
}

// ---------- lado do anfitrião ----------

export interface Novidade {
  tipo: "sala" | "artigo" | "video" | "anuncio";
  id: string;
  /** A Sala do item (ela mesma, ou a Sala do artigo). */
  salaId: string;
  titulo: string;
  decisao: DecisaoRevisao;
}

/** Decisões da curadoria que o anfitrião ainda não viu, da mais recente para a mais antiga. */
export function novidadesDe(donoId: string): Novidade[] {
  const daSala = salasDe(donoId).flatMap((s) =>
    (s.revisao?.decisoes ?? [])
      .filter((d) => !d.vista)
      .map((decisao) => ({ tipo: "sala" as const, id: s.id, salaId: s.id, titulo: s.nome, decisao })),
  );
  const salaPorSlug = new Map(salasDe(donoId).map((s) => [s.slug, s.id]));
  const doArtigo = artigosDe(donoId).flatMap((a) =>
    (a.revisao?.decisoes ?? [])
      .filter((d) => !d.vista)
      .map((decisao) => ({
        tipo: "artigo" as const,
        id: a.id,
        salaId: salaPorSlug.get(a.sala) ?? "",
        titulo: a.titulo,
        decisao,
      })),
  );
  const doVideo = videosDe(donoId).flatMap((v) =>
    (v.revisao?.decisoes ?? [])
      .filter((d) => !d.vista)
      .map((decisao) => ({
        tipo: "video" as const,
        id: v.id,
        salaId: salaPorSlug.get(v.sala) ?? "",
        titulo: v.titulo,
        decisao,
      })),
  );
  const doAnuncio = anunciosDe(donoId).flatMap((a) =>
    a.revisao.decisoes
      .filter((d) => !d.vista)
      .map((decisao) => ({ tipo: "anuncio" as const, id: a.id, salaId: "", titulo: a.titulo, decisao })),
  );
  return [...daSala, ...doArtigo, ...doVideo, ...doAnuncio]
    .sort((a, b) => b.decisao.quando.localeCompare(a.decisao.quando))
    .map(clone);
}

export interface ResumoSalaAnfitriao {
  sala: SalaEditorial;
  artigos: ReturnType<typeof contar> & { total: number };
}

export interface PainelAnfitriao {
  perfil: PerfilAnfitriao | undefined;
  indicadores: {
    salas: number;
    publicados: number;
    emRevisao: number;
    reprovados: number;
    videos: number;
    anuncios: number;
  };
  novidades: Novidade[];
  salas: ResumoSalaAnfitriao[];
}

export function painelDoAnfitriao(donoId: string): PainelAnfitriao {
  const salas = salasDe(donoId).sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  const artigos = artigosDe(donoId);
  const itens = [...artigos, ...videosDe(donoId), ...anunciosDe(donoId)];
  const total = contar(itens);
  return {
    perfil: clone(acervo().perfis.get(donoId)),
    indicadores: {
      salas: salas.length,
      publicados: total.publicados,
      emRevisao: total.emRevisao,
      reprovados: total.reprovados,
      videos: videosDe(donoId).length,
      anuncios: anunciosDe(donoId).length,
    },
    novidades: novidadesDe(donoId),
    salas: salas.map((s) => {
      const daSala = artigosDaSala(s);
      return { sala: clone(s), artigos: { ...contar(daSala), total: daSala.length } };
    }),
  };
}

/** Vídeos do anfitrião, os mais recentes primeiro, com o nome da Sala. */
export function videosDoAnfitriao(donoId: string): (VideoEditorial & { salaNome: string })[] {
  const nomes = new Map([...acervo().salas.values()].map((s) => [s.slug, s.nome]));
  return videosDe(donoId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .map((v) => ({ ...clone(v), salaNome: nomes.get(v.sala) ?? v.sala }));
}

export function anunciosDoAnfitriao(donoId: string): AnuncioEditorial[] {
  return anunciosDe(donoId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .map(clone);
}

/** Salas do anfitrião que podem receber vídeo ou artigo (fora da lixeira e não congeladas). */
export function salasParaCriar(donoId: string) {
  return salasDe(donoId)
    .filter((s) => !s.revisao?.congelado)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map((s) => ({ id: s.id, slug: s.slug, nome: s.nome, status: s.status }));
}

/** A Sala do anfitrião com os artigos dela; recusa (AcessoNegado) se não for dele. */
export function salaDoAnfitriao(salaId: string, donoId: string) {
  const sala = salaDoDono(salaId, donoId);
  return { sala: clone(sala), artigos: artigosDaSala(sala).map(clone) };
}

export function artigoDoAnfitriao(artigoId: string, donoId: string) {
  const artigo = artigoDoDono(artigoId, donoId);
  const sala = [...acervo().salas.values()].find((s) => s.slug === artigo.sala);
  return { artigo: clone(artigo), sala: sala ? clone(sala) : undefined };
}

/** Fontes que o anfitrião pode citar: o catálogo público e as que ele mesmo propôs. */
export function fontesParaAnfitriao(donoId: string): (FonteEditorial & { nova: boolean })[] {
  return [...acervo().fontes.values()]
    .filter((f) => !f.proposta?.pendente || f.proposta.donoId === donoId)
    .map((f) => ({ ...clone(f), nova: Boolean(f.proposta?.pendente) }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
}

export function perfilPorSlug(slug: string): PerfilAnfitriao | undefined {
  const p = [...acervo().perfis.values()].find((x) => x.slug === slug);
  return p ? clone(p) : undefined;
}

// ---------- lado da curadoria ----------

export interface LinhaAnfitriao {
  conta: Membro;
  perfil: PerfilAnfitriao | undefined;
  salas: number;
  publicados: number;
  /** Salas e artigos em revisão. */
  pendentes: number;
  /** Envio pendente mais antigo (ISO), para ordenar por espera. */
  maisAntigo: string | null;
}

function pendentesDe(donoId: string) {
  const itens = [
    ...salasDe(donoId).filter((s) => s.status === "em_revisao"),
    ...artigosDe(donoId).filter((a) => a.status === "em_revisao"),
    ...videosDe(donoId).filter((v) => v.status === "em_revisao"),
    ...anunciosDe(donoId).filter((a) => a.status === "em_revisao"),
  ];
  const datas = itens.map((i) => i.revisao?.enviadoEm ?? i.atualizadoEm).sort();
  return { total: itens.length, maisAntigo: datas[0] ?? null };
}

/**
 * Nível 1 da revisão: anfitriões (e ex-anfitriões com conteúdo), quem espera
 * há mais tempo primeiro; sem pendência, pelo nome.
 */
export function listarAnfitrioes(filtro: { soComPendencias?: boolean } = {}): LinhaAnfitriao[] {
  const donos = new Set([...acervo().salas.values()].flatMap((s) => (s.revisao ? [s.revisao.donoId] : [])));
  const linhas = contasDoDiretorio()
    .filter((c) => c.papel === "anfitriao" || donos.has(c.id))
    .map((conta) => {
      const p = pendentesDe(conta.id);
      return {
        conta,
        perfil: clone(acervo().perfis.get(conta.id)),
        salas: salasDe(conta.id).length,
        publicados: artigosDe(conta.id).filter((a) => a.status === "publicado").length,
        pendentes: p.total,
        maisAntigo: p.maisAntigo,
      };
    })
    .filter((l) => !filtro.soComPendencias || l.pendentes > 0);
  return linhas.sort((a, b) => {
    if (a.maisAntigo && b.maisAntigo) return a.maisAntigo.localeCompare(b.maisAntigo);
    if (a.maisAntigo) return -1;
    if (b.maisAntigo) return 1;
    return (a.perfil?.nome ?? a.conta.pseudonimo).localeCompare(
      b.perfil?.nome ?? b.conta.pseudonimo,
      "pt-BR",
    );
  });
}

/** Total de Salas e artigos de anfitriões esperando decisão (card do /admin). */
export function totalPendenteRevisao(): number {
  return (
    [...acervo().salas.values()].filter(
      (s) => !s.lixeira && s.origem === "anfitriao" && s.status === "em_revisao",
    ).length +
    [...acervo().conteudos.values()].filter(
      (c) => !c.lixeira && !salaNaLixeira(c.sala) && c.revisao && c.status === "em_revisao",
    ).length +
    [...acervo().videos.values()].filter(
      (v) => !salaNaLixeira(v.sala) && v.revisao && v.status === "em_revisao",
    ).length +
    [...acervo().anuncios.values()].filter((a) => a.status === "em_revisao").length
  );
}

/** Nível 2: as Salas de um anfitrião com a contagem dos artigos. */
export function salasDoAnfitriaoParaRevisao(contaId: string): ResumoSalaAnfitriao[] {
  return salasDe(contaId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    .map((s) => {
      const daSala = artigosDaSala(s);
      return { sala: clone(s), artigos: { ...contar(daSala), total: daSala.length } };
    });
}

/** Nível 3: a Sala em revisão, com os artigos e as fontes (as propostas marcadas como novas). */
export function salaParaRevisao(salaId: string) {
  const sala = acervo().salas.get(salaId);
  if (sala?.origem !== "anfitriao" || sala.lixeira) return undefined;
  const artigos = artigosDaSala(sala).map((a) => ({
    artigo: clone(a),
    fontes: a.fontes.flatMap((id) => {
      const f = acervo().fontes.get(id);
      return f ? [{ ...clone(f), nova: Boolean(f.proposta?.pendente) }] : [];
    }),
  }));
  const dono = sala.revisao ? contasDoDiretorio().find((c) => c.id === sala.revisao?.donoId) : undefined;
  return { sala: clone(sala), dono, artigos };
}

/** Revisão: vídeos e anúncios de um anfitrião, os que esperam decisão primeiro. */
export function videosEAnunciosParaRevisao(contaId: string) {
  const primeiroEmRevisao = <T extends { status: StatusEditorial; atualizadoEm: string }>(a: T, b: T) =>
    Number(b.status === "em_revisao") - Number(a.status === "em_revisao") ||
    b.atualizadoEm.localeCompare(a.atualizadoEm);
  return {
    videos: videosDoAnfitriao(contaId).sort(primeiroEmRevisao),
    anuncios: anunciosDoAnfitriao(contaId).sort(primeiroEmRevisao),
  };
}

export function listarCandidaturas(): Candidatura[] {
  return [...acervo().candidaturas.values()]
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm))
    .map(clone);
}

export function listarConvites(agora = new Date()): (Convite & { situacao: StatusConvite })[] {
  return [...acervo().convites.values()]
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .map((c) => ({ ...clone(c), situacao: statusDoConvite(c, agora) }));
}
