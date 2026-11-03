"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  type Anexo,
  chaveConversa,
  LIMITE_ENVIOS,
  recusaDeEnvio,
  TEXTO_RECUSA,
  validarEnvio,
} from "@/features/conversa/regras/mensagem";
import type { Membro } from "@/modules/conta/conta.contratos";
import {
  definirBloqueio,
  enviadasDesde,
  haBloqueio,
  incluirMensagem,
  incluirMensagemDireta,
  marcarLidas,
  mensagemDireta,
  mensagensDoAnfitriao,
  naoLidasPorRemetente,
} from "@/modules/conversa/conversa.repositorio";
import type { ResultadoAcao } from "../anfitriao/comum";
import { EMAIL_CURADORIA, enviarEmail, URL_PUBLICA } from "../caixa-saida";
import { anexoDoDono } from "../midia";
import { membroAtual } from "../sessao";
import { comGravacoesDoPedido, contaNoDiretorio, sincronizarAcervo } from "../store";
import { nomeDaConta } from "./consultas";

/*
 * Mensagens. A identidade vem sempre da sessão. Canal com a curadoria: cada
 * conta (buscador ou anfitrião) tem a sua, respondida por qualquer curador.
 * Mensagens diretas: entre duas contas quaisquer, só os dois leem; bloqueio e
 * limite de envios valem no servidor. Buscador só escreve; anfitrião e
 * curadoria também anexam imagens e PDF enviados pela própria conta.
 */

type Entrada = { texto: string; anexos?: { midia: string; nome: string }[] };

const falha = (erro: string): ResultadoAcao => ({ ok: false, mensagem: `Erro: ${erro}` });

/** Valida texto e anexos e confere que cada anexo foi enviado pelo autor. */
function prepararEnvio(autor: Membro, entrada: Entrada): { texto: string; anexos: Anexo[] } | string {
  const v = validarEnvio(entrada?.texto, entrada?.anexos, autor.papel);
  if (!v.ok) return v.erro;
  const anexos: Anexo[] = [];
  for (const a of v.anexos) {
    const midia = anexoDoDono(a.midia, autor.id);
    if (!midia) return "este anexo não foi enviado por esta conta. Anexe o arquivo de novo.";
    anexos.push({ midia: midia.id, nome: a.nome, tipo: midia.tipo });
  }
  return { texto: v.texto, anexos };
}

async function contaDaSessao(): Promise<Membro | null> {
  await sincronizarAcervo();
  return membroAtual();
}

// ---------- canal com a curadoria ----------

async function enviarNoCanal(dono: Membro, autor: Membro, entrada: Entrada): Promise<ResultadoAcao> {
  const envio = prepararEnvio(autor, entrada);
  if (typeof envio === "string") return falha(envio);
  const anterior = (await mensagensDoAnfitriao(dono.id)).at(-1);
  await incluirMensagem({
    id: `m-${randomUUID()}`,
    anfitriaoId: dono.id,
    autorId: autor.id,
    texto: envio.texto,
    anexos: envio.anexos,
    criadaEm: new Date().toISOString(),
  });
  const daCuradoria = autor.id !== dono.id;
  const mudouDeLado = !anterior || (anterior.autorId !== anterior.anfitriaoId) !== daCuradoria;
  if (mudouDeLado) {
    const caminho = dono.papel === "anfitriao" ? "/anfitriao/conversa" : "/mensagens/curadoria";
    await comGravacoesDoPedido(() =>
      daCuradoria
        ? enviarEmail({
            para: dono.email,
            assunto: "Nova mensagem da curadoria",
            corpo: `A curadoria respondeu na sua conversa.\n\nLeia em ${URL_PUBLICA}${caminho}`,
          })
        : enviarEmail({
            para: EMAIL_CURADORIA,
            assunto: `Nova mensagem de ${nomeDaConta(dono.id)}`,
            corpo: `Uma conta escreveu para a curadoria.\n\nLeia em ${URL_PUBLICA}/admin/conversas/${dono.id}`,
          }),
    );
  }
  revalidatePath("/anfitriao/conversa");
  revalidatePath("/mensagens", "layout");
  revalidatePath("/admin/conversas", "layout");
  return { ok: true, valor: undefined, mensagem: "Mensagem enviada." };
}

/** Buscador ou anfitrião escreve para a curadoria. */
export async function escreverACuradoriaAcao(entrada: Entrada | string): Promise<ResultadoAcao> {
  const conta = await contaDaSessao();
  if (!conta) return falha("entre na sua conta para escrever.");
  if (conta.papel === "administrador") return falha("a curadoria responde pelas Conversas da Curadoria.");
  return enviarNoCanal(conta, conta, typeof entrada === "string" ? { texto: entrada } : entrada);
}

