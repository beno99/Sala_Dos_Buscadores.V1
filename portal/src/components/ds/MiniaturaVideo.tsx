"use client";

import { useEffect, useState } from "react";
import type { Placa } from "@/data/types";
import { carregarMiniatura } from "@/features/admin/regras/miniatura-video";
import { miniaturasYoutube } from "@/features/admin/regras/youtube";
import { Arc } from "./Arc";
import { Button } from "./Button";

type Estado = "carregando" | "pronta" | "erro";

/** A chave reinicia o estado ao trocar o link; o cleanup ignora respostas antigas. */
export function MiniaturaVideo({
  id,
  imagem,
  placa,
  mostrarEstado,
  titulo,
  className = "video__image",
}: {
  id?: string;
  imagem?: string;
  placa: Placa;
  mostrarEstado?: boolean;
  titulo?: string;
  className?: string;
}) {
  const [tentativa, setTentativa] = useState(0);
  const [src, setSrc] = useState<string>();
  const [estado, setEstado] = useState<Estado>("carregando");
  // biome-ignore lint/correctness/useExhaustiveDependencies: tentativa reinicia o carregamento por ação explícita.
  useEffect(() => {
    setSrc(undefined);
    setEstado("carregando");
    return carregarMiniatura([...(imagem ? [imagem] : []), ...(id ? miniaturasYoutube(id) : [])], (url) => {
      setSrc(url);
      setEstado(url ? "pronta" : "erro");
    });
  }, [id, imagem, tentativa]);

  return (
    <>
      {src ? (
        // biome-ignore lint/performance/noImgElement: URL validada e carregada com fallback antes da exibição.
        <img
          className={className}
          src={src}
          alt={titulo ? `Miniatura do vídeo: ${titulo}` : ""}
          width={736}
          height={414}
          decoding="async"
        />
      ) : (
        <div className={`video__placa sdb-plate--${placa}`} aria-hidden="true">
          <Arc line on={placa} />
        </div>
      )}
      {mostrarEstado && (
        <div className="video__thumbnail-status sdb-footnote" role="status">
          {estado === "carregando" && "Carregando miniatura…"}
          {estado === "erro" && (
            <>
              Miniatura indisponível.{" "}
              <Button variant="plain" onClick={() => setTentativa((v) => v + 1)}>
                Tentar novamente
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
