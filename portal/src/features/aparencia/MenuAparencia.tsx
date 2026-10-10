"use client";

import { useState } from "react";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { type Aparencia, aplicarAparencia } from "./tema";

/** Menu de aparência da Barra superior: claro ou escuro (temas sólidos). */
export function MenuAparencia({ inicial }: { inicial: Aparencia }) {
  const [aparencia, setAparencia] = useState<Aparencia>(inicial);
  const escolher = (a: Aparencia) => {
    setAparencia(a);
    aplicarAparencia(a);
  };
  return (
    <Menu
      right
      titulo="Aparência"
      triggerLabel="Aparência"
      triggerClassName="sdb-btn sdb-btn--icon sdb-btn--secondary"
      trigger={<Icon name="tema" />}
      items={[
        { label: "Claro", checked: aparencia === "claro", onSelect: () => escolher("claro") },
        { label: "Escuro", checked: aparencia === "escuro", onSelect: () => escolher("escuro") },
      ]}
    />
  );
}
