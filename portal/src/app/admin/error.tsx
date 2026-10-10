"use client";

import { Alerta } from "@/components/ds/Alerta";
import { Button } from "@/components/ds/Button";

export default function ErroCuradoria({ reset }: { error: Error; reset: () => void }) {
  return (
    <Alerta
      variant="error"
      title="Erro: esta tela da curadoria não carregou"
      actions={
        <Button variant="destructive" size="sm" icon="regenerar" onClick={reset}>
          Tentar de novo
        </Button>
      }
    >
      O acervo não foi alterado. Tente de novo; se continuar, volte ao painel e abra o item pela lista.
    </Alerta>
  );
}
