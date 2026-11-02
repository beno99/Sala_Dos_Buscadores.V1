"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { Select } from "@/components/ds/CamposExtras";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import type { Video } from "@/data/types";
import { CardDoVideo } from "./CardDoVideo";

export function CatalogoVideos({
  videos,
  salas,
}: {
  videos: Video[];
  salas: { slug: string; nome: string; origem: "oficial" | "anfitriao" }[];
}) {
  const [busca, setBusca] = useState("");
  const [sala, setSala] = useState("");
  const [origem, setOrigem] = useState("");
  const [artigo, setArtigo] = useState("");
  const artigos = [
    ...new Map(videos.flatMap((v) => v.artigosRelacionados ?? []).map((c) => [c.id, c])).values(),
  ];
  const encontrados = videos.filter((v) => {
    const contexto = salas.find((s) => s.slug === v.sala);
    return (
      (!sala || v.sala === sala || v.artigosRelacionados?.some((a) => a.sala === sala)) &&
      (!origem || contexto?.origem === origem) &&
      (!artigo || v.artigosRelacionados?.some((a) => a.id === artigo)) &&
      `${v.titulo} ${contexto?.nome ?? ""} ${(v.artigosRelacionados ?? []).map((a) => a.titulo).join(" ")}`
        .toLocaleLowerCase("pt-BR")
        .includes(busca.toLocaleLowerCase("pt-BR").trim())
    );
  });
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="sdb-meta">Acervo audiovisual</p>
        <h1 className="sdb-title-1">Vídeos</h1>
        <p className="sdb-body-sm">Encontre vídeos por Sala, artigo ou origem editorial.</p>
      </header>
      <div className="sdb-grid">
        <CampoTexto
          label="Buscar vídeos ou artigos relacionados"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Select
          label="Sala"
          value={sala}
          onChange={(e) => setSala(e.target.value)}
          opcoes={[
            { value: "", label: "Todas as Salas" },
            ...salas.map((s) => ({ value: s.slug, label: s.nome })),
          ]}
        />
        <Select
          label="Origem editorial"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
          opcoes={[
            { value: "", label: "Todas as origens" },
            { value: "oficial", label: "Curadoria" },
            { value: "anfitriao", label: "Anfitriões" },
          ]}
        />
        <Select
          label="Artigo relacionado"
          value={artigo}
          onChange={(e) => setArtigo(e.target.value)}
          opcoes={[
            { value: "", label: "Todos, inclusive vídeos sem artigo" },
            ...artigos.map((a) => ({ value: a.id, label: a.titulo })),
          ]}
        />
      </div>
      <p className="sdb-footnote" role="status">
        {encontrados.length} {encontrados.length === 1 ? "vídeo encontrado" : "vídeos encontrados"}
      </p>
      {!encontrados.length ? (
        <EstadoSecao
          compacto
          simbolo="busca"
          titulo="Nenhum vídeo encontrado"
          descricao="Experimente outro termo ou remova os filtros."
          acao={{
            rotulo: "Limpar filtros",
            executar: () => {
              setBusca("");
              setSala("");
              setOrigem("");
              setArtigo("");
            },
          }}
        />
      ) : (
        <div className="sdb-grid">
          {encontrados.map((v) => (
            <div key={v.id} className="flex min-w-0 flex-col gap-2">
              <CardDoVideo video={v} nomeSala={salas.find((s) => s.slug === v.sala)?.nome ?? v.sala} />
              <p className="sdb-footnote">
                {salas.find((s) => s.slug === v.sala)?.origem === "anfitriao"
                  ? "Sala de Anfitrião"
                  : "Curadoria"}
              </p>
              {Boolean(v.artigosRelacionados?.length) && (
                <details>
                  <summary className="sdb-link">
                    Artigos relacionados ({v.artigosRelacionados?.length})
                  </summary>
                  <ul>
                    {v.artigosRelacionados?.map((a) => (
                      <li key={a.id}>
                        <Link className="sdb-link" href={`/salas/${a.sala}/${a.slug}` as Route}>
                          {a.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
