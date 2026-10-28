"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ds/Toast";
import { instalarRegistroSalas } from "@/data/catalogo";
import type { Sala } from "@/data/types";
import { ConversaProvider } from "@/features/assistente/ConversaProvider";
import { instalarLeiturasDoAssistente, type LeituraParaAssistente } from "@/features/assistente/motor";
import { SessaoProvider } from "@/features/auth/SessaoProvider";
import type { Membro } from "@/modules/conta/conta.contratos";

/**
 * No navegador, o catálogo de Salas lê a lista que o servidor mandou (as Salas
 * visíveis agora). No servidor o registro já é o store; não é sobrescrito.
 */
function registrarSalasNoNavegador(salas: Sala[], leituras: LeituraParaAssistente[]) {
  if (typeof window === "undefined") return;
  instalarRegistroSalas(() => salas);
  instalarLeiturasDoAssistente(() => leituras);
}

export function Providers({
  children,
  membro,
  salas,
  leituras,
}: {
  children: ReactNode;
  membro: Membro | null;
  salas: Sala[];
  /** Leituras de anfitriões que o assistente pode citar (Salas na comparação). */
  leituras: LeituraParaAssistente[];
}) {
  registrarSalasNoNavegador(salas, leituras);
  return (
    <ToastProvider>
      <SessaoProvider inicial={membro}>
        <ConversaProvider>{children}</ConversaProvider>
      </SessaoProvider>
    </ToastProvider>
  );
}
