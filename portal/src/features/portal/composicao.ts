import type { ConteudoComImagem, ModeloPortal } from "@/server/estudo";

/** Apenas compõe fontes existentes: sem pontuação, preenchimento ou recomendação nova. */
export function comporLeituras(
  modelo: Pick<ModeloPortal, "emAndamento" | "comecePorAqui" | "ampliar" | "recentes">,
) {
  const retomada = modelo.emAndamento[0];
  const inicio = retomada ? undefined : modelo.comecePorAqui[0];
  const usados = new Set<string>();
  const chave = ({ conteudo }: ConteudoComImagem) => `${conteudo.sala}/${conteudo.slug}`;
  if (retomada ?? inicio) usados.add(chave((retomada ?? inicio) as ConteudoComImagem));
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
    sugestoes: unicos([...(modelo.ampliar ? [modelo.ampliar] : []), ...modelo.comecePorAqui]),
    novidades: unicos(modelo.recentes).slice(0, 3),
  };
}

export function percentualDeLeitura(valor: number) {
  return Number.isFinite(valor) ? Math.max(0, Math.min(100, valor)) : undefined;
}
