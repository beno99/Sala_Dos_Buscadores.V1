"use client";

import type { Route } from "next";
import { type CSSProperties, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { Segmented } from "@/components/ds/Segmented";
import { NIVEL_ROTULO } from "@/data/rotulos";
import type { Conteudo, Nivel } from "@/data/types";

type FiltroNivel = "todos" | `${Nivel}`;

/**
 * Conteúdos de uma Sala com filtro por nível (RF-10, RF-11). Sem conteúdo
 * publicado, ou sem conteúdo no nível escolhido, mostra o estado vazio.
 */
export function ConteudosDaSala({ conteudos, nomeSala }: { conteudos: Conteudo[]; nomeSala: string }) {
  const [nivel, setNivel] = useState<FiltroNivel>("todos");
  const visiveis = nivel === "todos" ? conteudos : conteudos.filter((c) => `${c.nivel}` === nivel);
  const contar = (n: Nivel) => conteudos.filter((c) => c.nivel === n).length;

  if (conteudos.length === 0) {
    return (
      <Alerta
        title="Esta Sala ainda não tem conteúdo publicado"
        actions={
          <ButtonLink href={"/comparar" as Route} variant="secondary" size="sm">
            Comparar temas em outras Salas
          </ButtonLink>
        }
      >
        A curadoria está preparando os primeiros textos de {nomeSala}. Enquanto isso, o glossário e as fontes
        abaixo já podem ser consultados.
      </Alerta>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Segmented<FiltroNivel>
        label="Filtrar por nível"
        value={nivel}
        onChange={setNivel}
        options={[
          { value: "todos", label: "Todos", count: conteudos.length },
          ...([1, 2, 3] as Nivel[]).map((n) => ({
            value: `${n}` as FiltroNivel,
            label: NIVEL_ROTULO[n],
            count: contar(n),
          })),
        ]}
      />
      {visiveis.length === 0 ? (
        <Alerta
          title={`Ainda não há conteúdo ${nivel === "3" ? "avançado" : nivel === "2" ? "intermediário" : "iniciante"} publicado nesta Sala`}
          actions={
            <button
              type="button"
              className="sdb-btn sdb-btn--secondary sdb-btn--sm"
              onClick={() => setNivel("todos")}
            >
              Ver todos os níveis
            </button>
          }
        >
          A curadoria publica por etapas. Escolha outro nível ou veja todos os conteúdos de {nomeSala}.
        </Alerta>
      ) : (
        <div className="sdb-grid" style={{ "--sdb-col": "300px" } as CSSProperties}>
          {visiveis.map((c) => (
            <CardConteudo key={c.slug} conteudo={c} />
          ))}
        </div>
      )}
    </div>
  );
}
