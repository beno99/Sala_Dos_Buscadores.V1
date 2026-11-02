import "server-only";
import { randomUUID } from "node:crypto";
import { ErroLixeiraArtigo } from "@/features/artigos/lixeira";
import type { AcaoLixeira, AtorLixeira } from "@/features/salas/lixeira";
import { mudarLixeiraArtigoNoAcervo } from "../store";
export const ARTIGO_NA_LIXEIRA = "Este artigo está na lixeira. Peça ao curador para restaurá-lo.";
async function executar(id: string, acao: AcaoLixeira, ator: AtorLixeira, permanente = false) {
  try {
    await mudarLixeiraArtigoNoAcervo(
      { id, acao, ator, quando: new Date().toISOString(), auditoriaId: `a-${randomUUID()}` },
      permanente,
    );
    return {
      ok: true as const,
      valor: undefined,
      mensagem: permanente
        ? "Artigo excluído definitivamente."
        : acao === "excluir"
          ? "Artigo movido para a lixeira."
          : "Artigo restaurado com seu estado editorial anterior.",
    };
  } catch (e) {
    return {
      ok: false as const,
      mensagem: `Erro: ${e instanceof ErroLixeiraArtigo ? e.message : "Não foi possível alterar a lixeira. Atualize e tente novamente."}`,
    };
  }
}
export function mudarLixeiraArtigo(id: string, acao: AcaoLixeira, ator: AtorLixeira) {
  return executar(id, acao, ator);
}
export function excluirArtigoPermanentemente(id: string, ator: AtorLixeira) {
  return executar(id, "excluir", ator, true);
}
