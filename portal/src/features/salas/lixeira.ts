import type { RegistroAuditoria, SalaEditorial } from "@/data/types";
import type { Membro } from "@/modules/conta/conta.contratos";

export type AtorLixeira = Pick<Membro, "id" | "papel" | "pseudonimo">;
export type AcaoLixeira = "excluir" | "restaurar";
export interface PedidoLixeiraSala {
  id: string;
  ator: AtorLixeira;
  acao: AcaoLixeira;
  quando: string;
  auditoriaId: string;
}
export class ErroLixeiraSala extends Error {}

export interface PedidoExclusaoPermanenteSala {
  id: string;
  ator: AtorLixeira;
  quando: string;
  auditoriaId: string;
}

/** Mesma regra no caso de uso e dentro da transação que bloqueia a linha da Sala. */
export function planejarLixeiraSala(
  sala: SalaEditorial | undefined,
  pedido: PedidoLixeiraSala,
): {
  sala: SalaEditorial;
  registro: RegistroAuditoria;
} {
  const { ator, acao, quando } = pedido;
  if (
    !sala ||
    !(
      ator.papel === "administrador" ||
      (acao === "excluir" &&
        ator.papel === "anfitriao" &&
        sala.origem === "anfitriao" &&
        sala.revisao?.donoId === ator.id)
    )
  )
    throw new ErroLixeiraSala("Você não tem permissão para esta ação nesta Sala.");
  if (acao !== "excluir" && acao !== "restaurar") throw new ErroLixeiraSala("Ação inválida.");
  if (acao === "excluir" && sala.lixeira) throw new ErroLixeiraSala("Esta Sala já está na lixeira.");
  if (acao === "restaurar" && !sala.lixeira) throw new ErroLixeiraSala("Esta Sala não está na lixeira.");
  return {
    sala: {
      ...sala,
      lixeira: acao === "excluir" ? { em: quando, por: ator.id } : undefined,
      atualizadoEm: quando,
      atualizadoPor: ator.pseudonimo,
    },
    registro: {
      id: pedido.auditoriaId,
      quando,
      quem: ator.pseudonimo,
      acao: acao === "excluir" ? "excluiu" : "restaurou",
      tipoItem: "sala",
      itemId: sala.id,
      itemTitulo: sala.nome,
      mudancas: [
        {
          campo: "Lixeira",
          antes: acao === "excluir" ? "Fora da lixeira" : "Na lixeira",
          depois: acao === "excluir" ? "Na lixeira (conteúdos preservados)" : "Fora da lixeira",
        },
      ],
    },
  };
}

/** Mesma regra no caso de uso e dentro da transação que bloqueia a linha da Sala. */
export function planejarExclusaoPermanenteSala(
  sala: SalaEditorial | undefined,
  pedido: PedidoExclusaoPermanenteSala,
): { registro: RegistroAuditoria } {
  const { ator, quando } = pedido;
  if (!sala) throw new ErroLixeiraSala("Esta Sala não existe mais.");
  if (ator.papel !== "administrador")
    throw new ErroLixeiraSala("Somente a curadoria pode excluir uma Sala definitivamente.");
  if (!sala.lixeira)
    throw new ErroLixeiraSala("Mova a Sala para a lixeira antes de excluí-la definitivamente.");
  return {
    registro: {
      id: pedido.auditoriaId,
      quando,
      quem: ator.pseudonimo,
      acao: "excluiu-definitivamente",
      tipoItem: "sala",
      itemId: sala.id,
      itemTitulo: sala.nome,
    },
  };
}
