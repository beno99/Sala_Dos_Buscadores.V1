import type { FormHTMLAttributes, ReactNode } from "react";

/** Casca controlada: a tela fornece radios, campos, avisos e ações do tipo escolhido. */
export function CompositorComunidade({
  tipos,
  children,
  acoes,
  ...form
}: Omit<FormHTMLAttributes<HTMLFormElement>, "className" | "children"> & {
  tipos: ReactNode;
  children: ReactNode;
  acoes: ReactNode;
}) {
  return (
    <form {...form} className="sdb-composer" aria-label={form["aria-label"] ?? "Compor publicação"}>
      <fieldset className="sdb-composer__types">
        <legend className="sdb-label">Tipo de publicação</legend>
        {tipos}
      </fieldset>
      <div className="sdb-composer__fields">{children}</div>
      <div className="sdb-composer__foot">{acoes}</div>
    </form>
  );
}
