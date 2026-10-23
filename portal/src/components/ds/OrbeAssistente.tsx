"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import { initializeGoldOrb } from "@/design-system/gold-orb.js";
import { cx } from "@/lib/cx";

type Renderizador = ReturnType<typeof initializeGoldOrb>;

const suportaPopover = () => typeof HTMLElement !== "undefined" && "showPopover" in HTMLElement.prototype;

/**
 * Orbe do assistente (BotaoFlutuante 1.0, "esfera armilar"): núcleo de ouro
 * líquido em WebGL (renderizador `gold-orb.js` do design system) com três
 * anéis que se abrem no hover. Sem WebGL, o fallback em CSS mantém o orbe
 * usável. Abre o mini chat do assistente (`alvo`) como popover nativo; onde o
 * navegador não tem popover, `onAlternar` faz o papel.
 */
export function OrbeAssistente({
  alvo,
  aberto,
  pausado,
  acimaDaBarra,
  onAlternar,
}: {
  /** id do mini chat que o orbe abre e fecha. */
  alvo: string;
  aberto: boolean;
  pausado: boolean;
  acimaDaBarra?: boolean;
  onAlternar: () => void;
}) {
  const tela = useRef<HTMLCanvasElement>(null);
  const renderizador = useRef<Renderizador | null>(null);
  const [sobre, setSobre] = useState(false);

  useEffect(() => {
    if (!tela.current) return;
    const r = initializeGoldOrb(tela.current);
    renderizador.current = r;
    return () => {
      r.destroy();
      renderizador.current = null;
    };
  }, []);

  useEffect(() => renderizador.current?.setActive(aberto), [aberto]);
  useEffect(() => renderizador.current?.setPaused(pausado), [pausado]);
  useEffect(() => renderizador.current?.setHovered(sobre), [sobre]);

  // O hover só abre os anéis com ponteiro fino; ao sair (ou esconder a aba), eles se fecham.
  useEffect(() => {
    const esconder = () => document.hidden && setSobre(false);
    document.addEventListener("visibilitychange", esconder);
    return () => document.removeEventListener("visibilitychange", esconder);
  }, []);

  return (
    <button
      className={cx("orb-launcher", acimaDaBarra && "orb-launcher--acima-da-barra")}
      type="button"
      popoverTarget={alvo}
      aria-label="Abrir o assistente"
      aria-haspopup="dialog"
      aria-controls={alvo}
      aria-expanded={aberto}
      onClick={() => {
        if (!suportaPopover()) onAlternar();
      }}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setSobre(true);
        }
      }}
      onPointerLeave={() => setSobre(false)}
      onPointerCancel={() => setSobre(false)}
    >
      <OrbeVisual tela={tela} sobre={sobre} pausado={pausado} />
      <span className="orb-launcher__label" aria-hidden="true">
        Pergunte ao acervo
      </span>
    </button>
  );
}

function OrbeVisual({
  tela,
  sobre,
  pausado,
}: {
  tela: RefObject<HTMLCanvasElement | null>;
  sobre: boolean;
  pausado: boolean;
}) {
  return (
    <span className="orb-visual" data-hovered={sobre} data-orb-paused={pausado} aria-hidden="true">
      <span className="orb-fallback-rings">
        <i />
        <i />
        <i />
      </span>
      <canvas ref={tela} data-gold-orb />
    </span>
  );
}

/** Botão "Pausar movimento" do orbe (mesmo estado em todo o app). */
export function PausarOrbe({ pausado, onAlternar }: { pausado: boolean; onAlternar: () => void }) {
  return (
    <button
      className="orb-motion"
      type="button"
      aria-pressed={pausado}
      aria-label={pausado ? "Retomar movimento do orbe" : "Pausar movimento do orbe"}
      onClick={onAlternar}
    >
      <svg viewBox="0 0 256 256" aria-hidden="true">
        {pausado ? (
          <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
        ) : (
          <path d="M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z" />
        )}
      </svg>
      <span>{pausado ? "Retomar movimento" : "Pausar movimento"}</span>
    </button>
  );
}
