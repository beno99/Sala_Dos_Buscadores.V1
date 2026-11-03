import "server-only";
import { type Anexo, chaveConversa, type PapelConta } from "@/features/conversa/regras/mensagem";
import {
  bloqueou,
  haBloqueio,
  type MensagemCuradoria,
  type MensagemDireta,
  mensagensDaConversa,
  mensagensDoAnfitriao,
  naoLidasPorRemetente,
  ultimasDiretasDaConta,
  ultimasMensagens,
} from "@/modules/conversa/conversa.repositorio";
import { painelDoAnfitriao } from "../anfitriao/consultas";
import { urlDaMidia } from "../midia";
import { perfilDe } from "../perfilBuscador";
import { contaNoDiretorio } from "../store";

export interface AutorVisivel {
  id: string;
  nome: string;
  papel: PapelConta;
  href?: string;
  foto?: string;
}

export interface AnexoVisivel extends Anexo {
  url: string;
}

export interface MensagemVisivel {
  id: string;
  texto: string;
  criadaEm: string;
  autor: AutorVisivel;
  minha: boolean;
  anexos: AnexoVisivel[];
}

export const nomeDaConta = (contaId: string) =>
  painelDoAnfitriao(contaId).perfil?.nome ?? contaNoDiretorio(contaId)?.pseudonimo ?? "Conta removida";

/** Mantido para as telas da conversa com a curadoria. */
export const nomeDoAnfitriao = nomeDaConta;

export function autorVisivel(contaId: string): AutorVisivel {
  const conta = contaNoDiretorio(contaId);
  const papel: PapelConta = conta?.papel ?? "membro";
  const foto = papel === "anfitriao" ? undefined : perfilDe(contaId).foto;
  return {
    id: contaId,
    nome: nomeDaConta(contaId),
    papel,
    ...(conta && papel !== "administrador" ? { href: `/perfil/${contaId}` } : {}),
    ...(foto ? { foto } : {}),
  };
}

const anexosVisiveis = (anexos: Anexo[] | null | undefined): AnexoVisivel[] =>
  (anexos ?? []).map((a) => ({ ...a, url: urlDaMidia(a.midia) }));

function visivel(m: MensagemCuradoria | MensagemDireta, autorId: string, leitorId: string): MensagemVisivel {
  return {
    id: m.id,
    texto: m.texto,
    criadaEm: m.criadaEm,
    autor: autorVisivel(autorId),
    minha: autorId === leitorId,
    anexos: anexosVisiveis(m.anexos),
  };
}

// ---------- canal com a curadoria (qualquer conta que não seja da curadoria) ----------

/** Do ponto de vista de quem lê: o dono da conversa ou um curador. */
export async function conversaComCuradoria(donoId: string, leitorId: string): Promise<MensagemVisivel[]> {
  return (await mensagensDoAnfitriao(donoId)).map((m) => visivel(m, m.autorId, leitorId));
}

/** Compatível com a tela do anfitrião. */
export const conversaDoAnfitriao = (anfitriaoId: string) => conversaComCuradoria(anfitriaoId, anfitriaoId);

export async function conversasDaCuradoria() {
  return (await ultimasMensagens()).map((m) => ({
    contaId: m.anfitriaoId,
    nome: nomeDaConta(m.anfitriaoId),
    papel: autorVisivel(m.anfitriaoId).papel,
    ultima: m.texto || (m.anexos?.length ? "Anexo" : ""),
    daCuradoria: m.autorId !== m.anfitriaoId,
    aguardando: m.autorId === m.anfitriaoId,
  }));
}

// ---------- mensagens diretas ----------

export interface ConversaNaCaixa {
  outro: AutorVisivel;
  ultima: string;
  criadaEm: string;
  minha: boolean;
  naoLidas: number;
}

export async function caixaDeEntrada(contaId: string): Promise<ConversaNaCaixa[]> {
  const [ultimas, naoLidas] = await Promise.all([
    ultimasDiretasDaConta(contaId),
    naoLidasPorRemetente(contaId),
  ]);
  return ultimas.map((m) => {
    const outroId = m.remetenteId === contaId ? m.destinatarioId : m.remetenteId;
    return {
      outro: autorVisivel(outroId),
      ultima: m.texto || (m.anexos?.length ? "Anexo" : ""),
      criadaEm: m.criadaEm,
      minha: m.remetenteId === contaId,
      naoLidas: naoLidas.get(outroId) ?? 0,
    };
  });
}

export async function totalNaoLidas(contaId: string): Promise<number> {
  let total = 0;
  for (const n of (await naoLidasPorRemetente(contaId)).values()) total += n;
  return total;
}

export async function conversaDireta(contaId: string, outroId: string) {
  const [mensagens, bloqueada, euBloqueei] = await Promise.all([
    mensagensDaConversa(chaveConversa(contaId, outroId)),
    haBloqueio(contaId, outroId),
    bloqueou(contaId, outroId),
  ]);
  return {
    mensagens: mensagens.map((m) => visivel(m, m.remetenteId, contaId)),
    bloqueada,
    euBloqueei,
  };
}
