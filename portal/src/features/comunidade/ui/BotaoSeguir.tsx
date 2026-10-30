"use client";
import { useOptimistic } from "react";
import { Button } from "@/components/ds/Button";
import { seguirAcao } from "@/server/comunidade/acoes";
import { useAcaoComunidade } from "./useAcaoComunidade";

export function BotaoSeguir({
  alvo,
  nome,
  seguindo,
}: {
  alvo: { tipo: "pessoa" | "sala"; id: string };
  nome: string;
  seguindo: boolean;
}) {
  const { executar } = useAcaoComunidade();
  const [ativo, alternar] = useOptimistic(seguindo, (atual: boolean) => !atual);
  return (
    <Button
      variant={ativo ? "plain" : "secondary"}
      size="sm"
      aria-pressed={ativo}
      aria-label={`${ativo ? "Deixar de acompanhar" : "Acompanhar"} ${nome}`}
      onClick={() =>
        executar(
          () => seguirAcao(alvo),
          () => alternar(null),
        )
      }
    >
      {ativo ? "Acompanhando" : "Acompanhar"}
    </Button>
  );
}