/** Um curador responde no canal de uma conta. */
export async function responderContaAcao(contaId: string, entrada: Entrada): Promise<ResultadoAcao> {
  const curador = await contaDaSessao();
  if (curador?.papel !== "administrador") return falha("acesso restrito à curadoria.");
  const dono = contaNoDiretorio(String(contaId));
  if (!dono || dono.papel === "administrador") return falha("esta conta não está disponível.");
  return enviarNoCanal(dono, curador, entrada);
}

// ---------- mensagens diretas ----------

export async function enviarDiretaAcao(paraId: string, entrada: Entrada): Promise<ResultadoAcao> {
  const autor = await contaDaSessao();
  if (!autor) return falha("entre na sua conta para escrever.");
  const destino = contaNoDiretorio(String(paraId));
  const desde = new Date(Date.now() - LIMITE_ENVIOS.janelaMin * 60_000).toISOString();
  const [bloqueado, enviadas] = destino
    ? await Promise.all([haBloqueio(autor.id, destino.id), enviadasDesde(autor.id, desde)])
    : [false, 0];
  const recusa = recusaDeEnvio({
    remetenteId: autor.id,
    destinatarioId: String(paraId),
    destinoAtivo: Boolean(destino?.emailVerificadoEm),
    bloqueado,
    enviadasNaJanela: enviadas,
  });
  if (recusa || !destino) return falha(TEXTO_RECUSA[recusa ?? "destino-inexistente"]);
  const envio = prepararEnvio(autor, entrada);
  if (typeof envio === "string") return falha(envio);
  const jaTinhaNaoLida = ((await naoLidasPorRemetente(destino.id)).get(autor.id) ?? 0) > 0;
  await incluirMensagemDireta({
    id: `d-${randomUUID()}`,
    conversa: chaveConversa(autor.id, destino.id),
    remetenteId: autor.id,
    destinatarioId: destino.id,
    texto: envio.texto,
    anexos: envio.anexos,
    criadaEm: new Date().toISOString(),
    lidaEm: null,
  });
  if (!jaTinhaNaoLida)
    await comGravacoesDoPedido(() =>
      enviarEmail({
        para: destino.email,
        assunto: `Nova mensagem de ${nomeDaConta(autor.id)}`,
        corpo: `Você recebeu uma mensagem na Sala dos Buscadores.\n\nLeia em ${URL_PUBLICA}/mensagens/${autor.id}`,
      }),
    );
  revalidatePath("/mensagens", "layout");
  return { ok: true, valor: undefined, mensagem: "Mensagem enviada." };
}

export async function marcarLidasAcao(outroId: string): Promise<void> {
  const conta = await contaDaSessao();
  if (!conta) return;
  await marcarLidas(chaveConversa(conta.id, String(outroId)), conta.id);
}

export async function bloquearAcao(outroId: string, bloquear: boolean): Promise<ResultadoAcao> {
  const conta = await contaDaSessao();
  if (!conta) return falha("entre na sua conta.");
  const outro = contaNoDiretorio(String(outroId));
  if (!outro || outro.id === conta.id) return falha("esta conta não está disponível.");
  await definirBloqueio(conta.id, outro.id, bloquear === true);
  revalidatePath("/mensagens", "layout");
  return {
    ok: true,
    valor: undefined,
    mensagem: bloquear
      ? `${nomeDaConta(outro.id)} foi bloqueado. Nenhum dos dois envia mensagens nesta conversa.`
      : "Bloqueio desfeito.",
  };
}

/**
 * Denúncia: a mensagem recebida vai, com o consentimento de quem denuncia, para
 * o canal dessa pessoa com a curadoria. A curadoria não lê mensagens diretas
 * por outro caminho.
 */
export async function denunciarDiretaAcao(mensagemId: string): Promise<ResultadoAcao> {
  const conta = await contaDaSessao();
  if (!conta) return falha("entre na sua conta.");
  const m = await mensagemDireta(String(mensagemId));
  if (!m || m.destinatarioId !== conta.id) return falha("só é possível denunciar mensagens recebidas.");
  if (conta.papel === "administrador")
    return falha("contas da curadoria podem bloquear a conta diretamente.");
  const quando = new Date(m.criadaEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const anexos = m.anexos?.length
    ? `\nAnexos: ${m.anexos.map((a) => `${a.nome} (${URL_PUBLICA}/midia/${a.midia})`).join(", ")}`
    : "";
  return enviarNoCanal(conta, conta, {
    texto:
      `Denúncia de mensagem direta\nDe: ${nomeDaConta(m.remetenteId)} (conta ${m.remetenteId})\nEm: ${quando}\n\n«${m.texto}»${anexos}`.slice(
        0,
        2000,
      ),
  });
}
