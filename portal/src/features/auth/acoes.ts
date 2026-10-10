"use server";

import { cookies } from "next/headers";
import { COOKIE_SESSAO, tokenDaSessao } from "@/server/sessao";
import {
  abrirSessao,
  autenticar,
  encerrarSessao,
  type Membro,
  type Resultado,
  registrar,
  solicitarRedefinicao,
} from "./contas";
import { validarEmail, validarPseudonimo, validarSenha } from "./validacao";

/* Ações de conta (RF-01 a RF-03). A sessão vive num cookie httpOnly. */

async function gravarCookie(email: string) {
  (await cookies()).set(COOKIE_SESSAO, abrirSessao(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function entrarAcao(email: string, senha: string): Promise<Resultado<Membro>> {
  const r = autenticar(String(email), String(senha));
  if (r.ok) await gravarCookie(r.valor.email);
  return r;
}

export async function cadastrarAcao(dados: {
  pseudonimo: string;
  email: string;
  senha: string;
}): Promise<Resultado<Membro>> {
  // As regras do formulário valem também aqui: o servidor não confia no navegador.
  const erroPseudonimo = validarPseudonimo(dados.pseudonimo);
  if (erroPseudonimo) return { ok: false, campo: "pseudonimo", erro: erroPseudonimo };
  const erroEmail = validarEmail(dados.email);
  if (erroEmail) return { ok: false, campo: "email", erro: erroEmail };
  const erroSenha = validarSenha(dados.senha);
  if (erroSenha) return { ok: false, campo: "senha", erro: erroSenha };
  const r = registrar({ pseudonimo: dados.pseudonimo, email: dados.email, senha: dados.senha });
  if (r.ok) await gravarCookie(r.valor.email);
  return r;
}

export async function sairAcao(): Promise<void> {
  encerrarSessao(await tokenDaSessao());
  (await cookies()).delete(COOKIE_SESSAO);
}

export async function solicitarRedefinicaoAcao(email: string) {
  return solicitarRedefinicao(String(email));
}
