import type { Metadata, Route } from "next";
import Link from "next/link";
import { ListaHistorico } from "@/components/ds/Curadoria";
import type { AcaoAuditada, TipoItemAuditado } from "@/data/types";
import { historicoGeral } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Histórico" };

const TIPOS: { value: TipoItemAuditado | ""; label: string }[] = [
  { value: "", label: "Tudo" },
  { value: "artigo", label: "Artigos" },
  { value: "video", label: "Vídeos" },
  { value: "fonte", label: "Fontes" },
  { value: "destaques", label: "Destaques" },
  { value: "acervo", label: "Acervo" },
];

const GRUPOS: { value: string; label: string; acoes: AcaoAuditada[] }[] = [
  { value: "", label: "Todas as ações", acoes: [] },
  {
    value: "status",
    label: "Mudanças de status",
    acoes: ["publicou", "despublicou", "arquivou", "restaurou"],
  },
  { value: "edicao", label: "Criação e edição", acoes: ["criou", "editou", "duplicou", "excluiu"] },
  {
    value: "sensivel",
    label: "Proveniência e situação jurídica",
    acoes: ["alterou-proveniencia", "alterou-situacao-juridica"],
  },
];

/** Histórico geral de auditoria (RNF-04). Só leitura: nenhuma tela edita ou apaga registros. */
export default async function Historico(props: PageProps<"/admin/historico">) {
  const p = await props.searchParams;
  const tipo = TIPOS.find((t) => t.value === p.tipo)?.value ?? "";
  const grupo = GRUPOS.find((g) => g.value === p.acao) ?? GRUPOS[0];
  const registros = historicoGeral().filter(
    (r) => (!tipo || r.tipoItem === tipo) && (!grupo?.acoes.length || grupo.acoes.includes(r.acao)),
  );
  const href = (t: string, a: string) => {
    const q = new URLSearchParams({ ...(t ? { tipo: t } : {}), ...(a ? { acao: a } : {}) }).toString();
    return `/admin/historico${q ? `?${q}` : ""}` as Route;
  };
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Histórico de auditoria</h1>
        <p className="sdb-body-sm sdb-secondary">
          Quem fez o quê e quando, com os valores antes e depois dos campos sensíveis. Os registros só são
          acrescentados: ninguém os edita nem apaga.
        </p>
      </header>
      <nav className="flex flex-col gap-3" aria-label="Filtros do histórico">
        <div className="sdb-row">
          {TIPOS.map((t) => (
            <Link
              key={t.value}
              className="sdb-chip sdb-chip--sm"
              aria-current={tipo === t.value ? "true" : undefined}
              href={href(t.value, grupo?.value ?? "")}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="sdb-row">
          {GRUPOS.map((g) => (
            <Link
              key={g.value}
              className="sdb-chip sdb-chip--sm"
              aria-current={grupo?.value === g.value ? "true" : undefined}
              href={href(tipo, g.value)}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </nav>
      <p className="sdb-footnote" aria-live="polite">
        {registros.length} {registros.length === 1 ? "registro" : "registros"}.
      </p>
      <ListaHistorico
        registros={registros}
        vazio="Nenhum registro com estes filtros desde que o servidor iniciou."
      />
    </>
  );
}
