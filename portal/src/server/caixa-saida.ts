import "server-only";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import type { EmailEnviado } from "@/data/types";
import { ASSINATURA_EMAIL } from "@/lib/email";
import { ANEXO_LOGO, htmlEmail } from "./email-padrao";
import { aposConfirmarPedido, caixaSaidaBruta, incluirEmail } from "./store";

/*
 * Caixa de saída (§10). Cada envio fica registrado no banco (para, assunto,
 * corpo em texto e quando), e a curadoria lê tudo em /admin/caixa-saida. Com
 * RESEND_API_KEY configurada, o e-mail também sai de verdade pelo Resend
 * (instalado via Vercel Marketplace); sem a chave (dev local), só o registro
 * acontece, como antes.
 */

export interface NovoEmail {
  para: string;
  assunto: string;
  corpo: string;
  /** HTML opcional (ex.: verificação de e-mail); sem ele, o provedor recebe só texto. */
  html?: string;
  /** Imagens embutidas no HTML por `cid:<idConteudo>`. */
  anexos?: AnexoEmail[];
}

export interface AnexoEmail {
  nome: string;
  tipo: string;
  base64: string;
  idConteudo: string;
}

/** Destinatário dos avisos para a curadoria (candidatura recebida). */
export const EMAIL_CURADORIA = "curadoria@saladosbuscadores.org";

export const URL_PUBLICA = process.env.SDB_URL_PUBLICA ?? "http://localhost:3000";

const RODAPE = `\n\n${ASSINATURA_EMAIL}`;

const REMETENTE =
  process.env.SDB_EMAIL_REMETENTE ??
  (process.env.RESEND_EMAIL_DOMAIN
    ? `A Sala dos Buscadores <verificacao@${process.env.RESEND_EMAIL_DOMAIN}>`
    : "A Sala dos Buscadores <onboarding@resend.dev>");

async function enviarPeloResend(email: EmailEnviado, html?: string, anexos?: AnexoEmail[]) {
  const chave = process.env.RESEND_API_KEY;
  if (!chave) return;
  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: REMETENTE,
      to: email.para,
      subject: email.assunto,
      text: email.corpo,
      ...(html && { html }),
      ...(anexos?.length && {
        attachments: anexos.map((a) => ({
          filename: a.nome,
          content: a.base64,
          content_type: a.tipo,
          content_id: a.idConteudo,
        })),
      }),
    }),
  });
  if (!resposta.ok) {
    console.error("Resend recusou o envio:", resposta.status, await resposta.text());
  }
}

export function enviarEmail(novo: NovoEmail, quando = new Date()): EmailEnviado {
  const email: EmailEnviado = Object.freeze({
    id: `e-${randomUUID()}`,
    para: novo.para.trim().toLowerCase(),
    assunto: novo.assunto.trim(),
    corpo: `${novo.corpo.trim()}${RODAPE}`,
    quando: quando.toISOString(),
  });
  incluirEmail(email);
  const html =
    novo.html ??
    htmlEmail({
      titulo: email.assunto,
      paragrafos: novo.corpo.trim().split(/\n{2,}/),
    });
  if (process.env.RESEND_API_KEY)
    aposConfirmarPedido(() => after(() => enviarPeloResend(email, html, novo.anexos ?? [ANEXO_LOGO])));
  return { ...email };
}

/** Do mais recente para o mais antigo. */
export function listarEmails(filtro?: { para?: string }): EmailEnviado[] {
  const para = filtro?.para?.trim().toLowerCase();
  return caixaSaidaBruta()
    .filter((e) => !para || e.para === para)
    .map((e) => ({ ...e }))
    .reverse();
}
