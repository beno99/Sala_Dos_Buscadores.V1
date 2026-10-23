"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";

export interface OpcoesToast {
  title?: string;
  variant?: "erro";
  action?: string;
  onAction?: () => void;
  icon?: IconName;
  duration?: number;
  /** Texto pronto para selecionar (o link, quando a área de transferência é recusada). */
  select?: string;
}

interface ItemToast extends OpcoesToast {
  id: number;
  message: string;
  estado: "enter" | "idle" | "exit";
}

type Disparar = (message: string, opcoes?: OpcoesToast) => void;

const ContextoToast = createContext<Disparar | null>(null);

/** Confirmações breves (Toast). Máximo de 3 visíveis; o tempo pausa no hover. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemToast[]>([]);
  const proximo = useRef(0);

  const remover = useCallback((id: number) => {
    setItens((atual) => atual.map((t) => (t.id === id ? { ...t, estado: "exit" } : t)));
    setTimeout(() => setItens((atual) => atual.filter((t) => t.id !== id)), 220);
  }, []);

  const disparar = useCallback<Disparar>(
    (message, opcoes = {}) => {
      proximo.current += 1;
      const novo: ItemToast = { ...opcoes, id: proximo.current, message, estado: "enter" };
      setItens((atual) => {
        const vivos = atual.filter((t) => t.estado !== "exit");
        const excedente = vivos.length >= 3 ? vivos[0] : undefined;
        if (excedente) setTimeout(() => remover(excedente.id), 0);
        return [...atual, novo];
      });
    },
    [remover],
  );

  const entrar = useCallback((id: number) => {
    setItens((atual) =>
      atual.map((t) => (t.id === id && t.estado === "enter" ? { ...t, estado: "idle" } : t)),
    );
  }, []);

  return (
    <ContextoToast.Provider value={disparar}>
      {children}
      <section className="sdb-toaster" aria-live="polite" aria-label="Notificações">
        {itens.map((t) => (
          <Toast key={t.id} item={t} remover={remover} entrar={entrar} />
        ))}
      </section>
    </ContextoToast.Provider>
  );
}

function Toast({
  item,
  remover,
  entrar,
}: {
  item: ItemToast;
  remover: (id: number) => void;
  entrar: (id: number) => void;
}) {
  const { id } = item;
  const erro = item.variant === "erro";
  const restante = useRef(item.duration ?? 4200);
  const inicio = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const aoFechar = useCallback(() => remover(id), [remover, id]);

  const armar = useCallback(() => {
    clearTimeout(timer.current);
    inicio.current = Date.now();
    timer.current = setTimeout(aoFechar, restante.current);
  }, [aoFechar]);

  useEffect(() => {
    // Dois quadros para a transição de entrada partir do estado "enter".
    const q = requestAnimationFrame(() => requestAnimationFrame(() => entrar(id)));
    armar();
    return () => {
      cancelAnimationFrame(q);
      clearTimeout(timer.current);
    };
  }, [entrar, id, armar]);

  const pausar = () => {
    clearTimeout(timer.current);
    restante.current -= Date.now() - inicio.current;
  };

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions lint/a11y/noStaticElementInteractions: pausar no hover só estende o tempo de leitura; o botão Fechar é o controle.
    <div
      className={cx("sdb-toast", erro && "sdb-toast--error")}
      role={erro ? "alert" : "status"}
      data-state={item.estado === "idle" ? undefined : item.estado}
      onMouseEnter={pausar}
      onMouseLeave={armar}
    >
      <span className="sdb-toast__icon">
        <Icon name={item.icon ?? (erro ? "erro" : "check")} />
      </span>
      <div className="sdb-toast__msg">
        {item.title && <strong>{item.title}</strong>}
        <span>{item.message}</span>
        {item.select && <span className="sdb-toast__select">{item.select}</span>}
      </div>
      {item.action && (
        <button
          type="button"
          className="sdb-btn sdb-btn--tinted sdb-btn--sm sdb-toast__action"
          onClick={() => {
            item.onAction?.();
            aoFechar();
          }}
        >
          {item.action}
        </button>
      )}
      <button type="button" className="sdb-toast__close" aria-label="Fechar notificação" onClick={aoFechar}>
        <Icon name="fechar" size="sm" />
      </button>
    </div>
  );
}

export function useToast(): Disparar {
  const disparar = useContext(ContextoToast);
  if (!disparar) throw new Error("useToast precisa de <ToastProvider>.");
  return disparar;
}

/** Copia texto e confirma com toast; se a área de transferência for recusada, avisa. */
export function useCopiar() {
  const toast = useToast();
  return useCallback(
    async (texto: string, confirmacao = "Copiado para a área de transferência.") => {
      try {
        await navigator.clipboard.writeText(texto);
        toast(confirmacao);
      } catch {
        toast("Selecione o texto e copie manualmente.", {
          variant: "erro",
          title: "Erro: não foi possível copiar",
        });
      }
    },
    [toast],
  );
}
