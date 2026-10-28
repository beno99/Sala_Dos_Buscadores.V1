import bcrypt from "bcryptjs";
import type { DepsConta, Membro, Resultado } from "../conta.contratos";

const NAO_CONFEREM = "e-mail ou senha não conferem. Confira os dois ou redefina a senha.";

export async function autenticar(
  { contas }: Pick<DepsConta, "contas">,
  email: string,
  senha: string,
): Promise<Resultado<Membro>> {
  const achada = await contas.credenciais(email);
  if (!achada || !(await bcrypt.compare(senha, achada.senhaHash))) return { ok: false, erro: NAO_CONFEREM };
  return { ok: true, valor: achada.membro };
}
