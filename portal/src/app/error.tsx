"use client";

import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";

export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <Alerta
      variant="error"
      title="Erro: esta página não carregou"
      actions={
        <Button variant="destructive" size="sm" icon="regenerar" onClick={reset}>
          Tentar de novo
        </Button>
      }
    >
      Algo falhou ao montar a página. Tente de novo; o acervo e suas escolhas nesta sessão foram mantidos.
    </Alerta>
  );
}
