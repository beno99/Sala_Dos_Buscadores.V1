import type { ReactNode } from "react";

/** Telas de conta (entrar, cadastro, recuperar senha): fora da moldura, sem sessão. */
export default function LayoutConta({ children }: { children: ReactNode }) {
  return (
    <main id="conteudo" tabIndex={-1}>
      {children}
    </main>
  );
}
