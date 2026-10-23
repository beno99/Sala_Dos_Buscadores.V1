import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ConteudoEditorial, FonteEditorial, SalaEditorial } from "@/data/types";
import { type Membro, membroDaSessao } from "@/features/auth/contas";
import { acervo } from "./store";

/*
 * Camada de acesso aos dados de sessão (DAL). Toda página, Server Action e
 * Route Handler da curadoria confere o papel por aqui: o proxy só faz uma
 * checagem otimista, e Server Actions podem ser chamadas direto por POST.
 */

export const COOKIE_SESSAO = "sdb_sessao";

export async function tokenDaSessao(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_SESSAO)?.value;
}

export async function membroAtual(): Promise<Membro | null> {
  return membroDaSessao(await tokenDaSessao());
}

/** "sem-sessao" só aparece se o proxy for contornado: o portal exige conta. */
export type Acesso =
  | { tipo: "sem-sessao" }
  | { tipo: "membro"; membro: Membro }
  | { tipo: "anfitriao"; membro: Membro }
  | { tipo: "admin"; membro: Membro };

export async function acessoAtual(): Promise<Acesso> {
  const membro = await membroAtual();
  if (!membro) return { tipo: "sem-sessao" };
  if (membro.papel === "administrador") return { tipo: "admin", membro };
  if (membro.papel === "anfitriao") return { tipo: "anfitriao", membro };
  return { tipo: "membro", membro };
}

/** Para páginas: sem sessão vai para /entrar preservando a volta. */
export async function caminhoAtual(): Promise<string> {
  return (await headers()).get("x-sdb-caminho") ?? "/";
}

export async function redirecionarParaEntrar(): Promise<never> {
  redirect(`/entrar?voltar=${encodeURIComponent(await caminhoAtual())}`);
}

export class AcessoNegado extends Error {
  constructor(mensagem = "Acesso restrito à curadoria.") {
    super(mensagem);
    this.name = "AcessoNegado";
  }
}

/** Para Server Actions e Route Handlers: sem papel de administrador, nada acontece. */
export async function exigirAdmin(): Promise<Membro> {
  const membro = await membroAtual();
  if (membro?.papel !== "administrador") throw new AcessoNegado();
  return membro;
}

// ---------- anfitriões ----------

/*
 * O anfitrião só toca no que é dele. Os ajudantes abaixo conferem o papel e a
 * posse no servidor; o administrador não passa por eles (ele não edita
 * conteúdo de anfitrião, só julga em src/server/anfitriao/revisao.ts).
 * Item de outro anfitrião e item inexistente dão o mesmo erro, para não
 * revelar o que existe.
 */

const NEGADO_ANFITRIAO = "Acesso restrito ao anfitrião dono deste item.";

/** Para Server Actions e Route Handlers: só o papel anfitrião passa. */
export async function exigirAnfitriao(): Promise<Membro> {
  const membro = await membroAtual();
  if (membro?.papel !== "anfitriao") throw new AcessoNegado("Acesso restrito a anfitriões.");
  return membro;
}

/** Posse, sem sessão: usado pelas operações, que recebem quem age já identificado. */
export function salaDoDono(salaId: string, donoId: string): SalaEditorial {
  const sala = acervo().salas.get(salaId);
  if (sala?.origem !== "anfitriao" || sala.revisao?.donoId !== donoId) {
    throw new AcessoNegado(NEGADO_ANFITRIAO);
  }
  return sala;
}

export function artigoDoDono(artigoId: string, donoId: string): ConteudoEditorial {
  const artigo = acervo().conteudos.get(artigoId);
  if (!artigo?.revisao || artigo.revisao.donoId !== donoId) throw new AcessoNegado(NEGADO_ANFITRIAO);
  return artigo;
}

/** Fonte que o anfitrião pode citar: do catálogo público ou proposta por ele mesmo. */
export function fonteVisivelAoDono(fonteId: string, donoId: string): FonteEditorial {
  const fonte = acervo().fontes.get(fonteId);
  if (!fonte || (fonte.proposta?.pendente && fonte.proposta.donoId !== donoId)) {
    throw new AcessoNegado(NEGADO_ANFITRIAO);
  }
  return fonte;
}

export async function exigirDonoDaSala(salaId: string): Promise<{ membro: Membro; sala: SalaEditorial }> {
  const membro = await exigirAnfitriao();
  return { membro, sala: salaDoDono(salaId, membro.id) };
}

export async function exigirDonoDoArtigo(
  artigoId: string,
): Promise<{ membro: Membro; artigo: ConteudoEditorial }> {
  const membro = await exigirAnfitriao();
  return { membro, artigo: artigoDoDono(artigoId, membro.id) };
}
