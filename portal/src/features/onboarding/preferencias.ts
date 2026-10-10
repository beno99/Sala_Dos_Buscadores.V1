import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import type { SalaSlug, TemaSlug } from "@/data/types";

/*
 * Preferências do onboarding (RF-07, RNF-LEG-02/03). Interesses e convicção
 * são opcionais e privados; a convicção é dado sensível (LGPD art. 11) e só é
 * guardada com consentimento específico. A recomendação usa os interesses
 * primeiro e a convicção só como sinal fraco; nada aqui esconde o acervo.
 */

export const OPCOES_CONVICCAO = [
  { valor: "sem-religiao", rotulo: "Não tenho religião" },
  { valor: "espiritualidade", rotulo: "Espiritualidade sem religião" },
  { valor: "nao-informar", rotulo: "Prefiro não informar" },
  { valor: "budismo", rotulo: "Budismo" },
  { valor: "candomble", rotulo: "Candomblé" },
  { valor: "catolicismo", rotulo: "Catolicismo" },
  { valor: "esoterismo", rotulo: "Esoterismo e hermetismo" },
  { valor: "espiritismo", rotulo: "Espiritismo" },
  { valor: "hinduismo", rotulo: "Hinduísmo" },
  { valor: "islamismo", rotulo: "Islamismo" },
  { valor: "judaismo", rotulo: "Judaísmo" },
  { valor: "protestantismo", rotulo: "Protestantismo e igrejas evangélicas" },
  { valor: "umbanda", rotulo: "Umbanda" },
  { valor: "outra", rotulo: "Outra" },
] as const;

export type ValorConviccao = (typeof OPCOES_CONVICCAO)[number]["valor"];
export type Conviccao = Exclude<ValorConviccao, "nao-informar">;

export const OUTRA_MAXIMO = 60;

export const FINALIDADE_CONVICCAO =
  "Usamos só para sugerir conteúdos. Fica privado, ninguém mais vê, e você pode mudar ou apagar em Ajustes.";

export type RespostaConviccao =
  | { tipo: "informada"; opcoes: Conviccao[]; outra?: string; consentidoEm: string }
  | { tipo: "nao-informar" }
  | { tipo: "pulada" };

export interface Preferencias {
  temas: TemaSlug[];
  salas: SalaSlug[];
  conviccao: RespostaConviccao;
  concluidoEm: string;
}

export interface EntradaPreferencias {
  temas: string[];
  salas: string[];
  conviccao: string[];
  outra?: string;
  consentimento: boolean;
}

export type ResultadoPreferencias = { ok: true; valor: Preferencias } | { ok: false; erro: string };

const unicos = <T>(lista: T[]) => [...new Set(lista)];

export function rotuloConviccao(valor: ValorConviccao): string {
  return OPCOES_CONVICCAO.find((o) => o.valor === valor)?.rotulo ?? valor;
}

/** Confere a entrada vinda do formulário (o servidor não confia no navegador). */
export function validarPreferencias(e: EntradaPreferencias, agora = new Date()): ResultadoPreferencias {
  const temasValidos = new Set<string>(todosOsTemas().map((t) => t.slug));
  const salasValidas = new Set<string>(todasAsSalas().map((s) => s.slug));
  const temas = unicos(Array.isArray(e.temas) ? e.temas : []);
  const salas = unicos(Array.isArray(e.salas) ? e.salas : []);
  if (temas.some((t) => !temasValidos.has(t)))
    return { ok: false, erro: "um dos temas não existe no acervo." };
  if (salas.some((s) => !salasValidas.has(s)))
    return { ok: false, erro: "uma das Salas não existe no acervo." };

  const valores = new Set<string>(OPCOES_CONVICCAO.map((o) => o.valor));
  const escolhidas = unicos(Array.isArray(e.conviccao) ? e.conviccao : []);
  if (escolhidas.some((c) => !valores.has(c)))
    return { ok: false, erro: "uma das opções de convicção não existe." };

  const base = { temas: temas as TemaSlug[], salas: salas as SalaSlug[], concluidoEm: agora.toISOString() };
  if (escolhidas.length === 0) return { ok: true, valor: { ...base, conviccao: { tipo: "pulada" } } };

  if (escolhidas.includes("nao-informar")) {
    if (escolhidas.length > 1) {
      return {
        ok: false,
        erro: "«Prefiro não informar» não combina com outras opções. Deixe só uma das escolhas.",
      };
    }
    return { ok: true, valor: { ...base, conviccao: { tipo: "nao-informar" } } };
  }

  if (!e.consentimento) {
    return {
      ok: false,
      erro: "marque a autorização para guardar esta informação, ou escolha «Prefiro não informar».",
    };
  }

  const opcoes = escolhidas as Conviccao[];
  let outra: string | undefined;
  if (opcoes.includes("outra")) {
    outra = (e.outra ?? "").trim();
    if (!outra) return { ok: false, erro: "escreva qual é a outra religião ou convicção." };
    if (outra.length > OUTRA_MAXIMO) return { ok: false, erro: `use no máximo ${OUTRA_MAXIMO} caracteres.` };
  }

  return {
    ok: true,
    valor: {
      ...base,
      conviccao: {
        tipo: "informada",
        opcoes,
        ...(outra ? { outra } : {}),
        consentidoEm: agora.toISOString(),
      },
    },
  };
}

/** Texto curto do que foi salvo, para o resumo do onboarding e para Ajustes. */
export function resumoConviccao(c: RespostaConviccao): string {
  if (c.tipo === "pulada") return "Não respondida";
  if (c.tipo === "nao-informar") return "Prefiro não informar";
  return c.opcoes.map((o) => (o === "outra" && c.outra ? c.outra : rotuloConviccao(o))).join(", ");
}
