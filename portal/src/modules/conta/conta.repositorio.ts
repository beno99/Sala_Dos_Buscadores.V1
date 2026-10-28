import "server-only";
import { and, asc, eq, gt } from "drizzle-orm";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { somarVersao } from "@/modules/compartilhado/banco/versao";
import type { ContaRepositorio, Membro, RedefinicaoRepositorio, SessaoRepositorio } from "./conta.contratos";
import { redefinicoesSenha, sessoes, usuarios } from "./conta.schema";

/* Implementação Postgres dos contratos de conta. */

type Linha = typeof usuarios.$inferSelect;

const paraMembro = (l: Linha): Membro => ({
  id: l.id,
  pseudonimo: l.pseudonimo,
  email: l.email,
  papel: l.papel,
  membroDesde: new Date(l.membroDesde).toISOString(),
  preferencias: l.preferencias ?? null,
});

const normalizar = (email: string) => email.trim().toLowerCase();

async function uma(where: ReturnType<typeof eq>): Promise<Linha | undefined> {
  const [linha] = await banco().select().from(usuarios).where(where).limit(1);
  return linha;
}

const ouvintes = new Set<(membro: Membro) => void>();

/** Avisa a cada conta criada ou alterada (o diretório de contas do snapshot se mantém em dia). */
export function aoMudarConta(ouvinte: (membro: Membro) => void) {
  ouvintes.add(ouvinte);
}

function avisar(linha: Linha | undefined): Membro | null {
  if (!linha) return null;
  const membro = paraMembro(linha);
  for (const ouvinte of ouvintes) ouvinte(membro);
  return membro;
}

/** Toda mudança de conta soma a versão dos dados: as outras instâncias recarregam o diretório de contas. */
async function atualizar(id: string, campos: Partial<Linha>): Promise<Membro | null> {
  const linha = await banco().transaction(async (tx) => {
    const [nova] = await tx.update(usuarios).set(campos).where(eq(usuarios.id, id)).returning();
    if (nova) await somarVersao(tx);
    return nova;
  });
  return avisar(linha);
}

export const contaRepositorio: ContaRepositorio = {
  async credenciais(email) {
    const linha = await uma(eq(usuarios.email, normalizar(email)));
    return linha ? { membro: paraMembro(linha), senhaHash: linha.senhaHash } : null;
  },
  async porId(id) {
    const linha = await uma(eq(usuarios.id, id));
    return linha ? paraMembro(linha) : null;
  },
  async porEmail(email) {
    const linha = await uma(eq(usuarios.email, normalizar(email)));
    return linha ? paraMembro(linha) : null;
  },
  async listar() {
    return (await banco().select().from(usuarios).orderBy(asc(usuarios.membroDesde))).map(paraMembro);
  },
  async criar(conta) {
    const linha = await banco().transaction(async (tx) => {
      const [criada] = await tx
        .insert(usuarios)
        .values({ ...conta, email: normalizar(conta.email) })
        .returning();
      await somarVersao(tx);
      return criada;
    });
    const membro = avisar(linha);
    if (!membro) throw new Error("conta não criada");
    return membro;
  },
  async definirPapel(id, papel) {
    return atualizar(id, { papel });
  },
  async definirPreferencias(id, preferencias) {
    return atualizar(id, { preferencias });
  },
  async definirSenha(id, senhaHash) {
    await banco().update(usuarios).set({ senhaHash }).where(eq(usuarios.id, id));
  },
};

export const sessaoRepositorio: SessaoRepositorio = {
  async criar({ tokenHash, usuarioId, expiraEm }) {
    await banco().insert(sessoes).values({ tokenHash, usuarioId, expiraEm: expiraEm.toISOString() });
  },
  async membro(tokenHash, agora) {
    const [linha] = await banco()
      .select({ u: usuarios })
      .from(sessoes)
      .innerJoin(usuarios, eq(usuarios.id, sessoes.usuarioId))
      .where(and(eq(sessoes.tokenHash, tokenHash), gt(sessoes.expiraEm, agora.toISOString())))
      .limit(1);
    return linha ? paraMembro(linha.u) : null;
  },
  async apagar(tokenHash) {
    await banco().delete(sessoes).where(eq(sessoes.tokenHash, tokenHash));
  },
  async apagarDoUsuario(usuarioId) {
    await banco().delete(sessoes).where(eq(sessoes.usuarioId, usuarioId));
  },
};

export const redefinicaoRepositorio: RedefinicaoRepositorio = {
  async criar({ tokenHash, usuarioId, expiraEm }) {
    await banco().transaction(async (tx) => {
      await tx.delete(redefinicoesSenha).where(eq(redefinicoesSenha.usuarioId, usuarioId));
      await tx.insert(redefinicoesSenha).values({ tokenHash, usuarioId, expiraEm: expiraEm.toISOString() });
    });
  },
  async consumir(tokenHash, agora) {
    const [linha] = await banco()
      .delete(redefinicoesSenha)
      .where(
        and(eq(redefinicoesSenha.tokenHash, tokenHash), gt(redefinicoesSenha.expiraEm, agora.toISOString())),
      )
      .returning({ usuarioId: redefinicoesSenha.usuarioId });
    return linha?.usuarioId ?? null;
  },
  async valido(tokenHash, agora) {
    const [linha] = await banco()
      .select({ t: redefinicoesSenha.tokenHash })
      .from(redefinicoesSenha)
      .where(
        and(eq(redefinicoesSenha.tokenHash, tokenHash), gt(redefinicoesSenha.expiraEm, agora.toISOString())),
      )
      .limit(1);
    return Boolean(linha);
  },
};
