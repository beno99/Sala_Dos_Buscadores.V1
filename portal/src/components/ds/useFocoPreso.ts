"use client";

import { type RefObject, useEffect } from "react";

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Mantém o Tab dentro de um diálogo aberto (Modal, Drawer, Onboarding). */
export function useFocoPreso(ref: RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const prender = (e: KeyboardEvent) => {
      const raiz = ref.current;
      if (e.key !== "Tab" || !raiz) return;
      const lista = [...raiz.querySelectorAll<HTMLElement>(FOCAVEIS)].filter(
        (el) => !el.closest("[hidden], [inert]") && el.offsetParent !== null,
      );
      if (lista.length === 0) return;
      const primeiro = lista[0];
      const ultimo = lista[lista.length - 1];
      if (e.shiftKey && (document.activeElement === primeiro || !raiz.contains(document.activeElement))) {
        e.preventDefault();
        ultimo?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === ultimo || !raiz.contains(document.activeElement))
      ) {
        e.preventDefault();
        primeiro?.focus();
      }
    };
    document.addEventListener("keydown", prender);
    return () => document.removeEventListener("keydown", prender);
  }, [ref, ativo]);
}
