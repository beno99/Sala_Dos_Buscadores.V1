"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { CampoTexto } from "@/components/ds/Campos";
import { Select } from "@/components/ds/CamposExtras";
import { Icon } from "@/components/ds/Icon";
import { Paginacao } from "@/components/ds/Paginacao";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { formatarData } from "@/lib/texto";

export interface LinhaAnfitriaoVisual {
  id: string;
  nome: string;
  email: string;
  papel: "membro" | "anfitriao" | "administrador";
  salas: number;
  publicados: number;
  pendentes: number;
  maisAntigo: string | null;
}

export interface FiltrosAnfitrioes {
  busca: string;
  /** "" todos, "pendentes", "em-dia" ou "ex". */
  situacao: string;
  /** "" espera mais longa, "pendentes" mais pendências, "nome". */
  ordem: string;
  pagina: number;
}

const POR_PAGINA = 10;
const normalizar = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function endereco(f: FiltrosAnfitrioes) {
  const q = new URLSearchParams();
  if (f.busca.trim()) q.set("busca", f.busca.trim());
  if (f.situacao) q.set("situacao", f.situacao);
  if (f.ordem) q.set("ordem", f.ordem);
  if (f.pagina > 1) q.set("pagina", String(f.pagina));
  const texto = q.toString();
  return `/admin/anfitrioes${texto ? `?${texto}` : ""}`;
}

const porEspera = (a: LinhaAnfitriaoVisual, b: LinhaAnfitriaoVisual) => {
  if (a.maisAntigo && b.maisAntigo) return a.maisAntigo.localeCompare(b.maisAntigo);
  if (a.maisAntigo) return -1;
  if (b.maisAntigo) return 1;
  return a.nome.localeCompare(b.nome, "pt-BR");
};

/** Nível 1 da revisão: anfitriões, com busca, situação, ordem e paginação guardadas no endereço. */
export function ListaAnfitrioesAdmin({
  linhas,
  filtrosIniciais,
}: {
  linhas: LinhaAnfitriaoVisual[];
  filtrosIniciais: FiltrosAnfitrioes;
}) {
  const [f, setF] = useState(filtrosIniciais);
  const atualizar = (parcial: Partial<FiltrosAnfitrioes>) => {
    const novos = { ...f, pagina: 1, ...parcial };
    setF(novos);
    window.history.replaceState(null, "", endereco(novos));
  };
  const filtradas = linhas
    .filter(
      (l) =>
        (!f.situacao ||
          (f.situacao === "pendentes" && l.pendentes > 0) ||
          (f.situacao === "em-dia" && l.pendentes === 0 && l.papel === "anfitriao") ||
          (f.situacao === "ex" && l.papel !== "anfitriao")) &&
        normalizar(`${l.nome} ${l.email}`).includes(normalizar(f.busca.trim())),
    )
    .sort((a, b) =>
      f.ordem === "nome"
        ? a.nome.localeCompare(b.nome, "pt-BR")
        : f.ordem === "pendentes"
          ? b.pendentes - a.pendentes || porEspera(a, b)
          : porEspera(a, b),
    );
  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, f.pagina), paginas);
  const comPendencias = linhas.filter((l) => l.pendentes > 0).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-x-6 gap-y-5 nav:grid-cols-3">
        <CampoTexto
          label="Buscar por nome ou e-mail"
          type="search"
          placeholder="Ex.: Frater"
          autoComplete="off"
          value={f.busca}
          onChange={(e) => atualizar({ busca: e.target.value })}
        />
        <Select
          label="Situação"
          value={f.situacao}
          onChange={(e) => atualizar({ situacao: e.target.value })}
          opcoes={[
            { value: "", label: "Todos os anfitriões" },
            { value: "pendentes", label: `Com pendências (${comPendencias})` },
            { value: "em-dia", label: "Sem pendências" },
            { value: "ex", label: "Ex-anfitriões" },
          ]}
        />
        <Select
          label="Ordenar por"
          value={f.ordem}
          onChange={(e) => atualizar({ ordem: e.target.value })}
          opcoes={[
            { value: "", label: "Espera mais longa" },
            { value: "pendentes", label: "Mais pendências" },
            { value: "nome", label: "Nome (A–Z)" },
          ]}
        />
      </div>
      <TabelaDados<LinhaAnfitriaoVisual>
        legenda={`Anfitriões · ${filtradas.length} de ${linhas.length}${paginas > 1 ? ` · página ${pagina} de ${paginas}` : ""}`}
        navegacao
        itens={filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)}
        chave={(l) => l.id}
        rotuloItem={(l) => l.nome}
        vazio={linhas.length ? "Nenhum anfitrião corresponde aos filtros." : "Nenhum anfitrião ainda."}
        colunas={[
          {
            id: "nome",
            cabecalho: "Anfitrião",
            celula: (l) => (
              <>
                <span className="sdb-table__title">
                  <Link href={`/admin/anfitrioes/${l.id}` as Route}>{l.nome}</Link>
                </span>
                <span className="sdb-table__sub">
                  {l.email}
                  {l.papel !== "anfitriao" && " · ex-anfitrião"}
                </span>
              </>
            ),
          },
          { id: "salas", cabecalho: "Salas", className: "sdb-table__num", celula: (l) => l.salas },
          {
            id: "publicados",
            cabecalho: "Publicados",
            className: "sdb-table__num",
            celula: (l) => l.publicados,
          },
          {
            id: "pendentes",
            cabecalho: "Pendentes",
            celula: (l) =>
              l.pendentes > 0 ? (
                <span className="sdb-badge sdb-badge--review">
                  <Icon name="editar" size="sm" />
                  {l.pendentes} em revisão
                </span>
              ) : (
                <span className="sdb-footnote">Nenhum</span>
              ),
          },
          {
            id: "espera",
            cabecalho: "Envio mais antigo",
            className: "sdb-tabular",
            celula: (l) => (l.maisAntigo ? formatarData(l.maisAntigo.slice(0, 10)) : "—"),
          },
        ]}
      />
      <div className="flex justify-center">
        <Paginacao
          pagina={pagina}
          total={paginas}
          onPagina={(p) => atualizar({ pagina: p })}
          rotulo="Páginas de anfitriões"
        />
      </div>
    </div>
  );
}
