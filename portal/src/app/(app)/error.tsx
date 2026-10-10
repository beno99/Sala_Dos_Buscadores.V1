"use client";

import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";

/** Erro dentro da moldura: diz o que houve e oferece tentar de novo. */
export default function ErroDoApp({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex max-w-read flex-col gap-4">
      <Alerta
        variant="error"
        title="Erro: não foi possível carregar esta página."
        actions={
          <Button variant="secondary" size="sm" onClick={reset}>
            Tentar de novo
          </Button>
        }
      >
        Seus dados e seu progresso continuam salvos. Se o erro voltar, recarregue a página.
      </Alerta>
    </div>
  );
}
