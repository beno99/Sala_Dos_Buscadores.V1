import "server-only";
import type { AlvoComunidade, DenunciaComunidade } from "@/data/types";
import { MOTIVOS_DENUNCIA } from "@/features/comunidade/regras";
import { acervo, contaNoDiretorio } from "../store";

/* Leitura da fila de moderação. Só /admin/comunidade usa, depois de conferir o papel. */

const nomeDe = (id: string) => contaNoDiretorio(id)?.pseudonimo ?? "Conta removida";

function itemDe(alvo: AlvoComunidade) {
  const { publicacoes, comentarios } = acervo().comunidade;
  const item = alvo.tipo === "publicacao" ? publicacoes.get(alvo.id) : comentarios.get(alvo.id);
  if (!item) return undefined;
  const publicacaoId = "publicacaoId" in item ? item.publicacaoId : item.id;
  return {
    alvo,
    rotulo: alvo.tipo === "publicacao" ? "Publicação" : "Comentário",
    texto: item.texto,
    autor: nomeDe(item.autorId),
    href: `/comunidade/p/${publicacaoId}`,
    estado: item.estado,
  };
}

function denunciaParaFila(d: DenunciaComunidade) {
  const item = itemDe(d.alvo);
  return item
    ? [
        {
          ...item,
          id: d.id,
          motivo: MOTIVOS_DENUNCIA[d.motivo],
          nota: d.nota,
          denunciante: nomeDe(d.denuncianteId),
          criadaEm: d.criadaEm,
        },
      ]
    : [];
}

export const totalDenunciasPendentes = () =>
  [...acervo().comunidade.denuncias.values()].filter((d) => d.estado === "pendente").length;

export function filaDeModeracao() {
  const { publicacoes, comentarios, denuncias } = acervo().comunidade;
  return {
    pendentes: [...denuncias.values()]
      .filter((d) => d.estado === "pendente")
      .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
      .flatMap(denunciaParaFila),
    ocultos: [
      ...[...publicacoes.values()]
        .filter((p) => p.estado === "oculta")
        .flatMap((p) => itemDe({ tipo: "publicacao", id: p.id }) ?? []),
      ...[...comentarios.values()]
        .filter((c) => c.estado === "oculta")
        .flatMap((c) => itemDe({ tipo: "comentario", id: c.id }) ?? []),
    ],
  };
}
export type FilaDeModeracao = ReturnType<typeof filaDeModeracao>;
