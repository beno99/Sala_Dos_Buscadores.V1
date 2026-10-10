"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState, useTransition } from "react";
import { Button } from "@/components/ds/Button";
import { Chip } from "@/components/ds/Chip";
import { Icon } from "@/components/ds/Icon";
import { Segmented } from "@/components/ds/Segmented";
import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import type { SalaSlug } from "@/data/types";
import { cx } from "@/lib/cx";
import { FILTROS_VAZIOS, type FiltrosBusca, type ModoBusca, paraQueryString } from "./busca";

const PLACEHOLDER: Record<ModoBusca, string> = {
  tema: "O que acontece com a alma após a morte?",
  sala: "Buscar dentro das Salas escolhidas",
};

const DICA = "Escreva uma pergunta ou escolha um tema para ver a resposta de cada Sala lado a lado.";

interface BarraBuscaProps {
  /** Filtros já aplicados (na página de resultados); na Home, vazio. */
  filtros?: FiltrosBusca;
  /** Resumo do resultado atual, lido por leitores de tela. */
  resumo?: string;
  className?: string;
}

/**
 * Barra de busca dupla (BarraBusca, RF-17): por Sala/tradição ou por
 * tema/pergunta. Envia para /comparar, que mostra a grade e a lista.
 */
export function BarraBusca({ filtros = FILTROS_VAZIOS, resumo, className }: BarraBuscaProps) {
  const router = useRouter();
  const idCampo = useId();
  const [modo, setModo] = useState<ModoBusca>(filtros.modo);
  const [q, setQ] = useState(filtros.q);
  const [salas, setSalas] = useState<SalaSlug[]>(filtros.salas);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const texto = q.trim();
    if (!texto && (modo === "tema" || salas.length === 0)) {
      setErro(
        modo === "tema"
          ? "Erro: escreva uma pergunta ou escolha um tema abaixo."
          : "Erro: escolha ao menos uma Sala ou escreva o que procura.",
      );
      document.getElementById(idCampo)?.focus();
      return;
    }
    setErro(null);
    // Uma nova pergunta substitui o tema escolhido antes; Sala, nível e formato continuam.
    const destino = { ...filtros, q: texto, modo, temas: [], salas: modo === "sala" ? salas : filtros.salas };
    iniciar(() => router.push(`/comparar${paraQueryString(destino)}` as Route));
  };

  const alternarSala = (slug: SalaSlug) =>
    setSalas((atual) => (atual.includes(slug) ? atual.filter((s) => s !== slug) : [...atual, slug]));

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <form className={cx("sdb-searchbar", erro && "is-error")} role="search" noValidate onSubmit={enviar}>
        <div className="sdb-row sdb-row--between" style={{ padding: "2px 2px 0" }}>
          <Segmented<ModoBusca>
            label="Modo de busca"
            value={modo}
            onChange={(m) => {
              setModo(m);
              setErro(null);
            }}
            options={[
              { value: "sala", label: "Por Sala" },
              { value: "tema", label: "Por tema ou pergunta" },
            ]}
          />
        </div>
        <div className="sdb-searchbar__row">
          <Icon name="busca" />
          <label className="sdb-sr" htmlFor={idCampo}>
            {modo === "tema" ? "Tema ou pergunta" : "Buscar nas Salas escolhidas"}
          </label>
          <input
            id={idCampo}
            type="search"
            autoComplete="off"
            enterKeyHint="search"
            value={q}
            placeholder={PLACEHOLDER[modo]}
            aria-invalid={erro ? true : undefined}
            aria-describedby={`${idCampo}-msg`}
            onChange={(e) => {
              setQ(e.target.value);
              setErro(null);
            }}
          />
          <Button variant="primary" type="submit" loading={enviando}>
            {modo === "tema" ? "Comparar" : "Buscar"}
          </Button>
        </div>
        <div className="sdb-searchbar__foot">
          {modo === "tema"
            ? todosOsTemas().map((t) => (
                <Chip
                  key={t.slug}
                  small
                  onClick={() => {
                    setQ(t.nome);
                    setErro(null);
                    document.getElementById(idCampo)?.focus();
                  }}
                >
                  {t.nome}
                </Chip>
              ))
            : todasAsSalas().map((s) => (
                <Chip
                  key={s.slug}
                  small
                  arc
                  pressed={salas.includes(s.slug)}
                  onClick={() => alternarSala(s.slug)}
                >
                  {s.nome}
                </Chip>
              ))}
        </div>
      </form>
      <p id={`${idCampo}-msg`} className="sdb-hint px-2" aria-live="polite">
        {erro ?? (enviando ? "Consultando as Salas…" : (resumo ?? DICA))}
      </p>
    </div>
  );
}
