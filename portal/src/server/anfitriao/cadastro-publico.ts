"use server";

import { revalidatePath } from "next/cache";
import { type FormCandidatura, validarCandidatura } from "@/features/anfitriao/regras/perfil";
import * as conta from "@/modules/conta/conta.controller";
import { comGravacoesDoPedido, sincronizarAcervo } from "../store";
import * as usuarios from "./usuarios";

export async function cadastrarComoAnfitriaoAcao(
  dados: { pseudonimo: string; email: string; senha: string },
  candidatura: FormCandidatura,
) {
  const form: FormCandidatura = {
    nome: String(candidatura.nome ?? ""),
    credencial: String(candidatura.credencial ?? ""),
    apresentacao: String(candidatura.apresentacao ?? ""),
    link: String(candidatura.link ?? ""),
  };
  const erros = validarCandidatura(form);
  if (Object.keys(erros).length) {
    return { ok: false as const, mensagem: "Erro: confira os campos indicados.", erros };
  }
  const r = await conta.cadastrar(dados);
  if (!r.ok) {
    return {
      ok: false as const,
      mensagem: `Erro: ${r.erro}`,
      erros: r.campo ? { [`campo-${r.campo}`]: r.erro } : undefined,
    };
  }
  await sincronizarAcervo();
  const c = await comGravacoesDoPedido(() => usuarios.candidatar(form, r.valor));
  revalidatePath("/", "layout");
  if (!c.ok) return { ok: false as const, mensagem: c.mensagem, contaCriada: true };
  return {
    ok: true as const,
    mensagem: "Conta criada e candidatura enviada. Confirme seu e-mail; a curadoria responde por e-mail.",
  };
}
