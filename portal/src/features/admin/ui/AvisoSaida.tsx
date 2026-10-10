"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModalConfirmacao } from "@/components/ds/Modal";

/**
 * Aviso ao sair com alterações não salvas: o navegador pergunta ao fechar ou
 * recarregar; links internos abrem um Modal da biblioteca.
 */
export function AvisoSaida({ sujo, onDescartar }: { sujo: boolean; onDescartar?: () => void }) {
  const router = useRouter();
  const [destino, setDestino] = useState<string | null>(null);

  useEffect(() => {
    if (!sujo) return;
    const antesDeSair = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const clique = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.hash))
        return;
      e.preventDefault();
      e.stopPropagation();
      setDestino(`${url.pathname}${url.search}${url.hash}`);
    };
    window.addEventListener("beforeunload", antesDeSair);
    document.addEventListener("click", clique, true);
    return () => {
      window.removeEventListener("beforeunload", antesDeSair);
      document.removeEventListener("click", clique, true);
    };
  }, [sujo]);

  return (
    <ModalConfirmacao
      open={destino !== null}
      titulo="Sair sem salvar?"
      icone="aviso"
      destrutivo
      rotuloCancelar="Continuar editando"
      rotuloConfirmar="Sair sem salvar"
      onCancelar={() => setDestino(null)}
      onConfirmar={() => {
        const d = destino;
        setDestino(null);
        onDescartar?.();
        if (d) router.push(d as Route);
      }}
    >
      As alterações feitas desde o último salvamento serão perdidas.
    </ModalConfirmacao>
  );
}

/** Leva o foco (e a rolagem) ao campo indicado, ou ao primeiro controle dentro dele. */
export function focarCampo(id: string) {
  const alvo = document.getElementById(id);
  if (!alvo) return;
  const controle = alvo.matches("input, select, textarea, button")
    ? alvo
    : alvo.querySelector<HTMLElement>("input:not([disabled]), select, textarea, button:not([disabled])");
  const reduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "center" });
  (controle ?? alvo).focus({ preventScroll: true });
}
