"use client";

import { useState } from "react";
import { Button } from "@/components/ds/Button";
import type { SalaSlug } from "@/data/types";
import { emitirEstudo } from "@/features/estudo/eventos";

type Alvo = { tipo: "artigo"; sala: SalaSlug; slug: string } | { tipo: "video"; id: string };

/**
 * Conclusão declarada da Jornada: "Marcar leitura como concluída" ou "Marcar
 * vídeo como concluído". Rolagem e reprodução não provam estudo; só a marcação
 * conta. Dá para desmarcar uma marcação acidental (fica no histórico).
 */
export function BotaoConcluir({ alvo, concluido: inicial }: { alvo: Alvo; concluido: boolean }) {
  const [concluido, setConcluido] = useState(inicial);
  const artigo = alvo.tipo === "artigo";
  const alternar = () => {
    const proximo = !concluido;
    setConcluido(proximo);
    if (artigo) emitirEstudo({ tipo: proximo ? "concluir" : "desmarcar", sala: alvo.sala, slug: alvo.slug });
    else emitirEstudo({ tipo: proximo ? "concluir-video" : "desmarcar-video", id: alvo.id });
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant={concluido ? "secondary" : "primary"}
        size={artigo ? undefined : "sm"}
        icon={concluido ? "check" : "trilha"}
        aria-pressed={concluido}
        onClick={alternar}
      >
        {concluido
          ? artigo
            ? "Leitura concluída"
            : "Vídeo concluído"
          : artigo
            ? "Marcar leitura como concluída"
            : "Marcar vídeo como concluído"}
      </Button>
      {concluido && (
        <span className="sdb-footnote">
          Registrado na sua Jornada. Marcou sem querer? Toque de novo para desmarcar.
        </span>
      )}
    </div>
  );
}
