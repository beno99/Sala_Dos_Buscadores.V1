"use client";
import { useId, useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { normalizar } from "@/lib/texto";
import type { VideoSelecionavel } from "@/server/vinculos-editoriais";

export function SeletorVideosArtigo({
  videos,
  selecionados,
  onMudar,
  erro,
}: {
  videos: VideoSelecionavel[];
  selecionados: string[];
  onMudar: (ids: string[]) => void;
  erro?: string;
}) {
  const id = useId();
  const [busca, setBusca] = useState("");
  const encontrados = videos.filter((v) =>
    normalizar(`${v.titulo} ${v.sala}`).includes(normalizar(busca.trim())),
  );
  return (
    <section className="sdb-material sdb-panel" aria-labelledby={`${id}-titulo`}>
      <h2 className="sdb-headline" id={`${id}-titulo`}>
        Vídeos relacionados
      </h2>
      <p className="sdb-help">
        Escolha vídeos do acervo, inclusive de outras Salas. Cada vídeo pode acompanhar vários artigos.
      </p>
      <CampoTexto
        id={`${id}-busca`}
        label="Buscar vídeos por título ou Sala"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <p className="sdb-footnote" role="status">
        {selecionados.filter((id) => videos.some((v) => v.id === id)).length} vídeo(s) selecionado(s)
      </p>
      <div className="sdb-selection-list" role="region" aria-label="Vídeos disponíveis">
        {encontrados.map((v) => (
          <label className="sdb-check" key={v.id}>
            <input
              type="checkbox"
              checked={selecionados.includes(v.id)}
              onChange={(e) =>
                onMudar(
                  e.target.checked
                    ? [...new Set([...selecionados, v.id])]
                    : selecionados.filter((id) => id !== v.id),
                )
              }
            />
            <span>
              {v.titulo}
              <small>
                {v.sala} · {v.status}
              </small>
            </span>
          </label>
        ))}
        {!encontrados.length && <p className="sdb-hint">Nenhum vídeo disponível para esta busca.</p>}
      </div>
      {erro && (
        <p className="sdb-error-msg" id="campo-videos" tabIndex={-1}>
          {erro}
        </p>
      )}
    </section>
  );
}
