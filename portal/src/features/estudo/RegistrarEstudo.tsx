"use client";

import { useEffect } from "react";
import { emitirEstudo } from "./eventos";
import type { EventoEstudo } from "./tipos";

/** Registra um evento de estudo ao abrir a página (Sala visitada, tema comparado). */
export function RegistrarEstudo({ evento }: { evento: EventoEstudo }) {
  const chave = JSON.stringify(evento);
  // biome-ignore lint/correctness/useExhaustiveDependencies: o evento muda só quando muda a chave.
  useEffect(() => {
    emitirEstudo(evento);
  }, [chave]);
  return null;
}
