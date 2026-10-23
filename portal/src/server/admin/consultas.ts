import "server-only";
import type {
  Citacao,
  ConteudoEditorial,
  FonteEditorial,
  Proveniencia,
  RegistroAuditoria,
  SalaSlug,
  StatusEditorial,
  VideoEditorial,
} from "@/data/types";
import { artigoParaForm, videoParaForm } from "@/features/admin/formularios";
import { checklistArtigo, checklistVideo, temPendencia } from "@/features/admin/regras/checklist";
import { DIAS_RASCUNHO_PARADO } from "@/features/admin/regras/config";
import { listarAuditoria } from "../auditoria";
import { acervo } from "../store";

/*
 * Leitura editorial (todos os status). Só as páginas e ações de /admin usam
 * este módulo, sempre depois de conferir o papel de administrador.
 */

const clone = <T>(v: T): T => structuredClone(v);

/**
 * Artigos e fontes primárias da curadoria: os tipos que ela edita nesta etapa.
 * Os artigos de anfitrião ficam de fora: a curadoria só os julga, em /admin/anfitrioes.
 */
export function listarArtigos(): ConteudoEditorial[] {
  return [...acervo().conteudos.values()]
    .filter((c) => !c.revisao && (c.tipo === "artigo" || c.tipo === "fonte-primaria"))
    .map(clone);
}

/** Artigos e fontes primárias de todas as Salas, inclusive de anfitriões (exportação CSV). */
export function listarTodosOsArtigos(): ConteudoEditorial[] {
  return [...acervo().conteudos.values()]
    .filter((c) => c.tipo === "artigo" || c.tipo === "fonte-primaria")
    .map(clone);
}

export function obterArtigo(id: string): { artigo: ConteudoEditorial; citacao?: Citacao } | undefined {
  const artigo = acervo().conteudos.get(id);
  if (!artigo) return undefined;
  const citacao = artigo.citacao ? acervo().citacoes.get(artigo.citacao) : undefined;
  return { artigo: clone(artigo), citacao: citacao ? clone(citacao) : undefined };
}

export function listarVideos(): VideoEditorial[] {
  return [...acervo().videos.values()].map(clone);
}

export function obterVideo(id: string): VideoEditorial | undefined {
  const v = acervo().videos.get(id);
  return v ? clone(v) : undefined;
}

/** Catálogo de fontes: as propostas por anfitriões só entram quando o artigo que as usa é aprovado. */
export function listarFontes(): FonteEditorial[] {
  return [...acervo().fontes.values()].filter((f) => !f.proposta?.pendente).map(clone);
}

export function obterFonte(id: string): FonteEditorial | undefined {
  const f = acervo().fontes.get(id);
  return f ? clone(f) : undefined;
}

export interface UsoDaFonte {
  id: string;
  titulo: string;
  sala: SalaSlug;
  status: StatusEditorial;
}

/** Conteúdos que citam a fonte, de qualquer status. */
export function usosDaFonte(id: string): UsoDaFonte[] {
  return [...acervo().conteudos.values()]
    .filter((c) => c.fontes.includes(id))
    .map((c) => ({ id: c.id, titulo: c.titulo, sala: c.sala, status: c.status }));
}

export function pendenciasDoArtigo(a: ConteudoEditorial) {
  const citacao = a.citacao ? acervo().citacoes.get(a.citacao) : undefined;
  return checklistArtigo(artigoParaForm(a, citacao)).filter((i) => i.estado === "pendente");
}

export function historicoDoItem(id: string): RegistroAuditoria[] {
  return listarAuditoria({ itemId: id });
}

export function historicoGeral(): RegistroAuditoria[] {
  return listarAuditoria();
}

// ---------- painel (RF-37) ----------

export interface ResumoPainel {
  totais: {
    artigos: Record<StatusEditorial, number>;
    videos: Record<StatusEditorial, number>;
    fontes: number;
  };
  porSala: { sala: SalaSlug; nome: string; artigos: Record<StatusEditorial, number>; videos: number }[];
  porProveniencia: Record<Proveniencia, number>;
  comPendencia: { id: string; tipo: "artigo" | "video"; titulo: string; pendencias: string[] }[];
  rascunhosParados: { id: string; tipo: "artigo" | "video"; titulo: string; dias: number }[];
  ultimasAcoes: RegistroAuditoria[];
}

const zerado = (): Record<StatusEditorial, number> => ({
  rascunho: 0,
  em_revisao: 0,
  publicado: 0,
  reprovado: 0,
  arquivado: 0,
});

export function resumoPainel(agora = new Date()): ResumoPainel {
  const artigos = listarArtigos();
  const videos = listarVideos();
  const totais = { artigos: zerado(), videos: zerado(), fontes: listarFontes().length };
  for (const a of artigos) totais.artigos[a.status] += 1;
  for (const v of videos) totais.videos[v.status] += 1;

  // Todas as Salas oficiais, inclusive as que ainda não estão no portal (rascunho, sem artigo).
  const oficiais = [...acervo().salas.values()]
    .filter((s) => s.origem === "oficial")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const porSala = oficiais.map((s) => {
    const daSala = artigos.filter((a) => a.sala === s.slug);
    const contagem = zerado();
    for (const a of daSala) contagem[a.status] += 1;
    return {
      sala: s.slug,
      nome: s.nome,
      artigos: contagem,
      videos: videos.filter((v) => v.sala === s.slug && v.status !== "arquivado").length,
    };
  });

  const porProveniencia: Record<Proveniencia, number> = {
    primaria: 0,
    curado: 0,
    especialista: 0,
    comunidade: 0,
    ia: 0,
    anfitriao: 0,
  };
  for (const a of artigos) if (a.status !== "arquivado") porProveniencia[a.proveniencia] += 1;

  const comPendencia = [
    ...artigos
      .filter((a) => a.status !== "arquivado")
      .map((a) => ({
        id: a.id,
        tipo: "artigo" as const,
        titulo: a.titulo,
        pendencias: pendenciasDoArtigo(a).map((p) => p.rotulo),
      })),
    ...videos
      .filter((v) => v.status !== "arquivado")
      .map((v) => ({
        id: v.id,
        tipo: "video" as const,
        titulo: v.titulo,
        pendencias: checklistVideo(videoParaForm(v))
          .filter((i) => i.estado === "pendente")
          .map((i) => i.rotulo),
      })),
  ].filter((i) => i.pendencias.length > 0);

  const dias = (iso: string) => Math.floor((agora.getTime() - new Date(iso).getTime()) / 86_400_000);
  const rascunhosParados = [
    ...artigos
      .filter((a) => a.status === "rascunho")
      .map((a) => ({ id: a.id, tipo: "artigo" as const, titulo: a.titulo, dias: dias(a.atualizadoEm) })),
    ...videos
      .filter((v) => v.status === "rascunho")
      .map((v) => ({ id: v.id, tipo: "video" as const, titulo: v.titulo, dias: dias(v.atualizadoEm) })),
  ]
    .filter((r) => r.dias > DIAS_RASCUNHO_PARADO)
    .sort((a, b) => b.dias - a.dias);

  return {
    totais,
    porSala,
    porProveniencia,
    comPendencia,
    rascunhosParados,
    ultimasAcoes: historicoGeral().slice(0, 8),
  };
}

export { temPendencia };
