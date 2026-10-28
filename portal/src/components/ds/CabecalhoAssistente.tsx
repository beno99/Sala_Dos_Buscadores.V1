"use client";

import type { ReactNode } from "react";
import { useConversa } from "@/features/assistente/ConversaProvider";
import { Icon } from "./Icon";

/** Cabeçalho da TelaAssistente, no lugar da barra superior da moldura. */
export function CabecalhoAssistente({ conta, onBuscar }: { conta: ReactNode; onBuscar: () => void }) {
  const { aparencia, setAparencia, pausado, setPausado } = useConversa();
  return (
    <header className="topbar">
      <div className="page-path">
        <Icon name="assistente" />
        <span>Assistente do acervo</span>
      </div>
      <div className="appearance">
        <span className="appearance-label">Esfera</span>
        <div className="appearance-switch" role="group" aria-label="Aparência da esfera">
          <button type="button" aria-pressed={aparencia === "gold"} onClick={() => setAparencia("gold")}>
            <i className="swatch swatch--gold" aria-hidden="true" />
            Dourada
          </button>
          <button type="button" aria-pressed={aparencia === "dark"} onClick={() => setAparencia("dark")}>
            <i className="swatch swatch--dark" aria-hidden="true" />
            Escura
          </button>
        </div>
        <button
          type="button"
          className="icon-control"
          aria-label={pausado ? "Retomar movimento" : "Pausar movimento"}
          aria-pressed={pausado}
          onClick={() => setPausado(!pausado)}
        >
          <Icon name={pausado ? "play" : "pausar"} />
        </button>
        <button
          type="button"
          className="icon-control"
          aria-label="Buscar no acervo"
          aria-haspopup="dialog"
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onBuscar}
        >
          <Icon name="busca" />
        </button>
        {conta}
      </div>
    </header>
  );
}
