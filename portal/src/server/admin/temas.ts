"use server";
import { eq } from "drizzle-orm";
import { temas } from "@/modules/acervo/acervo.schema";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { membroAtual } from "../sessao";

export async function criarTemaAcao(dados: { nome: string; sinonimos: string[] }) {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") return { ok: false as const, mensagem: "Sem permissão" };

  if (!dados.nome.trim()) return { ok: false as const, mensagem: "Nome obrigatório" };

  const slug = dados.nome.toLowerCase().replace(/\s+/g, "-");
  const agora = new Date().toISOString();

  try {
    await banco().insert(temas).values({
      slug,
      nome: dados.nome,
      sinonimos: dados.sinonimos,
      criadoEm: agora,
      criadoPor: membro.id,
    });
    return { ok: true as const, slug };
  } catch {
    return { ok: false as const, mensagem: "Erro ao criar" };
  }
}

export async function editarTemaAcao(slug: string, dados: { nome: string; sinonimos: string[] }) {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") return { ok: false as const, mensagem: "Sem permissão" };

  if (!dados.nome.trim()) return { ok: false as const, mensagem: "Nome obrigatório" };

  try {
    await banco()
      .update(temas)
      .set({
        nome: dados.nome,
        sinonimos: dados.sinonimos,
      })
      .where(eq(temas.slug, slug));
    return { ok: true as const };
  } catch {
    return { ok: false as const, mensagem: "Erro ao editar" };
  }
}

export async function apagarTemaAcao(slug: string) {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") return { ok: false as const, mensagem: "Sem permissão" };

  try {
    await banco().delete(temas).where(eq(temas.slug, slug));
    return { ok: true as const };
  } catch {
    return { ok: false as const, mensagem: "Erro ao apagar" };
  }
}
