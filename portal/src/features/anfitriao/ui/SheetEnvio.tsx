"use client";

import { type ReactNode, useId } from "react";
import { Button } from "@/components/ds/Button";
import { Checkbox } from "@/components/ds/Campos";
import { Icon } from "@/components/ds/Icon";
import { Sheet } from "@/components/ds/Sheet";
import { ROTULO_ACEITE } from "./Diretrizes";

/**
 * Envio para revisão (Modal › sheet): o que vai junto e o aceite de direitos,
 * obrigatório e registrado no envio (§3.4).
 */
export function SheetEnvio({
  aberto,
  titulo,
  children,
  aceite,
  onAceite,
  erro,
  enviando,
  onEnviar,
  onFechar,
}: {
  aberto: boolean;
  titulo: string;
  children?: ReactNode;
  aceite: boolean;
  onAceite: (v: boolean) => void;
  erro: string | null;
  enviando: boolean;
  onEnviar: () => void;
  onFechar: () => void;
}) {
  const id = useId();
  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          {titulo}
        </h2>
        <Button variant="primary" size="sm" loading={enviando} onClick={onEnviar}>
          Enviar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        {children}
        <Checkbox
          id={`${id}-aceite`}
          label={ROTULO_ACEITE}
          help="Fica registrado com seu nome e a data do envio."
          checked={aceite}
          error={Boolean(erro && !aceite)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          onChange={(e) => onAceite(e.target.checked)}
        />
        {erro && (
          <p id={`${id}-erro`} className="sdb-error-msg" role="alert">
            <Icon name="erro" />
            <span>
              <b>Erro:</b> {erro}
            </span>
          </p>
        )}
        <p className="sdb-help m-0">
          A curadoria aprova ou devolve com motivo. Enquanto isso, o que foi enviado não pode ser editado.
        </p>
      </div>
    </Sheet>
  );
}
