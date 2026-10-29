import { COMPARACOES } from "./referencia/comparacoes";
import { GLOSSARIO } from "./referencia/glossario";
import type { Comparacao, Sala, SalaSlug, Tema, TemaSlug, Verbete } from "./types";

/*
 * Catálogo de referência: Salas, temas, glossário e comparações curadas.
 * Pode ser lido no servidor e no navegador.
 *
 * As Salas vivem no banco: as oficiais, mantidas pela curadoria, e as dos
 * anfitriões. As funções de Sala
 * leem um registro em globalThis com as Salas visíveis ao público:
 * - no servidor, o store (src/server/store.ts) instala o registro e o mantém
 *   em dia, porque guarda Salas e artigos;
 * - no navegador, o `RegistroSalas` (components/layout) instala a lista que o
 *   servidor mandou no layout raiz.
 * Sem registro, não há Salas.
 * Salas que ainda não estão no ar (rascunho, em revisão) não passam por aqui:
 * a área do anfitrião e a curadoria as leem do servidor.
 *
 * TODO(admin-glossario): edição do glossário entra na curadoria numa próxima etapa.
 * TODO(admin-comparacoes): as comparações e as respostas do assistente ainda são
 * curadas à mão nos mocks; conteúdos novos não entram nelas automaticamente.
 */

const CHAVE_REGISTRO = Symbol.for("sala-dos-buscadores.registro-salas");
type ComRegistro = typeof globalThis & { [CHAVE_REGISTRO]?: () => Sala[] };

/** Instala a fonte das Salas visíveis (servidor: o store; navegador: a lista do layout). */
export function instalarRegistroSalas(fonte: () => Sala[]): void {
  (globalThis as ComRegistro)[CHAVE_REGISTRO] = fonte;
}

/** Salas visíveis ao público: oficiais primeiro, depois as de anfitriões, cada grupo em ordem alfabética. */
export function todasAsSalas(): Sala[] {
  return (globalThis as ComRegistro)[CHAVE_REGISTRO]?.() ?? [];
}

export function salaPorSlug(slug: string): Sala | undefined {
  return todasAsSalas().find((s) => s.slug === slug);
}

/** Salas mantidas pela curadoria (as únicas em que o administrador publica direto). */
export function salasOficiais(): Sala[] {
  return todasAsSalas().filter((s) => s.origem === "oficial");
}

/** Salas que entram na grade comparativa e no acervo do assistente. */
export function salasNaComparacao(): Sala[] {
  return todasAsSalas().filter((s) => s.naComparacao);
}

const CHAVE_TEMAS = Symbol.for("sala-dos-buscadores.registro-temas");
type ComTemas = typeof globalThis & { [CHAVE_TEMAS]?: () => Tema[] };

export function instalarRegistroTemas(fonte: () => Tema[]): void {
  (globalThis as ComTemas)[CHAVE_TEMAS] = fonte;
}

export function todosOsTemas(): Tema[] {
  return (globalThis as ComTemas)[CHAVE_TEMAS]?.() ?? [];
}

export function temaPorSlug(slug: string): Tema | undefined {
  return todosOsTemas().find((t) => t.slug === slug);
}

export function verbetesDaSala(sala: SalaSlug): Verbete[] {
  return GLOSSARIO.filter((v) => v.definicoes.some((d) => d.sala === sala));
}

/** Comparação do tema com as colunas na ordem fixa das Salas, nunca por "correção". */
export function comparacaoDoTema(tema: TemaSlug): Comparacao | undefined {
  const c = COMPARACOES.find((x) => x.tema === tema);
  if (!c) return undefined;
  const salas = salasNaComparacao();
  const ordem = (slug: SalaSlug) => salas.findIndex((s) => s.slug === slug);
  return {
    ...c,
    respostas: c.respostas.filter((r) => ordem(r.sala) >= 0).sort((a, b) => ordem(a.sala) - ordem(b.sala)),
  };
}
