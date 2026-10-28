"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Membro, Resultado } from "@/modules/conta/conta.contratos";
import { cadastrarAcao, entrarAcao, sairAcao } from "./acoes";

interface Sessao {
  /** null só nas telas de conta: o resto do portal exige sessão. */
  membro: Membro | null;
  /** Atualiza o membro depois de uma Server Action (ex.: preferências salvas). */
  atualizar: (membro: Membro) => void;
  entrar: (email: string, senha: string) => Promise<Resultado<Membro>>;
  cadastrar: (dados: { pseudonimo: string; email: string; senha: string }) => Promise<Resultado<Membro>>;
  sair: () => Promise<void>;
}

const ContextoSessao = createContext<Sessao | null>(null);

/**
 * Sessão do lado do cliente. A fonte da verdade é o cookie httpOnly lido no
 * servidor (src/server/sessao.ts); o layout raiz entrega o membro atual em
 * `inicial`, e as ações de conta são Server Actions.
 */
export function SessaoProvider({
  children,
  inicial = null,
}: {
  children: ReactNode;
  inicial?: Membro | null;
}) {
  const router = useRouter();
  const [membro, setMembro] = useState<Membro | null>(inicial);

  useEffect(() => setMembro(inicial), [inicial]);

  const entrar = useCallback(async (email: string, senha: string) => {
    const r = await entrarAcao(email, senha);
    if (r.ok) setMembro(r.valor);
    return r;
  }, []);

  const cadastrar = useCallback<Sessao["cadastrar"]>(async (dados) => {
    const r = await cadastrarAcao(dados);
    if (r.ok) setMembro(r.valor);
    return r;
  }, []);

  const sair = useCallback(async () => {
    await sairAcao();
    setMembro(null);
    router.push("/entrar");
    router.refresh();
  }, [router]);

  const valor = useMemo(
    () => ({ membro, atualizar: setMembro, entrar, cadastrar, sair }),
    [membro, entrar, cadastrar, sair],
  );
  return <ContextoSessao.Provider value={valor}>{children}</ContextoSessao.Provider>;
}

export function useSessao(): Sessao {
  const s = useContext(ContextoSessao);
  if (!s) throw new Error("useSessao precisa de <SessaoProvider>.");
  return s;
}
