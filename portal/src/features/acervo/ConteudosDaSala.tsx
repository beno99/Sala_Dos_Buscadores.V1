"use client";

import type { Route } from "next";
import { useState } from "react";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Segmented } from "@/components/ds/Segmented";
import { NIVEL_ROTULO } from "@/data/rotulos";
import type { Conteudo, Nivel } from "@/data/types";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { plural } from "@/lib/texto";

type FiltroNivel = "todos" | `${Nivel}`;

/**
 * Conteúdos de uma Sala com filtro por nível (RF-10, RF-11): título "Conteúdos"
 * com o segmentado na mesma linha, filete e a lista em uma coluna só. Sem
 * conteúdo publicado, ou sem conteúdo no nível escolhido, mostra o estado vazio.
 */
export function ConteudosDaSala({ conteudos, nomeSala }: { conteudos: Conteudo[]; nomeSala: string }) {
  const [nivel, setNivel] = useState<FiltroNivel>("todos");
  const visiveis = nivel === "todos" ? conteudos : conteudos.filter((c) => `${c.nivel}` === nivel);
  const contar = (n: Nivel) => conteudos.filter((c) => c.nivel === n).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-x-0 border-t-0 border-b border-solid border-separator pb-4">
        <h2 id="titulo-conteudos" className="sdb-title-2">
          Conteúdos
        </h2>
        {conteudos.length > 0 && (
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
        )}
      </div>
      <p className="sdb-sr" aria-live="polite">
        {plural(visiveis.length, "conteúdo", "conteúdos")}
      </p>
      {conteudos.length === 0 ? (
        <EstadoSecao
          simbolo="livro"
          titulo="Esta Sala ainda não tem conteúdo publicado"
          descricao={`A curadoria está preparando os primeiros textos de ${nomeSala}. Enquanto isso, o glossário e as fontes abaixo já podem ser consultados.`}
          acao={{ rotulo: "Comparar temas em outras Salas", href: "/comparar" as Route }}
        />
      ) : visiveis.length === 0 ? (
        <EstadoSecao
          simbolo="busca"
          compacto
          titulo={`Ainda não há conteúdo ${nivel === "3" ? "avançado" : nivel === "2" ? "intermediário" : "iniciante"} publicado nesta Sala`}
          descricao={`A curadoria publica por etapas. Escolha outro nível ou veja todos os conteúdos de ${nomeSala}.`}
          acao={{ rotulo: "Ver todos os níveis", executar: () => setNivel("todos") }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {visiveis.map((c) => (
            <CardConteudo
              key={c.slug}
              conteudo={c}
              acoes={
                <BotaoSalvar tipo="conteudo" alvo={`${c.sala}/${c.slug}`} titulo={c.titulo} estilo="card" />
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
