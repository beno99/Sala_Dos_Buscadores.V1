import type { ComentarioComunidade, EstadoComunidade, Publicacao, SeguirComunidade } from "@/data/types";
import type { Papel } from "@/features/auth/contas";

export const LIMITES_COMUNIDADE = {
  texto: 1500,
  comentario: 600,
  temas: 3,
  publicacoesPorDia: 10,
  comentariosPorDia: 60,
} as const;
export const normalizarTextoComunidade = (texto: string) =>
  texto
    .replace(/<[^>]*>/g, "")
    // biome-ignore lint/suspicious/noControlCharactersInRegex: remove controles, preservando tab e quebras de linha.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
export function validarPublicacao(
  p: Pick<Publicacao, "tipo" | "texto" | "temas" | "salaSlug" | "citacao" | "conteudoId">,
): string[] {
  const erros: string[] = [];
  const texto = normalizarTextoComunidade(p.texto);
  if (!texto || texto.length > LIMITES_COMUNIDADE.texto) erros.push("Escreva entre 1 e 1.500 caracteres.");
  if (!["reflexao", "citacao", "pergunta", "achado"].includes(p.tipo))
    erros.push("Escolha um tipo de publicação.");
  if (new Set(p.temas).size !== p.temas.length || p.temas.length > LIMITES_COMUNIDADE.temas)
    erros.push("Escolha até três temas diferentes.");
  if (
    p.tipo === "citacao" &&
    (!normalizarTextoComunidade(p.citacao?.trecho ?? "") ||
      !normalizarTextoComunidade(p.citacao?.obra ?? "") ||
      !normalizarTextoComunidade(p.citacao?.passagem ?? ""))
  )
    erros.push("Informe trecho, obra e passagem.");
  if (p.tipo === "pergunta" && !p.salaSlug?.trim()) erros.push("Escolha a Sala da pergunta.");
  if (p.tipo === "achado" && !p.conteudoId?.trim()) erros.push("Escolha um conteúdo do acervo.");
  return erros;
}
export function validarComentario(
  texto: string,
  pai?: Pick<ComentarioComunidade, "paiId" | "publicacaoId" | "estado">,
  publicacaoId?: string,
): string[] {
  const limpo = normalizarTextoComunidade(texto);
  const erros =
    !limpo || limpo.length > LIMITES_COMUNIDADE.comentario ? ["Escreva entre 1 e 600 caracteres."] : [];
  if (pai && (pai.paiId || pai.estado !== "visivel" || pai.publicacaoId !== publicacaoId))
    erros.push("Responda a um comentário visível desta publicação, sem criar outro nível.");
  return erros;
}
/** Dia em UTC, igual ao armazenamento ISO; alterações de fuso do cliente não contornam o limite. */
export function dentroDoLimiteDiario(
  tipo: "publicacao" | "comentario",
  autorId: string,
  registros: readonly { autorId: string; criadaEm: string }[],
  agora: Date,
): boolean {
  const total = registros.filter(
    (r) => r.autorId === autorId && r.criadaEm.slice(0, 10) === agora.toISOString().slice(0, 10),
  ).length;
  return (
    total <
    (tipo === "publicacao" ? LIMITES_COMUNIDADE.publicacoesPorDia : LIMITES_COMUNIDADE.comentariosPorDia)
  );
}
export const podeEditarPublicacao = (atorId: string, p: Pick<Publicacao, "autorId" | "estado">) =>
  p.autorId === atorId && p.estado === "visivel";
export const podeFixar = (papel: Papel, atorId: string, donoSala?: string) =>
  papel === "anfitriao" && atorId === donoSala;
export const podeOcultarComentario = (papel: Papel, atorId: string, donoSala?: string) =>
  papel === "administrador" || podeFixar(papel, atorId, donoSala);
