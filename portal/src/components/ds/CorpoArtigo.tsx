import type { ReactNode } from "react";
import type { BlocoCorpo } from "@/data/types";
import { cx } from "@/lib/cx";
import { TextoMarcado } from "./TextoMarcado";

/**
 * Um bloco do Corpo do artigo, com a mesma marcação da página: lead,
 * parágrafo, intertítulo, destaque (figure > blockquote + figcaption) e
 * imagem com legenda e crédito. O editor de blocos usa o mesmo componente na
 * pré-visualização.
 */
export function BlocoDoCorpo({ bloco, lead }: { bloco: BlocoCorpo; lead?: boolean }) {
  if (typeof bloco === "string") {
    return (
      <p className={lead ? "sdb-articlebody__lead" : "sdb-body"}>
        <TextoMarcado texto={bloco} />
      </p>
    );
  }
  const alinhamento = "alinhamento" in bloco ? `sdb-texto--${bloco.alinhamento ?? "esquerda"}` : "";
  if (bloco.tipo === "paragrafo")
    return (
      <p
        className={cx(
          lead ? "sdb-articlebody__lead" : "sdb-body",
          alinhamento,
          !!bloco.recuo && `sdb-texto--recuo-${bloco.recuo}`,
        )}
      >
        <TextoMarcado texto={bloco.texto} />
      </p>
    );
  if (bloco.tipo === "lista") {
    const Lista = bloco.ordenada ? "ol" : "ul";
    return (
      <Lista className="sdb-body sdb-articlebody__lista">
        {bloco.itens.map((texto, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: ordem editorial dos itens.
          <li key={i}>
            <TextoMarcado texto={texto} />
          </li>
        ))}
      </Lista>
    );
  }
  if (bloco.tipo === "intertitulo") {
    const Titulo = bloco.nivel === 3 ? "h3" : "h2";
    return (
      <Titulo className={cx("sdb-title-2", alinhamento)}>
        <TextoMarcado texto={bloco.texto} />
      </Titulo>
    );
  }
  if (bloco.tipo === "destaque") {
    return (
      <figure className="sdb-pullquote">
        <span className="sdb-pullquote__mark" aria-hidden="true">
          “
        </span>
        <div>
          <blockquote>
            <TextoMarcado texto={bloco.texto} />
          </blockquote>
          <figcaption className="sdb-footnote">
            <TextoMarcado texto={bloco.atribuicao} />
          </figcaption>
        </div>
      </figure>
    );
  }
  return (
    <figure className="sdb-articlebody__figure">
      {/* biome-ignore lint/performance/noImgElement: imagem do acervo (/imagens) ou enviada (/midia), sem otimização do Next */}
      <img src={bloco.src} alt={bloco.alt} loading="lazy" />
      <figcaption className="sdb-footnote">
        {bloco.legenda && <span>{bloco.legenda}</span>}
        <span>{bloco.credito}</span>
      </figcaption>
    </figure>
  );
}

/** Corpo do artigo (CorpoArtigo): os blocos na ordem gravada; o primeiro parágrafo é o lead. */
export function CorpoArtigo({
  corpo,
  className,
  children,
}: {
  corpo: readonly BlocoCorpo[];
  className?: string;
  /** O que vem depois dos blocos: "Ler no site", a nota de divergência. */
  children?: ReactNode;
}) {
  return (
    <div className={cx("sdb-articlebody", className)} data-leitura>
      {corpo.map((bloco, i) => (
        <BlocoDoCorpo
          // biome-ignore lint/suspicious/noArrayIndexKey: posição editorial do bloco.
          key={i}
          bloco={bloco}
          lead={i === 0 && (typeof bloco === "string" || bloco.tipo === "paragrafo")}
        />
      ))}
      {children}
    </div>
  );
}
