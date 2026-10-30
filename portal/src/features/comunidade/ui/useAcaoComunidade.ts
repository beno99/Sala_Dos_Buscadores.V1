"use client";
import { useTransition } from "react";
import { useToast } from "@/components/ds/Toast";

interface Resultado {
  ok: boolean;
  mensagem: string;
}

/** Roda uma Server Action em transição; `antes` aplica a resposta otimista e o erro vira toast. */
export function useAcaoComunidade() {
  const toast = useToast();
  const [pendente, iniciar] = useTransition();
  const executar = (acao: () => Promise<Resultado>, antes?: () => void, depois?: () => void) =>
    iniciar(async () => {
      antes?.();
      const r = await acao();
      if (r.mensagem) toast(r.mensagem, r.ok ? undefined : { variant: "erro" });
      if (r.ok) depois?.();
    });
  return { pendente, executar };
}
