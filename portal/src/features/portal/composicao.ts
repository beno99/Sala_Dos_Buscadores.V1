import type { ConteudoComImagem, ModeloPortal } from "@/server/estudo";

/** Apenas compõe fontes existentes: sem pontuação, preenchimento ou recomendação nova. */
export function comporLeituras(
  modelo: Pick<ModeloPortal, "emAndamento" | "comecePorAqui" | "ultimaLida" | "ampliar" | "recentes">,
) {
  const retomada = modelo.emAndamento[0];
  const inicio = retomada ? undefined : modelo.comecePorAqui[0];
  // Nada em andamento, mas já leu algo: mostra a última leitura concluída em vez do
  // estado de "nunca leu nada".
  const revisao = retomada || inicio ? undefined : modelo.ultimaLida;
  const usados = new Set<string>();
  const chave = ({ conteudo }: ConteudoComImagem) => `${conteudo.sala}/${conteudo.slug}`;
  const destacado = retomada ?? inicio ?? revisao;
  if (destacado) usados.add(chave(destacado));
  const unicos = (itens: ConteudoComImagem[]) =>
    itens.filter((item) => {
      const id = chave(item);
      if (usados.has(id)) return false;
      usados.add(id);
      return true;
    });
  return {
    retomada,
    inicio,
    revisao,
    sugestoes: unicos([...(modelo.ampliar ? [modelo.ampliar] : []), ...modelo.comecePorAqui]),
    novidades: unicos(modelo.recentes).slice(0, 3),
  };
}

export function percentualDeLeitura(valor: number) {
  return Number.isFinite(valor) ? Math.max(0, Math.min(100, valor)) : undefined;
}

export interface PreviaComunidade {
  id: string;
  texto: string;
  criadaEm: string;
  autorNome: string;
  autorHref: string;
}

/** Recebe somente publicações já autorizadas; não transporta comentários, mídia ou dados da conta. */
export function projetarPreviaComunidade(
  publicacoes: readonly {
    id: string;
    texto: string;
    criadaEm: string;
    autor: { nome: string; href: string };
  }[],
): PreviaComunidade[] {
  return [...new Map(publicacoes.map((p) => [p.id, p])).values()]
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      texto: p.texto.length > 240 ? `${p.texto.slice(0, 237)}…` : p.texto,
      criadaEm: p.criadaEm,
      autorNome: p.autor.nome,
      autorHref: p.autor.href,
    }));
}
