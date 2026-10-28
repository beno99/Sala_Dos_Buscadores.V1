"use client";
import { useState } from "react";
import type { Placa } from "@/data/types";
import { Arc } from "./Arc";

/** Imagem decorativa; a placa permanece disponível em ausência ou falha do arquivo. */
export function ImagemAcervo({
  src,
  placa = "bordo",
  className = "",
}: {
  src?: string;
  placa?: Placa;
  className?: string;
}) {
  const [falhou, setFalhou] = useState<string>();
  return (
    <div className={`sdb-imagem-acervo ${className}`} aria-hidden="true">
      <div className={`sdb-imagem-acervo__fallback sdb-plate--${placa}`}>
        <Arc on={placa} />
      </div>
      {src && falhou !== src && (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onError trata falha da mídia, não interação.
        // biome-ignore lint/performance/noImgElement: asset local com fallback e proporção do contêiner.
        <img src={src} alt="" decoding="async" onError={() => setFalhou(src)} />
      )}
    </div>
  );
}
