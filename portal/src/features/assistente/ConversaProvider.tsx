"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  consultar as consultarPadrao,
  type Escopo,
  type Etapa,
  type OpcoesConsulta,
  type Resposta,
} from "./motor";

export type EstadoTurno = "consultando" | "concluida" | "interrompida" | "erro";

export interface Turno {
  id: string;
  pergunta: string;
  escopo: Escopo;
  estado: EstadoTurno;
  etapa: number;
  inicio: number;
  fim?: number;
  resposta?: Resposta;
}

interface Conversa {
  turnos: Turno[];
  gerando: boolean;
  /** Resolve com o estado final do turno. */
  perguntar: (pergunta: string, escopo: Escopo) => Promise<EstadoTurno>;
  gerarNovamente: (id: string) => Promise<EstadoTurno | undefined>;
  interromper: () => void;
}

const ContextoConversa = createContext<Conversa | null>(null);

type Consultar = (pergunta: string, opcoes: OpcoesConsulta) => Promise<Resposta>;

/**
 * Guarda a conversa com o assistente enquanto a pessoa navega pelo portal
 * (só em memória). `consultar` pode ser trocado por uma chamada real.
 */
export function ConversaProvider({
  children,
  consultar = consultarPadrao,
}: {
  children: ReactNode;
  consultar?: Consultar;
}) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const controle = useRef<AbortController | null>(null);

  const atualizar = useCallback((id: string, mudanca: Partial<Turno>) => {
    setTurnos((atual) => atual.map((t) => (t.id === id ? { ...t, ...mudanca } : t)));
  }, []);

  const executar = useCallback(
    async (id: string, pergunta: string, escopo: Escopo): Promise<EstadoTurno> => {
      controle.current?.abort();
      const ctrl = new AbortController();
      controle.current = ctrl;
      try {
        const resposta = await consultar(pergunta, {
          escopo,
          signal: ctrl.signal,
          onEtapa: (_: Etapa, indice: number) => atualizar(id, { etapa: indice }),
        });
        atualizar(id, { estado: "concluida", etapa: 4, fim: Date.now(), resposta });
        return "concluida";
      } catch (e) {
        const estado = e instanceof DOMException && e.name === "AbortError" ? "interrompida" : "erro";
        atualizar(id, { estado, fim: Date.now() });
        return estado;
      } finally {
        if (controle.current === ctrl) controle.current = null;
      }
    },
    [consultar, atualizar],
  );

  const perguntar = useCallback(
    async (pergunta: string, escopo: Escopo) => {
      const id = `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      setTurnos((atual) => [
        ...atual,
        { id, pergunta, escopo, estado: "consultando", etapa: 0, inicio: Date.now() },
      ]);
      return executar(id, pergunta, escopo);
    },
    [executar],
  );

  const gerarNovamente = useCallback(
    async (id: string) => {
      const turno = turnos.find((t) => t.id === id);
      if (!turno) return undefined;
      atualizar(id, {
        estado: "consultando",
        etapa: 0,
        inicio: Date.now(),
        fim: undefined,
        resposta: undefined,
      });
      return executar(id, turno.pergunta, turno.escopo);
    },
    [turnos, atualizar, executar],
  );

  const interromper = useCallback(() => controle.current?.abort(), []);

  const gerando = turnos.some((t) => t.estado === "consultando");
  const valor = useMemo(
    () => ({ turnos, gerando, perguntar, gerarNovamente, interromper }),
    [turnos, gerando, perguntar, gerarNovamente, interromper],
  );
  return <ContextoConversa.Provider value={valor}>{children}</ContextoConversa.Provider>;
}

export function useConversa(): Conversa {
  const c = useContext(ContextoConversa);
  if (!c) throw new Error("useConversa precisa de <ConversaProvider>.");
  return c;
}
