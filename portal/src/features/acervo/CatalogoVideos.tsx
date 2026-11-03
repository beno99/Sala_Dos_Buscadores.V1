"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { Select } from "@/components/ds/CamposExtras";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Paginacao } from "@/components/ds/Paginacao";
import type { Video } from "@/data/types";
import { BotaoConcluir } from "@/features/jornada/BotaoConcluir";
import { CardDoVideo } from "./CardDoVideo";

const POR_PAGINA = 12;

export function CatalogoVideos({
  videos,
  salas,
  autores = {},
  jornada,
}: {
  videos: Video[];
  salas: { slug: string; nome: string; origem: "oficial" | "anfitriao" }[];
  /** Quem assina cada vídeo, por id. */
  autores?: Record<string, string>;
  /** Vídeos já concluídos e os do próprio anfitrião (sem botão de conclusão). */
  jornada?: { concluidos: string[]; proprios: string[] };
}) {
  const [busca, setBusca] = useState("");
  const [sala, setSala] = useState("");
  const [origem, setOrigem] = useState("");
  const [artigo, setArtigo] = useState("");
  const [curador, setCurador] = useState("");
  const [anfitriao, setAnfitriao] = useState("");
  const [pagina, setPagina] = useState(1);
  const origemDe = (v: Video) => salas.find((s) => s.slug === v.sala)?.origem;
  const pessoas = (o: "oficial" | "anfitriao") => {
    const contagem = new Map<string, number>();
    for (const v of videos) {
      const nome = autores[v.id];
      if (origemDe(v) === o && nome) contagem.set(nome, (contagem.get(nome) ?? 0) + 1);
    }
    return [...contagem]
      .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .map(([nome, n]) => ({ value: nome, label: `${nome} · ${n} ${n === 1 ? "vídeo" : "vídeos"}` }));
  };
  const filtrar =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPagina(1);
    };
  const artigos = [
    ...new Map(videos.flatMap((v) => v.artigosRelacionados ?? []).map((c) => [c.id, c])).values(),
  ];
  const encontrados = videos.filter((v) => {
    const contexto = salas.find((s) => s.slug === v.sala);
    return (
      (!sala || v.sala === sala || v.artigosRelacionados?.some((a) => a.sala === sala)) &&
      (!origem || contexto?.origem === origem) &&
      (!artigo || v.artigosRelacionados?.some((a) => a.id === artigo)) &&
      (!curador || (contexto?.origem === "oficial" && autores[v.id] === curador)) &&
      (!anfitriao || (contexto?.origem === "anfitriao" && autores[v.id] === anfitriao)) &&
      `${v.titulo} ${contexto?.nome ?? ""} ${(v.artigosRelacionados ?? []).map((a) => a.titulo).join(" ")}`
        .toLocaleLowerCase("pt-BR")
        .includes(busca.toLocaleLowerCase("pt-BR").trim())
    );
  });
  const totalPaginas = Math.max(1, Math.ceil(encontrados.length / POR_PAGINA));
  const atual = Math.min(pagina, totalPaginas);
  const visiveis = encontrados.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);
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
          onChange={(e) => filtrar(setBusca)(e.target.value)}
        />
        <Select
          label="Sala"
          value={sala}
          onChange={(e) => filtrar(setSala)(e.target.value)}
          opcoes={[
            { value: "", label: "Todas as Salas" },
            ...salas.map((s) => ({ value: s.slug, label: s.nome })),
          ]}
        />
        <Select
          label="Origem editorial"
          value={origem}
          onChange={(e) => filtrar(setOrigem)(e.target.value)}
          opcoes={[
            { value: "", label: "Todas as origens" },
            { value: "oficial", label: "Curadoria" },
            { value: "anfitriao", label: "Anfitriões" },
          ]}
        />
        <Select
          label="Curador"
          value={curador}
          onChange={(e) => filtrar(setCurador)(e.target.value)}
          opcoes={[{ value: "", label: "Todos os curadores" }, ...pessoas("oficial")]}
        />
        <Select
          label="Anfitrião"
          value={anfitriao}
          onChange={(e) => filtrar(setAnfitriao)(e.target.value)}
          opcoes={[{ value: "", label: "Todos os anfitriões" }, ...pessoas("anfitriao")]}
        />
        <Select
          label="Artigo relacionado"
          value={artigo}
          onChange={(e) => filtrar(setArtigo)(e.target.value)}
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
              setCurador("");
              setAnfitriao("");
              setPagina(1);
            },
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 items-stretch gap-5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
            {visiveis.map((v) => (
              <div key={v.id} className="flex h-full min-w-0 flex-col gap-2">
                <div className="grid flex-1">
                  <CardDoVideo video={v} nomeSala={salas.find((s) => s.slug === v.sala)?.nome ?? v.sala} />
                </div>
                {jornada && !jornada.proprios.includes(v.id) && (
                  <BotaoConcluir
                    alvo={{ tipo: "video", id: v.id }}
                    concluido={jornada.concluidos.includes(v.id)}
                  />
                )}
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
          {totalPaginas > 1 && (
            <Paginacao
              pagina={atual}
              total={totalPaginas}
              rotulo="Páginas de vídeos"
              onPagina={(p) => {
                setPagina(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
