"use client";

import { useEffect, useRef, useState } from "react";
import { initializeDarkOrb } from "@/design-system/dark-orb.js";
import { initializeGoldOrb } from "@/design-system/gold-orb.js";
import type { AparenciaEsfera } from "@/features/assistente/contrato";

type Renderizador = ReturnType<typeof initializeGoldOrb>;
/** O DS controla redução de movimento, visibilidade e recursos WebGL. */
export function EsferaAssistente({
  aparencia,
  pausado,
  onPerguntar,
}: {
  aparencia: AparenciaEsfera;
  pausado: boolean;
  onPerguntar: () => void;
}) {
  return <Esfera key={aparencia} aparencia={aparencia} pausado={pausado} onPerguntar={onPerguntar} />;
}
function Esfera({
  aparencia,
  pausado,
  onPerguntar,
}: {
  aparencia: AparenciaEsfera;
  pausado: boolean;
  onPerguntar: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderizador | null>(null);
  const [sobre, setSobre] = useState(false);
  useEffect(() => {
    if (!canvas.current) return;
    const r = (aparencia === "gold" ? initializeGoldOrb : initializeDarkOrb)(canvas.current);
    renderer.current = r;
    return () => {
      r.destroy();
      renderer.current = null;
    };
  }, [aparencia]);
  useEffect(() => {
    renderer.current?.setPaused(pausado);
  }, [pausado]);
  useEffect(() => {
    renderer.current?.setHovered(sobre);
  }, [sobre]);
  useEffect(() => {
    const esconder = () => {
      if (document.hidden) setSobre(false);
    };
    document.addEventListener("visibilitychange", esconder);
    return () => document.removeEventListener("visibilitychange", esconder);
  }, []);
  return (
    <button
      type="button"
      className="hero-orb"
      aria-label="Começar uma pergunta"
      onClick={onPerguntar}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches)
          setSobre(true);
      }}
      onPointerLeave={() => setSobre(false)}
      onPointerCancel={() => setSobre(false)}
    >
      <span
        className={aparencia === "gold" ? "orb-visual" : "dark-visual"}
        data-hovered={sobre && !pausado}
        data-orb-paused={pausado}
        aria-hidden="true"
      >
        <canvas ref={canvas} />
        {aparencia === "gold" && (
          <span className="orb-fallback-rings">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
    </button>
  );
}
