import type { SalaSlug, TemaSlug } from "@/data/types";
import { chaveLeitura, type ItemAcervo, type ItemVideo, type ProgressoEstudo } from "@/features/estudo/tipos";

/*
 * Jornada do Buscador, especificação v1.0 (03/11/2026). Etapa 1 ativa:
 * conclusões declaradas de leitura e vídeo, progresso por Sala, histórico,
 * título Explorador e as gemas Citrino, Esmeralda e Opala. O resto do catálogo
 * aparece "Em preparação", sem progresso fictício, até o fluxo existir.
 * Registra atividades; não certifica conhecimento nem superioridade espiritual.
 */

export const FUSO_PADRAO = "America/Sao_Paulo";

export type CodigoGema =
  | "citrino"
  | "esmeralda"
  | "cristal-de-rocha"
  | "safira"
  | "turmalina"
  | "opala"
  | "ametista"
  | "rubi";

export interface DefinicaoGema {
  codigo: CodigoGema;
  nome: string;
  /** Modalidade de estudo que a gema reconhece ("Primeiro passo"). */
  modalidade: string;
  criterio: string;
  escopo: "geral" | "tema";
  /** Fluxo ainda não entregue: aparece como "Em preparação". */
  emPreparacao?: string;
}

export const GEMAS: DefinicaoGema[] = [
  {
    codigo: "citrino",
    nome: "Citrino",
    modalidade: "Primeiro passo",
    criterio: "Concluir o primeiro artigo ou vídeo elegível.",
    escopo: "geral",
  },
  {
    codigo: "esmeralda",
    nome: "Esmeralda",
    modalidade: "Continuidade",
    criterio: "Concluir 5 conteúdos distintos em pelo menos 3 dias diferentes (não precisam ser seguidos).",
    escopo: "geral",
  },
  {
    codigo: "cristal-de-rocha",
    nome: "Cristal de Rocha",
    modalidade: "Na fonte",
    criterio: "Registrar consulta a 3 fontes distintas vinculadas ao acervo.",
    escopo: "geral",
    emPreparacao: "O registro de consulta às fontes ainda está em preparação.",
  },
  {
    codigo: "safira",
    nome: "Safira",
    modalidade: "Aprofundamento",
    criterio: "Alcançar Investigador em um tema. Uma por tema.",
    escopo: "tema",
    emPreparacao: "Depende do registro de consulta às fontes, ainda em preparação.",
  },
  {
    codigo: "turmalina",
    nome: "Turmalina",
    modalidade: "Perspectivas em diálogo",
    criterio:
      "Concluir uma comparação orientada de dois conteúdos de Salas diferentes no mesmo tema. Uma por tema.",
    escopo: "tema",
    emPreparacao: "A comparação orientada ainda está em preparação.",
  },
  {
    codigo: "opala",
    nome: "Opala",
    modalidade: "Entre Salas",
    criterio: "Concluir pelo menos um conteúdo elegível em cada uma de 3 Salas diferentes.",
    escopo: "geral",
  },
  {
    codigo: "ametista",
    nome: "Ametista",
    modalidade: "Leitura reflexiva",
    criterio: "Salvar reflexões próprias associadas a 3 conteúdos distintos.",
    escopo: "geral",
    emPreparacao: "As reflexões privadas ainda estão em preparação.",
  },
  {
    codigo: "rubi",
    nome: "Rubi",
    modalidade: "Contribuição à comunidade",
    criterio: "Receber reconhecimento da moderação por uma contribuição relevante ao estudo ou ao diálogo.",
    escopo: "geral",
    emPreparacao: "O reconhecimento pela moderação ainda está em preparação.",
  },
];

export type CodigoTitulo = "explorador" | "investigador" | "articulador" | "aprofundador";

export interface DefinicaoTitulo {
  codigo: CodigoTitulo;
  nome: string;
  conteudos: number;
  salas?: number;
  fontes?: number;
  comparacoes?: number;
  emPreparacao?: string;
}

