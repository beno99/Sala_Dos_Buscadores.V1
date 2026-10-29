import type {
  ConteudoEditorial,
  FonteEditorial,
  Nivel,
  Proveniencia,
  SalaSlug,
  StatusEditorial,
  TemaSlug,
  VideoEditorial,
} from "@/data/types";
import { normalizar } from "@/lib/texto";

/*
 * Filtros e ordenação das listas da curadoria. Os mesmos filtros valem na
 * tela e na exportação CSV (RF-38), lidos da URL.
 */

export type Ordem = "atualizado-desc" | "atualizado-asc" | "titulo-asc" | "titulo-desc";

export interface FiltrosArtigos {
  q: string;
  sala: SalaSlug | "";
  tipo: "artigo" | "fonte-primaria" | "";
  status: StatusEditorial | "";
  proveniencia: Proveniencia | "";
  nivel: Nivel | 0;
  tema: TemaSlug | "";
  ordem: Ordem;
  pagina: number;
}

export interface FiltrosVideos {
  q: string;
  sala: SalaSlug | "";
  tema: TemaSlug | "";
  nivel: Nivel | 0;
  status: StatusEditorial | "";
  ordem: Ordem;
  pagina: number;
}

export type OrigemFiltro = "oficial" | "anfitriao" | "";

/** Filtros da lista de Salas da curadoria (e da exportação CSV a partir dela). */
export interface FiltrosSalas {
  q: string;
  origem: OrigemFiltro;
  status: StatusEditorial | "";
  /** Id da conta do anfitrião; só vale com a origem "anfitriao". */
  anfitriao: string;
}

export interface FiltrosFontes {
  q: string;
  ordem: Ordem;
  pagina: number;
}

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function ler(p: Params, k: string): string {
  if (p instanceof URLSearchParams) return p.get(k) ?? "";
  const v = p[k];
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

const um = <T extends string>(v: string, validos: readonly T[]): T | "" =>
  validos.includes(v as T) ? (v as T) : "";
const ORDENS = ["atualizado-desc", "atualizado-asc", "titulo-asc", "titulo-desc"] as const;
/** Salas não são fixas: o slug só precisa ter o formato de endereço. */
const slugDeSala = (v: string): SalaSlug | "" => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) ? v : "");
const STATUS = ["rascunho", "em_revisao", "publicado", "reprovado", "arquivado"] as const;
const PROVENIENCIAS = ["primaria", "curado", "especialista", "comunidade", "ia"] as const;

const nivel = (v: string): Nivel | 0 => (v === "1" || v === "2" || v === "3" ? (Number(v) as Nivel) : 0);
const pagina = (v: string) => Math.max(1, Number.parseInt(v, 10) || 1);
const ordem = (v: string): Ordem => um(v, ORDENS) || "atualizado-desc";

export function lerFiltrosArtigos(p: Params): FiltrosArtigos {
  return {
    q: ler(p, "q").slice(0, 120),
    sala: slugDeSala(ler(p, "sala")),
    tipo: um(ler(p, "tipo"), ["artigo", "fonte-primaria"] as const),
    status: um(ler(p, "status"), STATUS),
    proveniencia: um(ler(p, "proveniencia"), PROVENIENCIAS),
    nivel: nivel(ler(p, "nivel")),
    tema: slugDeSala(ler(p, "tema")),
    ordem: ordem(ler(p, "ordem")),
    pagina: pagina(ler(p, "pagina")),
  };
}

export function lerFiltrosVideos(p: Params): FiltrosVideos {
  return {
    q: ler(p, "q").slice(0, 120),
    sala: slugDeSala(ler(p, "sala")),
    tema: slugDeSala(ler(p, "tema")),
    nivel: nivel(ler(p, "nivel")),
    status: um(ler(p, "status"), STATUS),
    ordem: ordem(ler(p, "ordem")),
    pagina: pagina(ler(p, "pagina")),
  };
}

