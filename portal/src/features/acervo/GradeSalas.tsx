"use client";

import { useState } from "react";
import { CardSala } from "@/components/ds/CardSala";
import { Chip } from "@/components/ds/Chip";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import type { SalaResumo } from "@/data/repositorio";
import type { TemaSlug } from "@/data/types";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";

export interface SalaNaGrade {
  sala: SalaResumo;
  temas: TemaSlug[];
  imagem?: string;
}

/**
 * Grade de Salas com o filtro por tema em chips de areia (layout do Figma):
 * a primeira Sala em destaque e as outras em cards normais, três por linha.
 */
export function GradeSalas({
  id,
  salas,
  temas,
}: {
  id: string;
  salas: SalaNaGrade[];
  temas: { slug: TemaSlug; nome: string; contagem: number }[];
}) {
  const [tema, setTema] = useState<TemaSlug | null>(null);
  const visiveis = tema ? salas.filter((s) => s.temas.includes(tema)) : salas;
  const escolhido = temas.find((t) => t.slug === tema);
  return (
    <div className="flex flex-col gap-5">
      {temas.length > 0 && (
        <div
          className="sdb-row border-x-0 border-t-0 border-b border-solid border-separator pb-5"
          style={{ gap: 8 }}
          role="group"
          aria-label="Filtrar Salas por tema"
        >
          {temas.map((t) => (
            <Chip
              key={t.slug}
              areia
              pressed={tema === t.slug}
              count={t.contagem}
              onClick={() => setTema((atual) => (atual === t.slug ? null : t.slug))}
            >
              {t.nome}
            </Chip>
          ))}
        </div>
      )}
      <p className="sdb-sr" aria-live="polite">
        {escolhido ? `${visiveis.length} Salas tratam de ${escolhido.nome.toLowerCase()}.` : ""}
      </p>
      {visiveis.length > 0 ? (
        <div id={id} className="grid grid-cols-3 gap-5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
          {visiveis.map((s) => (
            <CardSala
              key={s.sala.slug}
              sala={s.sala}
              imagem={s.imagem}
              acoes={<BotaoSalvar estilo="sala" tipo="sala" alvo={s.sala.slug} titulo={s.sala.nome} />}
            />
          ))}
        </div>
      ) : (
        <EstadoSecao
          simbolo="busca"
          compacto
          titulo={`Nenhuma Sala trata de ${escolhido?.nome.toLowerCase()} ainda.`}
          descricao="Tire o filtro de tema para ver todas as Salas."
          acao={{ rotulo: "Tirar o filtro", executar: () => setTema(null) }}
        />
      )}
    </div>
  );
}
