import { htmlEmail } from "@/server/email-padrao";

export function emailVerificacao({ pseudonimo, link }: { pseudonimo: string; link: string }) {
  const assunto = "Confirme seu e-mail na Sala dos Buscadores";
  const paragrafos = [
    `Olá, ${pseudonimo}. Falta um passo para abrir sua conta: confirme que este e-mail é seu.`,
  ];
  const corpo = [
    ...paragrafos,
    `Confirme seu e-mail neste link:\n${link}`,
    "Se não foi você quem criou esta conta, ignore esta mensagem.",
  ].join("\n\n");
  const html = htmlEmail({
    titulo: "Confirme seu e-mail",
    paragrafos,
    botao: { rotulo: "Confirmar e-mail", link },
    nota: "Se não foi você quem criou esta conta, ignore esta mensagem.",
  });
  return { assunto, corpo, html };
}
