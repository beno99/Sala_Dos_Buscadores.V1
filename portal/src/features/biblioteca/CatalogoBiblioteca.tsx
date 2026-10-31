"use client";

import { type CSSProperties, useState } from "react";
import { Button } from "@/components/ds/Button";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardVideo } from "@/components/ds/CardVideo";
import { Drawer } from "@/components/ds/Drawer";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import {
  type AcervoBusca,
  buscar,
  contarFiltrosAtivos,
  FILTROS_VAZIOS,
  type FiltrosBusca,
} from "@/features/busca/busca";
import { FiltrosPainel } from "@/features/busca/FiltrosBusca";

/**
 * Catálogo de textos e fontes da Biblioteca (CatalogoBiblioteca): busca por
 * texto e o mesmo painel de Filtros (Sala, tema, nível, formato) do Comparar,
 * só que local — sem ida para a URL, resultado atualiza na hora.
 */
export function CatalogoBiblioteca({
  acervo,
  filtrosIniciais,
}: {
  acervo: AcervoBusca;
  filtrosIniciais?: Partial<FiltrosBusca>;
}) {
  const [filtros, setFiltros] = useState<FiltrosBusca>({ ...FILTROS_VAZIOS, ...filtrosIniciais });
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const ativos = contarFiltrosAtivos(filtros);
  const resultado = buscar(filtros, acervo);
  const limpar = () => setFiltros({ ...FILTROS_VAZIOS, q: filtros.q });

  return (
    <section className="flex flex-col gap-5" aria-labelledby="titulo-catalogo">
      <div className="flex flex-col gap-2">
        <h2 id="titulo-catalogo" className="sdb-title-1">
          Textos e fontes
        </h2>
      </div>

      <form className="sdb-searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="sdb-searchbar__row">
          <Icon name="busca" />
          <label className="sdb-sr" htmlFor="busca-biblioteca">
            Buscar no acervo
          </label>
          <input
            id="busca-biblioteca"
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            value={filtros.q}
            placeholder="Buscar no acervo"
            onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
          />
        </div>
      </form>

      <div className="lg:hidden">
        <Button variant="glass" icon="filtro" onClick={() => setGavetaAberta(true)}>
          {ativos ? `Filtros (${ativos})` : "Filtros"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="sdb-footnote" aria-live="polite">
            {resultado.itens.length === 0
              ? "Nenhum conteúdo com esses filtros."
              : `${resultado.itens.length} ${resultado.itens.length === 1 ? "conteúdo" : "conteúdos"}.`}
          </p>
          {resultado.itens.length === 0 ? (
            <EstadoSecao
              simbolo="busca"
              compacto
              titulo="Nenhum conteúdo com esses filtros"
              descricao="Tente outro termo ou limpe os filtros ao lado."
              acao={{ rotulo: "Limpar filtros", executar: limpar }}
            />
          ) : (
            <div className="sdb-grid" style={{ "--sdb-col": "300px" } as CSSProperties}>
              {resultado.itens.map((i) =>
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
        </div>

        <aside className="hidden lg:sticky lg:top-6 lg:block" aria-label="Filtros do catálogo">
          <section className="sdb-filters" aria-labelledby="filtros-biblioteca-titulo">
            <div className="sdb-row sdb-row--between">
              <h3 id="filtros-biblioteca-titulo" className="sdb-headline" style={{ fontSize: 20 }}>
                Filtros
              </h3>
              <Button variant="plain" size="sm" disabled={ativos === 0} onClick={limpar}>
                Limpar
              </Button>
            </div>
            <FiltrosPainel rascunho={filtros} acervo={acervo} onChange={setFiltros} />
          </section>
        </aside>
      </div>

      <Drawer open={gavetaAberta} onClose={() => setGavetaAberta(false)} title="Filtros">
        <FiltrosPainel rascunho={filtros} acervo={acervo} onChange={setFiltros} />
      </Drawer>
    </section>
  );
}
