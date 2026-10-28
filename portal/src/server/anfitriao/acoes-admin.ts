"use server";

import { revalidatePath } from "next/cache";
import { AcessoNegado, exigirAdmin } from "../sessao";
import { aguardarGravacoes } from "../store";
import type { ResultadoAcao } from "./comum";
import * as revisao from "./revisao";
import * as usuarios from "./usuarios";

/*
 * Server Actions da curadoria sobre anfitriões: revisão (aprovar, reprovar,
 * comparação), usuários, candidaturas e convites. Cada uma confere o papel de
 * administrador antes de qualquer coisa. Nenhuma edita conteúdo de anfitrião.
 */

async function comAdmin<T>(
  fazer: (quem: string) => ResultadoAcao<T> | Promise<ResultadoAcao<T>>,
): Promise<ResultadoAcao<T>> {
  let quem: string;
  try {
    quem = (await exigirAdmin()).pseudonimo;
  } catch (e) {
    if (e instanceof AcessoNegado) {
      return {
        ok: false,
        mensagem: "Erro: acesso restrito à curadoria. Entre com uma conta de administrador.",
      };
    }
    throw e;
  }
  const r = await fazer(quem);
  await aguardarGravacoes();
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

export async function aprovarSalaAcao(salaId: string) {
  return comAdmin((quem) => revisao.aprovarSala(String(salaId), quem));
}

export async function reprovarSalaAcao(salaId: string, motivo: string) {
  return comAdmin((quem) => revisao.reprovarSala(String(salaId), String(motivo ?? ""), quem));
}

export async function aprovarArtigoAcao(artigoId: string) {
  return comAdmin((quem) => revisao.aprovarArtigo(String(artigoId), quem));
}

export async function reprovarArtigoAcao(artigoId: string, motivo: string) {
  return comAdmin((quem) => revisao.reprovarArtigo(String(artigoId), String(motivo ?? ""), quem));
}

export async function definirNaComparacaoAcao(salaId: string, incluir: boolean) {
  return comAdmin((quem) => revisao.definirNaComparacao(String(salaId), incluir === true, quem));
}

export async function arquivarSalaAnfitriaoAcao(salaId: string) {
  return comAdmin((quem) => revisao.arquivarSala(String(salaId), quem));
}

export async function promoverAcao(contaId: string) {
  return comAdmin((quem) => usuarios.promover(String(contaId), quem));
}

export async function rebaixarAcao(contaId: string, opcao: usuarios.OpcaoRebaixamento) {
  const valida =
    opcao?.tipo === "manter" || opcao?.tipo === "despublicar"
      ? { tipo: opcao.tipo }
      : opcao?.tipo === "transferir"
        ? { tipo: "transferir" as const, para: String(opcao.para) }
        : null;
  if (!valida) return { ok: false as const, mensagem: "Erro: escolha o que acontece com as Salas." };
  return comAdmin((quem) => usuarios.rebaixar(String(contaId), valida, quem));
}

export async function decidirCandidaturaAcao(id: string, decisao: "aprovar" | "recusar", motivo?: string) {
  if (decisao !== "aprovar" && decisao !== "recusar")
    return { ok: false as const, mensagem: "Erro: decisão inválida." };
  return comAdmin((quem) => usuarios.decidirCandidatura(String(id), decisao, motivo, quem));
}

export async function convidarAcao(email: string) {
  return comAdmin((quem) => usuarios.convidar(String(email), quem));
}

export async function revogarConviteAcao(id: string) {
  return comAdmin((quem) => usuarios.revogarConvite(String(id), quem));
}
