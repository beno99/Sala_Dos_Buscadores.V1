import type { DepsConta, Membro, Papel, Resultado } from "../conta.contratos";

/** Muda o papel entre membro e anfitrião. O papel de administrador não é dado nem tirado por aqui. */
export async function definirPapel(
  { contas }: Pick<DepsConta, "contas">,
  id: string,
  papel: Exclude<Papel, "administrador">,
): Promise<Resultado<Membro>> {
  const conta = await contas.porId(id);
  if (!conta) return { ok: false, erro: "conta não encontrada." };
  if (conta.papel === "administrador")
    return { ok: false, erro: "o papel de administrador não muda por aqui." };
  const membro = await contas.definirPapel(id, papel);
  return membro ? { ok: true, valor: membro } : { ok: false, erro: "conta não encontrada." };
}
