import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { DepsConta, Membro, Papel, Resultado } from "../conta.contratos";

/** Custo do bcrypt (RNF-01). */
export const CUSTO_BCRYPT = 12;

export const novoIdConta = () => `u-${randomBytes(6).toString("hex")}`;

/**
 * Cadastro público sempre cria membro; administrador só existe por atribuição
 * (RF-08). O cadastro por convite válido cria anfitrião: quem confere o
 * convite é o módulo de anfitriões, antes de chamar aqui.
 */
export async function registrar(
  { contas }: Pick<DepsConta, "contas">,
  dados: { pseudonimo: string; email: string; senha: string },
  opcoes: { papel?: Exclude<Papel, "administrador"> } = {},
): Promise<Resultado<Membro>> {
  if (await contas.porEmail(dados.email)) {
    return {
      ok: false,
      campo: "email",
      erro: "já existe uma conta com este e-mail. Entre ou redefina a senha.",
    };
  }
  const membro = await contas.criar({
    id: novoIdConta(),
    pseudonimo: dados.pseudonimo.trim(),
    email: dados.email,
    senhaHash: await bcrypt.hash(dados.senha, CUSTO_BCRYPT),
    papel: opcoes.papel ?? "membro",
  });
  return { ok: true, valor: membro };
}
