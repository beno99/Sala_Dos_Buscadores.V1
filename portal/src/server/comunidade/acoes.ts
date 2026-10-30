"use server";

import { revalidatePath } from "next/cache";
import type { AlvoComunidade, MotivoDenunciaComunidade, TipoReacaoComunidade } from "@/data/types";
import type { Membro } from "@/modules/conta/conta.contratos";
import type { ResultadoAcao } from "../anfitriao/comum";
import { AcessoNegado, exigirAdmin, membroAtual } from "../sessao";
import { aguardarGravacoes } from "../store";
import * as operacoes from "./operacoes";

/*
 * Server Actions da Comunidade. Podem ser chamadas direto por POST: a identidade
 * vem sempre da sessão, e as operações conferem posse e papel de cada item.
 */

async function comConta<T>(fazer: (conta: Membro) => ResultadoAcao<T>): Promise<ResultadoAcao<T>> {
  const conta = await membroAtual();
  if (!conta) return { ok: false, mensagem: "Erro: entre na sua conta." };
  const r = fazer(conta);
  await aguardarGravacoes();
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

async function comAdmin<T>(fazer: (admin: Membro) => ResultadoAcao<T>): Promise<ResultadoAcao<T>> {
  try {
    const admin = await exigirAdmin();
    const r = fazer(admin);
    await aguardarGravacoes();
    if (r.ok) revalidatePath("/", "layout");
    return r;
  } catch (e) {
    if (e instanceof AcessoNegado) return { ok: false, mensagem: "Erro: acesso restrito à curadoria." };
    throw e;
  }
}

export async function publicarAcao(form: operacoes.FormPublicacao) {
  return comConta((c) => operacoes.publicar(form, c));
}

export async function editarPublicacaoAcao(id: string, form: operacoes.FormPublicacao) {
  return comConta((c) => operacoes.editarPublicacao(String(id), form, c));
}

export async function excluirPublicacaoAcao(id: string) {
  return comConta((c) => operacoes.excluirPublicacao(String(id), c));
}

export async function comentarAcao(publicacaoId: string, texto: string, paiId?: string) {
  return comConta((c) =>
    operacoes.comentar(String(publicacaoId), String(texto), paiId ? String(paiId) : undefined, c),
  );
}

export async function excluirComentarioAcao(id: string) {
  return comConta((c) => operacoes.excluirComentario(String(id), c));
}

export async function reagirAcao(alvo: AlvoComunidade, tipo: TipoReacaoComunidade) {
  return comConta((c) => operacoes.reagir(alvo, tipo, c));
}

export async function salvarAcao(publicacaoId: string) {
  return comConta((c) => operacoes.salvar(String(publicacaoId), c));
}

export async function seguirAcao(alvo: { tipo: "pessoa" | "sala"; id: string }) {
  return comConta((c) => operacoes.seguir(alvo, c));
}

export async function marcarRespostaAcao(publicacaoId: string, comentarioId: string) {
  return comConta((c) => operacoes.marcarRespostaQueAjudou(String(publicacaoId), String(comentarioId), c));
}

export async function denunciarAcao(alvo: AlvoComunidade, motivo: MotivoDenunciaComunidade, nota?: string) {
  return comConta((c) => operacoes.denunciar(alvo, motivo, nota, c));
}

export async function ocultarComentarioAcao(id: string, motivo: string) {
  return comConta((c) => operacoes.ocultarComentario(String(id), String(motivo), c));
}

export async function moderarAcao(alvo: AlvoComunidade, para: "visivel" | "oculta", motivo: string) {
  return comAdmin((a) => operacoes.moderar(alvo, para, String(motivo), a));
}

export async function decidirDenunciaAcao(
  id: string,
  decisao: "procedente" | "improcedente",
  motivo: string,
) {
  return comAdmin((a) => operacoes.decidirDenuncia(String(id), decisao, String(motivo), a));
}
