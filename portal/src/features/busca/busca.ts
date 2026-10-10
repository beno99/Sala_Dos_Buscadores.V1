import { comparacaoDoTema, salaPorSlug, temaPorSlug, todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { NIVEL_ROTULO } from "@/data/rotulos";
import type { Comparacao, Conteudo, Formato, Nivel, SalaSlug, TemaSlug, Video } from "@/data/types";
import { normalizar } from "@/lib/texto";

/*
 * Busca por Sala ou por tema e comparação transversal (RF-17 a RF-21).
 * Funções puras: recebem o acervo publicado (que vem do servidor) e podem
 * rodar tanto no servidor quanto no navegador (contagem ao vivo dos filtros).
 */

/** Só o que está publicado entra na busca. */
export interface AcervoBusca {
  conteudos: Conteudo[];
  videos: Video[];
}

export type ModoBusca = "tema" | "sala";

export interface FiltrosBusca {
  q: string;
  modo: ModoBusca;
  salas: SalaSlug[];
  temas: TemaSlug[];
  niveis: Nivel[];
  formato: Formato | null;
}

export const FILTROS_VAZIOS: FiltrosBusca = {
  q: "",
  modo: "tema",
  salas: [],
  temas: [],
  niveis: [],
  formato: null,
};

export type ItemResultado = { tipo: "conteudo"; item: Conteudo } | { tipo: "video"; item: Video };

export interface ResultadoBusca {
  /** Tema que alimenta a grade comparativa, se houver. */
  tema: TemaSlug | null;
  comparacao: Comparacao | null;
  itens: ItemResultado[];
  /** A busca tinha termo ou tema, mas nada foi encontrado. */
  vazio: boolean;
}

const PALAVRAS_VAZIAS = new Set(
  "a o as os um uma de da do das dos e em no na nos nas para por com sem que qual quais como sobre apos ante entre se sua seu suas seus ao aos acontece diz dizem the of".split(
    " ",
  ),
);

// ---------- parâmetros de URL ----------

type Params = Record<string, string | string[] | undefined>;

const lista = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

export function lerFiltros(params: Params | URLSearchParams): FiltrosBusca {
  const get = (k: string) =>
    params instanceof URLSearchParams ? params.getAll(k) : lista((params as Params)[k]);
  const salasValidas = new Set(todasAsSalas().map((s) => s.slug));
  const temasValidos = new Set(todosOsTemas().map((t) => t.slug));
  const formato = get("formato")[0];
  return {
    q: (get("q")[0] ?? "").slice(0, 200),
    modo: get("modo")[0] === "sala" ? "sala" : "tema",
    salas: get("sala").filter((s): s is SalaSlug => salasValidas.has(s as SalaSlug)),
    temas: get("tema").filter((t): t is TemaSlug => temasValidos.has(t as TemaSlug)),
    niveis: get("nivel")
      .map(Number)
      .filter((n): n is Nivel => n === 1 || n === 2 || n === 3),
    formato: formato === "texto" || formato === "video" ? formato : null,
  };
}

export function paraQueryString(f: FiltrosBusca): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q.trim());
  if (f.modo === "sala") p.set("modo", "sala");
  for (const s of f.salas) p.append("sala", s);
  for (const t of f.temas) p.append("tema", t);
  for (const n of f.niveis) p.append("nivel", String(n));
  if (f.formato) p.set("formato", f.formato);
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export function contarFiltrosAtivos(f: FiltrosBusca): number {
  return f.salas.length + f.temas.length + f.niveis.length + (f.formato ? 1 : 0);
}

/** Rótulos dos filtros ativos, na ordem em que aparecem no painel. */
export function filtrosAtivos(f: FiltrosBusca) {
  const salas = todasAsSalas();
  const temas = todosOsTemas();
  return [
    ...f.salas.map((s) => ({
      rotulo: salas.find((x) => x.slug === s)?.nome ?? s,
      remover: (x: FiltrosBusca) => ({ ...x, salas: x.salas.filter((v) => v !== s) }),
    })),
    ...f.temas.map((t) => ({
      rotulo: temas.find((x) => x.slug === t)?.nome ?? t,
      remover: (x: FiltrosBusca) => ({ ...x, temas: x.temas.filter((v) => v !== t) }),
    })),
    ...f.niveis.map((n) => ({
      rotulo: NIVEL_ROTULO[n],
      remover: (x: FiltrosBusca) => ({ ...x, niveis: x.niveis.filter((v) => v !== n) }),
    })),
    ...(f.formato
      ? [
          {
            rotulo: f.formato === "video" ? "Vídeo" : "Texto",
            remover: (x: FiltrosBusca) => ({ ...x, formato: null }),
          },
        ]
      : []),
  ];
}

