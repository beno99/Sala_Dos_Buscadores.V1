import type { Preferencias } from "@/features/onboarding/preferencias";
import type { DepsConta, Membro, Resultado } from "../conta.contratos";

const SEM_CONTA = "conta não encontrada. Entre de novo.";

/** Grava as preferências do onboarding (já validadas). */
export async function salvarPreferencias(
  { contas }: Pick<DepsConta, "contas">,
  contaId: string,
  preferencias: Preferencias,
): Promise<Resultado<Membro>> {
  const membro = await contas.definirPreferencias(contaId, preferencias);
  return membro ? { ok: true, valor: membro } : { ok: false, erro: SEM_CONTA };
}

/** Apaga só a resposta de religião ou convicção (RNF-LEG-03); os interesses ficam. */
export async function apagarConviccao(
  { contas }: Pick<DepsConta, "contas">,
  contaId: string,
): Promise<Resultado<Membro>> {
  const conta = await contas.porId(contaId);
  if (!conta) return { ok: false, erro: SEM_CONTA };
  if (!conta.preferencias) return { ok: true, valor: conta };
  const membro = await contas.definirPreferencias(contaId, {
    ...conta.preferencias,
    conviccao: { tipo: "pulada" },
  });
  return membro ? { ok: true, valor: membro } : { ok: false, erro: SEM_CONTA };
}
