import type { Route } from "next";
import Link from "next/link";
import type { Fonte, Placa, Proveniencia } from "@/data/types";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";
import { Badge, SeloProveniencia } from "./Selos";

function Capa({ capa, inicial, small }: { capa: Placa; inicial: string; small?: boolean }) {
  return (
    <span
      className={cx("sdb-cover", capa !== "bordo" && `sdb-cover--${capa}`, small && "sdb-cover--sm")}
      aria-hidden="true"
    >
      {inicial}
    </span>
  );
}

/** Obra consultada, apresentada como um livro (CardFonte, variante card). */
export function CardFonte({ fonte }: { fonte: Fonte }) {
  const miolo = (
    <>
      <Capa capa={fonte.capa} inicial={fonte.inicial} />
      <div className="sdb-source__info">
        <h3 className="sdb-source__title">{fonte.titulo}</h3>
        <p className="sdb-source__author">{fonte.autor}</p>
        <div className="sdb-source__tags">
          {fonte.tipo === "Fonte primária" ? (
            <Badge variant="source" icon="fontePrimaria">
              {fonte.tipo}
            </Badge>
          ) : (
            <Badge variant="language" icon="artigo">
              {fonte.tipo}
            </Badge>
          )}
          <Badge variant="topic" icon="glossario">
            {fonte.tradicao}
          </Badge>
        </div>
        <p className="sdb-source__ref">
          {fonte.referencia}
          {fonte.url && " · abre em nova aba"}
        </p>
      </div>
    </>
  );
  if (!fonte.url) return <div className="sdb-card sdb-source">{miolo}</div>;
  return (
    <a
      className="sdb-card sdb-card--interactive sdb-source"
      href={fonte.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {miolo}
      <Icon name="externo" className="sdb-source__trail" />
    </a>
  );
}

/** Fonte citada pelo assistente: linha numerada (CardFonte, variante linha). */
export function LinhaFonte({
  id,
  numero,
  titulo,
  referencia,
  capa,
  inicial,
  href,
  proveniencia,
}: {
  id?: string;
  numero: number;
  titulo: string;
  referencia: string;
  capa: Placa;
  inicial: string;
  href?: string;
  /** Leitura de anfitrião citada pelo assistente: o selo vai junto. */
  proveniencia?: Proveniencia;
}) {
  const miolo = (
    <>
      <Capa capa={capa} inicial={inicial} small />
      <div className="sdb-source__info">
        <h3 className="sdb-source__title">{titulo}</h3>
        <p className="sdb-source__ref">{referencia}</p>
        {proveniencia && <SeloProveniencia tipo={proveniencia} compacto />}
      </div>
      <span className="sdb-source__num">{numero}</span>
    </>
  );
  return href ? (
    <Link id={id} href={href as Route} className="sdb-source sdb-source--row text-inherit no-underline">
      {miolo}
    </Link>
  ) : (
    <div id={id} className="sdb-source sdb-source--row">
      {miolo}
    </div>
  );
}
