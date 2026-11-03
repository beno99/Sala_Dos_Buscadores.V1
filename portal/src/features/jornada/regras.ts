import type { SalaSlug, TemaSlug } from "@/data/types";
import { chaveLeitura, type ItemAcervo, type ItemVideo, type ProgressoEstudo } from "@/features/estudo/tipos";

/*
 * Jornada do Buscador: catálogo inicial de 12 gemas (03/11/2026), todas ativas,
 * calculadas por conteúdos concluídos, dias de conclusão e Salas. Títulos por
 * tema são camada separada; só Explorador está ativo.
 * Registra atividades; não certifica conhecimento nem superioridade espiritual.
 */

export const FUSO_PADRAO = "America/Fortaleza";

export type CodigoGema =
  | "citrino"
  | "esmeralda"
  | "opala"
  | "agata"
  | "jaspe"
  | "quartzo-rosa"
  | "fluorita"
  | "lapis-lazuli"
  | "amazonita"
  | "granada"
  | "pedra-da-lua"
  | "topazio"
  | "alexandrita"
  | "benitoita"
  | "espinelio"
  | "demantoide"
  | "paraiba"
  | "rubi-estrela"
  | "padparadscha"
  | "diamante-rosa";

/** Contadores reais de uma conta, a partir das conclusões ativas. */
export interface Medidas {
  conteudos: number;
  dias: number;
  salas: number;
  maiorSala: number;
  porSala: { conteudos: number; dias: number }[];
  artigos: number;
  salasComArtigo: number;
}

export interface DefinicaoGema {
  codigo: CodigoGema;
  /** J01…J12, identificador estável do catálogo. */
  ordem: string;
  nome: string;
  modalidade: string;
  criterio: string;
  escopo: "geral";
  requisitos: (m: Medidas) => { rotulo: string; atual: number; alvo: number }[];
}

const req = (rotulo: string, atual: number, alvo: number) => ({ rotulo, atual: Math.min(atual, alvo), alvo });

