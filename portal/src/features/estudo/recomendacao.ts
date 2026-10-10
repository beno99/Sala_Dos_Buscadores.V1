import type { SalaSlug, TemaSlug } from "@/data/types";
import type { RespostaConviccao } from "@/features/onboarding/preferencias";
import type { ItemAcervo, Leitura } from "./tipos";

/*
 * Recomendação do Portal. Usa primeiro os interesses declarados; a religião
 * ou convicção entra só como desempate fraco e nunca esconde nada do acervo.
 * Sempre há pelo menos uma Sala e um conteúdo "Para ampliar o olhar", fora
 * do perfil declarado, para evitar bolha de conteúdo.
 */

export type MotivoSala = "andamento" | "interesse" | "ampliar" | "outra";

interface Interesses {
  temas: TemaSlug[];
  salas: SalaSlug[];
}

interface Contexto {
  acervo: ItemAcervo[];
  leituras: Leitura[];
  interesses: Interesses;
  conviccao: RespostaConviccao;
}

/** Afinidade fraca, só para desempatar dentro do mesmo grupo. */
const AFINIDADE: Partial<Record<string, SalaSlug[]>> = {
  esoterismo: ["corpus-hermeticum", "caibalion"],
  catolicismo: ["apocrifos-cristianismo-primitivo", "nag-hammadi"],
  protestantismo: ["apocrifos-cristianismo-primitivo", "nag-hammadi"],
  espiritismo: ["urantia"],
  espiritualidade: ["urantia", "caibalion"],
};

function afinidade(sala: SalaSlug, c: RespostaConviccao): number {
  if (c.tipo !== "informada") return 0;
  return c.opcoes.some((o) => AFINIDADE[o]?.includes(sala)) ? 1 : 0;
}

export function noPerfil(sala: SalaSlug, acervo: ItemAcervo[], i: Interesses): boolean {
  return (
    i.salas.includes(sala) || acervo.some((c) => c.sala === sala && c.temas.some((t) => i.temas.includes(t)))
  );
}

const lidasNaSala = (sala: SalaSlug, leituras: Leitura[]) =>
  leituras.filter((l) => l.sala === sala && l.concluidaEm).length;

function emAndamento(sala: SalaSlug, ctx: Contexto): boolean {
  const total = ctx.acervo.filter((c) => c.sala === sala).length;
  const tocadas = ctx.leituras.filter((l) => l.sala === sala);
  return tocadas.length > 0 && lidasNaSala(sala, ctx.leituras) < total;
}

const ultimaLeitura = (sala: SalaSlug, leituras: Leitura[]) =>
  leituras.filter((l) => l.sala === sala).reduce((m, l) => (l.atualizadaEm > m ? l.atualizadaEm : m), "");

export function ordenarSalas(salas: SalaSlug[], ctx: Contexto): { sala: SalaSlug; motivo: MotivoSala }[] {
  const fora = salas.filter((s) => !noPerfil(s, ctx.acervo, ctx.interesses));
  const candidatas = fora.length > 0 ? fora : salas;
  // Para ampliar: fora do perfil, de preferência ainda não lida; depois a menos lida.
  const ampliar = [...candidatas].sort(
    (a, b) =>
      lidasNaSala(a, ctx.leituras) - lidasNaSala(b, ctx.leituras) ||
      Number(emAndamento(a, ctx)) - Number(emAndamento(b, ctx)) ||
      a.localeCompare(b),
  )[0];

  const resto = salas.filter((s) => s !== ampliar);
  const andamento = resto
    .filter((s) => emAndamento(s, ctx))
    .sort((a, b) => ultimaLeitura(b, ctx.leituras).localeCompare(ultimaLeitura(a, ctx.leituras)));
  const interesse = resto
    .filter((s) => !andamento.includes(s) && noPerfil(s, ctx.acervo, ctx.interesses))
    .sort(
      (a, b) =>
        Number(ctx.interesses.salas.includes(b)) - Number(ctx.interesses.salas.includes(a)) ||
        afinidade(b, ctx.conviccao) - afinidade(a, ctx.conviccao) ||
        a.localeCompare(b),
    );
  const outras = resto
    .filter((s) => !andamento.includes(s) && !interesse.includes(s))
    .sort((a, b) => afinidade(b, ctx.conviccao) - afinidade(a, ctx.conviccao) || a.localeCompare(b));

  return [
    ...andamento.map((sala) => ({ sala, motivo: "andamento" as const })),
    ...interesse.map((sala) => ({ sala, motivo: "interesse" as const })),
    ...(ampliar ? [{ sala: ampliar, motivo: "ampliar" as const }] : []),
    ...outras.map((sala) => ({ sala, motivo: "outra" as const })),
  ];
}

const foiLido = (c: ItemAcervo, leituras: Leitura[]) =>
  leituras.some((l) => l.sala === c.sala && l.slug === c.slug);

/**
 * Para ampliar o olhar: de uma Sala fora do perfil declarado, de preferência
 * sobre um tema que a pessoa já leu; sem isso, de uma Sala ainda não lida.
 */
export function conteudoParaAmpliar(
  acervo: ItemAcervo[],
  leituras: Leitura[],
  interesses: Interesses,
  /** O que já está na tela ("Continue", "Comece por aqui"): não repete. */
  evitar: ItemAcervo[] = [],
): ItemAcervo | undefined {
  const naTela = (c: ItemAcervo) => evitar.some((e) => e.sala === c.sala && e.slug === c.slug);
  const temasLidos = new Set(
    acervo
      .filter((c) => leituras.some((l) => l.concluidaEm && l.sala === c.sala && l.slug === c.slug))
      .flatMap((c) => c.temas),
  );
  const salasLidas = new Set(leituras.map((l) => l.sala));
  const naoLidos = acervo.filter((c) => !foiLido(c, leituras) && !naTela(c));
  const fora = naoLidos.filter((c) => !noPerfil(c.sala, acervo, interesses));
  return (
    fora.find((c) => !salasLidas.has(c.sala) && c.temas.some((t) => temasLidos.has(t))) ??
    fora.find((c) => c.temas.some((t) => temasLidos.has(t))) ??
    fora.find((c) => !salasLidas.has(c.sala)) ??
    naoLidos[0]
  );
}

/** Para conta nova: 3 conteúdos de nível iniciante, de Salas diferentes; interesses primeiro. */
export function comecePorAqui(acervo: ItemAcervo[], interesses: Interesses): ItemAcervo[] {
  const iniciantes = acervo
    .filter((c) => c.nivel === 1)
    .sort(
      (a, b) =>
        Number(noPerfil(b.sala, [b], interesses)) - Number(noPerfil(a.sala, [a], interesses)) ||
        a.sala.localeCompare(b.sala),
    );
  const escolhidos: ItemAcervo[] = [];
  for (const c of iniciantes) {
    if (escolhidos.length === 3) break;
    if (!escolhidos.some((e) => e.sala === c.sala)) escolhidos.push(c);
  }
  return escolhidos;
}
