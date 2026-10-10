import type { ReactNode } from "react";
import { Arc } from "@/components/ds/Arc";

/** Telas de conta (entrar, cadastro, recuperar senha): fora da moldura, sem sessão. */
export default function LayoutConta({ children }: { children: ReactNode }) {
  return (
    <main
      id="conteudo"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh w-full max-w-form flex-col justify-center gap-6 px-4 py-8"
    >
      <p className="flex items-center gap-3">
        <Arc on="bege" />
        <span className="sdb-title-2">A Sala dos Buscadores</span>
      </p>
      {children}
    </main>
  );
}
