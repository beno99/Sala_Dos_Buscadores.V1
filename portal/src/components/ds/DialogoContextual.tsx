"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { IconeVolume, type SimboloVolume } from "./EstadosInterface";
import { InterfaceIcon } from "./InterfaceIcon";

/** Diálogo de orientação. O elemento nativo mantém o foco e permite fechar por Escape. */
export function DialogoContextual({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  simbolo = "livro",
  children,
  acao,
  rotuloVoltar = "Voltar",
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  subtitulo?: string;
  simbolo?: SimboloVolume;
  children: ReactNode;
  acao?: { rotulo: string; executar: () => void; desabilitada?: boolean };
  rotuloVoltar?: string;
}) {
  const id = useId();
  const painel = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = painel.current;
    if (!el) return;
    if (aberto && !el.open) el.showModal();
    else if (!aberto && el.open) el.close();
  }, [aberto]);
  return (
    <dialog
      ref={painel}
      className="sdb-ui-dialog"
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-descricao`}
      onCancel={(event) => {
        event.preventDefault();
        onFechar();
      }}
    >
      <button type="button" className="sdb-ui-dialog-close" aria-label="Fechar diálogo" onClick={onFechar}>
        <InterfaceIcon name="fechar" />
      </button>
      <IconeVolume simbolo={simbolo} />
      {subtitulo && <p className="sdb-ui-eyebrow">{subtitulo}</p>}
      <h2 id={`${id}-titulo`}>{titulo}</h2>
      <div id={`${id}-descricao`} className="sdb-ui-dialog-description">
        {children}
      </div>
      <div className="sdb-ui-dialog-actions">
        <button type="button" className="sdb-ui-secondary" onClick={onFechar}>
          <InterfaceIcon name="voltar" />
          {rotuloVoltar}
        </button>
        {acao && (
          <button
            type="button"
            className="sdb-ui-primary"
            disabled={acao.desabilitada}
            onClick={acao.executar}
          >
            {acao.rotulo}
            <InterfaceIcon name="seta" />
          </button>
        )}
      </div>
    </dialog>
  );
}
