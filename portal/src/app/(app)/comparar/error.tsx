"use client";

import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";

export default function ErroBusca({ reset }: { error: Error; reset: () => void }) {
  return (
    <Alerta
      variant="error"
      title="Erro: não foi possível consultar as Salas"
      actions={
        <Button variant="destructive" size="sm" icon="regenerar" onClick={reset}>
          Tentar de novo
        </Button>
      }
    >
      A consulta não terminou. Tente de novo; se o erro continuar, volte à página das Salas e escolha um tema.
    </Alerta>
  );
}