/** Catálogo inicial de 12 gemas (03/11/2026): conclusão de conteúdos, dias de estudo e Salas. */
const GEMAS_EM_ORDEM: DefinicaoGema[] = [
  {
    codigo: "citrino",
    ordem: "J01",
    nome: "Citrino",
    modalidade: "Primeiro passo",
    criterio: "Concluir 1 conteúdo.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 1)],
  },
  {
    codigo: "esmeralda",
    ordem: "J02",
    nome: "Esmeralda",
    modalidade: "Continuidade",
    criterio: "Concluir 5 conteúdos em pelo menos 3 dias diferentes, sem precisar ser seguidos.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 5), req("dias de conclusão", m.dias, 3)],
  },
  {
    codigo: "opala",
    ordem: "J03",
    nome: "Opala",
    modalidade: "Entre Salas",
    criterio: "Concluir pelo menos 1 conteúdo em cada uma de 3 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com conclusão", m.salas, 3)],
  },
  {
    codigo: "agata",
    ordem: "J04",
    nome: "Ágata",
    modalidade: "Novas leituras",
    criterio: "Concluir 3 conteúdos.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 3)],
  },
  {
    codigo: "jaspe",
    ordem: "J05",
    nome: "Jaspe",
    modalidade: "Primeiro percurso",
    criterio: "Concluir 5 conteúdos.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 5)],
  },
  {
    codigo: "quartzo-rosa",
    ordem: "J06",
    nome: "Quartzo Rosa",
    modalidade: "Retomar a busca",
    criterio: "Concluir conteúdos em pelo menos 2 dias diferentes.",
    escopo: "geral",
    requisitos: (m) => [req("dias de conclusão", m.dias, 2)],
  },
  {
    codigo: "fluorita",
    ordem: "J07",
    nome: "Fluorita",
    modalidade: "Duas perspectivas",
    criterio: "Concluir pelo menos 1 conteúdo em cada uma de 2 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com conclusão", m.salas, 2)],
  },
  {
    codigo: "lapis-lazuli",
    ordem: "J08",
    nome: "Lápis Lazúli",
    modalidade: "Permanecer em uma Sala",
    criterio: "Concluir 3 conteúdos em uma mesma Sala.",
    escopo: "geral",
    requisitos: (m) => [req("maior progresso em uma Sala", m.maiorSala, 3)],
  },
  {
    codigo: "amazonita",
    ordem: "J09",
    nome: "Amazonita",
    modalidade: "Horizontes do acervo",
    criterio: "Concluir pelo menos 1 conteúdo em cada uma de 4 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com conclusão", m.salas, 4)],
  },
  {
    codigo: "granada",
    ordem: "J10",
    nome: "Granada",
    modalidade: "Percurso ampliado",
    criterio: "Concluir 10 conteúdos.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 10)],
  },
  {
    codigo: "pedra-da-lua",
    ordem: "J11",
    nome: "Pedra da Lua",
    modalidade: "Ritmo próprio",
    criterio: "Concluir conteúdos em pelo menos 5 dias diferentes, sem exigir sequência.",
    escopo: "geral",
    requisitos: (m) => [req("dias de conclusão", m.dias, 5)],
  },
  {
    codigo: "alexandrita",
    ordem: "J13",
    nome: "Alexandrita",
    modalidade: "Raízes em uma Sala",
    criterio: "Concluir 20 conteúdos em uma mesma Sala, em pelo menos 10 dias diferentes nessa Sala.",
    escopo: "geral",
    requisitos: (m) => {
      const b = [...m.porSala].sort(
        (x, y) => Math.min(y.conteudos / 20, y.dias / 10) - Math.min(x.conteudos / 20, x.dias / 10),
      )[0] ?? { conteudos: 0, dias: 0 };
      return [req("conteúdos na Sala mais avançada", b.conteudos, 20), req("dias nessa Sala", b.dias, 10)];
    },
  },
  {
    codigo: "benitoita",
    ordem: "J14",
    nome: "Benitoíta",
    modalidade: "Percursos entre Salas",
    criterio: "Concluir pelo menos 5 conteúdos em cada uma de 5 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com 5 conteúdos", m.porSala.filter((x) => x.conteudos >= 5).length, 5)],
  },
  {
    codigo: "espinelio",
    ordem: "J15",
    nome: "Espinélio",
    modalidade: "Uma busca constante",
    criterio: "Concluir 30 conteúdos em pelo menos 15 dias diferentes.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 30), req("dias", m.dias, 15)],
  },
  {
    codigo: "demantoide",
    ordem: "J16",
    nome: "Demantoide",
    modalidade: "Continuidade construída",
    criterio: "Concluir 40 conteúdos em pelo menos 20 dias diferentes.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 40), req("dias", m.dias, 20)],
  },
  {
    codigo: "paraiba",
    ordem: "J17",
    nome: "Paraíba",
    modalidade: "Três caminhos aprofundados",
    criterio:
      "Concluir 10 conteúdos em cada uma de 3 Salas, com conclusões em pelo menos 5 dias diferentes em cada Sala.",
    escopo: "geral",
    requisitos: (m) => [
      req(
        "Salas com 10 conteúdos e 5 dias",
        m.porSala.filter((x) => x.conteudos >= 10 && x.dias >= 5).length,
        3,
      ),
    ],
  },
  {
    codigo: "rubi-estrela",
    ordem: "J18",
    nome: "Rubi Estrela",
    modalidade: "Horizontes conectados",
    criterio: "Concluir 50 artigos no acervo. Vídeos não contam.",
    escopo: "geral",
    requisitos: (m) => [req("artigos", m.artigos, 50)],
  },
  {
    codigo: "padparadscha",
    ordem: "J19",
    nome: "Padparadscha",
    modalidade: "Amplitude do percurso",
    criterio: "Concluir pelo menos 1 artigo em cada uma de 25 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com artigo concluído", m.salasComArtigo, 25)],
  },
  {
    codigo: "diamante-rosa",
    ordem: "J20",
    nome: "Diamante Rosa",
    modalidade: "Dedicação ao percurso",
    criterio: "Concluir pelo menos 1 artigo em cada uma de 50 Salas.",
    escopo: "geral",
    requisitos: (m) => [req("Salas com artigo concluído", m.salasComArtigo, 50)],
  },
  {
    codigo: "topazio",
    ordem: "J12",
    nome: "Topázio",
    modalidade: "Caminho construído",
    criterio: "Concluir 15 conteúdos, em pelo menos 3 Salas e 5 dias diferentes.",
    escopo: "geral",
    requisitos: (m) => [req("conteúdos", m.conteudos, 15), req("Salas", m.salas, 3), req("dias", m.dias, 5)],
  },
];

/** Quatro famílias (só organizam a interface; não criam pré-requisitos). */
const FAMILIAS: CodigoGema[] = [
  "citrino",
  "agata",
  "jaspe",
  "granada",
  "esmeralda",
  "quartzo-rosa",
  "pedra-da-lua",
  "espinelio",
  "demantoide",
  "opala",
  "fluorita",
  "lapis-lazuli",
  "amazonita",
  "alexandrita",
  "benitoita",
  "paraiba",
  "topazio",
  "rubi-estrela",
  "padparadscha",
  "diamante-rosa",
];
export const GEMAS: DefinicaoGema[] = FAMILIAS.map(
  (c) => GEMAS_EM_ORDEM.find((g) => g.codigo === c) as DefinicaoGema,
);