export function podeTransitar(
  de: EstadoComunidade,
  para: EstadoComunidade,
  papel: Papel,
  proprio: boolean,
): boolean {
  if (de === para || de === "removida") return false;
  if (para === "removida") return proprio;
  return (
    papel === "administrador" &&
    ((de === "visivel" && para === "oculta") || (de === "oculta" && para === "visivel"))
  );
}
export function ordenarFeed(
  publicacoes: readonly Publicacao[],
  contexto: {
    pessoaId: string;
    aba: "para-voce" | "seguindo";
    seguindo: readonly SeguirComunidade[];
    salasTrilhas: readonly string[];
    anfitrioes: readonly string[];
  },
): Publicacao[] {
  const seguidos = contexto.seguindo.filter((s) => s.seguidor === contexto.pessoaId);
  const pessoas = new Set(seguidos.filter((s) => s.alvo.tipo === "pessoa").map((s) => s.alvo.id));
  const salas = new Set([
    ...seguidos.filter((s) => s.alvo.tipo === "sala").map((s) => s.alvo.id),
    ...contexto.salasTrilhas,
  ]);
  // Recência com bônus máximo de duas horas, sem curtidas: só Sala/trilha e anfitrião acompanhado.
  const prioridade = (p: Publicacao) =>
    contexto.aba === "para-voce" &&
    ((p.salaSlug && salas.has(p.salaSlug)) ||
      (pessoas.has(p.autorId) && contexto.anfitrioes.includes(p.autorId)))
      ? 2 * 3_600_000
      : 0;
  return publicacoes
    .filter((p) => p.estado === "visivel" && (contexto.aba !== "seguindo" || pessoas.has(p.autorId)))
    .sort(
      (a, b) =>
        Date.parse(b.criadaEm) + prioridade(b) - (Date.parse(a.criadaEm) + prioridade(a)) ||
        b.criadaEm.localeCompare(a.criadaEm) ||
        a.id.localeCompare(b.id),
    );
}
export function emDebate(
  publicacoes: readonly Publicacao[],
  comentarios: readonly ComentarioComunidade[],
  agora: Date,
) {
  const inicio = agora.getTime() - 7 * 86_400_000;
  const fim = agora.getTime();
  const grupos = new Map<string, { tema: string; sala: string; conversas: number; comentarios: number }>();
  for (const p of publicacoes.filter((p) => p.estado === "visivel" && p.salaSlug)) {
    const recentes = comentarios.filter(
      (c) =>
        c.publicacaoId === p.id &&
        c.estado === "visivel" &&
        Date.parse(c.criadaEm) >= inicio &&
        Date.parse(c.criadaEm) <= fim,
    );
    if (!recentes.length) continue;
    for (const tema of p.temas) {
      const chave = `${tema}/${p.salaSlug}`;
      const g = grupos.get(chave) ?? { tema, sala: p.salaSlug as string, conversas: 0, comentarios: 0 };
      g.conversas++;
      g.comentarios += recentes.length;
      grupos.set(chave, g);
    }
  }
  return [...grupos.values()]
    .sort(
      (a, b) =>
        b.comentarios - a.comentarios ||
        b.conversas - a.conversas ||
        a.tema.localeCompare(b.tema) ||
        a.sala.localeCompare(b.sala),
    )
    .slice(0, 5);
}
export function ordenarComentarios(
  comentarios: readonly ComentarioComunidade[],
  p: Pick<Publicacao, "tipo" | "respostaQueAjudouId">,
  anfitrioes: readonly string[],
) {
  const visiveis = comentarios.filter((c) => c.estado === "visivel");
  const prioridade = (c: ComentarioComunidade) =>
    (c.id === p.respostaQueAjudouId ? 2 : 0) +
    (p.tipo === "pergunta" && anfitrioes.includes(c.autorId) ? 1 : 0);
  const raizes = visiveis
    .filter((c) => !c.paiId)
    .sort(
      (a, b) =>
        prioridade(b) - prioridade(a) || a.criadaEm.localeCompare(b.criadaEm) || a.id.localeCompare(b.id),
    );
  return raizes.flatMap((c) => [
    c,
    ...visiveis.filter((r) => r.paiId === c.id).sort((a, b) => a.criadaEm.localeCompare(b.criadaEm)),
  ]);
}
