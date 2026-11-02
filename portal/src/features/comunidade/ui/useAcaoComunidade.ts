"use client";
import { useRef, useTransition } from "react";
import { useToast } from "@/components/ds/Toast";

interface Resultado {
  ok: boolean;
  mensagem: string;
}

/** Roda uma Server Action em transição; `antes` aplica a resposta otimista e o erro vira toast. */
export function useAcaoComunidade() {
  const toast = useToast();
  const [pendente, iniciar] = useTransition();
  const enviando = useRef(false);
  const executar = (acao: () => Promise<Resultado>, antes?: () => void, depois?: () => void) => {
    if (enviando.current) return;
    enviando.current = true;
    iniciar(async () => {
      try {
        antes?.();
        const r = await acao();
        if (r.mensagem) toast(r.mensagem, r.ok ? undefined : { variant: "erro" });
        if (r.ok) depois?.();
      } catch {
        toast("Erro: não foi possível concluir. Seu texto foi mantido; tente novamente.", {
          variant: "erro",
        });
      } finally {
        enviando.current = false;
      }
    });
  };
  return { pendente, executar };
}
