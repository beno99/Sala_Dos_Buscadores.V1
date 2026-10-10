/*
 * Vagas da página Destaques (escolha editorial). Regras puras: a curadoria
 * escolhe itens para vagas ordenadas; o que não cabe no grupo, saiu do
 * publicado ou repete outra vaga sai; vaga vazia é preenchida pelo publicado
 * mais recente que ainda não está na página, para a tela nunca ter buracos.
 */

export type GrupoVaga = "video" | "cards" | "artigos";

export const GRUPOS_VAGA: GrupoVaga[] = ["video", "cards", "artigos"];

export const TAMANHO_GRUPO: Record<GrupoVaga, number> = { video: 1, cards: 4, artigos: 5 };

/** Escolha da curadoria: um id (ou null, vaga automática) por vaga. */
export type EscolhaDestaques = Record<GrupoVaga, (string | null)[]>;

export const VAGAS_VAZIAS: EscolhaDestaques = {
  video: [null],
  cards: [null, null, null, null],
  artigos: [null, null, null, null, null],
};

/** Item publicado que pode ocupar vagas dos grupos indicados. */
export interface Candidato {
  id: string;
  titulo: string;
  publicadoEm: string;
  grupos: GrupoVaga[];
}

export interface Vaga {
  id: string | null;
  automatica: boolean;
}

export type VagasMontadas = Record<GrupoVaga, Vaga[]>;

const ajustar = (lista: (string | null)[] | undefined, n: number) =>
  Array.from({ length: n }, (_, i) => lista?.[i] ?? null);

/** Tira da escolha o que não está publicado, não cabe no grupo ou repete uma vaga anterior. */
export function podarEscolha(escolha: EscolhaDestaques, candidatos: Candidato[]): EscolhaDestaques {
  const porId = new Map(candidatos.map((c) => [c.id, c]));
  const usados = new Set<string>();
  const podada = { ...VAGAS_VAZIAS };
  for (const grupo of GRUPOS_VAGA) {
    podada[grupo] = ajustar(escolha[grupo], TAMANHO_GRUPO[grupo]).map((id) => {
      if (!id || usados.has(id) || !porId.get(id)?.grupos.includes(grupo)) return null;
      usados.add(id);
      return id;
    });
  }
  return podada;
}

const maisRecentePrimeiro = (a: Candidato, b: Candidato) =>
  b.publicadoEm.localeCompare(a.publicadoEm) || a.titulo.localeCompare(b.titulo, "pt-BR");

export function montarVagas(escolha: EscolhaDestaques, candidatos: Candidato[]): VagasMontadas {
  const podada = podarEscolha(escolha, candidatos);
  const naPagina = new Set(GRUPOS_VAGA.flatMap((g) => podada[g]).filter((id): id is string => !!id));
  const ordenados = [...candidatos].sort(maisRecentePrimeiro);
  const montadas = {} as VagasMontadas;
  for (const grupo of GRUPOS_VAGA) {
    montadas[grupo] = podada[grupo].map((id) => {
      if (id) return { id, automatica: false };
      const proximo = ordenados.find((c) => c.grupos.includes(grupo) && !naPagina.has(c.id));
      if (proximo) naPagina.add(proximo.id);
      return { id: proximo?.id ?? null, automatica: true };
    });
  }
  return montadas;
}
