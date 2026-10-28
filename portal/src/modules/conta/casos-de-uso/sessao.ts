import { createHash, randomBytes } from "node:crypto";
import type { DepsConta, Membro } from "../conta.contratos";

/** Validade da sessão. */
export const DURACAO_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;

export const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/** Devolve o token do cookie; o banco guarda só o hash dele. */
export async function abrirSessao(
  { sessoes }: Pick<DepsConta, "sessoes">,
  usuarioId: string,
  agora = new Date(),
) {
  const token = randomBytes(24).toString("base64url");
  await sessoes.criar({
    tokenHash: hash(token),
    usuarioId,
    expiraEm: new Date(agora.getTime() + DURACAO_SESSAO_MS),
  });
  return token;
}

export async function membroDaSessao(
  { sessoes }: Pick<DepsConta, "sessoes">,
  token: string | undefined,
  agora = new Date(),
): Promise<Membro | null> {
  return token ? sessoes.membro(hash(token), agora) : null;
}

export async function encerrarSessao({ sessoes }: Pick<DepsConta, "sessoes">, token: string | undefined) {
  if (token) await sessoes.apagar(hash(token));
}
