"use client";

import { useEffect, useState } from "react";
import { proximoSlide } from "@/features/estudo/banner";

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
 * cima, a aba oculta e `prefers-reduced-motion`, como o Banner rotativo do
 * Portal. Puramente decorativo: sem controles, `aria-hidden`.
 */
export function CarrosselImagemConta() {
  const [atual, setAtual] = useState(0);
  const [hover, setHover] = useState(false);
  const [movimentoReduzido, setReduzido] = useState(false);
  const [abaOculta, setOculta] = useState(false);
  const rodando = !(hover || movimentoReduzido || abaOculta);

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

  return (
    <div
      className="sdb-conta__imagem"
      aria-hidden="true"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
    </div>
  );
}
