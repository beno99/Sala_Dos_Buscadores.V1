import "server-only";
import { notFound } from "next/navigation";
import type { Membro } from "@/modules/conta/conta.contratos";
import { AcessoNegado, acessoAtual } from "../sessao";

/*
 * Ajudantes das páginas de /anfitriao. O layout já mostra "Acesso restrito"
 * para quem não é anfitrião; as páginas conferem de novo e tratam item de
 * outra pessoa como inexistente (404), para não revelar o que existe.
 */

export async function anfitriaoDaPagina(): Promise<Membro> {
  const acesso = await acessoAtual();
  if (acesso.tipo !== "anfitriao") notFound();
  return acesso.membro;
}

export function ouNaoEncontrado<T>(ler: () => T): T {
  try {
    return ler();
  } catch (e) {
    if (e instanceof AcessoNegado) notFound();
    throw e;
  }
}
