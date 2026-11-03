import "server-only";
import type { Route } from "next";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { acervoDeEstudo, acervoPublico, listarSalas, videosDeEstudo } from "@/data/repositorio";
import { avaliarConquistas, type EstadoConquista } from "@/features/estudo/conquistas";
import { chaveLeitura } from "@/features/estudo/tipos";
import {
  type ContextoJornada,
  conclusoesAtivas,
  GEMAS,
  type PercursoTema,
  type ProgressoSala,
  percursosPorTema,
  progressoNasSalas,
  proximaDescoberta,
  TITULOS,
} from "@/features/jornada/regras";
import type { Membro } from "@/modules/conta/conta.contratos";
import { progressoDe } from "./progresso";

/* Minha Jornada: só a própria conta lê (visibilidade padrão "somente você"). */

const NOMES_LEGADOS: Record<string, string> = {
  "primeiro-passo": "Primeiro passo",
  "palavra-por-palavra": "Palavra por palavra",
  "alem-da-primeira-leitura": "Além da primeira leitura",
  "entre-salas": "Entre Salas",
  "leitura-atenta": "Leitura atenta",
  "caminho-percorrido": "Caminho percorrido",
  "porta-aberta": "Porta aberta",
  "cinco-salas": "Cinco Salas",
  "lado-a-lado": "Lado a lado",
  "na-fonte": "Na fonte",
  vocabulario: "Vocabulário",
  "com-as-fontes": "Com as fontes",
  "degrau-iii": "Degrau III",
};

export interface EventoHistorico {
  em: string;
  texto: string;
  detalhe?: string;
  href?: Route;
}

export interface ModeloJornada {
  percursos: (PercursoTema & { nomeTema: string })[];
  salas: (ProgressoSala & { nome: string; href: Route })[];
  proxima: { titulo: string; sala: string; href: Route; tema?: string } | null;
  gemas: EstadoConquista[];
  historico: EventoHistorico[];
  totais: { conteudos: number; salas: number; gemas: number };
}

export async function modeloDaJornada(m: Membro): Promise<ModeloJornada> {
  const p = progressoDe(m.id);
  const ctx: ContextoJornada = { contaId: m.id, acervo: acervoDeEstudo(), videos: videosDeEstudo() };
  const publico = acervoPublico();
  const titulo = new Map(publico.conteudos.map((c) => [chaveLeitura(c.sala, c.slug), c.titulo]));
  const tituloVideo = new Map(publico.videos.map((v) => [v.id, v.titulo]));
  const salas = (await listarSalas()).map((s) => s.slug);
  const conclusoes = conclusoesAtivas(p, ctx);
  const nomeTema = (t: string) => temaPorSlug(t)?.nome ?? t;
  const nomeSala = (s: string) => salaPorSlug(s)?.nome ?? s;

  const historico: EventoHistorico[] = [
    ...conclusoes.map((c) => ({
      em: c.em,
      texto:
        c.tipo === "artigo"
          ? `Leitura concluída: ${titulo.get(c.chave) ?? c.chave}`
          : `Vídeo concluído: ${tituloVideo.get(c.chave) ?? c.chave}`,
      detalhe: `${nomeSala(c.sala)}${c.origem === "importada" ? " · registrada antes da Jornada" : ""}`,
      ...(c.tipo === "artigo" ? { href: `/salas/${c.chave}` as Route } : {}),
    })),
    ...Object.entries(p.gemas ?? {}).map(([codigo, em]) => {
      const g = GEMAS.find((x) => x.codigo === codigo.split(":")[0]);
      const tema = codigo.split(":")[1];
      return {
        em,
        texto: `Gema da Jornada: ${g?.nome ?? codigo} · ${g?.modalidade ?? ""}`.trim(),
        ...(tema ? { detalhe: nomeTema(tema) } : {}),
      };
    }),
    ...Object.entries(p.titulos ?? {}).flatMap(([tema, obtidos]) =>
      Object.entries(obtidos).map(([codigo, em]) => ({
        em,
        texto: `Título: ${TITULOS.find((t) => t.codigo === codigo)?.nome ?? codigo} em ${nomeTema(tema)}`,
      })),
    ),
    ...(p.ajustes ?? []).map((a) => ({
      em: a.em,
      texto: "Marcação desfeita",
      detalhe: a.alvo.startsWith("video:")
        ? (tituloVideo.get(a.alvo.slice(6)) ?? "vídeo")
        : (titulo.get(a.alvo) ?? a.alvo),
    })),
    ...Object.entries(p.conquistas).flatMap(([id, em]) =>
      em ? [{ em, texto: `Conquista anterior à Jornada: ${NOMES_LEGADOS[id] ?? id}` }] : [],
    ),
  ].sort((a, b) => b.em.localeCompare(a.em));

  const sugestao = proximaDescoberta(p, ctx);
  const doAcervo = sugestao
    ? publico.conteudos.find((c) => c.sala === sugestao.item.sala && c.slug === sugestao.item.slug)
    : undefined;

  return {
    percursos: percursosPorTema(p, ctx).map((t) => ({ ...t, nomeTema: nomeTema(t.tema) })),
    salas: progressoNasSalas(p, ctx, salas)
      .filter((s) => s.artigos.concluidos + s.videos.concluidos > 0 || p.salasVisitadas.includes(s.sala))
      .map((s) => ({ ...s, nome: nomeSala(s.sala), href: `/salas/${s.sala}` as Route })),
    proxima:
      sugestao && doAcervo
        ? {
            titulo: doAcervo.titulo,
            sala: nomeSala(doAcervo.sala),
            href: `/salas/${doAcervo.sala}/${doAcervo.slug}` as Route,
            ...(sugestao.tema ? { tema: nomeTema(sugestao.tema) } : {}),
          }
        : null,
    gemas: avaliarConquistas(p, ctx),
    historico,
    totais: {
      conteudos: conclusoes.length,
      salas: new Set(conclusoes.map((c) => c.sala)).size,
      gemas: Object.keys(p.gemas ?? {}).length,
    },
  };
}
