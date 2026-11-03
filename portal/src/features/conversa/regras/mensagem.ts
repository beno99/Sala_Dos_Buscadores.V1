export const LIMITE_MENSAGEM = 2000;

/** Normaliza a mensagem (quebras de linha, espaços nas pontas, no máximo uma linha em branco seguida). */
export function normalizarMensagem(bruto: unknown): string {
  return String(bruto ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validarMensagem(bruto: unknown): { ok: true; texto: string } | { ok: false; erro: string } {
  const texto = normalizarMensagem(bruto);
  if (!texto) return { ok: false, erro: "escreva a mensagem antes de enviar." };
  if (texto.length > LIMITE_MENSAGEM)
    return { ok: false, erro: `a mensagem passa de ${LIMITE_MENSAGEM.toLocaleString("pt-BR")} caracteres.` };
  return { ok: true, texto };
}

/** Chave da conversa direta entre duas contas: o par em ordem, igual para os dois lados. */
export const chaveConversa = (a: string, b: string) => (a < b ? `${a}:${b}` : `${b}:${a}`);

export const LIMITE_ENVIOS = { quantidade: 30, janelaMin: 10 };

export type RecusaEnvio = "si-mesmo" | "destino-inexistente" | "bloqueio" | "excesso";

/** Quem pode mandar mensagem direta a quem. Devolve o motivo da recusa ou null. */
export function recusaDeEnvio(p: {
  remetenteId: string;
  destinatarioId: string;
  destinoAtivo: boolean;
  bloqueado: boolean;
  enviadasNaJanela: number;
}): RecusaEnvio | null {
  if (p.remetenteId === p.destinatarioId) return "si-mesmo";
  if (!p.destinoAtivo) return "destino-inexistente";
  if (p.bloqueado) return "bloqueio";
  if (p.enviadasNaJanela >= LIMITE_ENVIOS.quantidade) return "excesso";
  return null;
}

export const TEXTO_RECUSA: Record<RecusaEnvio, string> = {
  "si-mesmo": "não é possível enviar mensagem para a própria conta.",
  "destino-inexistente": "esta conta não está disponível para mensagens.",
  bloqueio: "não é possível enviar mensagens nesta conversa.",
  excesso: `você enviou muitas mensagens em pouco tempo. Espere ${LIMITE_ENVIOS.janelaMin} minutos e tente de novo.`,
};

export interface Anexo {
  midia: string;
  nome: string;
  tipo: string;
}

export const LIMITE_ANEXOS = 4;

export type PapelConta = "membro" | "anfitriao" | "administrador";

/** Buscador só escreve; anfitrião e curadoria também anexam imagens e PDF. */
export const podeAnexar = (papel: PapelConta) => papel === "anfitriao" || papel === "administrador";

export const ROTULO_PAPEL: Record<PapelConta, string> = {
  administrador: "Curadoria",
  anfitriao: "Anfitrião",
  membro: "Buscador",
};

/** Nome de arquivo exibível: sem caminho, sem caracteres de controle, até 120 caracteres. */
export function nomeDeArquivo(bruto: unknown): string {
  const nome = String(bruto ?? "")
    .split(/[\\/]/)
    .pop()
    // biome-ignore lint/suspicious/noControlCharactersInRegex: remove caracteres de controle do nome do arquivo.
    ?.replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 120);
  return nome || "anexo";
}

/** Texto e anexos de um envio. Os ids dos anexos ainda precisam ser conferidos contra o dono no servidor. */
export function validarEnvio(
  textoBruto: unknown,
  anexosBrutos: unknown,
  papel: PapelConta,
): { ok: true; texto: string; anexos: { midia: string; nome: string }[] } | { ok: false; erro: string } {
  const lista = Array.isArray(anexosBrutos) ? anexosBrutos : [];
  if (lista.length && !podeAnexar(papel)) return { ok: false, erro: "buscadores enviam só texto." };
  if (lista.length > LIMITE_ANEXOS)
    return { ok: false, erro: `anexe no máximo ${LIMITE_ANEXOS} arquivos por mensagem.` };
  const anexos = lista.map((a) => ({
    midia: String((a as { midia?: unknown })?.midia ?? ""),
    nome: nomeDeArquivo((a as { nome?: unknown })?.nome),
  }));
  if (anexos.some((a) => !/^m-[A-Za-z0-9_-]{6,40}$/.test(a.midia)))
    return { ok: false, erro: "anexo inválido. Envie o arquivo de novo." };
  if (new Set(anexos.map((a) => a.midia)).size !== anexos.length)
    return { ok: false, erro: "o mesmo arquivo foi anexado duas vezes." };
  const texto = normalizarMensagem(textoBruto);
  if (!texto && !anexos.length) return { ok: false, erro: "escreva a mensagem antes de enviar." };
  if (texto.length > LIMITE_MENSAGEM)
    return { ok: false, erro: `a mensagem passa de ${LIMITE_MENSAGEM.toLocaleString("pt-BR")} caracteres.` };
  return { ok: true, texto, anexos };
}
