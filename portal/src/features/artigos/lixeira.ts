import type { ConteudoEditorial, RegistroAuditoria } from "@/data/types";
import type { AcaoLixeira, AtorLixeira } from "@/features/salas/lixeira";
export interface PedidoLixeiraArtigo {
  id: string;
  ator: AtorLixeira;
  acao: AcaoLixeira;
  quando: string;
  auditoriaId: string;
}
export class ErroLixeiraArtigo extends Error {}
export function planejarLixeiraArtigo(
  artigo: ConteudoEditorial | undefined,
  pedido: PedidoLixeiraArtigo,
): { artigo: ConteudoEditorial; registro: RegistroAuditoria } {
  const { ator, acao, quando } = pedido;
  if (
    !artigo ||
    !(
      ator.papel === "administrador" ||
      (acao === "excluir" && ator.papel === "anfitriao" && artigo.revisao?.donoId === ator.id)
    )
  )
    throw new ErroLixeiraArtigo("Você não tem permissão para esta ação neste artigo.");
  if (acao !== "excluir" && acao !== "restaurar") throw new ErroLixeiraArtigo("Ação inválida.");
  if (Boolean(artigo.lixeira) === (acao === "excluir"))
    throw new ErroLixeiraArtigo(
      acao === "excluir" ? "Este artigo já está na lixeira." : "Este artigo não está na lixeira.",
    );
  return {
    artigo: {
      ...artigo,
      lixeira: acao === "excluir" ? { em: quando, por: ator.id } : undefined,
      atualizadoEm: quando,
      atualizadoPor: ator.pseudonimo,
    },
    registro: {
      id: pedido.auditoriaId,
      quando,
      quem: ator.pseudonimo,
      atorId: ator.id,
      acao: acao === "excluir" ? "excluiu" : "restaurou",
      tipoItem: "artigo",
      itemId: artigo.id,
      itemTitulo: artigo.titulo,
    },
  };
}
