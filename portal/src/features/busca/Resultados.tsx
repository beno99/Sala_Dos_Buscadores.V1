import type { Route } from "next";
import type { CSSProperties } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardVideo } from "@/components/ds/CardVideo";
import { ChipLink } from "@/components/ds/Chip";
import { todosOsTemas } from "@/data/catalogo";
import { acervoPublico, alcanceDoTema } from "@/data/repositorio";
import { escolherResposta } from "@/features/assistente/motor";
import { AreaResultados } from "./AreaResultados";
import { buscar, contarFiltrosAtivos, type FiltrosBusca, filtrosAtivos, paraQueryString } from "./busca";
import { GradeComparativa } from "./GradeComparativa";

/** Latência simulada da consulta, para mostrar o estado de carregamento (RNF-USA-02). */
const LATENCIA_MS = Number(process.env.SIMULAR_LATENCIA_MS ?? 600);

function SugestoesDeTema() {
  return (
    <div className="sdb-row" style={{ gap: 8 }}>
      {todosOsTemas().map((t) => (
        <ChipLink key={t.slug} href={`/comparar?tema=${t.slug}` as Route} count={alcanceDoTema(t.slug).itens}>
          {t.nome}
        </ChipLink>
      ))}
    </div>
  );
}

/** Resultado da busca: grade comparativa (se houver tema) e lista filtrável. */
export async function Resultados({ filtros }: { filtros: FiltrosBusca }) {
  if (LATENCIA_MS > 0) await new Promise((r) => setTimeout(r, LATENCIA_MS));
  const acervo = acervoPublico();
  const resultado = buscar(filtros, acervo);
  const buscou = Boolean(filtros.q.trim()) || contarFiltrosAtivos(filtros) > 0;

  if (!buscou) {
    return (
      <section className="flex flex-col gap-4" aria-labelledby="titulo-inicio-busca">
        <h2 id="titulo-inicio-busca" className="sdb-title-2">
          Escolha um tema para começar
        </h2>
        <p className="sdb-footnote">
          Cada tema abre a mesma pergunta respondida por cada Sala, na sua própria voz e com a fonte indicada.
        </p>
        <SugestoesDeTema />
      </section>
    );
  }

  if (resultado.vazio) {
    const ativos = filtrosAtivos(filtros);
    const termo = filtros.q.trim();
    return (
      <Alerta
        title={
          termo ? `Nenhuma Sala trata de “${termo}” no acervo atual` : "Nenhum resultado com esses filtros"
        }
        actions={
          ativos.length > 0 ? (
            <ButtonLink
              href={
                `/comparar${paraQueryString({ ...filtros, salas: [], temas: [], niveis: [], formato: null })}` as Route
              }
              variant="secondary"
              size="sm"
            >
              Remover todos os filtros
            </ButtonLink>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3">
          <p className="m-0">
            {ativos.length > 0
              ? `Remova o filtro ${ativos.at(-1)?.rotulo} ou escolha um tema, como alma.`
              : "Tente um tema que atravessa as Salas, como alma, ou escreva a pergunta com outras palavras."}
          </p>
          <SugestoesDeTema />
        </div>
      </Alerta>
    );
  }

  const { comparacao, itens } = resultado;
  const perguntaAssistente = comparacao && escolherResposta(comparacao.pergunta) ? comparacao.pergunta : null;
  const conteudos = itens.filter((i) => i.tipo === "conteudo").length;
  const videos = itens.length - conteudos;

  return (
    <div className="flex flex-col gap-8">
      {comparacao && (
        <div className="flex flex-col gap-4">
          <GradeComparativa key={paraQueryString(filtros)} comparacao={comparacao} />
          {perguntaAssistente && (
            <div className="sdb-row">
              <ButtonLink
                href={`/assistente?pergunta=${encodeURIComponent(perguntaAssistente)}` as Route}
                variant="tinted"
                icon="ia"
              >
                Perguntar ao assistente sobre este tema
              </ButtonLink>
            </div>
          )}
        </div>
      )}

      <AreaResultados key={paraQueryString(filtros)} filtros={filtros} acervo={acervo}>
        <h2 className="sdb-title-2" id="titulo-lista">
          {comparacao ? "Conteúdos relacionados" : "Resultados no acervo"}
        </h2>
        <p className="sdb-footnote" aria-live="polite">
          {itens.length === 0
            ? "Nenhum conteúdo com esses filtros."
            : `${conteudos} ${conteudos === 1 ? "conteúdo" : "conteúdos"}${videos ? ` e ${videos} ${videos === 1 ? "vídeo" : "vídeos"}` : ""}.`}
        </p>
        {itens.length === 0 ? (
          <Alerta title="Nenhum conteúdo com esses filtros">
            Remova o filtro {filtrosAtivos(filtros).at(-1)?.rotulo ?? "mais recente"} para ver mais
            resultados. A grade acima continua valendo para a pergunta.
          </Alerta>
        ) : (
          <div className="sdb-grid" style={{ "--sdb-col": "300px" } as CSSProperties}>
            {itens.map((i) =>
              i.tipo === "video" ? (
                <div key={i.item.id} className="col-span-full">
                  <CardVideo video={i.item} />
                </div>
              ) : (
                <CardConteudo key={`${i.item.sala}-${i.item.slug}`} conteudo={i.item} />
              ),
            )}
          </div>
        )}
      </AreaResultados>
    </div>
  );
}
