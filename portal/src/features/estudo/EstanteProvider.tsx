"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { alternarEstanteAcao } from "./acoes";
import { chaveEstante, type TipoEstante } from "./estante";

interface ContextoEstante {
  salvo: (tipo: TipoEstante, ref: string) => boolean;
  alternar: (tipo: TipoEstante, ref: string) => Promise<void>;
}

const Contexto = createContext<ContextoEstante | null>(null);

/**
 * Estado da Estante no navegador: começa com o que o servidor mandou e muda na
 * hora do clique (otimista). Se o servidor recusar, volta ao estado anterior.
 * Depois de gravar, atualiza a página para a lateral e a Estante refletirem.
 */
export function EstanteProvider({ chaves, children }: { chaves: string[]; children: ReactNode }) {
  const router = useRouter();
  const [salvos, setSalvos] = useState(() => new Set(chaves));
  // O servidor manda uma lista nova depois de cada refresh.
  const assinatura = chaves.join("|");
  // biome-ignore lint/correctness/useExhaustiveDependencies: a assinatura resume a lista recebida.
  useEffect(() => setSalvos(new Set(chaves)), [assinatura]);

  const alternar = useCallback(
    async (tipo: TipoEstante, ref: string) => {
      const chave = chaveEstante(tipo, ref);
      const inverter = (atual: Set<string>) => {
        const novo = new Set(atual);
        if (novo.has(chave)) novo.delete(chave);
        else novo.add(chave);
        return novo;
      };
      setSalvos(inverter);
      const r = await alternarEstanteAcao(tipo, ref);
      if (!r) {
        setSalvos(inverter);
        return;
      }
      router.refresh();
    },
    [router],
  );

  const valor = useMemo<ContextoEstante>(
    () => ({ salvo: (tipo, ref) => salvos.has(chaveEstante(tipo, ref)), alternar }),
    [salvos, alternar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

/** Fora do provider (testes de peças isoladas), nada fica salvo e o clique não faz nada. */
export function useEstante(): ContextoEstante {
  return useContext(Contexto) ?? { salvo: () => false, alternar: async () => {} };
}
