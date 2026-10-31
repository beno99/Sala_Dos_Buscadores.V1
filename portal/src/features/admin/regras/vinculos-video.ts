import type { StatusEditorial } from "@/data/types";

export interface ArtigoLigavel {
  id: string;
  titulo: string;
  sala: string;
  status: StatusEditorial;
  criadoEm: string;
}

type Candidato = ArtigoLigavel & { tipo?: string; revisao?: unknown };
const normalizar = (valor: string) =>
  valor.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");

/** O mesmo recorte alimenta o seletor e a validação de IDs no servidor. */
export function artigosParaVincular<T extends Candidato>(artigos: T[], sala: string, busca = ""): T[] {
  const termo = normalizar(busca.trim());
  return artigos
    .filter(
      (a) =>
        a.sala === sala &&
        a.status !== "arquivado" &&
        !a.revisao &&
        (!a.tipo || a.tipo === "artigo" || a.tipo === "fonte-primaria") &&
        (!termo || normalizar(`${a.titulo} ${a.id}`).includes(termo)),
    )
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm) || a.id.localeCompare(b.id));
}

export function idsDeArtigosValidos(ids: string[], artigos: Candidato[], sala: string): string[] {
  const permitidos = new Set(artigosParaVincular(artigos, sala).map((a) => a.id));
  return [...new Set(ids)].filter((id) => permitidos.has(id));
}
