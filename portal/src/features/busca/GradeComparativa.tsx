"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Arc } from "@/components/ds/Arc";
import { Icon } from "@/components/ds/Icon";
import { ICONE_PROVENIENCIA } from "@/components/ds/Selos";
import { TextoMarcado } from "@/components/ds/TextoMarcado";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { NIVEL_ROTULO, PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type { Comparacao, RespostaComparada, SalaSlug } from "@/data/types";

const hrefLer = (r: RespostaComparada): Route =>
  (r.conteudo ? `/salas/${r.sala}/${r.conteudo}` : `/salas/${r.sala}`) as Route;

function Seta() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 12h15m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Um card por Sala (CardComparativo 1.0): cabeçalho em placa, resposta na voz da tradição, fonte e nível. */
function CardComparativo({
  resposta,
  placa,
  onRemover,
}: {
  resposta: RespostaComparada;
  placa: "bordo" | "grafite";
  onRemover?: () => void;
}) {
  const sala = salaPorSlug(resposta.sala);
  if (!sala) return null;
  const id = `comparacao-${resposta.sala}`;

  if (resposta.vazia) {
    return (
      <article
        className="comparativo comparativo--empty"
        data-sala={resposta.sala}
        aria-label={`${sala.nome}: sem resposta direta`}
      >
        <header className="comparativo__head" data-plate="bege">
          <span className="comparativo__arc" aria-hidden="true">
            <Arc on="bege" />
          </span>
          <h3 className="comparativo__title" id={id}>
            {sala.nome}
          </h3>
          <p className="comparativo__tradition">{sala.tradicaoCurta}</p>
        </header>
        <div className="comparativo__answer">
          <span className="comparativo__empty-label">
            <Icon name="info" size="sm" />
            Sem resposta direta
          </span>
          <p>{resposta.nota}</p>
        </div>
        <footer className="comparativo__foot">
          <Link className="comparativo__action" href={hrefLer(resposta)}>
            {resposta.linkRotulo}
            <Seta />
          </Link>
        </footer>
      </article>
    );
  }

  return (
    <article className="comparativo" data-sala={resposta.sala} aria-label={sala.nome}>
      <header className="comparativo__head" data-plate={placa}>
        <span className="comparativo__arc" aria-hidden="true">
          <Arc on={placa} />
        </span>
        {onRemover && (
          <button
            className="comparativo__remove"
            type="button"
            aria-label={`Remover ${sala.nome} da comparação`}
            onClick={onRemover}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <h3 className="comparativo__title" id={id}>
          {sala.nome}
        </h3>
        <p className="comparativo__tradition">{sala.tradicaoCurta}</p>
      </header>
      <div className="comparativo__answer">
        <p>
          <TextoMarcado texto={resposta.resposta} />
        </p>
      </div>
      <footer className="comparativo__foot">
        <div className="comparativo__badges">
          <span className="comparativo__source">
            <Icon name={ICONE_PROVENIENCIA[resposta.proveniencia]} size="sm" />
            {PROVENIENCIA_ROTULO[resposta.proveniencia]}
          </span>
          <span className="comparativo__level" data-level={resposta.nivel}>
            <span className="comparativo__steps" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {NIVEL_ROTULO[resposta.nivel]}
          </span>
        </div>
        <p className="comparativo__reference">{resposta.referencia}</p>
        <Link className="comparativo__action" href={hrefLer(resposta)}>
          <span>
            Ler na Sala<span className="sdb-sr"> {sala.nome}</span>
          </span>
          <Seta />
        </Link>
      </footer>
    </article>
  );
}

function CardEsqueleto() {
  return (
    <article className="comparativo" aria-busy="true">
      <div className="comparativo__head sdb-skel" />
      <div className="comparativo__answer flex flex-col gap-3">
        <div className="sdb-skel h-4" />
        <div className="sdb-skel h-4" />
        <div className="sdb-skel h-4 w-3/5" />
      </div>
    </article>
  );
}

/** Esqueleto da grade enquanto as Salas são consultadas. */
export function GradeComparativaEsqueleto({ colunas = 5 }: { colunas?: number }) {
  return (
    <section className="comparison" aria-busy="true" aria-label="Consultando as Salas">
      <div className="comparison__intro flex flex-col gap-4">
        <div className="sdb-skel h-3 w-1/4" />
        <div className="sdb-skel h-10 w-4/5" />
      </div>
      <div className="comparison__track mt-6">
        {Array.from({ length: colunas }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: esqueleto sem identidade própria.
          <CardEsqueleto key={i} />
        ))}
      </div>
    </section>
  );
}

/**
 * Grade comparativa (GradeComparativa 1.0, RF-18/RF-19): a mesma pergunta com
 * a resposta de cada Sala na sua própria voz, sem síntese única. Os cards
 * seguem a ordem fixa das Salas, nunca "a mais correta". Remover só oculta a
 * Sala nesta tela; "Desfazer" traz a última de volta e "Restaurar salas",
 * todas. Ao menos uma Sala fica na grade.
 */
export function GradeComparativa({ comparacao }: { comparacao: Comparacao }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [removidas, setRemovidas] = useState<SalaSlug[]>([]);
  const [focoPendente, setFocoPendente] = useState<SalaSlug | null>(null);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(true);

  const visiveis = comparacao.respostas.filter((r) => !removidas.includes(r.sala));
  const diretas = visiveis.filter((r) => !r.vazia).length;
  const semResposta = visiveis.length - diretas;
  const ultima = removidas.at(-1);

  const medir = useCallback(() => {
    const t = trilho.current;
    if (!t) return;
    setInicio(t.scrollLeft <= 1);
    setFim(t.scrollLeft + t.clientWidth >= t.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const t = trilho.current;
    if (!t) return;
    medir();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", medir);
      return () => window.removeEventListener("resize", medir);
    }
    const observador = new ResizeObserver(medir);
    observador.observe(t);
    return () => observador.disconnect();
  }, [medir]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mede de novo quando a quantidade de Salas muda.
  useEffect(() => {
    medir();
  }, [medir, visiveis.length]);

  // Depois de remover ou desfazer, o foco vai para o controle da Sala vizinha (ou da que voltou).
  useEffect(() => {
    if (!focoPendente) return;
    const card = trilho.current?.querySelector(`[data-sala="${focoPendente}"]`);
    const alvo = card?.querySelector<HTMLElement>(".comparativo__remove") ?? card?.querySelector("a");
    alvo?.focus({ preventScroll: true });
    setFocoPendente(null);
  }, [focoPendente]);

  const remover = (r: RespostaComparada) => {
    if (visiveis.length <= 1) return;
    const i = visiveis.findIndex((v) => v.sala === r.sala);
    const vizinha = visiveis[i + 1] ?? visiveis[i - 1];
    setRemovidas((atual) => [...atual, r.sala]);
    setFocoPendente(vizinha?.sala ?? null);
  };
  const desfazer = () => {
    if (!ultima) return;
    setRemovidas((atual) => atual.slice(0, -1));
    setFocoPendente(ultima);
  };
  const restaurar = () => {
    setRemovidas([]);
    setFocoPendente(comparacao.respostas[0]?.sala ?? null);
  };
  const mover = (direcao: 1 | -1) => {
    const t = trilho.current;
    const primeiro = t?.querySelector(".comparativo");
    if (!t || !primeiro) return;
    const intervalo = Number.parseFloat(getComputedStyle(t).columnGap) || 0;
    t.scrollBy({ left: direcao * (primeiro.getBoundingClientRect().width + intervalo), behavior: "auto" });
  };

  let indice = 0;
  return (
    <section className="comparison" aria-labelledby="pergunta-central">
      <div className="comparison__intro">
        <p className="eyebrow">Uma pergunta, diferentes tradições</p>
        <h2 id="pergunta-central">{comparacao.pergunta}</h2>
        <div className="comparison__topics" role="list" aria-label="Temas">
          {comparacao.temasLigados.map((t) => (
            <span key={t} role="listitem">
              {temaPorSlug(t)?.nome}
            </span>
          ))}
        </div>
      </div>

      <div className="comparison__toolbar">
        <p aria-live="polite">
          {diretas} {diretas === 1 ? "Sala responde" : "Salas respondem"} diretamente
          {semResposta > 0 && `, ${semResposta} não ${semResposta === 1 ? "trata" : "tratam"} do tema`}.
        </p>
        <div className="comparison__controls">
          {removidas.length > 0 && (
            <button className="comparison__reset" type="button" onClick={restaurar}>
              Restaurar salas
            </button>
          )}
          <button
            className="comparison__nav comparison__nav--previous"
            type="button"
            aria-label="Salas anteriores"
            disabled={inicio}
            onClick={() => mover(-1)}
          >
            <Seta />
          </button>
          <button
            className="comparison__nav"
            type="button"
            aria-label="Próximas salas"
            disabled={fim}
            onClick={() => mover(1)}
          >
            <Seta />
          </button>
        </div>
      </div>

      {ultima && (
        <div className="comparison__notice">
          <span role="status">{salaPorSlug(ultima)?.nome} saiu da comparação.</span>
          <button type="button" onClick={desfazer}>
            Desfazer
          </button>
        </div>
      )}

      <div
        ref={trilho}
        className="comparison__track"
        role="region"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a área rola na horizontal e precisa receber foco pelo teclado (WCAG 2.1.1).
        tabIndex={0}
        aria-label="Respostas por Sala; role na horizontal"
        onScroll={medir}
      >
        {visiveis.map((r) => {
          const placa = r.vazia ? "bordo" : indice++ % 2 === 0 ? "bordo" : "grafite";
          return (
            <CardComparativo
              key={r.sala}
              resposta={r}
              placa={placa}
              onRemover={visiveis.length > 1 ? () => remover(r) : undefined}
            />
          );
        })}
      </div>

      <p className="comparison__note">
        <Icon name="info" size="sm" />
        <span>
          Sem síntese única: cada Sala mantém o vocabulário da sua tradição (termos em destaque) e aponta a
          fonte. As respostas não são ordenadas por correção, e as divergências entre elas ficam visíveis.
        </span>
      </p>
    </section>
  );
}
