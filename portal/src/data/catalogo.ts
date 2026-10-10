import { COMPARACOES } from "./mock/comparacoes";
import { GLOSSARIO } from "./mock/glossario";
import { SALAS } from "./mock/salas";
import { TEMAS } from "./mock/temas";
import type { Comparacao, Sala, SalaSlug, Tema, TemaSlug, Verbete } from "./types";

/*
 * Catálogo de referência: Salas, temas, glossário e comparações curadas.
 * Não é editável nesta etapa, então pode ser lido também no navegador.
 * O acervo editável (conteúdos, citações, vídeos e fontes) fica no servidor:
 * ver src/data/repositorio.ts.
 *
 * TODO(admin-salas): edição de Salas e temas entra na curadoria numa próxima etapa.
 * TODO(admin-glossario): edição do glossário entra na curadoria numa próxima etapa.
 * TODO(admin-comparacoes): as comparações e as respostas do assistente ainda são
 * curadas à mão nos mocks; conteúdos novos não entram nelas automaticamente.
 */

const porSlug = new Map(SALAS.map((s) => [s.slug, s]));

export function salaPorSlug(slug: string): Sala | undefined {
  return porSlug.get(slug as SalaSlug);
}

/** Salas em ordem alfabética, sem contadores (esses dependem do que está publicado). */
export function todasAsSalas(): Sala[] {
  return SALAS;
}

export function todosOsTemas(): Tema[] {
  return TEMAS;
}

export function temaPorSlug(slug: string): Tema | undefined {
  return TEMAS.find((t) => t.slug === slug);
}

export function verbetesDaSala(sala: SalaSlug): Verbete[] {
  return GLOSSARIO.filter((v) => v.definicoes.some((d) => d.sala === sala));
}

/** Comparação do tema com as colunas na ordem fixa das Salas, nunca por "correção". */
export function comparacaoDoTema(tema: TemaSlug): Comparacao | undefined {
  const c = COMPARACOES.find((x) => x.tema === tema);
  if (!c) return undefined;
  const ordem = (slug: SalaSlug) => SALAS.findIndex((s) => s.slug === slug);
  return { ...c, respostas: [...c.respostas].sort((a, b) => ordem(a.sala) - ordem(b.sala)) };
}
