import "server-only";
import { randomUUID } from "node:crypto";
import {
  type AcaoLixeira,
  type AtorLixeira,
  ErroLixeiraSala,
  planejarLixeiraSala,
} from "@/features/salas/lixeira";
import { acervo, mudarLixeiraSalaNoAcervo } from "../store";

export const SALA_NA_LIXEIRA =
  "Esta Sala está na lixeira. Peça ao curador para restaurá-la antes de continuar.";
export function salaNaLixeira(slug: string): boolean {
  return [...acervo().salas.values()].some((s) => s.slug === slug && Boolean(s.lixeira));
}
export async function mudarLixeiraSala(id: string, acao: AcaoLixeira, ator: AtorLixeira) {
  const pedido = { id, acao, ator, quando: new Date().toISOString(), auditoriaId: `a-${randomUUID()}` };
  try {
    planejarLixeiraSala(acervo().salas.get(id), pedido);
    await mudarLixeiraSalaNoAcervo(pedido);
    return {
      ok: true as const,
      valor: undefined,
      mensagem:
        acao === "excluir"
          ? "Sala movida para a lixeira. Os conteúdos foram preservados."
          : "Sala restaurada com seus conteúdos e endereço anteriores.",
    };
  } catch (e) {
    if (e instanceof ErroLixeiraSala) return { ok: false as const, mensagem: `Erro: ${e.message}` };
    // Não expor detalhes do banco; a transação falhou sem remover conteúdo.
    return {
      ok: false as const,
      mensagem: "Erro: não foi possível alterar a lixeira. Atualize a página e tente novamente.",
    };
  }
}
export function listarLixeiraSalas() {
  return [...acervo().salas.values()]
    .filter((s) => s.lixeira)
    .sort((a, b) => (b.lixeira?.em ?? "").localeCompare(a.lixeira?.em ?? ""))
    .map((s) => ({
      id: s.id,
      nome: s.nome,
      slug: s.slug,
      origem: s.origem,
      status: s.status,
      excluidaEm: s.lixeira?.em ?? "",
      artigos: [...acervo().conteudos.values()].filter((c) => c.sala === s.slug).length,
      videos: [...acervo().videos.values()].filter((v) => v.sala === s.slug).length,
      conversas: [...acervo().comunidade.publicacoes.values()].filter((p) => p.salaSlug === s.slug).length,
    }));
}