export const TITULOS: DefinicaoTitulo[] = [
  { codigo: "explorador", nome: "Explorador", conteudos: 1 },
  {
    codigo: "investigador",
    nome: "Investigador",
    conteudos: 5,
    fontes: 2,
    emPreparacao: "Depende do registro de consulta às fontes, ainda em preparação.",
  },
  {
    codigo: "articulador",
    nome: "Articulador",
    conteudos: 10,
    salas: 2,
    fontes: 3,
    comparacoes: 1,
    emPreparacao: "Depende das consultas às fontes e da comparação orientada, ainda em preparação.",
  },
  {
    codigo: "aprofundador",
    nome: "Aprofundador",
    conteudos: 20,
    salas: 3,
    fontes: 5,
    comparacoes: 3,
    emPreparacao: "Depende das consultas às fontes e da comparação orientada, ainda em preparação.",
  },
];

export interface Conclusao {
  tipo: "artigo" | "video";
  /** "sala/slug" do artigo ou id do vídeo. */
  chave: string;
  sala: SalaSlug;
  temas: TemaSlug[];
  em: string;
  origem: "declarada" | "importada";
}

export interface ContextoJornada {
  contaId: string;
  acervo: ItemAcervo[];
  videos: ItemVideo[];
  fuso?: string;
}

/** Dia local (AAAA-MM-DD) no fuso da conta. */
export function diaLocal(iso: string, fuso = FUSO_PADRAO): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: fuso,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/**
 * Conclusões que contam agora: conteúdo ainda publicado, que não é da própria
 * conta, uma vez por artigo e uma vez por vídeo (identificador canônico).
 */
export function conclusoesAtivas(p: ProgressoEstudo, ctx: ContextoJornada): Conclusao[] {
  const artigos = new Map(ctx.acervo.map((c) => [chaveLeitura(c.sala, c.slug), c]));
  const videos = new Map(ctx.videos.map((v) => [v.id, v]));
  const lista: Conclusao[] = [];
  for (const l of p.leituras) {
    if (!l.concluidaEm) continue;
    const chave = chaveLeitura(l.sala, l.slug);
    const c = artigos.get(chave);
    if (!c || c.donoId === ctx.contaId) continue;
    lista.push({
      tipo: "artigo",
      chave,
      sala: c.sala,
      temas: l.temas ?? c.temas,
      em: l.concluidaEm,
      origem: l.origem ?? "importada",
    });
  }
  for (const v of p.videosConcluidos ?? []) {
    const atual = videos.get(v.id);
    if (!atual || atual.donoId === ctx.contaId) continue;
    lista.push({ tipo: "video", chave: v.id, sala: v.sala, temas: v.temas, em: v.em, origem: "declarada" });
  }
  return [...new Map(lista.map((c) => [`${c.tipo}:${c.chave}`, c])).values()];
}

/** Gemas e títulos que as conclusões ativas cumprem na Etapa 1. */
export function conquistasCumpridas(conclusoes: Conclusao[], fuso = FUSO_PADRAO) {
  const dias = new Set(conclusoes.map((c) => diaLocal(c.em, fuso)));
  const salas = new Set(conclusoes.map((c) => c.sala));
  const gemas: CodigoGema[] = [];
  if (conclusoes.length >= 1) gemas.push("citrino");
  if (conclusoes.length >= 5 && dias.size >= 3) gemas.push("esmeralda");
  if (salas.size >= 3) gemas.push("opala");
  const exploradorEm = [...new Set(conclusoes.flatMap((c) => c.temas))];
  return { gemas, exploradorEm };
}

/**
 * Quando cada gema da Etapa 1 foi cumprida, pela ordem das conclusões ativas.
 * Serve para mostrar como conquistado o que já estava cumprido antes de qualquer
 * marcação nova (leituras importadas), com a data em que foi cumprido.
 */
