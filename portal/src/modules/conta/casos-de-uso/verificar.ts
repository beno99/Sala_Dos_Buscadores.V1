import { randomBytes } from "node:crypto";
import { VALIDADE_VERIFICACAO_H } from "../acesso";
import type { DepsConta, Membro, Resultado } from "../conta.contratos";
import { hash } from "./sessao";

export { VALIDADE_VERIFICACAO_H } from "../acesso";

export async function pedirVerificacao(
  { contas, verificacoes }: Pick<DepsConta, "contas" | "verificacoes">,
  usuarioId: string,
  agora = new Date(),
): Promise<{ membro: Membro; token: string } | null> {
  const membro = await contas.porId(usuarioId);
  if (!membro || membro.emailVerificadoEm) return null;
  const token = randomBytes(24).toString("base64url");
  const criado = await verificacoes.criar({
    tokenHash: hash(token),
    usuarioId,
    email: membro.email,
    expiraEm: new Date(agora.getTime() + VALIDADE_VERIFICACAO_H * 60 * 60_000),
  });
  return criado ? { membro, token } : null;
}

export async function confirmarEmail(
  { contas, verificacoes }: Pick<DepsConta, "contas" | "verificacoes">,
  token: string,
  agora = new Date(),
): Promise<Resultado<Membro>> {
  const usuarioId = token ? await verificacoes.consumir(hash(token), agora) : null;
  const membro = usuarioId ? await contas.porId(usuarioId) : null;
  if (!membro?.emailVerificadoEm)
    return { ok: false, erro: "este link expirou ou já foi usado. Peça um novo." };
  return { ok: true, valor: membro };
}
