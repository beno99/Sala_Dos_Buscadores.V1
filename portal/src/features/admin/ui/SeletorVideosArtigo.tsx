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
  const [aberto, setAberto] = useState(false);
  const encontrados = videos.filter((v) =>
    normalizar(`${v.titulo} ${v.sala}`).includes(normalizar(busca.trim())),
  );
  const selecionadosInfo = selecionados
    .map((sId) => videos.find((v) => v.id === sId))
    .filter(Boolean) as VideoSelecionavel[];

  return (
    <section className="sdb-material sdb-panel" aria-labelledby={`${id}-titulo`}>
      <h2 className="sdb-headline" id={`${id}-titulo`}>
        Vídeos relacionados
      </h2>
      <p className="sdb-help">
        Escolha vídeos do acervo, inclusive de outras Salas. Cada vídeo pode acompanhar vários artigos.
      </p>

      <div className="flex flex-col gap-3">
        <CampoTexto
          id={`${id}-busca`}
          label="Buscar e adicionar vídeos"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onFocus={() => setAberto(true)}
        />

        {aberto && (
          <div
            className="sdb-selection-list max-h-64 overflow-y-auto border border-solid rounded-lg"
            style={{ borderColor: "var(--border)" }}
          >
            {encontrados.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() =>
                  onMudar(
                    selecionados.includes(v.id)
                      ? selecionados.filter((id) => id !== v.id)
                      : [...new Set([...selecionados, v.id])],
                  )
                }
                className={`w-full text-left px-3 py-2 flex items-center gap-2 ${
                  selecionados.includes(v.id) ? "bg-slate-100" : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(v.id)}
                  onChange={() => {}}
                  className="pointer-events-none"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{v.titulo}</div>
                  <div className="text-xs text-slate-600">{v.status}</div>
                </div>
              </button>
            ))}
            {!encontrados.length && <p className="sdb-hint p-3">Nenhum vídeo encontrado.</p>}
          </div>
        )}

        {selecionadosInfo.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selecionadosInfo.map((v) => (
              <div
                key={v.id}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: "var(--neutral-bg)", color: "var(--label)" }}
              >
                {v.titulo}
                <button
                  type="button"
                  onClick={() => onMudar(selecionados.filter((id) => id !== v.id))}
                  className="text-xs hover:opacity-60"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="sdb-footnote" role="status">
          {selecionados.length} vídeo(s) selecionado(s)
        </p>
      </div>

      {erro && (
        <p className="sdb-error-msg" id="campo-videos" tabIndex={-1}>
          {erro}
        </p>
      )}
    </section>
  );
}