export function datasDeCumprimento(
  conclusoes: Conclusao[],
  fuso = FUSO_PADRAO,
): Partial<Record<CodigoGema, string>> {
  const ordem = [...conclusoes].sort((a, b) => a.em.localeCompare(b.em));
  const datas: Partial<Record<CodigoGema, string>> = {};
  const dias = new Set<string>();
  const salas = new Set<string>();
  ordem.forEach((c, i) => {
    dias.add(diaLocal(c.em, fuso));
    salas.add(c.sala);
    if (!datas.citrino) datas.citrino = c.em;
    if (!datas.esmeralda && i + 1 >= 5 && dias.size >= 3) datas.esmeralda = c.em;
    if (!datas.opala && salas.size >= 3) datas.opala = c.em;
  });
  return datas;
}

/**
 * Concede, sem nunca retirar, o que já foi cumprido. Devolve as gemas novas.
 * Idempotente: repetir o mesmo evento não concede de novo.
 */
export function conceder(p: ProgressoEstudo, ctx: ContextoJornada, agora: string): CodigoGema[] {
  const { gemas, exploradorEm } = conquistasCumpridas(conclusoesAtivas(p, ctx), ctx.fuso);
  const atuais = { ...(p.gemas ?? {}) };
  const novas = gemas.filter((g) => !atuais[g]);
  for (const g of novas) atuais[g] = agora;
  p.gemas = atuais;
  const titulos = { ...(p.titulos ?? {}) };
  for (const tema of exploradorEm) {
    if (!titulos[tema]?.explorador) titulos[tema] = { ...titulos[tema], explorador: agora };
  }
  p.titulos = titulos;
  return novas;
}

export type EstadoGema = "conquistada" | "em-progresso" | "disponivel" | "em-preparacao";

export interface GemaVisivel extends DefinicaoGema {
  estado: EstadoGema;
  em?: string;
  progresso?: { rotulo: string; atual: number; alvo: number }[];
}

export function estadoDasGemas(p: ProgressoEstudo, ctx: ContextoJornada): GemaVisivel[] {
  const conclusoes = conclusoesAtivas(p, ctx);
  const cumpridas = datasDeCumprimento(conclusoes, ctx.fuso);
  const dias = new Set(conclusoes.map((c) => diaLocal(c.em, ctx.fuso))).size;
  const salas = new Set(conclusoes.map((c) => c.sala)).size;
  const medir: Partial<Record<CodigoGema, { rotulo: string; atual: number; alvo: number }[]>> = {
    citrino: [{ rotulo: "conteúdo concluído", atual: Math.min(1, conclusoes.length), alvo: 1 }],
    esmeralda: [
      { rotulo: "conteúdos distintos", atual: Math.min(5, conclusoes.length), alvo: 5 },
      { rotulo: "dias diferentes", atual: Math.min(3, dias), alvo: 3 },
    ],
    opala: [{ rotulo: "Salas com conteúdo concluído", atual: Math.min(3, salas), alvo: 3 }],
  };
  return GEMAS.map((g) => {
    const em = p.gemas?.[g.codigo] ?? cumpridas[g.codigo];
    if (em) return { ...g, estado: "conquistada", em };
    if (g.emPreparacao) return { ...g, estado: "em-preparacao" };
    const progresso = medir[g.codigo];
    const comecou = progresso?.some((m) => m.atual > 0);
    return { ...g, estado: comecou ? "em-progresso" : "disponivel", ...(progresso ? { progresso } : {}) };
  });
}

export interface PercursoTema {
  tema: TemaSlug;
  titulo?: { nome: string; em: string };
  conteudos: number;
  salas: number;
  /** Próximo título e seus requisitos, um a um (sem barra única de cálculo oculto). */
  proximo?: {
    nome: string;
    requisitos: { rotulo: string; atual: number; alvo: number }[];
    emPreparacao?: string;
  };
}

