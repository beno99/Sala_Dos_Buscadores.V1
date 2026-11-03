import type { Convite, StatusConvite } from "@/data/types";

/*
 * Convite para ser anfitrião (§2.3): vale 7 dias e só pode ser usado uma vez.
 * "Expirado" não é guardado; sai da data de validade.
 */

export const DIAS_VALIDADE_CONVITE = 7;

export function expiraEm(criadoEm: Date): Date {
  return new Date(criadoEm.getTime() + DIAS_VALIDADE_CONVITE * 86_400_000);
}

export function statusDoConvite(c: Pick<Convite, "status" | "expiraEm">, agora = new Date()): StatusConvite {
  if (c.status !== "pendente") return c.status;
  return agora.getTime() >= new Date(c.expiraEm).getTime() ? "expirado" : "pendente";
}

/** Por que o convite não serve para cadastrar; null quando serve. */
export function erroDoConvite(
  c: Pick<Convite, "status" | "expiraEm"> | undefined,
  agora = new Date(),
): string | null {
  if (!c) return "este convite não existe. Confira o link do e-mail ou peça um novo convite.";
  switch (statusDoConvite(c, agora)) {
    case "usado":
      return "este convite já foi usado. Entre com a conta criada por ele.";
    case "revogado":
      return "este convite foi revogado pela curadoria.";
    case "expirado":
      return `este convite venceu: ele vale ${DIAS_VALIDADE_CONVITE} dias. Peça um novo à curadoria.`;
    default:
      return null;
  }
}

export const ASSUNTO_CONVITE = "Convite para ser anfitrião na Sala dos Buscadores";
export const LIMITE_NOME_CONVITE = 80;
export const LIMITE_MENSAGEM_CONVITE = 1200;

export interface PersonalizacaoConvite {
  nome: string;
  mensagem: string;
}

export const SEM_PERSONALIZACAO: PersonalizacaoConvite = { nome: "", mensagem: "" };

export function validarPersonalizacao(p: PersonalizacaoConvite): Record<string, string> {
  const erros: Record<string, string> = {};
  if (p.nome.trim().length > LIMITE_NOME_CONVITE)
    erros["campo-nome-convite"] = `o nome tem mais de ${LIMITE_NOME_CONVITE} caracteres.`;
  if (p.mensagem.trim().length > LIMITE_MENSAGEM_CONVITE)
    erros["campo-mensagem-convite"] = `a mensagem tem mais de ${LIMITE_MENSAGEM_CONVITE} caracteres.`;
  return erros;
}

export function corpoDoConvite(p: PersonalizacaoConvite, link: string): string {
  const nome = p.nome.trim().replace(/\s+/g, " ");
  const mensagem = p.mensagem.trim().replace(/\n{3,}/g, "\n\n");
  return [
    nome ? `Olá, ${nome}.` : "Olá.",
    mensagem,
    "A curadoria da Sala dos Buscadores convida você a ser anfitrião: manter uma Sala própria, com leituras suas, revisadas pela curadoria antes de ir ao ar.",
    `Para aceitar, crie sua conta por este link, que vale ${DIAS_VALIDADE_CONVITE} dias e só pode ser usado uma vez:\n${link}`,
    "Se não esperava este convite, ignore esta mensagem.",
  ]
    .filter(Boolean)
    .join("\n\n");
}
