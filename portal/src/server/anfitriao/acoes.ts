"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type {
  FormArtigoAnfitriao,
  FormFonteProposta,
  FormSalaAnfitriao,
} from "@/features/anfitriao/regras/artigo";
import type { FormCandidatura, FormPerfil } from "@/features/anfitriao/regras/perfil";
import { abrirSessao, type Membro } from "@/features/auth/contas";
import type { ModoSalvar } from "../admin/editorial";
import { AcessoNegado, COOKIE_SESSAO, exigirAnfitriao, membroAtual } from "../sessao";
import type { ResultadoAcao } from "./comum";
import * as editorial from "./editorial";
import * as usuarios from "./usuarios";

/*
 * Server Actions do anfitrião e do membro que se candidata. Podem ser chamadas
 * direto por POST, então cada uma confere o papel aqui; as operações conferem
 * de novo a posse de cada item. A curadoria não passa por estas ações: ela
 * só julga, em ./acoes-admin.ts.
 */

const NEGADO = (mensagem: string) => ({ ok: false as const, mensagem: `Erro: ${mensagem}` });

async function comAnfitriao<T>(
  fazer: (dono: Membro) => ResultadoAcao<T>,
  { revalidar = true }: { revalidar?: boolean } = {},
): Promise<ResultadoAcao<T>> {
  let dono: Membro;
  try {
    dono = await exigirAnfitriao();
  } catch (e) {
    if (e instanceof AcessoNegado) return NEGADO("acesso restrito a anfitriões.");
    throw e;
  }
  const r = fazer(dono);
  if (r.ok && revalidar) revalidatePath("/", "layout");
  return r;
}

/*
 * O rascunho salvo sozinho não muda nada público, então não invalida a página:
 * invalidar remontaria o editor no meio da digitação (a URL já trocou de /nova
 * para /[id]). O salvamento manual (que pode tirar do ar) invalida.
 */
export async function salvarSalaAcao(form: FormSalaAnfitriao, modo: ModoSalvar) {
  return comAnfitriao((dono) => editorial.salvarSala(form, dono, modo), { revalidar: modo === "manual" });
}

export async function salvarArtigoAnfitriaoAcao(form: FormArtigoAnfitriao, modo: ModoSalvar) {
  return comAnfitriao((dono) => editorial.salvarArtigo(form, dono, modo), { revalidar: modo === "manual" });
}

export async function proporFonteAcao(form: FormFonteProposta) {
  return comAnfitriao((dono) => editorial.proporFonte(form, dono));
}

export async function enviarSalaAcao(salaId: string, artigos: string[], aceite: boolean) {
  return comAnfitriao((dono) =>
    editorial.enviarSala(String(salaId), artigos.map(String), aceite === true, dono),
  );
}

export async function enviarArtigoAcao(artigoId: string, aceite: boolean) {
  return comAnfitriao((dono) => editorial.enviarArtigo(String(artigoId), aceite === true, dono));
}

export async function retirarDoArAcao(tipo: editorial.TipoItemAnfitriao, id: string) {
  if (tipo !== "sala" && tipo !== "artigo") return NEGADO("tipo de item inválido.");
  return comAnfitriao((dono) => editorial.retirarDoAr(tipo, String(id), dono));
}

export async function excluirItemAcao(tipo: editorial.TipoItemAnfitriao, id: string) {
  if (tipo !== "sala" && tipo !== "artigo") return NEGADO("tipo de item inválido.");
  return comAnfitriao((dono) => editorial.excluir(tipo, String(id), dono));
}

export async function marcarNovidadesVistasAcao(tipo: editorial.TipoItemAnfitriao, id: string) {
  if (tipo !== "sala" && tipo !== "artigo") return NEGADO("tipo de item inválido.");
  return comAnfitriao((dono) => editorial.marcarNovidadesVistas(tipo, String(id), dono));
}

export async function salvarPerfilAcao(form: FormPerfil) {
  return comAnfitriao((dono) => usuarios.salvarPerfil(form, dono));
}

// ---------- membro ----------

/** Candidatura a anfitrião, enviada por um membro em /ajustes. */
export async function candidatarAcao(form: FormCandidatura) {
  const membro = await membroAtual();
  if (!membro) return NEGADO("entre na sua conta para se candidatar.");
  const r = usuarios.candidatar(form, membro);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

// ---------- cadastro por convite (sem sessão) ----------

/** Cria a conta pelo link do convite, já como anfitrião, e abre a sessão. */
export async function cadastrarPorConviteAcao(token: string, dados: { pseudonimo: string; senha: string }) {
  const r = usuarios.aceitarConvite(String(token), {
    pseudonimo: String(dados.pseudonimo),
    senha: String(dados.senha),
  });
  if (r.ok) {
    (await cookies()).set(COOKIE_SESSAO, abrirSessao(r.valor.email), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return r;
}
