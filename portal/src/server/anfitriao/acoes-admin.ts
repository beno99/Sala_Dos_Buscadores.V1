"use server";

import { revalidatePath } from "next/cache";
import { ConflitoEditorial } from "@/modules/acervo/editorial-atomico";
import { auditarComo } from "@/server/auditoria";
import { AcessoNegado, exigirAdmin } from "../sessao";
import { comGravacoesDoPedido } from "../store";
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
  let atorId: string;
  try {
    const admin = await exigirAdmin();
    quem = admin.pseudonimo;
    atorId = admin.id;
  } catch (e) {
    if (e instanceof AcessoNegado) {
      return {
        ok: false,
        mensagem: "Erro: acesso restrito à curadoria. Entre com uma conta de administrador.",
      };
    }
    throw e;
  }
  let r: ResultadoAcao<T>;
  try {
    r = await comGravacoesDoPedido(() => auditarComo(atorId, () => fazer(quem)));
  } catch (e) {
    if (e instanceof ConflitoEditorial) return { ok: false, conflito: true, mensagem: e.message };
    throw e;
  }
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

function validarOpcaoRebaixamento(opcao: usuarios.OpcaoRebaixamento) {
  return opcao?.tipo === "manter" || opcao?.tipo === "despublicar"
    ? { tipo: opcao.tipo }
    : opcao?.tipo === "transferir"
      ? { tipo: "transferir" as const, para: String(opcao.para) }
      : null;
}

export async function rebaixarAcao(contaId: string, opcao: usuarios.OpcaoRebaixamento) {
  const valida = validarOpcaoRebaixamento(opcao);
  if (!valida) return { ok: false as const, mensagem: "Erro: escolha o que acontece com as Salas." };
  return comAdmin((quem) => usuarios.rebaixar(String(contaId), valida, quem));
}

export async function excluirUsuarioAcao(contaId: string, opcao: usuarios.OpcaoRebaixamento) {
  const valida = validarOpcaoRebaixamento(opcao);
  if (!valida) return { ok: false as const, mensagem: "Erro: escolha o que acontece com as Salas." };
  return comAdmin((quem) => usuarios.excluirConta(String(contaId), valida, quem));
}

export async function decidirCandidaturaAcao(id: string, decisao: "aprovar" | "recusar", motivo?: string) {
  if (decisao !== "aprovar" && decisao !== "recusar")
    return { ok: false as const, mensagem: "Erro: decisão inválida." };
  return comAdmin((quem) => usuarios.decidirCandidatura(String(id), decisao, motivo, quem));
}

export async function convidarAcao(email: string, personalizacao?: { nome?: string; mensagem?: string }) {
  return comAdmin((quem) =>
    usuarios.convidar(String(email), quem, new Date(), {
      nome: String(personalizacao?.nome ?? ""),
      mensagem: String(personalizacao?.mensagem ?? ""),
    }),
  );
}

export async function revogarConviteAcao(id: string) {
  return comAdmin((quem) => usuarios.revogarConvite(String(id), quem));
}

export async function aprovarVideoAnfitriaoAcao(videoId: string) {
  return comAdmin((quem) => revisao.aprovarVideo(String(videoId), quem));
}

export async function reprovarVideoAnfitriaoAcao(videoId: string, motivo: string) {
  return comAdmin((quem) => revisao.reprovarVideo(String(videoId), String(motivo ?? ""), quem));
}

export async function aprovarAnuncioAcao(anuncioId: string) {
  return comAdmin((quem) => revisao.aprovarAnuncio(String(anuncioId), quem));
}

export async function reprovarAnuncioAcao(anuncioId: string, motivo: string) {
  return comAdmin((quem) => revisao.reprovarAnuncio(String(anuncioId), String(motivo ?? ""), quem));
}

export async function apagarConviteAcao(id: string) {
  return comAdmin((quem) => usuarios.apagarConvite(String(id), quem));
}

export async function alterarEmailAcao(contaId: string, email: string) {
  return comAdmin((quem) => usuarios.alterarEmail(String(contaId), String(email ?? ""), quem));
}

export async function criarUsuarioAcao(dados: {
  pseudonimo: string;
  email: string;
  senha: string;
  papel: usuarios.CargoAvulso;
}) {
  return comAdmin((quem) =>
    usuarios.criarUsuarioAvulso(
      {
        pseudonimo: String(dados.pseudonimo ?? ""),
        email: String(dados.email ?? ""),
        senha: String(dados.senha ?? ""),
        papel: usuarios.CARGOS_AVULSOS.includes(dados.papel) ? dados.papel : "membro",
      },
      quem,
    ),
  );
}
