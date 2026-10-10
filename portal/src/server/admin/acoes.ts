"use server";

import { revalidatePath } from "next/cache";
import type { FormArtigo, FormFonte, FormVideo } from "@/features/admin/formularios";
import type { GrupoVaga } from "@/features/destaques/vagas";
import { AcessoNegado, exigirAdmin } from "../sessao";
import * as destaques from "./destaques";
import type { AcaoStatus, ModoSalvar, ResultadoAcao } from "./editorial";
import * as editorial from "./editorial";

/*
 * Server Actions da curadoria. Podem ser chamadas direto por POST, então cada
 * uma confere o papel de administrador antes de qualquer coisa. Depois de
 * gravar, invalida o portal inteiro: o acervo é pequeno e o que foi publicado
 * precisa aparecer na mesma hora.
 */

async function comAdmin<T>(fazer: (quem: string) => ResultadoAcao<T>): Promise<ResultadoAcao<T>> {
  let quem: string;
  try {
    quem = (await exigirAdmin()).pseudonimo;
  } catch (e) {
    if (e instanceof AcessoNegado)
      return {
        ok: false,
        mensagem: "Erro: acesso restrito à curadoria. Entre com uma conta de administrador.",
      };
    throw e;
  }
  const resultado = fazer(quem);
  if (resultado.ok) revalidatePath("/", "layout");
  return resultado;
}

export async function salvarArtigoAcao(form: FormArtigo, modo: ModoSalvar) {
  return comAdmin((quem) => editorial.salvarArtigo(form, quem, modo));
}

export async function mudarStatusArtigoAcao(id: string, acao: AcaoStatus) {
  return comAdmin((quem) => editorial.mudarStatusArtigo(id, acao, quem));
}

export async function duplicarArtigoAcao(id: string) {
  return comAdmin((quem) => editorial.duplicarArtigo(id, quem));
}

export async function salvarVideoAcao(form: FormVideo, modo: ModoSalvar) {
  return comAdmin((quem) => editorial.salvarVideo(form, quem, modo));
}

export async function mudarStatusVideoAcao(id: string, acao: AcaoStatus) {
  return comAdmin((quem) => editorial.mudarStatusVideo(id, acao, quem));
}

export async function salvarFonteAcao(form: FormFonte) {
  return comAdmin((quem) => editorial.salvarFonte(form, quem));
}

export async function excluirFonteAcao(id: string) {
  return comAdmin((quem) => editorial.excluirFonte(id, quem));
}

export async function restaurarAcervoAcao() {
  return comAdmin((quem) => editorial.restaurarAcervo(quem));
}

export async function definirVagaDestaqueAcao(grupo: GrupoVaga, indice: number, id: string | null) {
  return comAdmin((quem) => destaques.definirVaga(grupo, indice, id, quem));
}

export async function moverVagaDestaqueAcao(grupo: GrupoVaga, indice: number, direcao: 1 | -1) {
  return comAdmin((quem) => destaques.moverVaga(grupo, indice, direcao, quem));
}
