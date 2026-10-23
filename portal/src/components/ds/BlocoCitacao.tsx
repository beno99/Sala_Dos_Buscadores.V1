"use client";

import { useState } from "react";
import type { Citacao } from "@/data/types";
import { cx } from "@/lib/cx";
import { Button } from "./Button";
import { Segmented } from "./Segmented";
import { SeloProveniencia } from "./Selos";
import { useCopiar } from "./Toast";

type Vista = "orig" | "trad" | "both";

/**
 * Trecho de fonte primária com original, tradução, referência e ação de copiar (BlocoCitacao, RF-15).
 * `estreito`: numa coluna lateral, começa em "Tradução" (lado a lado empilharia) e o segmentado ocupa a largura.
 */
export function BlocoCitacao({ citacao, estreito }: { citacao: Citacao; estreito?: boolean }) {
  const temOriginal = Boolean(citacao.original);
  const [vista, setVista] = useState<Vista>(temOriginal && !estreito ? "both" : "trad");
  const copiar = useCopiar();

  return (
    <figure className="sdb-quote m-0">
      <div className="sdb-quote__head">
        <div className="sdb-row" style={{ gap: 12, flexWrap: "nowrap", minWidth: 0 }}>
          <span
            className={cx(
              "sdb-cover sdb-cover--sm",
              citacao.capa !== "bordo" && `sdb-cover--${citacao.capa}`,
            )}
            aria-hidden="true"
          >
            {citacao.inicial}
          </span>
          <div className="sdb-quote__src">
            <b>{citacao.obra}</b>
            <span>{citacao.localizacao}</span>
          </div>
        </div>
        <SeloProveniencia tipo={citacao.proveniencia} rotulo={citacao.rotuloSelo} />
      </div>

      {citacao.original && (
        <Segmented<Vista>
          label="Exibição do trecho"
          block={estreito}
          value={vista}
          onChange={setVista}
          options={[
            { value: "orig", label: "Original" },
            { value: "trad", label: "Tradução" },
            { value: "both", label: "Lado a lado" },
          ]}
        />
      )}

      <div className="sdb-quote__views" data-view={vista}>
        {citacao.original && (
          <div className="sdb-quote__part" data-part="orig">
            <span className="sdb-caption">Original · {citacao.original.idioma}</span>
            <blockquote className="sdb-quote__text sdb-quote__text--orig" lang={citacao.original.lang}>
              {citacao.original.texto}
            </blockquote>
          </div>
        )}
        <div className="sdb-quote__part" data-part="trad">
          <span className="sdb-caption">{citacao.rotuloTraducao ?? "Tradução"}</span>
          <blockquote className="sdb-quote__text">{citacao.traducao}</blockquote>
        </div>
      </div>

      <figcaption className="sdb-quote__foot">
        <cite>{citacao.referencia}</cite>
        <Button
          variant="secondary"
          size="sm"
          icon="copiar"
          onClick={() =>
            copiar(`${citacao.traducao} ${citacao.referencia}`, "Citação copiada com a referência.")
          }
        >
          Copiar citação
        </Button>
      </figcaption>
    </figure>
  );
}