export function lerFiltrosSalas(p: Params): FiltrosSalas {
  const origem = um(ler(p, "origem"), ["oficial", "anfitriao"] as const);
  return {
    q: ler(p, "q").slice(0, 120),
    origem,
    status: um(ler(p, "status"), STATUS),
    anfitriao: origem === "anfitriao" ? ler(p, "anfitriao").slice(0, 60) : "",
  };
}

export function filtrarSalas<
  T extends { sala: { nome: string; origem: string; status: StatusEditorial; revisao?: { donoId: string } } },
>(itens: T[], f: FiltrosSalas): T[] {
  return itens.filter(
    ({ sala }) =>
      contem(sala.nome, f.q) &&
      (!f.origem || sala.origem === f.origem) &&
      (!f.status || sala.status === f.status) &&
      (!f.anfitriao || sala.revisao?.donoId === f.anfitriao),
  );
}

export function lerFiltrosFontes(p: Params): FiltrosFontes {
  return { q: ler(p, "q").slice(0, 120), ordem: ordem(ler(p, "ordem")), pagina: pagina(ler(p, "pagina")) };
}

/** Filtros → query string, sem os valores padrão. */
export function paraQuery(f: object, sem: string[] = []): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (sem.includes(k)) continue;
    if (v === "" || v === 0 || v === null || v === undefined) continue;
    if (k === "ordem" && v === "atualizado-desc") continue;
    if (k === "pagina" && v === 1) continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

function ordenar<T extends { titulo: string; atualizadoEm: string }>(itens: T[], o: Ordem): T[] {
  const copia = [...itens];
  const porTitulo = (a: T, b: T) => a.titulo.localeCompare(b.titulo, "pt-BR");
  const porData = (a: T, b: T) => a.atualizadoEm.localeCompare(b.atualizadoEm);
  switch (o) {
    case "titulo-asc":
      return copia.sort(porTitulo);
    case "titulo-desc":
      return copia.sort((a, b) => porTitulo(b, a));
    case "atualizado-asc":
      return copia.sort(porData);
    default:
      return copia.sort((a, b) => porData(b, a));
  }
}

const contem = (texto: string, q: string) => !q.trim() || normalizar(texto).includes(normalizar(q));

export function filtrarArtigos(itens: ConteudoEditorial[], f: FiltrosArtigos): ConteudoEditorial[] {
  return ordenar(
    itens.filter(
      (c) =>
        (c.tipo === "artigo" || c.tipo === "fonte-primaria") &&
        contem(c.titulo, f.q) &&
        (!f.sala || c.sala === f.sala) &&
        (!f.tipo || c.tipo === f.tipo) &&
        (!f.status || c.status === f.status) &&
        (!f.proveniencia || c.proveniencia === f.proveniencia) &&
        (!f.nivel || c.nivel === f.nivel) &&
        (!f.tema || c.temas.includes(f.tema)),
    ),
    f.ordem,
  );
}

export function filtrarVideos(itens: VideoEditorial[], f: FiltrosVideos): VideoEditorial[] {
  return ordenar(
    itens.filter(
      (v) =>
        contem(v.titulo, f.q) &&
        (!f.sala || v.sala === f.sala) &&
        (!f.tema || v.tema === f.tema) &&
        (!f.nivel || v.nivel === f.nivel) &&
        (!f.status || v.status === f.status),
    ),
    f.ordem,
  );
}

export function filtrarFontes(itens: FonteEditorial[], f: FiltrosFontes): FonteEditorial[] {
  return ordenar(
    itens.filter((x) => contem(`${x.titulo} ${x.autor}`, f.q)),
    f.ordem,
  );
}

export function paginar<T>(itens: T[], pagina: number, porPagina: number) {
  const total = Math.max(1, Math.ceil(itens.length / porPagina));
  const atual = Math.min(Math.max(1, pagina), total);
  return {
    itens: itens.slice((atual - 1) * porPagina, atual * porPagina),
    pagina: atual,
    totalPaginas: total,
  };
}
