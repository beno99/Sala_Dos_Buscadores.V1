"use client";

import type { Route } from "next";
import { useState } from "react";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardSala } from "@/components/ds/CardSala";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Segmented } from "@/components/ds/Segmented";
import type { SalaResumo } from "@/data/repositorio";
import type { Conteudo, Video } from "@/data/types";
import { CardDoVideo } from "@/features/acervo/CardDoVideo";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import type { TipoEstante } from "@/features/estudo/estante";
import { plural } from "@/lib/texto";

export type ItemNaEstante =
  | { tipo: "sala"; sala: SalaResumo; imagem?: string }
  | { tipo: "conteudo"; conteudo: Conteudo }
  | { tipo: "video"; video: Video; nomeSala: string };

type Filtro = "todos" | TipoEstante;

/**
 * Estante (layout do Figma): "Conteúdos salvos" com o filtro Todos · Salas ·
 * Artigos · Vídeos na mesma linha e os itens numa grade de três colunas, na
 * ordem em que foram salvos. Vazia, o estado "Sua jornada começa com uma descoberta".
 */
export function EstanteCliente({ itens }: { itens: ItemNaEstante[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const contar = (t: TipoEstante) => itens.filter((i) => i.tipo === t).length;
  const visiveis = filtro === "todos" ? itens : itens.filter((i) => i.tipo === filtro);

  if (itens.length === 0) {
    return (
      <section className="sdb-panel sdb-material min-h-[60vh] justify-center" aria-label="Estante vazia">
        <EstadoSecao
          simbolo="historico"
          titulo="Sua jornada começa com uma descoberta"
          descricao="Nenhum item salvo por aqui ainda. Explore uma Sala e use o marcador dos cards para guardar o que quiser ler depois."
          acao={{ rotulo: "Explorar Salas", href: "/salas" as Route }}
        />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby="titulo-estante">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-x-0 border-t-0 border-b border-solid border-separator pb-5">
        <h1 id="titulo-estante" className="sdb-title-1">
          Conteúdos salvos
        </h1>
        <Segmented<Filtro>
          label="Filtrar a Estante"
          value={filtro}
          onChange={setFiltro}
          options={[
            { value: "todos", label: "Todos", count: itens.length },
            { value: "sala", label: "Salas", count: contar("sala") },
            { value: "conteudo", label: "Artigos", count: contar("conteudo") },
            { value: "video", label: "Vídeos", count: contar("video") },
          ]}
        />
      </div>
      <p className="sdb-sr" aria-live="polite">
        {plural(visiveis.length, "item", "itens")}
      </p>
      {visiveis.length === 0 ? (
        <EstadoSecao
          simbolo="pasta"
          compacto
          titulo="Nada deste tipo na Estante"
          descricao="Escolha outro filtro ou volte a ver todos os itens salvos."
          acao={{ rotulo: "Ver todos", executar: () => setFiltro("todos") }}
        />
      ) : (
        <div className="grid grid-cols-3 items-start gap-5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
          {visiveis.map((i) =>
            i.tipo === "sala" ? (
              <CardSala
                key={`sala:${i.sala.slug}`}
                sala={i.sala}
                imagem={i.imagem}
                acoes={<BotaoSalvar estilo="sala" tipo="sala" alvo={i.sala.slug} titulo={i.sala.nome} />}
              />
            ) : i.tipo === "conteudo" ? (
              <CardConteudo
                key={`conteudo:${i.conteudo.sala}/${i.conteudo.slug}`}
                conteudo={i.conteudo}
                acoes={
                  <BotaoSalvar
                    tipo="conteudo"
                    alvo={`${i.conteudo.sala}/${i.conteudo.slug}`}
                    titulo={i.conteudo.titulo}
                    estilo="card"
                  />
                }
              />
            ) : (
              <CardDoVideo key={`video:${i.video.id}`} video={i.video} nomeSala={i.nomeSala} />
            ),
          )}
        </div>
      )}
    </section>
  );
}
