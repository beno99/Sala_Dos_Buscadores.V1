"use server";
import { revalidatePath } from "next/cache";
import { membroAtual } from "../sessao";
import { mudarLixeiraSala } from "./lixeira";

export async function excluirSalaAcao(id: string) {
  const membro = await membroAtual();
  if (!membro || !["administrador", "anfitriao"].includes(membro.papel))
    return { ok: false as const, mensagem: "Erro: você não tem permissão para excluir Salas." };
  const r = await mudarLixeiraSala(String(id), "excluir", membro);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}
export async function restaurarSalaDaLixeiraAcao(id: string) {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador")
    return { ok: false as const, mensagem: "Erro: somente a curadoria pode restaurar Salas." };
  const r = await mudarLixeiraSala(String(id), "restaurar", membro);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}
