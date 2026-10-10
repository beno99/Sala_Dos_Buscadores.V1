"use client";

import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

export interface ColunaTabela<T> {
  id: string;
  cabecalho: string;
  celula: (item: T) => ReactNode;
  /** Chave de ordenação (ex.: "titulo"); sem ela a coluna não ordena. */
  ordenavel?: string;
  className?: string;
  /** Cabeçalho só para leitores de tela (ex.: coluna de ações). */
  cabecalhoOculto?: boolean;
}

interface TabelaDadosProps<T> {
  legenda: string;
  colunas: ColunaTabela<T>[];
  itens: T[];
  chave: (item: T) => string;
  rotuloItem: (item: T) => string;
  ordem?: { coluna: string; direcao: "ascending" | "descending" };
  onOrdenar?: (coluna: string) => void;
  selecionados?: Set<string>;
  onSelecionar?: (ids: Set<string>) => void;
  vazio: ReactNode;
}

/**
 * Tabela de dados (TabelaDados): ordenação com aria-sort, seleção opcional
 * e, abaixo de 720 px, uma lista com o nome da coluna em cada célula.
 */
export function TabelaDados<T>({
  legenda,
  colunas,
  itens,
  chave,
  rotuloItem,
  ordem,
  onOrdenar,
  selecionados,
  onSelecionar,
  vazio,
}: TabelaDadosProps<T>) {
  const selecao = Boolean(selecionados && onSelecionar);
  const todos = itens.length > 0 && itens.every((i) => selecionados?.has(chave(i)));
  const alguns = !todos && itens.some((i) => selecionados?.has(chave(i)));

  const alternar = (id: string) => {
    if (!selecionados || !onSelecionar) return;
    const novo = new Set(selecionados);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    onSelecionar(novo);
  };

  return (
    <div className="sdb-table-wrap">
      <table className="sdb-table">
        <caption>{legenda}</caption>
        <thead>
          <tr>
            {selecao && (
              <th className="sdb-table__check" scope="col">
                <label className="sdb-check">
                  <input
                    type="checkbox"
                    aria-label="Selecionar todos desta página"
                    checked={todos}
                    ref={(el) => {
                      if (el) el.indeterminate = alguns;
                    }}
                    onChange={() => onSelecionar?.(todos ? new Set() : new Set(itens.map(chave)))}
                  />
                </label>
              </th>
            )}
            {colunas.map((c) => {
              const ativa = ordem?.coluna === c.ordenavel;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={ativa ? ordem?.direcao : undefined}
                  className={c.className}
                >
                  {c.ordenavel && onOrdenar ? (
                    <button
                      type="button"
                      className="sdb-table__sort"
                      onClick={() => onOrdenar(c.ordenavel as string)}
                    >
                      {c.cabecalho}
                      <Icon name="chevronBaixo" />
                    </button>
                  ) : c.cabecalhoOculto ? (
                    <span className="sdb-sr">{c.cabecalho}</span>
                  ) : (
                    c.cabecalho
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td className="sdb-table__empty" colSpan={colunas.length + (selecao ? 1 : 0)}>
                {vazio}
              </td>
            </tr>
          ) : (
            itens.map((item) => {
              const id = chave(item);
              const marcado = selecionados?.has(id) ?? false;
              return (
                <tr key={id} aria-selected={selecao ? marcado : undefined}>
                  {selecao && (
                    <td className="sdb-table__check">
                      <label className="sdb-check">
                        <input
                          type="checkbox"
                          checked={marcado}
                          aria-label={`Selecionar ${rotuloItem(item)}`}
                          onChange={() => alternar(id)}
                        />
                      </label>
                    </td>
                  )}
                  {colunas.map((c) => (
                    <td
                      key={c.id}
                      data-label={c.cabecalhoOculto ? undefined : c.cabecalho}
                      className={cx(c.className)}
                    >
                      {c.celula(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Linhas de carregamento da tabela. */
export function TabelaEsqueleto({ linhas = 5 }: { linhas?: number }) {
  return (
    <div className="sdb-table-wrap" role="status" aria-busy="true" aria-label="Carregando a lista">
      <div className="flex flex-col gap-4 p-5">
        {Array.from({ length: linhas }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: esqueleto sem identidade própria.
          <div key={i} className="sdb-skel h-6" />
        ))}
      </div>
    </div>
  );
}
