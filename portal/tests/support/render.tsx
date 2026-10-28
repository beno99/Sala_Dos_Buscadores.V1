import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Membro } from "@tests/support/demonstracao";
import type { ReactElement, ReactNode } from "react";
import { ToastProvider } from "@/components/ds/Toast";
import { ConversaProvider } from "@/features/assistente/ConversaProvider";
import type { OpcoesConsulta, Resposta } from "@/features/assistente/motor";
import { SessaoProvider } from "@/features/auth/SessaoProvider";

interface Opcoes extends Omit<RenderOptions, "wrapper"> {
  membro?: Membro | null;
  /** Troca o motor do assistente (ex.: uma consulta que falha). */
  consultar?: (pergunta: string, opcoes: OpcoesConsulta) => Promise<Resposta>;
}

/** Renderiza com os mesmos providers do layout raiz e devolve um userEvent pronto. */
export function renderComProviders(ui: ReactElement, { membro = null, consultar, ...opcoes }: Opcoes = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ToastProvider>
        <SessaoProvider inicial={membro}>
          <ConversaProvider consultar={consultar}>{children}</ConversaProvider>
        </SessaoProvider>
      </ToastProvider>
    );
  }
  return { user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...opcoes }) };
}
