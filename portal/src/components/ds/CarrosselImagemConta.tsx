"use client";

import { useEffect, useState } from "react";
import { proximoSlide } from "@/features/estudo/banner";
import { Button } from "./Button";

const INTERVALO_MS = 8000;

const IMAGENS = [
  "/imagens/conta/carrossel-01-nag-hammadi.webp",
  "/imagens/conta/carrossel-02-hermetismo.webp",
  "/imagens/conta/carrossel-03-caibalion.webp",
  "/imagens/conta/carrossel-04-cristianismo-primitivo.webp",
  "/imagens/conta/carrossel-05-urantia.webp",
  "/imagens/conta/carrossel-06-contemplacao.webp",
];

/**
 * Carrossel de imagens do acesso (CenarioConta, variante entrada): troca a
 * cada 8 s com esmaecido cruzado de 900 ms (CSS); para com o ponteiro em
 * cima, o foco dentro, a aba oculta, `prefers-reduced-motion` e o botão de
 * pausa, como o Banner rotativo do Portal. Setas e indicadores trocam a cena
 * manualmente.
 */
export function CarrosselImagemConta() {
  const [atual, setAtual] = useState(0);
  const [pausadoPeloUsuario, setPausado] = useState(false);
  const [hover, setHover] = useState(false);
  const [foco, setFoco] = useState(false);
  const [movimentoReduzido, setReduzido] = useState(false);
  const [abaOculta, setOculta] = useState(false);
  const rodando = !(pausadoPeloUsuario || hover || foco || movimentoReduzido || abaOculta);

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
    const t = setTimeout(() => setAtual(proximoSlide(atual, IMAGENS.length)), INTERVALO_MS);
    return () => clearTimeout(t);
  }, [rodando, atual]);

  const pausaManual = pausadoPeloUsuario || movimentoReduzido;

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: ponteiro e foco só pausam o giro; as ações ficam nos botões.
    <div
      className="sdb-conta__imagem"
      role="group"
      aria-roledescription="carrossel"
      aria-label="Imagens do acervo"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFoco(false);
      }}
    >
      {IMAGENS.map((src, i) => (
        // biome-ignore lint/performance/noImgElement: gravura decorativa servida de public/imagens.
        <img
          key={src}
          src={src}
          alt=""
          className={i === atual ? "is-current" : undefined}
          fetchPriority={i === 0 ? "high" : undefined}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="sdb-conta__imagem-controls">
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          icon="chevronEsquerda"
          aria-label="Cena anterior"
          onClick={() => setAtual((i) => proximoSlide(i, IMAGENS.length, -1))}
        />
        <div className="sdb-dots" role="group" aria-label="Escolher cena">
          {IMAGENS.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Cena ${i + 1}`}
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
          aria-label="Próxima cena"
          onClick={() => setAtual((i) => proximoSlide(i, IMAGENS.length))}
        />
        <Button
          variant="secondary"
          size="sm"
          iconOnly
          icon={pausaManual ? "play" : "pausar"}
          aria-label={pausaManual ? "Retomar giro" : "Pausar giro"}
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
    </div>
  );
}