// ---------- interpretação da pergunta ----------

/** Temas reconhecidos na pergunta, do mais ao menos provável. */
export function detectarTemas(pergunta: string): TemaSlug[] {
  const q = ` ${normalizar(pergunta)} `;
  if (!q.trim()) return [];
  return todosOsTemas()
    .map((tema, ordem) => {
      const pontos = tema.sinonimos.reduce(
        (soma, s) => (q.includes(` ${s} `) ? soma + s.split(" ").length : soma),
        0,
      );
      return { tema: tema.slug, pontos, ordem };
    })
    .filter((t) => t.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || a.ordem - b.ordem)
    .map((t) => t.tema);
}

function termos(pergunta: string): string[] {
  return normalizar(pergunta)
    .split(" ")
    .filter((t) => t.length > 2 && !PALAVRAS_VAZIAS.has(t));
}

function textoPesquisavel(item: ItemResultado): string {
  const sala = salaPorSlug(item.item.sala)?.nome ?? "";
  if (item.tipo === "video") {
    const tema = temaPorSlug(item.item.tema)?.nome ?? "";
    return normalizar(`${item.item.titulo} ${sala} ${tema}`);
  }
  const temas = item.item.temas.map((t) => temaPorSlug(t)?.nome ?? "").join(" ");
  return normalizar(`${item.item.titulo} ${item.item.resumo} ${sala} ${temas}`);
}

// ---------- busca ----------

function todosOsItens(acervo: AcervoBusca): ItemResultado[] {
  return [
    ...acervo.conteudos.map((item) => ({ tipo: "conteudo" as const, item })),
    ...acervo.videos.map((item) => ({ tipo: "video" as const, item })),
  ];
}

const temasDoItem = (i: ItemResultado): TemaSlug[] => (i.tipo === "video" ? [i.item.tema] : i.item.temas);

type Faceta = "salas" | "temas" | "niveis" | "formato";

function aplicar(f: FiltrosBusca, acervo: AcervoBusca, ignorar?: Faceta): ItemResultado[] {
  const temasDaPergunta = detectarTemas(f.q);
  const palavras = termos(f.q);

  return todosOsItens(acervo).filter((i) => {
    if (f.q.trim()) {
      const texto = textoPesquisavel(i);
      const porTema = temasDaPergunta.some((t) => temasDoItem(i).includes(t));
      const porTexto = palavras.length > 0 && palavras.some((p) => texto.includes(p));
      if (!porTema && !porTexto) return false;
    }
    if (ignorar !== "salas" && f.salas.length && !f.salas.includes(i.item.sala)) return false;
    if (ignorar !== "temas" && f.temas.length && !f.temas.some((t) => temasDoItem(i).includes(t)))
      return false;
    if (ignorar !== "niveis" && f.niveis.length && !f.niveis.includes(i.item.nivel)) return false;
    if (ignorar !== "formato" && f.formato) {
      const formato: Formato = i.tipo === "video" ? "video" : i.item.formato;
      if (formato !== f.formato) return false;
    }
    return true;
  });
}

export function buscar(f: FiltrosBusca, acervo: AcervoBusca): ResultadoBusca {
  const tema = detectarTemas(f.q)[0] ?? f.temas[0] ?? null;
  const base = tema ? (comparacaoDoTema(tema) ?? null) : null;
  // O filtro de Sala tira colunas da grade; os demais filtros refinam só a lista.
  const comparacao =
    base && f.salas.length
      ? { ...base, respostas: base.respostas.filter((r) => f.salas.includes(r.sala)) }
      : base;
  const itens = aplicar(f, acervo);
  const buscou = Boolean(f.q.trim()) || contarFiltrosAtivos(f) > 0;
  const semGrade = !comparacao || comparacao.respostas.length === 0;
  return {
    tema,
    comparacao: semGrade ? null : comparacao,
    itens,
    vazio: buscou && itens.length === 0 && semGrade,
  };
}

/** Contagens por opção de cada faceta, considerando os demais filtros ativos. */
export function contarFacetas(f: FiltrosBusca, acervo: AcervoBusca) {
  const contar = <K extends string>(faceta: Faceta, chave: (i: ItemResultado) => K[]) => {
    const mapa = new Map<K, number>();
    for (const i of aplicar(f, acervo, faceta)) for (const k of chave(i)) mapa.set(k, (mapa.get(k) ?? 0) + 1);
    return mapa;
  };
  return {
    salas: contar("salas", (i) => [i.item.sala]),
    temas: contar("temas", temasDoItem),
    niveis: contar("niveis", (i) => [String(i.item.nivel) as `${Nivel}`]),
    formato: contar("formato", (i) => [i.tipo === "video" ? "video" : i.item.formato]),
  };
}
