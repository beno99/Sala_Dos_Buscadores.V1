import "server-only";
import type { AnexoEmail } from "./caixa-saida";
import { LOGO_SALA_PNG_BASE64 } from "./logo-email";

/*
 * Modelo único de e-mail: todo envio sai com este layout (logo, cartão creme,
 * título e botão opcional). Cliente de e-mail não lê var() nem fonte própria,
 * então as cores são as de design-system/tokens.json (tema Sólido · claro),
 * fixas e com estilo inline.
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

export const ANEXO_LOGO: AnexoEmail = {
  nome: "logo_sala.png",
  tipo: "image/png",
  base64: LOGO_SALA_PNG_BASE64,
  idConteudo: "logo-sala",
};

function escapar(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function htmlEmail({
  titulo,
  paragrafos,
  botao,
  nota,
}: {
  titulo: string;
  paragrafos: string[];
  botao?: { rotulo: string; link: string };
  nota?: string;
}): string {
  const corpo = paragrafos
    .map(
      (p) =>
        `<p style="margin:0 0 24px;font:400 16px/1.6 ${FONTE_LEITURA};color:${LABEL_SECUNDARIO};">${escapar(p).replace(/\n/g, "<br>")}</p>`,
    )
    .join("\n  ");
  const acao = botao
    ? `<a href="${escapar(botao.link)}" style="display:inline-block;padding:14px 28px;background:${BORDO};color:${BEGE};font:600 14px/1 ${FONTE_UI};text-decoration:none;border-radius:999px;">${escapar(botao.rotulo)}</a>
  <p style="margin:24px 0 0;font:400 13px/1.6 ${FONTE_LEITURA};color:${LABEL_TERCIARIO};">
    Se o botão não funcionar, copie e cole:<br>
    <span style="word-break:break-all;">${escapar(botao.link)}</span>
  </p>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:32px 16px;background:${AREIA};font-family:${FONTE_UI};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:${CREME};border-radius:24px;">
<tr><td style="padding:40px;">
  <img src="cid:${ANEXO_LOGO.idConteudo}" width="40" height="34" alt="A Sala dos Buscadores" style="display:block;margin:0 0 16px;">
  <p style="margin:0 0 24px;font:600 12px/1 ${FONTE_UI};letter-spacing:.08em;color:${LABEL_SECUNDARIO};text-transform:uppercase;">
    A Sala dos Buscadores
  </p>
  <h1 style="margin:0 0 16px;font:400 24px/1.3 ${FONTE_TITULO};color:${GRAFITE};">${escapar(titulo)}</h1>
  ${corpo}
  ${acao}
  <hr style="margin:32px 0;border:none;border-top:1px solid rgba(17,19,19,.08);">
  <p style="margin:0;font:400 12px/1.6 ${FONTE_UI};color:${LABEL_TERCIARIO};">
    A Sala dos Buscadores · curadoria do acervo${nota ? `<br>${escapar(nota)}` : ""}
  </p>
</td></tr>
</table>
</body>
</html>`;
}
