"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Carrossel } from "@/components/ds/Carrossel";
import { Chip } from "@/components/ds/Chip";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import type { TemaSlug } from "@/data/types";
import { cx } from "@/lib/cx";

export interface ItemDaFaixa {
  chave: string;
  temas: TemaSlug[];
  card: ReactNode;
}

/**
 * Faixa da Biblioteca (layout do Figma): título, legenda, chips de tema em
 * areia que filtram, o trilho de cards e "Ver mais", que abre todos os itens
 * numa grade. Sem itens no tema escolhido, o estado vazio com "Tirar o filtro".
 */
export function FaixaBiblioteca({
  id,
  titulo,
  legenda,
  rotuloItens,
  larguraItem,
  colunas = 3,
  temas,
  itens,
}: {
  id: string;
  titulo: string;
  legenda: string;
  rotuloItens: string;
  larguraItem: number;
  /** Colunas da grade aberta por "Ver mais". */
  colunas?: 1 | 2 | 3 | 4;
  temas: { slug: TemaSlug; nome: string }[];
  itens: ItemDaFaixa[];
}) {
  const [tema, setTema] = useState<TemaSlug | null>(null);
  const [aberta, setAberta] = useState(false);
  const visiveis = tema ? itens.filter((i) => i.temas.includes(tema)) : itens;
  const comItens = temas
    .map((t) => ({ ...t, contagem: itens.filter((i) => i.temas.includes(t.slug)).length }))
    .filter((t) => t.contagem > 0);
  const escolhido = comItens.find((t) => t.slug === tema);
  const grade = cx(
    "grid items-start gap-5 max-[640px]:grid-cols-1",
    colunas === 1 && "grid-cols-1",
    colunas === 2 && "grid-cols-2",
    colunas === 3 && "grid-cols-3 max-[1100px]:grid-cols-2",
    colunas === 4 && "grid-cols-4 max-[1200px]:grid-cols-3 max-[900px]:grid-cols-2",
  );

  return (
    <Carrossel
      id={id}
      titulo={titulo}
      legenda={legenda}
      rotuloItens={rotuloItens}
      larguraItem={larguraItem}
      filtros={
        comItens.length > 1 && (
          <div
            className="sdb-row border-x-0 border-t-0 border-b border-solid border-separator pb-5"
            style={{ gap: 8 }}
            role="group"
            aria-label={`Filtrar ${rotuloItens} por tema`}
          >
            {comItens.map((t) => (
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
        )
      }
      rodape={
        <>
          <p className="sdb-sr" aria-live="polite">
            {escolhido ? `${visiveis.length} ${rotuloItens} sobre ${escolhido.nome.toLowerCase()}.` : ""}
          </p>
          {visiveis.length === 0 && (
            <EstadoSecao
              simbolo="busca"
              compacto
              titulo={`Nenhum item sobre ${escolhido?.nome.toLowerCase()} nesta faixa.`}
              descricao="Tire o filtro de tema para ver tudo."
              acao={{ rotulo: "Tirar o filtro", executar: () => setTema(null) }}
            />
          )}
          {aberta && visiveis.length > 0 && (
            <div className={grade}>
              {visiveis.map((i) => (
                <div key={i.chave} className="grid min-w-0">
                  {i.card}
                </div>
              ))}
            </div>
          )}
          {visiveis.length > 1 && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                aria-expanded={aberta}
                aria-controls={`${id}-trilho`}
                onClick={() => setAberta((a) => !a)}
              >
                {aberta ? "Ver menos" : "Ver mais"}
              </Button>
            </div>
          )}
        </>
      }
    >
      {aberta ? null : visiveis.map((i) => <div key={i.chave}>{i.card}</div>)}
    </Carrossel>
  );
}
