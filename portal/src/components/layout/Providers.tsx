"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ds/Toast";
import { ConversaProvider } from "@/features/assistente/ConversaProvider";
import type { Membro } from "@/features/auth/contas";
import { SessaoProvider } from "@/features/auth/SessaoProvider";

export function Providers({ children, membro }: { children: ReactNode; membro: Membro | null }) {
  return (
    <ToastProvider>
      <SessaoProvider inicial={membro}>
        <ConversaProvider>{children}</ConversaProvider>
      </SessaoProvider>
    </ToastProvider>
  );
}
