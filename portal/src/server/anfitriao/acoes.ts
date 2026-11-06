"use server";

import { revalidatePath } from "next/cache";
import type { FormVideo } from "@/features/admin/formularios";
import type {
  FormArtigoAnfitriao,
  FormFonteProposta,
  FormSalaAnfitriao,
} from "@/features/anfitriao/regras/artigo";
import type { FormCandidatura, FormPerfil } from "@/features/anfitriao/regras/perfil";
import type { FormAnuncio } from "@/features/anuncios/regras";
import { ConflitoEditorial } from "@/modules/acervo/editorial-atomico";
import type { Membro } from "@/modules/conta/conta.contratos";
import { gravarSessao } from "@/modules/conta/conta.controller";
import { auditarComo } from "@/server/auditoria";
import type { ModoSalvar } from "../admin/editorial";
import * as anuncios from "../anuncios";
import { AcessoNegado, exigirAnfitriao, membroAtual } from "../sessao";
import { comGravacoesDoPedido, sincronizarAcervo } from "../store";
import type { ResultadoAcao } from "./comum";
import * as editorial from "./editorial";
import * as usuarios from "./usuarios";
import * as videos from "./videos";

/*
 * Server Actions do anfitrião e do membro que se candidata. Podem ser chamadas
 * direto por POST, então cada uma confere o papel aqui; as operações conferem
 * de novo a posse de cada item. A curadoria não passa por estas ações: ela
 * só julga, em ./acoes-admin.ts.
 */

const NEGADO = (mensagem: string) => ({ ok: false as const, mensagem: `Erro: ${mensagem}` });

async function comAnfitriao<T>(
  fazer: (dono: Membro) => ResultadoAcao<T> | Promise<ResultadoAcao<T>>,
  { revalidar = true }: { revalidar?: boolean } = {},
): Promise<ResultadoAcao<T>> {
  let dono: Membro;
  try {
    dono = await exigirAnfitriao();
  } catch (e) {
    if (e instanceof AcessoNegado) return NEGADO("acesso restrito a anfitriões.");
    throw e;
  }
  let r: ResultadoAcao<T>;
  try {
    r = await comGravacoesDoPedido(() => auditarComo(dono.id, () => fazer(dono)));
  } catch (e) {
    if (e instanceof ConflitoEditorial) return { ok: false, conflito: true, mensagem: e.message };
    throw e;
  }
  if (r.ok && revalidar) revalidatePath("/", "layout");
  return r;
}

/*
 * O rascunho salvo sozinho não muda nada público, então não invalida a página:
 * invalidar remontaria o editor no meio da digitação (a URL já trocou de /nova
 * para /[id]). O salvamento manual (que pode tirar do ar) invalida.
 */
export async function salvarSalaAcao(form: FormSalaAnfitriao, modo: ModoSalvar) {
  if (form.id && typeof form.versaoEsperada !== "string")
    return {
      ok: false as const,
      conflito: true,
      mensagem: "Reabra o editor para obter a versão atual. Seu rascunho continua nesta página.",
    };
  return comAnfitriao((dono) => editorial.salvarSala(form, dono, modo), { revalidar: modo === "manual" });
}

export async function salvarArtigoAnfitriaoAcao(form: FormArtigoAnfitriao, modo: ModoSalvar) {
  if (form.id && typeof form.versaoEsperada !== "string")
    return {
      ok: false as const,
      conflito: true,
      mensagem: "Reabra o editor para obter a versão atual. Seu rascunho continua nesta página.",
    };
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

// ---------- vídeos ----------

const SEM_VERSAO = {
  ok: false as const,
  conflito: true,
  mensagem: "Reabra o editor para obter a versão atual. Seu rascunho continua nesta página.",
};

export async function salvarVideoAnfitriaoAcao(form: FormVideo, modo: ModoSalvar) {
  if (form.id && typeof form.versaoEsperada !== "string") return SEM_VERSAO;
  return comAnfitriao((dono) => videos.salvarVideo(form, dono, modo), { revalidar: modo === "manual" });
}

export async function enviarVideoAcao(videoId: string, aceite: boolean) {
  return comAnfitriao((dono) => videos.enviarVideo(String(videoId), aceite === true, dono));
}

export async function retirarVideoAcao(videoId: string) {
  return comAnfitriao((dono) => videos.retirarVideo(String(videoId), dono));
}

export async function excluirVideoAcao(videoId: string) {
  return comAnfitriao((dono) => videos.excluirVideo(String(videoId), dono));
}

export async function marcarVideoVistoAcao(videoId: string) {
  return comAnfitriao((dono) => videos.marcarVideoVisto(String(videoId), dono));
}

// ---------- publicidade ----------

export async function salvarAnuncioAcao(form: FormAnuncio, modo: ModoSalvar) {
  if (form.id && typeof form.versaoEsperada !== "string") return SEM_VERSAO;
  return comAnfitriao((dono) => anuncios.salvarAnuncio(form, dono, modo), { revalidar: modo === "manual" });
}

export async function enviarAnuncioAcao(anuncioId: string, aceite: boolean) {
  return comAnfitriao((dono) => anuncios.enviarAnuncio(String(anuncioId), aceite === true, dono));
}

export async function retirarAnuncioAcao(anuncioId: string) {
  return comAnfitriao((dono) => anuncios.retirarAnuncio(String(anuncioId), dono));
}

export async function excluirAnuncioAcao(anuncioId: string) {
  return comAnfitriao((dono) => anuncios.excluirAnuncio(String(anuncioId), dono));
}

export async function marcarAnuncioVistoAcao(anuncioId: string) {
  return comAnfitriao((dono) => anuncios.marcarAnuncioVisto(String(anuncioId), dono));
}

// ---------- membro ----------

/** Candidatura a anfitrião, enviada por um membro em /seja-anfitriao. */
export async function candidatarAcao(form: FormCandidatura) {
  const membro = await membroAtual();
  if (!membro) return NEGADO("entre na sua conta para se candidatar.");
  const r = await comGravacoesDoPedido(() => usuarios.candidatar(form, membro));
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

// ---------- cadastro por convite (sem sessão) ----------

/** Cria a conta pelo link do convite, já como anfitrião, e abre a sessão. */
export async function cadastrarPorConviteAcao(token: string, dados: { pseudonimo: string; senha: string }) {
  await sincronizarAcervo();
  const r = await comGravacoesDoPedido(() =>
    usuarios.aceitarConvite(String(token), {
      pseudonimo: String(dados.pseudonimo),
      senha: String(dados.senha),
    }),
  );
  if (r.ok) await gravarSessao(r.valor);
  return r;
}
