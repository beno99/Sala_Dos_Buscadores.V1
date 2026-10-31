import { URL_PUBLICA } from "@/server/caixa-saida";
import { VALIDADE_VERIFICACAO_H } from "./casos-de-uso/verificar";

/*
 * E-mail de verificação de conta (RF-01). Cliente de e-mail não lê var() nem
 * carrega fonte própria: os valores abaixo são os mesmos de
 * design-system/tokens.json (tema Sólido · claro), só que fixos e com
 * estilo inline, como o meio exige.
 */

const AREIA = "#EBDCC1";
const CREME = "#FDF8EF";
const GRAFITE = "#111313";
const LABEL_SECUNDARIO = "#4C463B";
const LABEL_TERCIARIO = "#6B665E";
const BORDO = "#390007";
const BEGE = "#F6E7CE";
const FONTE_TITULO = "'Fraunces','Source Serif 4',Georgia,serif";
const FONTE_LEITURA = "'Source Serif 4',Georgia,serif";
const FONTE_UI = "Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

export function emailVerificacao({ pseudonimo, link }: { pseudonimo: string; link: string }) {
  const assunto = "Confirme seu e-mail na Sala dos Buscadores";
  const corpo = [
    `Olá, ${pseudonimo}. Falta um passo para abrir sua conta na Sala dos Buscadores.`,
    `Confirme seu e-mail neste link, válido por ${VALIDADE_VERIFICACAO_H} horas:\n${link}`,
    "Se não foi você quem criou esta conta, ignore esta mensagem.",
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:32px 16px;background:${AREIA};font-family:${FONTE_UI};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:${CREME};border-radius:24px;">
<tr><td style="padding:40px;">
  <img src="${URL_PUBLICA}/imagens/logo_sala.png" width="40" height="34" alt="A Sala dos Buscadores" style="display:block;margin:0 0 16px;">
  <p style="margin:0 0 24px;font:600 12px/1 ${FONTE_UI};letter-spacing:.08em;color:${LABEL_SECUNDARIO};text-transform:uppercase;">
    A Sala dos Buscadores
  </p>
  <h1 style="margin:0 0 16px;font:400 24px/1.3 ${FONTE_TITULO};color:${GRAFITE};">Confirme seu e-mail</h1>
  <p style="margin:0 0 24px;font:400 16px/1.6 ${FONTE_LEITURA};color:${LABEL_SECUNDARIO};">
    Olá, ${pseudonimo}. Falta um passo para abrir sua conta: confirme que este e-mail é seu.
  </p>
  <a href="${link}" style="display:inline-block;padding:14px 28px;background:${BORDO};color:${BEGE};font:600 14px/1 ${FONTE_UI};text-decoration:none;border-radius:999px;">
    Confirmar e-mail
  </a>
  <p style="margin:24px 0 0;font:400 13px/1.6 ${FONTE_LEITURA};color:${LABEL_TERCIARIO};">
    Válido por ${VALIDADE_VERIFICACAO_H} horas. Se o botão não funcionar, copie e cole:<br>
    <span style="word-break:break-all;">${link}</span>
  </p>
  <hr style="margin:32px 0;border:none;border-top:1px solid rgba(17,19,19,.08);">
  <p style="margin:0;font:400 12px/1.6 ${FONTE_UI};color:${LABEL_TERCIARIO};">
    A Sala dos Buscadores · curadoria do acervo<br>
    Se não foi você quem criou esta conta, ignore esta mensagem.
  </p>
</td></tr>
</table>
</body>
</html>`;

  return { assunto, corpo, html };
}
