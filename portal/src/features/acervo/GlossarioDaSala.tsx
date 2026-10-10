"use client";

import { Glossario } from "@/components/ds/Glossario";
import type { Verbete } from "@/data/types";
import { emitirEstudo } from "@/features/estudo/eventos";

/** Glossário da Sala: abrir um verbete conta para a conquista "Vocabulário". */
export function GlossarioDaSala({ verbetes }: { verbetes: Verbete[] }) {
  return <Glossario verbetes={verbetes} onAbrir={(termo) => emitirEstudo({ tipo: "verbete", termo })} />;
}
