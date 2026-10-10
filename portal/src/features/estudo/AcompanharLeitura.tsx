"use client";

import { useEffect, useRef } from "react";
import type { SalaSlug } from "@/data/types";
import { emitirEstudo } from "./eventos";

const PASSO = 10;

/**
 * Leitura em andamento: abrir registra; a porcentagem acompanha a rolagem
 * do texto (de 10 em 10); chegar ao fim marca como lida.
 */
export function AcompanharLeitura({ sala, slug, alvo }: { sala: SalaSlug; slug: string; alvo: string }) {
  const enviado = useRef(-1);

  useEffect(() => {
    enviado.current = -1;
    const medir = () => {
      const artigo = document.querySelector<HTMLElement>(alvo);
      if (!artigo) return;
      const r = artigo.getBoundingClientRect();
      const visto = Math.min(r.height, Math.max(0, window.innerHeight - r.top));
      const bruto = r.height > 0 ? (visto / r.height) * 100 : 100;
      const pct = bruto >= 98 ? 100 : Math.floor(bruto / PASSO) * PASSO;
      if (pct > enviado.current) {
        enviado.current = pct;
        emitirEstudo({ tipo: "leitura", sala, slug, pct });
      }
    };
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [sala, slug, alvo]);

  return null;
}
