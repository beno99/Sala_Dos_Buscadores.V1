"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { incluirMensagem, mensagensDoAnfitriao } from "@/modules/conversa/conversa.repositorio";
import type { ResultadoAcao } from "../anfitriao/comum";
import { EMAIL_CURADORIA, enviarEmail, URL_PUBLICA } from "../caixa-saida";
import { membroAtual } from "../sessao";
import { comGravacoesDoPedido, contaNoDiretorio } from "../store";
import { nomeDoAnfitriao } from "./consultas";

/*
 * A identidade vem sempre da sessão: o anfitrião só escreve na própria conversa,
 * e só o administrador escreve na conversa de um anfitrião.
 */

const LIMITE = 2000;

async function enviar(anfitriaoId: string, autorId: string, bruto: unknown): Promise<ResultadoAcao> {
  const texto = String(bruto ?? "").trim();
  if (!texto) return { ok: false, mensagem: "Erro: escreva a mensagem antes de enviar." };
  if (texto.length > LIMITE)
    return { ok: false, mensagem: `Erro: a mensagem passa de ${LIMITE} caracteres.` };
  const anterior = (await mensagensDoAnfitriao(anfitriaoId)).at(-1);
  await incluirMensagem({
    id: `m-${randomUUID()}`,
    anfitriaoId,
    autorId,
    texto,
    criadaEm: new Date().toISOString(),
  });
  const daCuradoria = autorId !== anfitriaoId;
  const mudouDeLado = !anterior || (anterior.autorId !== anterior.anfitriaoId) !== daCuradoria;
  const anfitriao = contaNoDiretorio(anfitriaoId);
  if (mudouDeLado && anfitriao) {
    await comGravacoesDoPedido(() =>
      daCuradoria
        ? enviarEmail({
            para: anfitriao.email,
            assunto: "Nova mensagem da curadoria",
            corpo: `A curadoria respondeu na sua conversa.\n\nLeia em ${URL_PUBLICA}/anfitriao/conversa`,
          })
        : enviarEmail({
            para: EMAIL_CURADORIA,
            assunto: `Nova mensagem de ${nomeDoAnfitriao(anfitriaoId)}`,
            corpo: `Um anfitrião escreveu para a curadoria.\n\nLeia em ${URL_PUBLICA}/admin/conversas/${anfitriaoId}`,
          }),
    );
  }
  revalidatePath("/anfitriao/conversa");
  revalidatePath("/admin/conversas", "layout");
  return { ok: true, valor: undefined, mensagem: "Mensagem enviada." };
}

export async function escreverACuradoriaAcao(texto: string): Promise<ResultadoAcao> {
  const membro = await membroAtual();
  if (membro?.papel !== "anfitriao") return { ok: false, mensagem: "Erro: acesso restrito a anfitriões." };
  return enviar(membro.id, membro.id, texto);
}

export async function responderAnfitriaoAcao(anfitriaoId: string, texto: string): Promise<ResultadoAcao> {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") return { ok: false, mensagem: "Erro: acesso restrito à curadoria." };
  const conta = contaNoDiretorio(String(anfitriaoId));
  if (conta?.papel !== "anfitriao") return { ok: false, mensagem: "Erro: esta conta não é de anfitrião." };
  return enviar(conta.id, membro.id, texto);
}
