"use server";

import { revalidatePath } from "next/cache";
import { apagarConviccao, type Membro, type Resultado, salvarPreferencias } from "@/features/auth/contas";
import { membroAtual } from "@/server/sessao";
import { type EntradaPreferencias, validarPreferencias } from "./preferencias";

/* Preferências do onboarding. Só a própria conta grava; o servidor valida de novo. */

export async function salvarPreferenciasAcao(entrada: EntradaPreferencias): Promise<Resultado<Membro>> {
  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "sua sessão terminou. Entre de novo para salvar." };
  const r = validarPreferencias(entrada);
  if (!r.ok) return r;
  const salvo = salvarPreferencias(membro.email, r.valor);
  if (salvo.ok) revalidatePath("/", "layout");
  return salvo;
}

export async function apagarConviccaoAcao(): Promise<Resultado<Membro>> {
  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "sua sessão terminou. Entre de novo." };
  const r = apagarConviccao(membro.email);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}
