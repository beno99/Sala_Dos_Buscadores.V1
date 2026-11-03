"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { Select } from "@/components/ds/CamposExtras";
import { Paginacao } from "@/components/ds/Paginacao";

export interface ItemPendente {
  id: string;
  tipo: "artigo" | "video";
  titulo: string;
  pendencias: string[];
  href: string;
}

const POR_PAGINA = 8;
const normalizar = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** "Com pendência no checklist" do Painel: busca por título, tipo, o que falta e paginação. */
export function ListaPendencias({ itens }: { itens: ItemPendente[] }) {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [falta, setFalta] = useState("");
  const [paginaPedida, setPagina] = useState(1);
  const motivos = [...new Set(itens.flatMap((i) => i.pendencias))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const filtrados = itens.filter(
    (i) =>
      (!tipo || i.tipo === tipo) &&
      (!falta || i.pendencias.includes(falta)) &&
      normalizar(i.titulo || "Sem título").includes(normalizar(busca.trim())),
  );
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagina = Math.min(paginaPedida, paginas);
  const filtrar = (mudar: () => void) => {
    mudar();
    setPagina(1);
  };

  if (itens.length === 0) return <p className="sdb-hint">Nenhum item ativo com pendência.</p>;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-3">
        <CampoTexto
          label="Buscar pelo título"
          type="search"
          autoComplete="off"
          value={busca}
          onChange={(e) => filtrar(() => setBusca(e.target.value))}
        />
        <Select
          label="Tipo"
          value={tipo}
          onChange={(e) => filtrar(() => setTipo(e.target.value))}
          opcoes={[
            { value: "", label: "Artigos e vídeos" },
            { value: "artigo", label: "Artigos" },
            { value: "video", label: "Vídeos" },
          ]}
        />
        <Select
          label="O que falta"
          value={falta}
          onChange={(e) => filtrar(() => setFalta(e.target.value))}
          opcoes={[
            { value: "", label: "Qualquer pendência" },
            ...motivos.map((m) => ({ value: m, label: m })),
          ]}
        />
      </div>
      <p className="sdb-footnote m-0" role="status">
        {filtrados.length} de {itens.length}
        {paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}
      </p>
      {filtrados.length === 0 ? (
        <p className="sdb-hint">Nenhum item corresponde aos filtros.</p>
      ) : (
        <ul className="sdb-list m-0 list-none p-0">
          {filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map((i) => (
            <li key={`${i.tipo}-${i.id}`} className="sdb-list-row">
              <span className="flex min-w-0 flex-col gap-1">
                <Link className="sdb-link" href={i.href as Route}>
                  {i.titulo || "Sem título"}
                </Link>
                <span className="sdb-footnote">
                  {i.tipo === "video" ? "Vídeo" : "Artigo"} · falta: {i.pendencias.join(" · ")}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-center">
        <Paginacao pagina={pagina} total={paginas} onPagina={setPagina} rotulo="Páginas de pendências" />
      </div>
    </div>
  );
}
