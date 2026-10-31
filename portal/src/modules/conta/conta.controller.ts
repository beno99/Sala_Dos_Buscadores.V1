import "server-only";
import { cookies } from "next/headers";
import { validarEmail, validarPseudonimo, validarSenha } from "@/features/auth/validacao";
import { enviarEmail, URL_PUBLICA } from "@/server/caixa-saida";
import { aguardarGravacoes, sincronizarAcervo } from "@/server/store";
import { VALIDADE_REDEFINICAO_MIN } from "./casos-de-uso/redefinir";
import { DURACAO_SESSAO_MS } from "./casos-de-uso/sessao";
import type { Membro, Resultado } from "./conta.contratos";
import { emailVerificacao } from "./email-verificacao";
import { contas } from "./index";

async function enviarVerificacao(membro: Membro, token: string) {
  const { assunto, corpo, html } = emailVerificacao({
    pseudonimo: membro.pseudonimo,
    link: `${URL_PUBLICA}/confirmar-email?token=${token}`,
  });
  enviarEmail({ para: membro.email, assunto, corpo, html });
}

/*
 * Controller de conta (RF-01 a RF-03): valida a entrada, chama os casos de
 * uso e cuida do cookie de sessão. As Server Actions (features/auth/acoes.ts)
 * e as rotas de app/api/conta usam estas mesmas funções.
 */

export const COOKIE_SESSAO = "sdb_sessao";

export async function tokenDaSessao(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESSAO)?.value;
}

export async function gravarSessao(membro: Membro) {
  (await cookies()).set(COOKIE_SESSAO, await contas.abrirSessao(membro.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_MS / 1000,
  });
}

export async function entrar(email: unknown, senha: unknown): Promise<Resultado<Membro>> {
  const r = await contas.autenticar(String(email ?? ""), String(senha ?? ""));
  if (r.ok) await gravarSessao(r.valor);
  return r;
}

export async function cadastrar(dados: {
  pseudonimo?: unknown;
  email?: unknown;
  senha?: unknown;
}): Promise<Resultado<Membro>> {
  const pseudonimo = String(dados.pseudonimo ?? "");
  const email = String(dados.email ?? "");
  const senha = String(dados.senha ?? "");
  // As regras do formulário valem também aqui: o servidor não confia no navegador.
  const erroPseudonimo = validarPseudonimo(pseudonimo);
  if (erroPseudonimo) return { ok: false, campo: "pseudonimo", erro: erroPseudonimo };
  const erroEmail = validarEmail(email);
  if (erroEmail) return { ok: false, campo: "email", erro: erroEmail };
  const erroSenha = validarSenha(senha);
  if (erroSenha) return { ok: false, campo: "senha", erro: erroSenha };
  const r = await contas.registrar({ pseudonimo, email, senha });
  if (r.ok) {
    await gravarSessao(r.valor);
    if (process.env.SDB_EXIGIR_CONFIRMACAO_EMAIL !== "1") {
      const confirmado = await contas.marcarEmailVerificado(r.valor.id);
      await aguardarGravacoes();
      return confirmado ? { ok: true, valor: confirmado } : r;
    }
    const pedido = await contas.pedirVerificacao(r.valor.id);
    if (pedido) {
      await sincronizarAcervo();
      await enviarVerificacao(pedido.membro, pedido.token);
      await aguardarGravacoes();
    }
  }
  return r;
}

export async function sair(): Promise<void> {
  await contas.encerrarSessao(await tokenDaSessao());
  (await cookies()).delete(COOKIE_SESSAO);
}

/** Recuperação de senha (RF-03). Responde igual exista ou não a conta, para não revelar cadastros. */
export async function solicitarRedefinicao(email: unknown): Promise<Resultado<{ validadeMin: number }>> {
  const texto = String(email ?? "");
  const erroEmail = validarEmail(texto);
  if (erroEmail) return { ok: false, campo: "email", erro: erroEmail };
  const pedido = await contas.pedirRedefinicao(texto);
  if (pedido) {
    await sincronizarAcervo();
    enviarEmail({
      para: pedido.membro.email,
      assunto: "Redefinir sua senha na Sala dos Buscadores",
      corpo: [
        `Olá, ${pedido.membro.pseudonimo}. Recebemos um pedido para redefinir a senha da sua conta.`,
        `Para escolher uma nova senha, abra este link, que vale ${VALIDADE_REDEFINICAO_MIN} minutos e só pode ser usado uma vez:\n${URL_PUBLICA}/recuperar-senha?token=${pedido.token}`,
        "Se não foi você, ignore esta mensagem: sua senha continua a mesma.",
      ].join("\n\n"),
    });
    await aguardarGravacoes();
  }
  return { ok: true, valor: { validadeMin: VALIDADE_REDEFINICAO_MIN } };
}

export async function redefinirSenha(token: unknown, senha: unknown): Promise<Resultado<Membro>> {
  const nova = String(senha ?? "");
  const erroSenha = validarSenha(nova);
  if (erroSenha) return { ok: false, campo: "senha", erro: erroSenha };
  const r = await contas.redefinirSenha(String(token ?? ""), nova);
  if (r.ok) await gravarSessao(r.valor);
  return r;
}

export async function membroAtual(): Promise<Membro | null> {
  return contas.membroDaSessao(await tokenDaSessao());
}

/** Confirma o e-mail pelo token do link (RF-01); a conta já existe, só libera o acesso. */
export async function confirmarEmail(token: unknown): Promise<Resultado<Membro>> {
  return contas.confirmarEmail(String(token ?? ""));
}

/** Reenvia o link de verificação para quem já está com sessão aberta, mas ainda não confirmou. */
export async function reenviarVerificacao(): Promise<Resultado<true>> {
  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "sessão expirada. Entre novamente." };
  if (membro.emailVerificadoEm) return { ok: true, valor: true };
  const pedido = await contas.pedirVerificacao(membro.id);
  if (pedido) {
    await sincronizarAcervo();
    await enviarVerificacao(pedido.membro, pedido.token);
    await aguardarGravacoes();
  }
  return { ok: true, valor: true };
}
