import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { Conteudo, Placa } from "@/data/types";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";
import { SeloProveniencia } from "./Selos";

export type FormatoVitrine = "alto" | "horizontal" | "normal";

/**
 * Card de conteúdo para vitrines (CardConteudo › modo destaque compacto,
 * `.sala--conteudo`): a anatomia do Card Sala em destaque, com Sala, título
 * (o link cobre o card) e o Selo de proveniência, obrigatório também aqui.
 * - alto: vertical, painel embaixo, com resumo (só ele);
 * - horizontal: painel à direita na altura toda, sem resumo;
 * - normal: imagem 4:3 em cima e o texto embaixo.
 */
export function CardConteudoVitrine({
  conteudo,
  imagem,
  placa,
  formato,
  acoes,
}: {
  conteudo: Conteudo;
  imagem?: string;
  placa: Placa;
  formato: FormatoVitrine;
  /** Controles sobre a mídia, como o botão .sala__save da Estante. */
  acoes?: ReactNode;
}) {
  const id = `vitrine-${conteudo.sala}-${conteudo.slug}`;
  const destaque = formato !== "normal";
  const tipo = TIPO_ROTULO[conteudo.tipo];
  const chip = formato === "horizontal" ? tipo : `${tipo} · ${conteudo.duracaoMin} min`;
  const corpo = (
    <div className="sala__body">
      <p className="sala__onde">{salaPorSlug(conteudo.sala)?.nome}</p>
      <h3 className="sala__title" id={id}>
        <Link className="sala__link" href={`/salas/${conteudo.sala}/${conteudo.slug}` as Route}>
          {conteudo.titulo}
        </Link>
      </h3>
      {formato === "alto" && <p className="sala__description">{conteudo.resumo}</p>}
      <SeloProveniencia tipo={conteudo.proveniencia} />
    </div>
  );
  return (
    <article
      className={cx(
        "sala sala--conteudo",
        destaque ? "sala--destaque" : "sala--normal",
        formato === "alto" && "sala--amplo",
        formato === "horizontal" && "sala--horizontal",
      )}
      aria-labelledby={id}
    >
      <div className="sala__media">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: imagem decorativa servida de public/imagens.
          <img className="sala__image" src={imagem} alt="" decoding="async" />
        ) : (
          <div className={`sala__placa sdb-plate--${placa}`} aria-hidden="true">
            <Arc on={placa} />
          </div>
        )}
        <div className="sala__tools">
          <span className="sala__count">{chip}</span>
          {acoes}
        </div>
        {destaque && corpo}
      </div>
      {!destaque && corpo}
    </article>
  );
}
