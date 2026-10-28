import "server-only";
import { randomUUID } from "node:crypto";
import type { EmailEnviado } from "@/data/types";
import { caixaSaidaBruta, incluirEmail } from "./store";

/*
 * Caixa de saída (§10). Nenhum e-mail sai do servidor ainda: cada envio
 * fica registrado no banco (para, assunto, corpo em texto e quando), e a
 * curadoria lê tudo em /admin/caixa-saida.
 *
 * Para usar um serviço real, troque só o corpo de `enviarEmail` (mantendo a
 * assinatura): quem envia não precisa mudar.
 */

export interface NovoEmail {
  para: string;
  assunto: string;
  corpo: string;
}

/** Destinatário dos avisos para a curadoria (candidatura recebida). */
export const EMAIL_CURADORIA = "curadoria@saladosbuscadores.org";

export const URL_PUBLICA = process.env.SDB_URL_PUBLICA ?? "http://localhost:3000";

/** Assinatura dos e-mails, na voz da casa. */
const RODAPE = "\n\nA Sala dos Buscadores · curadoria do acervo";

export function enviarEmail(novo: NovoEmail, quando = new Date()): EmailEnviado {
  const email: EmailEnviado = Object.freeze({
    id: `e-${randomUUID()}`,
    para: novo.para.trim().toLowerCase(),
    assunto: novo.assunto.trim(),
    corpo: `${novo.corpo.trim()}${RODAPE}`,
    quando: quando.toISOString(),
  });
  incluirEmail(email);
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
