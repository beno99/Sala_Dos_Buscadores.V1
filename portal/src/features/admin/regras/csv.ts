import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { NIVEL_ROTULO, PROVENIENCIA_ROTULO, TIPO_ROTULO } from "@/data/rotulos";
import type {
  ConteudoEditorial,
  FonteEditorial,
  SituacaoJuridica,
  StatusEditorial,
  VideoEditorial,
} from "@/data/types";

/*
 * Exportação CSV (RF-38): UTF-8 com BOM (o Excel abre os acentos certo),
 * separador ";" (padrão do Excel em português) e cabeçalhos em português.
 * Não exporta dados pessoais de membros nem de contas da curadoria
 * (RNF-LEG-01/02): só metadados do acervo e a autoria editorial pública.
 */

export const BOM = "﻿";
const SEPARADOR = ";";

export interface Coluna<T> {
  cabecalho: string;
  valor: (item: T) => string | number;
}

export function celula(v: string | number): string {
  const texto = String(v);
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCsv<T>(colunas: Coluna<T>[], itens: T[]): string {
  const linhas = [
    colunas.map((c) => celula(c.cabecalho)).join(SEPARADOR),
    ...itens.map((i) => colunas.map((c) => celula(c.valor(i))).join(SEPARADOR)),
  ];
  return `${BOM}${linhas.join("\r\n")}\r\n`;
}

export const STATUS_ROTULO: Record<StatusEditorial, string> = {
  rascunho: "Rascunho",
  em_revisao: "Em revisão",
  publicado: "Publicado",
  reprovado: "Reprovado",
  arquivado: "Arquivado",
};

export function rotuloSituacao(s: SituacaoJuridica | null): string {
  if (!s) return "Não declarada";
  switch (s.tipo) {
    case "dominio-publico":
      return "Domínio público";
    case "licenca":
      return `Licença compatível: ${s.licenca}`;
    case "cessao":
      return `Cessão do autor: ${s.registro}`;
    case "trecho-permitido":
      return "Trecho permitido com referência";
  }
}

const data = (iso: string) => (iso ? iso.slice(0, 10) : "");

export const COLUNAS_ARTIGOS: Coluna<ConteudoEditorial>[] = [
  { cabecalho: "Título", valor: (c) => c.titulo },
  { cabecalho: "Sala", valor: (c) => salaPorSlug(c.sala)?.nome ?? c.sala },
  { cabecalho: "Tipo", valor: (c) => TIPO_ROTULO[c.tipo] },
  { cabecalho: "Status", valor: (c) => STATUS_ROTULO[c.status] },
  { cabecalho: "Endereço", valor: (c) => `/salas/${c.sala}/${c.slug}` },
  { cabecalho: "Temas", valor: (c) => c.temas.map((t) => temaPorSlug(t)?.nome ?? t).join(", ") },
  { cabecalho: "Nível", valor: (c) => NIVEL_ROTULO[c.nivel] },
  { cabecalho: "Período", valor: (c) => c.periodo },
  { cabecalho: "Proveniência", valor: (c) => PROVENIENCIA_ROTULO[c.proveniencia] },
  { cabecalho: "Autoria", valor: (c) => c.autoria.nome },
  { cabecalho: "Credencial", valor: (c) => c.autoria.credencial },
  { cabecalho: "Situação jurídica", valor: (c) => rotuloSituacao(c.situacaoJuridica) },
  { cabecalho: "Tema divergente", valor: (c) => (c.temaDivergente ? "Sim" : "Não") },
  { cabecalho: "Fontes", valor: (c) => c.fontes.length },
  { cabecalho: "Publicado em", valor: (c) => data(c.publicadoEm) },
  { cabecalho: "Atualizado em", valor: (c) => data(c.atualizadoEm) },
];

export const COLUNAS_VIDEOS: Coluna<VideoEditorial>[] = [
  { cabecalho: "Título", valor: (v) => v.titulo },
  { cabecalho: "Sala", valor: (v) => salaPorSlug(v.sala)?.nome ?? v.sala },
  { cabecalho: "Status", valor: (v) => STATUS_ROTULO[v.status] },
  { cabecalho: "URL", valor: (v) => v.url },
  { cabecalho: "ID do YouTube", valor: (v) => v.youtubeId },
  { cabecalho: "Duração", valor: (v) => v.duracao },
  { cabecalho: "Tema", valor: (v) => temaPorSlug(v.tema)?.nome ?? v.tema },
  { cabecalho: "Nível", valor: (v) => NIVEL_ROTULO[v.nivel] },
  { cabecalho: "Episódio", valor: (v) => v.episodio },
  { cabecalho: "Publicado no canal em", valor: (v) => data(v.publicadoEm) },
  { cabecalho: "Artigos ligados", valor: (v) => v.artigos.length },
  { cabecalho: "Atualizado em", valor: (v) => data(v.atualizadoEm) },
];

export const COLUNAS_FONTES: Coluna<FonteEditorial & { usos: number }>[] = [
  { cabecalho: "Título", valor: (f) => f.titulo },
  { cabecalho: "Autor", valor: (f) => f.autor },
  { cabecalho: "Tradição", valor: (f) => f.tradicao },
  { cabecalho: "Tipo", valor: (f) => f.tipo },
  { cabecalho: "Referência", valor: (f) => f.referencia },
  { cabecalho: "URL", valor: (f) => f.url ?? "" },
  { cabecalho: "Conteúdos que citam", valor: (f) => f.usos },
  { cabecalho: "Atualizado em", valor: (f) => data(f.atualizadoEm) },
];
