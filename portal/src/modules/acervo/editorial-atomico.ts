import type { Citacao, ConteudoEditorial, SalaEditorial, VideoEditorial } from "@/data/types";
import { salaVisivel } from "@/features/anfitriao/regras/visibilidade";

export type ValorEditorial = ConteudoEditorial | VideoEditorial | SalaEditorial;
export interface PedidoEditorial {
  colecao: "conteudos" | "videos" | "salas";
  valor: ValorEditorial;
  esperado: string | null;
  ator: { id: string; papel: "administrador" | "anfitriao" };
  /** Seleção por artigo: modifica somente este ID nos arrays atuais dos vídeos. */
  videos?: string[];
  citacao?: Citacao;
}
export interface EstadoEditorial {
  salas: SalaEditorial[];
  conteudos: ConteudoEditorial[];
  videos: VideoEditorial[];
}
export interface ResultadoEditorial {
  colecao: PedidoEditorial["colecao"];
  valor: ValorEditorial;
  videos: VideoEditorial[];
  citacao?: Citacao;
}
export class ConflitoEditorial extends Error {
  constructor() {
    super(
      "Outra pessoa alterou este registro. Seu texto continua neste formulário. Copie suas alterações e reabra a versão atual antes de salvar novamente.",
    );
    this.name = "ConflitoEditorial";
  }
}
export function proximoInstante(anterior?: string): string {
  return new Date(Math.max(Date.now(), (Date.parse(anterior ?? "") || 0) + 1)).toISOString();
}
/** Executada sobre estado relido sob lock. Nunca usa arrays de relações do snapshot do servidor. */
export function planejarEditorial(p: PedidoEditorial, e: EstadoEditorial): ResultadoEditorial {
  const atual = e[p.colecao].find((v) => v.id === p.valor.id);
  if ((atual?.atualizadoEm ?? null) !== p.esperado) throw new ConflitoEditorial();
  if (atual && "lixeira" in atual && atual.lixeira) throw new Error("Este registro está na lixeira.");
  const salaDo = (slug: string) => e.salas.find((s) => s.slug === slug);
  const dono = p.ator.papel === "anfitriao";
  if (
    dono &&
    (p.colecao === "videos" ||
      !("revisao" in p.valor) ||
      p.valor.revisao?.donoId !== p.ator.id ||
      (atual && (!("revisao" in atual) || atual.revisao?.donoId !== p.ator.id)))
  )
    throw new Error("Acesso restrito ao proprietário do artigo ou Sala.");
  const sala =
    p.colecao === "salas"
      ? (atual as SalaEditorial | undefined)
      : salaDo((p.valor as ConteudoEditorial).sala);
  if (
    p.colecao !== "salas" &&
    ((atual && "sala" in atual && salaDo(atual.sala)?.lixeira) || !sala || sala.lixeira)
  )
    throw new Error("A Sala não está disponível.");
  if (dono && sala?.revisao?.donoId !== p.ator.id) throw new Error("A Sala pertence a outra pessoa.");
  const salaPublica = (slug: string) => {
    const s = salaDo(slug);
    return Boolean(s && salaVisivel(s, e.conteudos));
  };
  const elegivelVideo = (v: VideoEditorial) =>
    Boolean(
      salaDo(v.sala) &&
        !salaDo(v.sala)?.lixeira &&
        v.status !== "arquivado" &&
        (!dono || (v.status === "publicado" && salaPublica(v.sala))),
    );
  const mudados: VideoEditorial[] = [];
  let valor = { ...p.valor, atualizadoEm: p.valor.atualizadoEm } as ValorEditorial;
  // Preserva estado da lixeira/endereço mesmo em payload antigo ou adulterado.
  if (p.colecao === "salas" && atual)
    valor = { ...valor, slug: (atual as SalaEditorial).slug } as ValorEditorial;
  if (p.colecao === "conteudos" && p.videos !== undefined) {
    const desejados = new Set(p.videos);
    for (const id of desejados) {
      const v = e.videos.find((v) => v.id === id);
      if (!v || (!elegivelVideo(v) && !v.artigos.includes(p.valor.id)))
        throw new Error("Um vídeo não está disponível para associação.");
    }
    for (const v of e.videos) {
      if (!elegivelVideo(v)) continue;
      if (v.artigos.includes(p.valor.id) === desejados.has(v.id)) continue;
      mudados.push({
        ...v,
        artigos: desejados.has(v.id)
          ? [...new Set([...v.artigos, p.valor.id])]
          : v.artigos.filter((id) => id !== p.valor.id),
        atualizadoEm: proximoInstante(v.atualizadoEm),
      });
    }
  }
  if (p.colecao === "videos") {
    if (dono) throw new Error("Vídeos são administrados pela curadoria.");
    const v = valor as VideoEditorial;
    const antigo = atual as VideoEditorial | undefined;
    const elegivelArtigo = (id: string) => {
      const a = e.conteudos.find((a) => a.id === id);
      return Boolean(
        a &&
          !a.lixeira &&
          salaDo(a.sala) &&
          !salaDo(a.sala)?.lixeira &&
          a.status !== "arquivado" &&
          (!a.revisao || a.status === "publicado"),
      );
    };
    for (const id of v.artigos)
      if (!elegivelArtigo(id) && !antigo?.artigos.includes(id))
        throw new Error("Um artigo não está disponível para associação.");
    valor = {
      ...v,
      artigos: [
        ...new Set([
          ...v.artigos,
          ...(antigo?.artigos ?? []).filter((id) => {
            const a = e.conteudos.find((a) => a.id === id);
            return (
              !a ||
              Boolean(a.lixeira) ||
              !salaDo(a.sala) ||
              Boolean(salaDo(a.sala)?.lixeira) ||
              Boolean(a.revisao && a.status !== "publicado")
            );
          }),
        ]),
      ],
    };
  }
  return { colecao: p.colecao, valor, videos: mudados, citacao: p.citacao };
}
