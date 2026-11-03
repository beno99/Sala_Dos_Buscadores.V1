"use client";

import { useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { Select } from "@/components/ds/CamposExtras";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Paginacao } from "@/components/ds/Paginacao";
import type { Conteudo } from "@/data/types";
import { NOME_NIVEL } from "@/features/estudo/niveis";
import { normalizar, plural } from "@/lib/texto";

const POR_PAGINA = 12;
const VAZIAS = new Set(
  "quero queria busco procuro preciso um uma uns umas o a os as de do da dos das sobre artigo artigos texto textos algo que me e em no na para por com".split(
    " ",
  ),
);

export function CatalogoArtigos({
  artigos,
  salas,
  temas,
  temaInicial = "",
}: {
  artigos: Conteudo[];
  salas: { slug: string; nome: string; origem: "oficial" | "anfitriao" }[];
  temas: { slug: string; nome: string }[];
  temaInicial?: string;
}) {
  const [busca, setBusca] = useState("");
  const [sala, setSala] = useState("");
  const [tema, setTema] = useState(temaInicial);
  const [nivel, setNivel] = useState("");
  const [origem, setOrigem] = useState("");
  const [pagina, setPagina] = useState(1);
  const filtrar = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPagina(1);
  };
  // ponytail: busca por palavras com lista fixa de palavras vazias; trocar por busca no servidor se o acervo crescer muito
  const termos = normalizar(busca)
    .split(" ")
    .filter((t) => t.length > 1 && !VAZIAS.has(t));
  const encontrados = artigos.filter((c) => {
    const contexto = salas.find((s) => s.slug === c.sala);
    const texto = normalizar(
      [
        c.titulo,
        c.resumo,
        c.autoria.nome,
        contexto?.nome ?? "",
        ...c.temas.map((t) => temas.find((x) => x.slug === t)?.nome ?? t),
      ].join(" "),
    );
    return (
      (!sala || c.sala === sala) &&
      (!tema || c.temas.includes(tema)) &&
      (!nivel || `${c.nivel}` === nivel) &&
      (!origem || contexto?.origem === origem) &&
      termos.every((t) => texto.includes(t))
    );
  });
  const totalPaginas = Math.max(1, Math.ceil(encontrados.length / POR_PAGINA));
  const atual = Math.min(pagina, totalPaginas);
  const visiveis = encontrados.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA);
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="sdb-meta">Acervo escrito</p>
        <h1 className="sdb-title-1">Artigos</h1>
        <p className="sdb-body-sm">Encontre artigos por tema, Sala, nível ou origem editorial.</p>
      </header>
      <div className="sdb-grid">
        <CampoTexto
          label="O que você quer estudar?"
          type="search"
          placeholder="Ex.: um artigo sobre gnose"
          value={busca}
          onChange={(e) => filtrar(setBusca)(e.target.value)}
        />
        <Select
          label="Tema"
          value={tema}
          onChange={(e) => filtrar(setTema)(e.target.value)}
          opcoes={[
            { value: "", label: "Todos os temas" },
            ...temas.map((t) => ({ value: t.slug, label: t.nome })),
          ]}
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
          label="Nível"
          value={nivel}
          onChange={(e) => filtrar(setNivel)(e.target.value)}
          opcoes={[
            { value: "", label: "Todos os níveis" },
            ...([1, 2, 3] as const).map((n) => ({ value: `${n}`, label: NOME_NIVEL[n] })),
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
      </div>
      <p className="sdb-footnote" role="status">
        {plural(encontrados.length, "artigo encontrado", "artigos encontrados")}
      </p>
      {!encontrados.length ? (
        <EstadoSecao
          compacto
          simbolo="busca"
          titulo="Nenhum artigo encontrado"
          descricao="Experimente outro termo ou remova os filtros."
          acao={{
            rotulo: "Limpar filtros",
            executar: () => {
              setBusca("");
              setSala("");
              setTema("");
              setNivel("");
              setOrigem("");
              setPagina(1);
            },
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 items-stretch gap-5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
            {visiveis.map((c) => (
              <CardConteudo key={`${c.sala}-${c.slug}`} conteudo={c} />
            ))}
          </div>
          {totalPaginas > 1 && (
            <Paginacao
              pagina={atual}
              total={totalPaginas}
              rotulo="Páginas de artigos"
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
