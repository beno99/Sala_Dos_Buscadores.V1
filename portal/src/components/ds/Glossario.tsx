"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { salaPorSlug } from "@/data/catalogo";
import type { Verbete } from "@/data/types";
import { AccordionItem } from "./Accordion";
import { Arc } from "./Arc";
import { TextoMarcado } from "./TextoMarcado";

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const inicial = (termo: string) => termo.normalize("NFD").charAt(0).toUpperCase();

/**
 * Glossário com índice A–Z e verbetes em accordion (VerbeteGlossario, RF-14).
 * Letras sem verbete ficam desabilitadas; o primeiro verbete da letra abre sozinho.
 */
export function Glossario({
  verbetes,
  idTitulo,
  onAbrir,
}: {
  verbetes: Verbete[];
  idTitulo?: string;
  /** Chamado quando a pessoa abre um verbete. */
  onAbrir?: (termo: string) => void;
}) {
  const disponiveis = new Set(verbetes.map((v) => inicial(v.termo)));
  const [letra, setLetra] = useState(() => LETRAS.find((l) => disponiveis.has(l)) ?? "A");
  const daLetra = verbetes.filter((v) => inicial(v.termo) === letra);

  if (verbetes.length === 0) {
    return <p className="sdb-hint">Esta Sala ainda não tem verbetes publicados no glossário.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sdb-alpha" role="group" aria-label="Letra inicial" aria-describedby={idTitulo}>
        {LETRAS.map((l) => {
          const tem = disponiveis.has(l);
          return (
            <button
              key={l}
              type="button"
              disabled={!tem}
              aria-pressed={l === letra}
              aria-label={tem ? `Letra ${l}` : `Letra ${l}, sem verbetes`}
              onClick={() => setLetra(l)}
            >
              {l}
            </button>
          );
        })}
      </div>
      <div className="sdb-gloss">
        {daLetra.map((v, i) => (
          <AccordionItem
            key={`${letra}-${v.termo}`}
            className="sdb-gloss__item"
            defaultOpen={i === 0}
            onToggle={(aberto) => {
              if (aberto) onAbrir?.(v.termo);
            }}
            bodyClassName="flex flex-col gap-4"
            title={
              <span>
                <span className="sdb-gloss__term">{v.termo}</span>
                <span className="sdb-gloss__origin">{v.origem}</span>
              </span>
            }
          >
            {v.definicoes.map((d) => (
              <p key={d.sala} className="m-0">
                {v.definicoes.length > 1 && <b>{salaPorSlug(d.sala)?.nome}. </b>}
                <TextoMarcado texto={d.texto} />
              </p>
            ))}
            <div className="sdb-row" style={{ gap: 8 }}>
              {v.definicoes.map((d) => (
                <Link key={d.sala} href={`/salas/${d.sala}` as Route} className="sdb-chip sdb-chip--sm">
                  <Arc />
                  {salaPorSlug(d.sala)?.nome}
                </Link>
              ))}
            </div>
            <p className="sdb-gloss__note">Verbete redigido por: {v.redigidoPor}.</p>
          </AccordionItem>
        ))}
      </div>
    </div>
  );
}
