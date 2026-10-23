import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "./Avatar";

export interface DadoAutoria {
  rotulo: string;
  valor: ReactNode;
  /** Explicação logo abaixo da linha (a do Selo de proveniência). */
  ajuda?: string;
}

/**
 * Autoria do conteúdo (AutoriaConteudo): Avatar de iniciais, nome e
 * credencial; filete; dados em linhas, rótulo à esquerda e valor à direita.
 * Fonte primária usa o avatar suave; anfitrião tem o nome com link.
 */
export function AutoriaConteudo({
  iniciais,
  nome,
  credencial,
  href,
  suave,
  dados,
  className,
}: {
  iniciais: string;
  nome: string;
  credencial?: string;
  href?: Route;
  suave?: boolean;
  dados: DadoAutoria[];
  className?: string;
}) {
  return (
    <section
      className={className ? `sdb-authorship ${className}` : "sdb-authorship"}
      aria-label="Autoria e dados"
    >
      <div className="sdb-authorship__who">
        <Avatar iniciais={iniciais} tone={suave ? "soft" : undefined} />
        <div>
          {href ? (
            <Link className="sdb-authorship__name" href={href}>
              {nome}
            </Link>
          ) : (
            <p className="sdb-authorship__name">{nome}</p>
          )}
          {credencial && <p className="sdb-footnote sdb-authorship__cred">{credencial}</p>}
        </div>
      </div>
      <dl className="sdb-authorship__data">
        {dados.map((d) => (
          <AutoriaLinha key={d.rotulo} dado={d} />
        ))}
      </dl>
    </section>
  );
}

function AutoriaLinha({ dado }: { dado: DadoAutoria }) {
  return (
    <div>
      <dt>{dado.rotulo}</dt>
      <dd>{dado.valor}</dd>
      {dado.ajuda && <dd className="sdb-authorship__help">{dado.ajuda}</dd>}
    </div>
  );
}
