"use client";

import { type ReactNode, useId } from "react";
import { Button } from "./Button";
import { Sheet } from "./Sheet";

/** Sheet já prende o foco, trata Escape e devolve o foco ao gatilho. */
export function PainelComentarios({
  aberto,
  onFechar,
  children,
  campo,
}: {
  aberto: boolean;
  onFechar: () => void;
  children: ReactNode;
  campo: ReactNode;
}) {
  const id = useId();
  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={id} className="sdb-community-dialog">
      <header className="sdb-community-dialog__head">
        <h2 id={id} className="sdb-title-2">
          Comentários
        </h2>
        <Button variant="plain" iconOnly icon="fechar" aria-label="Fechar comentários" onClick={onFechar} />
      </header>
      <div className="sdb-community-dialog__body">{children}</div>
      <footer className="sdb-community-dialog__foot">{campo}</footer>
    </Sheet>
  );
}
