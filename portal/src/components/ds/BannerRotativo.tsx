"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { Placa } from "@/data/types";
import { deveRodar, INTERVALO_BANNER_MS, proximoSlide } from "@/features/estudo/banner";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";
import { Button } from "./Button";
import { Icon } from "./Icon";

export interface MidiaBanner {
  placa: Placa;
  imagem?: string;
}

export type SlideBanner =
  | { id: string; tipo: "marca"; acoes: ReactNode; midia: MidiaBanner }
  | {
      id: string;
      tipo: "episodio";
      rotulo: string;
      titulo: [string, string];
      sub: string;
      acoes: ReactNode;
      midia: MidiaBanner;
    }
  | {
      id: string;
      tipo: "anuncio";
      anunciante: string;
      titulo: [string, string];
      texto: string;
      chamada: string;
      href: string;
      midia: MidiaBanner;
    };

function Midia({ midia }: { midia: MidiaBanner }) {
  return (
    <div className="sdb-banner__media">
      {midia.imagem ? (
        // biome-ignore lint/performance/noImgElement: imagem decorativa de tamanho fixo, servida de public/.
        <img src={midia.imagem} alt="" />
      ) : (
        <div className={`sdb-plate sdb-plate--${midia.placa}`}>
          <Arc on={midia.placa} />
        </div>
      )}
    </div>
  );
}

function Conteudo({ slide, onPorQue }: { slide: SlideBanner; onPorQue: () => void }) {
  if (slide.tipo === "marca") {
    return (
      <div className="sdb-banner__text">
        <p className="sdb-banner__label">Biblioteca digital de estudos comparados</p>
        <h2 className="sdb-banner__brand">A Sala dos Buscadores</h2>
        <p className="sdb-banner__sub">
          Um acervo curado para compreender textos, ideias e cosmologias em seus próprios contextos, sem
          hierarquias, sem respostas prontas.
        </p>
        <div className="sdb-banner__actions">{slide.acoes}</div>
      </div>
    );
  }
  if (slide.tipo === "episodio") {
    return (
      <div className="sdb-banner__text">
        <p className="sdb-banner__label">{slide.rotulo}</p>
        <h2 className="sdb-banner__title">
          {slide.titulo[0]}
          <span>{slide.titulo[1]}</span>
        </h2>
        <p className="sdb-banner__sub">{slide.sub}</p>
        <div className="sdb-banner__actions">{slide.acoes}</div>
      </div>
    );
  }
  return (
    <div className="sdb-banner__text">
      <p className="sdb-banner__label">
        <span className="sdb-badge sdb-badge--neutral">Publicidade</span>
        {slide.anunciante}
      </p>
      <h2 className="sdb-banner__title">
        {slide.titulo[0]}
        <span>{slide.titulo[1]}</span>
      </h2>
      <p className="sdb-banner__sub">{slide.texto}</p>
      <div className="sdb-banner__actions">
        <a
          className="sdb-btn sdb-btn--secondary"
          href={slide.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
        >
          {slide.chamada}
          <Icon name="externo" size="sm" />
        </a>
        <Button variant="plain" className="sdb-banner__why" onClick={onPorQue}>
          Por que estou vendo isto?
        </Button>
      </div>
    </div>
  );
}

/**
 * Banner rotativo (BannerRotativo): marca, episódios e anúncios. Gira a cada
 * 7 s e para com o botão, com o ponteiro em cima, com o foco dentro, com a aba
 * oculta e com `prefers-reduced-motion` (WCAG 2.2.2).
 */
export function BannerRotativo({ slides, onPorQue }: { slides: SlideBanner[]; onPorQue: () => void }) {
  const [atual, setAtual] = useState(0);
  const [pausadoPeloUsuario, setPausado] = useState(false);
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const [movimentoReduzido, setReduzido] = useState(false);
  const [abaOculta, setOculta] = useState(false);
  const total = slides.length;
  const rodando = total > 1 && deveRodar({ pausadoPeloUsuario, hover, foco, movimentoReduzido, abaOculta });

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduzido(Boolean(mq?.matches));
    const mudou = () => setReduzido(Boolean(mq?.matches));
    const visibilidade = () => setOculta(document.hidden);
    mq?.addEventListener?.("change", mudou);
    document.addEventListener("visibilitychange", visibilidade);
    return () => {
      mq?.removeEventListener?.("change", mudou);
      document.removeEventListener("visibilitychange", visibilidade);
    };
  }, []);

  useEffect(() => {
    if (!rodando) return;
    const t = setTimeout(() => setAtual(proximoSlide(atual, total)), INTERVALO_BANNER_MS);
    return () => clearTimeout(t);
  }, [rodando, total, atual]);

  const parado = !rodando;
  const pausaManual = pausadoPeloUsuario || movimentoReduzido;

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover e foco só pausam a rotação; as ações ficam nos botões.
    <section
      className={cx("sdb-banner sdb-banner--cheio", parado && "is-paused")}
      aria-roledescription="carrossel"
      aria-label="Destaques do Portal"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFoco(false);
      }}
    >
      <div className="sdb-banner__slides" aria-live={rodando ? "off" : "polite"}>
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cx(
              "sdb-banner__slide",
              s.tipo === "anuncio" && "sdb-banner__slide--ad",
              i === atual && "is-current",
            )}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}${s.tipo === "anuncio" ? ", publicidade" : ""}`}
            aria-hidden={i !== atual}
            inert={i !== atual}
          >
            <Conteudo slide={s} onPorQue={onPorQue} />
            <Midia midia={s.midia} />
          </div>
        ))}
      </div>
      {total > 1 && (
        <div className="sdb-banner__controls">
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon="chevronEsquerda"
            aria-label="Destaque anterior"
            onClick={() => setAtual((i) => proximoSlide(i, total, -1))}
          />
          <div className="sdb-dots" role="group" aria-label="Escolher destaque">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Destaque ${i + 1}`}
                aria-current={i === atual}
                onClick={() => setAtual(i)}
              />
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon="chevronDireita"
            aria-label="Próximo destaque"
            onClick={() => setAtual((i) => proximoSlide(i, total))}
          />
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            icon={pausaManual ? "play" : "pausar"}
            aria-label={pausaManual ? "Retomar rotação" : "Pausar rotação"}
            aria-pressed={pausaManual}
            tip={pausaManual ? "Retomar" : "Pausar"}
            onClick={() => {
              if (movimentoReduzido) {
                setReduzido(false);
                setPausado(false);
              } else setPausado((p) => !p);
            }}
          />
        </div>
      )}
    </section>
  );
}
