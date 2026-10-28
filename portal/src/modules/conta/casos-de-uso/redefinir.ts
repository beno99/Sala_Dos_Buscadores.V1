import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { DepsConta, Membro, Resultado } from "../conta.contratos";
import { CUSTO_BCRYPT } from "./registrar";
import { hash } from "./sessao";

export const VALIDADE_REDEFINICAO_MIN = 30;

export async function pedirRedefinicao(
  { contas, redefinicoes }: Pick<DepsConta, "contas" | "redefinicoes">,
  email: string,
  agora = new Date(),
): Promise<{ membro: Membro; token: string } | null> {
  const membro = await contas.porEmail(email);
  if (!membro) return null;
  const token = randomBytes(24).toString("base64url");
  await redefinicoes.criar({
    tokenHash: hash(token),
    usuarioId: membro.id,
    expiraEm: new Date(agora.getTime() + VALIDADE_REDEFINICAO_MIN * 60_000),
  });
  return { membro, token };
}

export async function linkDeRedefinicaoValido(
  { redefinicoes }: Pick<DepsConta, "redefinicoes">,
  token: string,
  agora = new Date(),
): Promise<boolean> {
  return token ? redefinicoes.valido(hash(token), agora) : false;
}

export async function redefinirSenha(
  { contas, sessoes, redefinicoes }: DepsConta,
  token: string,
  senha: string,
  agora = new Date(),
): Promise<Resultado<Membro>> {
  const usuarioId = token ? await redefinicoes.consumir(hash(token), agora) : null;
  const membro = usuarioId ? await contas.porId(usuarioId) : null;
  if (!membro) return { ok: false, erro: "este link expirou ou já foi usado. Peça um novo." };
  await contas.definirSenha(membro.id, await bcrypt.hash(senha, CUSTO_BCRYPT));
  await sessoes.apagarDoUsuario(membro.id);
  return { ok: true, valor: membro };
}
