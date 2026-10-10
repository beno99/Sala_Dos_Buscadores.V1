import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { type Membro, membroDaSessao } from "@/features/auth/contas";

/*
 * Camada de acesso aos dados de sessão (DAL). Toda página, Server Action e
 * Route Handler da curadoria confere o papel por aqui: o proxy só faz uma
 * checagem otimista, e Server Actions podem ser chamadas direto por POST.
 */

export const COOKIE_SESSAO = "sdb_sessao";

export async function tokenDaSessao(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESSAO)?.value;
}

export async function membroAtual(): Promise<Membro | null> {
  return membroDaSessao(await tokenDaSessao());
}

/** "sem-sessao" só aparece se o proxy for contornado: o portal exige conta. */
export type Acesso =
  | { tipo: "sem-sessao" }
  | { tipo: "membro"; membro: Membro }
  | { tipo: "admin"; membro: Membro };

export async function acessoAtual(): Promise<Acesso> {
  const membro = await membroAtual();
  if (!membro) return { tipo: "sem-sessao" };
  return membro.papel === "administrador" ? { tipo: "admin", membro } : { tipo: "membro", membro };
}

/** Para páginas: sem sessão vai para /entrar preservando a volta. */
export async function caminhoAtual(): Promise<string> {
  return (await headers()).get("x-sdb-caminho") ?? "/";
}

export async function redirecionarParaEntrar(): Promise<never> {
  redirect(`/entrar?voltar=${encodeURIComponent(await caminhoAtual())}`);
}

export class AcessoNegado extends Error {
  constructor() {
    super("Acesso restrito à curadoria.");
    this.name = "AcessoNegado";
  }
}

/** Para Server Actions e Route Handlers: sem papel de administrador, nada acontece. */
export async function exigirAdmin(): Promise<Membro> {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") throw new AcessoNegado();
  return membro;
}
