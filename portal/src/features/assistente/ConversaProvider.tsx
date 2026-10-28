"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AparenciaEsfera, ModoEstudo } from "./contrato";
import type { Escopo, OpcoesConsulta, Resposta } from "./motor";
import { consultarAcervo } from "./servico";

export type EstadoTurno = "consultando" | "concluida" | "interrompida" | "erro";
export interface Turno {
  id: string;
  pergunta: string;
  escopo: Escopo;
  modo: ModoEstudo;
  estado: EstadoTurno;
  etapa: number;
  inicio: number;
  fim?: number;
  resposta?: Resposta;
  erro?: string;
}
interface Conversa {
  turnos: Turno[];
  gerando: boolean;
  perguntar: (pergunta: string, escopo: Escopo, modo?: ModoEstudo) => Promise<EstadoTurno>;
  gerarNovamente: (id: string) => Promise<EstadoTurno | undefined>;
  interromper: () => void;
  novaConversa: () => void;
  aparencia: AparenciaEsfera;
  setAparencia: (aparencia: AparenciaEsfera) => void;
  pausado: boolean;
  setPausado: (pausado: boolean) => void;
}
const ContextoConversa = createContext<Conversa | null>(null);
type Consultar = (pergunta: string, opcoes: OpcoesConsulta) => Promise<Resposta>;

/** Uma conversa em memória, compartilhada com o mini chat. Sem histórico fictício. */
export function ConversaProvider({
  children,
  consultar = consultarAcervo,
}: {
  children: ReactNode;
  consultar?: Consultar;
}) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [aparencia, setAparencia] = useState<AparenciaEsfera>("dark");
  const [pausado, setPausado] = useState(false);
  const controle = useRef<{ id: string; ctrl: AbortController } | null>(null);
  useEffect(
    () => () => {
      controle.current?.ctrl.abort();
      controle.current = null;
    },
    [],
  );
  const atualizar = useCallback((id: string, mudanca: Partial<Turno>) => {
    setTurnos((atual) => atual.map((t) => (t.id === id ? { ...t, ...mudanca } : t)));
  }, []);
  const executar = useCallback(
    async (turno: Turno): Promise<EstadoTurno> => {
      const ctrl = new AbortController();
      controle.current = { id: turno.id, ctrl };
      try {
        const resposta = await consultar(turno.pergunta, {
          escopo: turno.escopo,
          modo: turno.modo,
          signal: ctrl.signal,
          onEtapa: (_, etapa) => {
            if (controle.current?.ctrl === ctrl) atualizar(turno.id, { etapa });
          },
        });
        // Um adaptador que ignore abort não pode ressuscitar uma tentativa antiga.
        if (ctrl.signal.aborted || controle.current?.ctrl !== ctrl) return "interrompida";
        atualizar(turno.id, { estado: "concluida", etapa: 4, fim: Date.now(), resposta });
        return "concluida";
      } catch (e) {
        if (ctrl.signal.aborted || controle.current?.ctrl !== ctrl) return "interrompida";
        atualizar(turno.id, {
          estado: "erro",
          fim: Date.now(),
          erro:
            e instanceof Error && e.message.startsWith("Erro:")
              ? e.message
              : "Erro: não foi possível consultar o acervo. Sua pergunta foi preservada; tente novamente.",
        });
        return "erro";
      } finally {
        if (controle.current?.ctrl === ctrl) controle.current = null;
      }
    },
    [consultar, atualizar],
  );
  const perguntar = useCallback(
    async (pergunta: string, escopo: Escopo, modo: ModoEstudo = "explorar") => {
      if (controle.current || !pergunta.trim()) return "interrompida" as const;
      const anterior = turnos.at(-1);
      const repetir =
        anterior &&
        ["erro", "interrompida"].includes(anterior.estado) &&
        anterior.pergunta === pergunta &&
        anterior.escopo === escopo &&
        anterior.modo === modo;
      const turno: Turno = {
        id: repetir ? anterior.id : crypto.randomUUID(),
        pergunta,
        escopo,
        modo,
        estado: "consultando",
        etapa: 0,
        inicio: Date.now(),
      };
      setTurnos((atuais) =>
        repetir ? atuais.map((t) => (t.id === turno.id ? turno : t)) : [...atuais, turno],
      );
      return executar(turno);
    },
    [executar, turnos],
  );
  const gerarNovamente = useCallback(
    async (id: string) => {
      const turno = turnos.find((t) => t.id === id);
      if (!turno || controle.current) return undefined;
      const novo: Turno = {
        ...turno,
        estado: "consultando",
        etapa: 0,
        inicio: Date.now(),
        fim: undefined,
        resposta: undefined,
        erro: undefined,
      };
      atualizar(id, novo);
      return executar(novo);
    },
    [turnos, atualizar, executar],
  );
  const interromper = useCallback(() => {
    const atual = controle.current;
    if (!atual) return;
    atual.ctrl.abort();
    controle.current = null;
    atualizar(atual.id, { estado: "interrompida", fim: Date.now() });
  }, [atualizar]);
  const novaConversa = useCallback(() => {
    controle.current?.ctrl.abort();
    controle.current = null;
    setTurnos([]);
  }, []);
  const gerando = turnos.some((t) => t.estado === "consultando");
  const valor = useMemo(
    () => ({
      turnos,
      gerando,
      perguntar,
      gerarNovamente,
      interromper,
      novaConversa,
      aparencia,
      setAparencia,
      pausado,
      setPausado,
    }),
    [turnos, gerando, perguntar, gerarNovamente, interromper, novaConversa, aparencia, pausado],
  );
  return <ContextoConversa.Provider value={valor}>{children}</ContextoConversa.Provider>;
}
export function useConversa(): Conversa {
  const c = useContext(ContextoConversa);
  if (!c) throw new Error("useConversa precisa de <ConversaProvider>.");
  return c;
}
