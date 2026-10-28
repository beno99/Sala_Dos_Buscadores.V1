import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { Conteudo } from "@/data/types";
import { percentualDeLeitura } from "@/features/portal/composicao";
import { Icon } from "./Icon";
import { ImagemAcervo } from "./ImagemAcervo";
import { SeloProveniencia } from "./Selos";

/** PortalInicio: um único link, percentual e barra derivados do mesmo valor. */
export function RetomadaPortal({
  conteudo,
  imagem,
  pct,
}: {
  conteudo: Conteudo;
  imagem?: string;
  pct?: number;
}) {
  const sala = salaPorSlug(conteudo.sala);
  const percentual = pct === undefined ? undefined : percentualDeLeitura(pct);
  return (
    <article className="sdb-retomada">
      <div className="sdb-retomada__media">
        <ImagemAcervo src={imagem} placa={sala?.placa ?? "bordo"} />
        <div className="sdb-retomada__selo">
          <SeloProveniencia tipo={conteudo.proveniencia} />
        </div>
        <div className="sdb-retomada__body">
          <p className="sdb-retomada__meta">
            {TIPO_ROTULO[conteudo.tipo]} · {conteudo.duracaoMin} min
          </p>
          <p className="sdb-retomada__sala">{sala?.nome}</p>
          <h3>{conteudo.titulo}</h3>
          {percentual !== undefined && (
            <div className="sdb-retomada__progresso">
              <span className="sdb-progress__track" aria-hidden="true">
                <i style={{ "--p": percentual / 100 } as CSSProperties} />
              </span>
              <span>{percentual}% lido</span>
            </div>
          )}
          <Link className="sdb-retomada__cta" href={`/salas/${conteudo.sala}/${conteudo.slug}` as Route}>
            {pct === undefined ? "Começar a leitura" : "Retomar leitura"}
            <Icon name="seta" />
            <span className="sdb-sr">: {conteudo.titulo}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
