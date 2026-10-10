"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/components/ds/Toast";
import { registrarEstudoAcao } from "./acoes";
import { CONQUISTAS } from "./conquistas";
import { ouvirEstudo } from "./eventos";
import type { EventoEstudo } from "./tipos";

/**
 * Ouve os eventos de estudo da página, grava pela Server Action e avisa as
 * conquistas novas ("Conquista: Lado a lado.", no passado, sem "parabéns").
 * Atualiza a página só quando o resumo muda (lateral e indicadores).
 */
export function useOuvinteEstudo() {
  const router = useRouter();
  const toast = useToast();
  useEffect(() => {
    return ouvirEstudo(async (evento: EventoEstudo) => {
      const r = await registrarEstudoAcao(evento);
      if (!r) return;
      if (r.mostrarNiveis) {
        for (const id of r.novas) {
          const c = CONQUISTAS.find((x) => x.id === id);
          if (c) toast(`Conquista: ${c.nome}.`, { icon: c.icone });
        }
      }
      if (r.mudouResumo) router.refresh();
    });
  }, [router, toast]);
}