/** Gemas do catálogo anterior, fora do catálogo ativo: só aparecem no histórico se já tiverem sido concedidas. */
export const GEMAS_ANTERIORES: Record<string, string> = {
  "cristal-de-rocha": "Cristal de Rocha · Na fonte",
  safira: "Safira · Aprofundamento",
  turmalina: "Turmalina · Perspectivas em diálogo",
  ametista: "Ametista · Leitura reflexiva",
  rubi: "Rubi · Contribuição à comunidade",
};

export function medir(conclusoes: Conclusao[], fuso = FUSO_PADRAO): Medidas {
  const porSala = new Map<string, { conteudos: number; dias: Set<string> }>();
  for (const c of conclusoes) {
    const x = porSala.get(c.sala) ?? { conteudos: 0, dias: new Set<string>() };
    x.conteudos += 1;
    x.dias.add(diaLocal(c.em, fuso));
    porSala.set(c.sala, x);
  }
  const artigos = conclusoes.filter((c) => c.tipo === "artigo");
  const salas = [...porSala.values()].map((x) => ({ conteudos: x.conteudos, dias: x.dias.size }));
  return {
    conteudos: conclusoes.length,
    dias: new Set(conclusoes.map((c) => diaLocal(c.em, fuso))).size,
    salas: porSala.size,
    maiorSala: Math.max(0, ...salas.map((x) => x.conteudos)),
    porSala: salas,
    artigos: artigos.length,
    salasComArtigo: new Set(artigos.map((c) => c.sala)).size,
  };
}

const cumprida = (g: DefinicaoGema, m: Medidas) => g.requisitos(m).every((r) => r.atual >= r.alvo);

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

/** Quando cada gema foi cumprida, pela ordem das conclusões (mostra como conquistado o que já estava cumprido). */
export function datasDeCumprimento(
  conclusoes: Conclusao[],
  fuso = FUSO_PADRAO,
): Partial<Record<CodigoGema, string>> {
  const ordem = [...conclusoes].sort((a, b) => a.em.localeCompare(b.em));
  const datas: Partial<Record<CodigoGema, string>> = {};
  ordem.forEach((c, i) => {
    const m = medir(ordem.slice(0, i + 1), fuso);
    for (const g of GEMAS) if (!datas[g.codigo] && cumprida(g, m)) datas[g.codigo] = c.em;
  });
  return datas;
}

/** Títulos por tema (camada separada das gemas): só Explorador está ativo. */
function exploradorEm(conclusoes: Conclusao[]) {
  return [...new Set(conclusoes.flatMap((c) => c.temas))];
}

/** Concede, sem nunca retirar, o que já foi cumprido. Idempotente. Devolve as gemas novas. */
export function conceder(p: ProgressoEstudo, ctx: ContextoJornada, agora: string): CodigoGema[] {
  const conclusoes = conclusoesAtivas(p, ctx);
  const m = medir(conclusoes, ctx.fuso);
  const atuais = { ...(p.gemas ?? {}) };
  const novas = GEMAS.filter((g) => !atuais[g.codigo] && cumprida(g, m)).map((g) => g.codigo);
  for (const g of novas) atuais[g] = agora;
  p.gemas = atuais;
  const titulos = { ...(p.titulos ?? {}) };
  for (const tema of exploradorEm(conclusoes)) {
    if (!titulos[tema]?.explorador) titulos[tema] = { ...titulos[tema], explorador: agora };
  }
  p.titulos = titulos;
  return novas;
}

export type EstadoGema = "conquistada" | "em-progresso";

export interface GemaVisivel extends DefinicaoGema {
  estado: EstadoGema;
  em?: string;
  progresso: { rotulo: string; atual: number; alvo: number }[];
}

export function estadoDasGemas(p: ProgressoEstudo, ctx: ContextoJornada): GemaVisivel[] {
  const conclusoes = conclusoesAtivas(p, ctx);
  const m = medir(conclusoes, ctx.fuso);
  const datas = datasDeCumprimento(conclusoes, ctx.fuso);
  return GEMAS.map((g) => {
    const em = p.gemas?.[g.codigo] ?? datas[g.codigo];
    return {
      ...g,
      estado: em ? "conquistada" : "em-progresso",
      ...(em ? { em } : {}),
      progresso: g.requisitos(m),
    };
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
      const candidato = TITULOS[atual ? TITULOS.indexOf(atual) + 1 : 0];
      const proximo = candidato && !candidato.emPreparacao ? candidato : undefined;
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
