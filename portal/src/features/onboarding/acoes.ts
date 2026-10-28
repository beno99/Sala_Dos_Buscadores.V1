"use server";

import { revalidatePath } from "next/cache";
import { contas } from "@/modules/conta";
import type { Membro, Resultado } from "@/modules/conta/conta.contratos";
import { membroAtual } from "@/server/sessao";
import { type EntradaPreferencias, validarPreferencias } from "./preferencias";

/* Preferências do onboarding. Só a própria conta grava; o servidor valida de novo. */

export async function salvarPreferenciasAcao(entrada: EntradaPreferencias): Promise<Resultado<Membro>> {
  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "sua sessão terminou. Entre de novo para salvar." };
  const r = validarPreferencias(entrada);
  if (!r.ok) return r;
  const salvo = await contas.salvarPreferencias(membro.id, r.valor);
  if (salvo.ok) revalidatePath("/", "layout");
  return salvo;
}

export async function apagarConviccaoAcao(): Promise<Resultado<Membro>> {
  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "sua sessão terminou. Entre de novo." };
  const r = await contas.apagarConviccao(membro.id);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}
