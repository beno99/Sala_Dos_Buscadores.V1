"use server";

import { revalidatePath } from "next/cache";
import type { FormArtigo, FormFonte, FormVideo } from "@/features/admin/formularios";
import type { FormSalaOficial } from "@/features/admin/regras/sala";
import type { GrupoVaga } from "@/features/destaques/vagas";
import type { Membro } from "@/modules/conta/conta.contratos";
import { AcessoNegado, exigirAdmin } from "../sessao";
import { aguardarGravacoes } from "../store";
import * as destaques from "./destaques";
import type { AcaoStatus, ModoSalvar, ResultadoAcao } from "./editorial";
import * as editorial from "./editorial";
import * as salas from "./salas";

/*
 * Server Actions da curadoria. Podem ser chamadas direto por POST, então cada
 * uma confere o papel de administrador antes de qualquer coisa. Depois de
 * gravar, invalida o portal inteiro: o acervo é pequeno e o que foi publicado
 * precisa aparecer na mesma hora.
 */

async function comAdmin<T>(
  fazer: (quem: string) => ResultadoAcao<T> | Promise<ResultadoAcao<T>>,
  opcoes: { revalidar?: boolean } = {},
): Promise<ResultadoAcao<T>> {
  return comConta((admin) => fazer(admin.pseudonimo), opcoes);
}

/** Como comAdmin, mas entrega a conta (id e pseudônimo): imagens enviadas são da conta. */
async function comConta<T>(
  fazer: (admin: Membro) => ResultadoAcao<T> | Promise<ResultadoAcao<T>>,
  { revalidar = true }: { revalidar?: boolean } = {},
): Promise<ResultadoAcao<T>> {
  let admin: Membro;
  try {
    admin = await exigirAdmin();
  } catch (e) {
    if (e instanceof AcessoNegado)
      return {
        ok: false,
        mensagem: "Erro: acesso restrito à curadoria. Entre com uma conta de administrador.",
      };
    throw e;
  }
  const resultado = await fazer(admin);
  await aguardarGravacoes();
  if (resultado.ok && revalidar) revalidatePath("/", "layout");
  return resultado;
}

/*
 * O rascunho salvo sozinho não muda o portal, então não invalida a página:
 * invalidar remontaria o editor no meio da digitação (a URL já trocou de /novo
 * para /[id]). Item publicado só muda com o salvamento manual, que invalida.
 */
export async function salvarArtigoAcao(form: FormArtigo, modo: ModoSalvar) {
  return comConta((admin) => editorial.salvarArtigo(form, admin.pseudonimo, modo, admin.id), {
    revalidar: modo === "manual",
  });
}

export async function moverArtigoAcao(id: string, destino: string) {
  return comAdmin((quem) => editorial.moverArtigo(String(id), String(destino), quem));
}

export async function ligarVideoAcao(videoId: string, artigoId: string, ligar: boolean) {
  return comAdmin((quem) => editorial.ligarVideo(String(videoId), String(artigoId), ligar === true, quem));
}

// ---------- Salas oficiais ----------

export async function salvarSalaOficialAcao(form: FormSalaOficial, modo: ModoSalvar) {
  return comConta((admin) => salas.salvarSalaOficial(form, admin, modo), { revalidar: modo === "manual" });
}

export async function mudarStatusSalaAcao(id: string, acao: salas.AcaoSala) {
  if (acao !== "publicar" && acao !== "arquivar" && acao !== "restaurar") {
    return { ok: false as const, mensagem: "Erro: ação desconhecida." };
  }
  return comAdmin((quem) => salas.mudarStatusSala(String(id), acao, quem));
}

export async function mudarStatusArtigoAcao(id: string, acao: AcaoStatus) {
  return comAdmin((quem) => editorial.mudarStatusArtigo(id, acao, quem));
}

export async function duplicarArtigoAcao(id: string) {
  return comAdmin((quem) => editorial.duplicarArtigo(id, quem));
}

export async function salvarVideoAcao(form: FormVideo, modo: ModoSalvar) {
  return comAdmin((quem) => editorial.salvarVideo(form, quem, modo), { revalidar: modo === "manual" });
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

export async function definirVagaDestaqueAcao(grupo: GrupoVaga, indice: number, id: string | null) {
  return comAdmin((quem) => destaques.definirVaga(grupo, indice, id, quem));
}

export async function moverVagaDestaqueAcao(grupo: GrupoVaga, indice: number, direcao: 1 | -1) {
  return comAdmin((quem) => destaques.moverVaga(grupo, indice, direcao, quem));
}
