"use client";

import { type ReactNode, useEffect, useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { Sheet } from "@/components/ds/Sheet";
import { MOTIVO_MINIMO, validarMotivo } from "@/features/anfitriao/regras/ciclo";

/**
 * Motivo obrigatório (Modal › sheet): toda reprovação e toda recusa de
 * candidatura levam um motivo de pelo menos ~20 caracteres, que vai para o
 * anfitrião (painel e e-mail).
 */
export function SheetMotivo({
  aberto,
  titulo,
  rotuloConfirmar,
  children,
  carregando,
  onConfirmar,
  onFechar,
}: {
  aberto: boolean;
  titulo: string;
  rotuloConfirmar: string;
  children?: ReactNode;
  carregando?: boolean;
  onConfirmar: (motivo: string) => void;
  onFechar: () => void;
}) {
  const id = useId();
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (aberto) {
      setMotivo("");
      setErro(null);
    }
  }, [aberto]);

  const confirmar = () => {
    const e = validarMotivo(motivo);
    if (e) {
      setErro(e);
      return;
    }
    onConfirmar(motivo.trim());
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          {titulo}
        </h2>
        <Button variant="destructive" size="sm" loading={carregando} onClick={confirmar}>
          {rotuloConfirmar}
        </Button>
      </div>
      <div className="sdb-sheet__body">
        {children}
        <AreaTexto
          id={`${id}-motivo`}
          label="Motivo"
          rows={4}
          contador
          maxLength={600}
          placeholder="Ex.: A citação do segundo parágrafo não indica a edição usada. Inclua a obra e a página."
          help={`Obrigatório, com pelo menos ${MOTIVO_MINIMO} caracteres. O anfitrião lê este texto para corrigir.`}
          value={motivo}
          error={erro ?? undefined}
          onChange={(e) => {
            setMotivo(e.target.value);
            setErro(null);
          }}
        />
      </div>
    </Sheet>
  );
}
