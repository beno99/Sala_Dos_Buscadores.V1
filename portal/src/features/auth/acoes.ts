"use server";

import type { Membro, Resultado } from "@/modules/conta/conta.contratos";
import * as conta from "@/modules/conta/conta.controller";

/* Ações de conta (RF-01 a RF-03): a regra fica no controller do módulo de conta. */

export async function entrarAcao(email: string, senha: string): Promise<Resultado<Membro>> {
  return conta.entrar(email, senha);
}

export async function cadastrarAcao(dados: {
  pseudonimo: string;
  email: string;
  senha: string;
}): Promise<Resultado<Membro>> {
  return conta.cadastrar(dados);
}

export async function sairAcao(): Promise<void> {
  await conta.sair();
}

export async function solicitarRedefinicaoAcao(email: string) {
  return conta.solicitarRedefinicao(email);
}

export async function redefinirSenhaAcao(token: string, senha: string): Promise<Resultado<Membro>> {
  return conta.redefinirSenha(token, senha);
}

export async function confirmarEmailAcao(token: string): Promise<Resultado<Membro>> {
  return conta.confirmarEmail(token);
}

export async function reenviarVerificacaoAcao(): Promise<Resultado<true>> {
  return conta.reenviarVerificacao();
}