export function percursosPorTema(p: ProgressoEstudo, ctx: ContextoJornada): PercursoTema[] {
  const conclusoes = conclusoesAtivas(p, ctx);
  const temas = [...new Set([...conclusoes.flatMap((c) => c.temas), ...Object.keys(p.titulos ?? {})])];
  return temas
    .map((tema): PercursoTema => {
      const doTema = conclusoes.filter((c) => c.temas.includes(tema));
      const salas = new Set(doTema.map((c) => c.sala)).size;
      const primeira = doTema.reduce((m, c) => (!m || c.em < m ? c.em : m), "");
      const obtidos: Record<string, string> = {
        ...(primeira ? { explorador: primeira } : {}),
        ...(p.titulos?.[tema] ?? {}),
      };
      const atual = [...TITULOS].reverse().find((t) => obtidos[t.codigo]);
      const proximo = TITULOS[atual ? TITULOS.indexOf(atual) + 1 : 0];
      return {
        tema,
        conteudos: doTema.length,
        salas,
        ...(atual ? { titulo: { nome: atual.nome, em: obtidos[atual.codigo] as string } } : {}),
        ...(proximo
          ? {
              proximo: {
                nome: proximo.nome,
                requisitos: [
                  {
                    rotulo: "conteúdos",
                    atual: Math.min(doTema.length, proximo.conteudos),
                    alvo: proximo.conteudos,
                  },
                  ...(proximo.salas
                    ? [{ rotulo: "Salas", atual: Math.min(salas, proximo.salas), alvo: proximo.salas }]
                    : []),
                ],
                ...(proximo.emPreparacao ? { emPreparacao: proximo.emPreparacao } : {}),
              },
            }
          : {}),
      };
    })
    .sort((a, b) => b.conteudos - a.conteudos || a.tema.localeCompare(b.tema));
}

export interface ProgressoSala {
  sala: SalaSlug;
  artigos: { concluidos: number; total: number };
  videos: { concluidos: number; total: number };
  /** Há conteúdo publicado depois da última conclusão nesta Sala. */
  novosConteudos: boolean;
}

/** Progresso por Sala no acervo publicado agora; Sala sem conteúdo fica "em preparação". */
export function progressoNasSalas(
  p: ProgressoEstudo,
  ctx: ContextoJornada,
  salas: SalaSlug[],
): ProgressoSala[] {
  const conclusoes = conclusoesAtivas(p, ctx);
  return salas.map((sala) => {
    const artigos = ctx.acervo.filter((c) => c.sala === sala && c.donoId !== ctx.contaId);
    const videos = ctx.videos.filter((v) => v.sala === sala && v.donoId !== ctx.contaId);
    const daSala = conclusoes.filter((c) => c.sala === sala);
    const ultima = daSala.reduce((m, c) => (c.em > m ? c.em : m), "");
    return {
      sala,
      artigos: { concluidos: daSala.filter((c) => c.tipo === "artigo").length, total: artigos.length },
      videos: { concluidos: daSala.filter((c) => c.tipo === "video").length, total: videos.length },
      novosConteudos: Boolean(ultima) && artigos.some((c) => c.publicadoEm > ultima),
    };
  });
}

/** Próxima descoberta: um conteúdo ainda não concluído do último tema estudado (ou de qualquer tema). */
export function proximaDescoberta(
  p: ProgressoEstudo,
  ctx: ContextoJornada,
): { item: ItemAcervo; tema?: TemaSlug } | null {
  const conclusoes = conclusoesAtivas(p, ctx).sort((a, b) => b.em.localeCompare(a.em));
  const feitos = new Set(conclusoes.map((c) => c.chave));
  const disponiveis = ctx.acervo.filter(
    (c) => c.donoId !== ctx.contaId && !feitos.has(chaveLeitura(c.sala, c.slug)),
  );
  const tema = conclusoes[0]?.temas[0];
  const doTema = tema ? disponiveis.find((c) => c.temas.includes(tema)) : undefined;
  if (doTema) return { item: doTema, tema };
  const qualquer = disponiveis[0];
  return qualquer ? { item: qualquer } : null;
}
