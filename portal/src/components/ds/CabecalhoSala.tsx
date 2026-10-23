import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { iniciais } from "@/lib/texto";
import { Avatar } from "./Avatar";
import { ButtonLink } from "./Button";
import { SeloProveniencia } from "./Selos";
import { TextoMarcado } from "./TextoMarcado";

export interface DadoCabecalho {
  rotulo: string;
  valor: ReactNode;
}

/**
 * Cabeçalho da Sala (CabecalhoSala): rótulo e título à esquerda; descrição e a
 * linha de assinatura e dados à direita. A assinatura (Avatar, nome com link,
 * credencial e selo) é só da Sala de anfitrião. Sem ela, as `acoes` vêm antes
 * dos dados (o assistente, na Sala oficial); com ela, depois ("Site da Sala").
 * O botão "‹ Salas" só aparece abaixo de 900 px, quando a barra esconde a trilha.
 */
export function CabecalhoSala({
  rotulo,
  titulo,
  descricao,
  assinatura,
  dados,
  acoes,
  voltar,
}: {
  rotulo: string;
  titulo: string;
  descricao: string;
  assinatura?: { nome: string; credencial?: string; href: Route };
  dados: DadoCabecalho[];
  acoes?: ReactNode;
  voltar?: { href: Route; rotulo: string };
}) {
  const blocoAcoes = acoes ? <div className="sdb-roomhead__actions">{acoes}</div> : null;
  return (
    <>
      {voltar && (
        <ButtonLink
          href={voltar.href}
          variant="secondary"
          size="sm"
          icon="chevronEsquerda"
          className="sdb-roomhead__back"
        >
          {voltar.rotulo}
        </ButtonLink>
      )}
      <header className="sdb-roomhead">
        <div className="sdb-roomhead__titles">
          <p className="sdb-meta">{rotulo}</p>
          <h1 className="sdb-large-title sdb-roomhead__title" id="titulo-sala">
            {titulo}
          </h1>
        </div>
        <div className="sdb-roomhead__side">
          <p className="sdb-body-sm sdb-roomhead__desc">
            <TextoMarcado texto={descricao} />
          </p>
          <div className="sdb-roomhead__line">
            {assinatura ? (
              <div className="sdb-roomhead__author">
                <Avatar iniciais={iniciais(assinatura.nome)} />
                <span className="sdb-roomhead__who">
                  <Link className="sdb-roomhead__name" href={assinatura.href}>
                    {assinatura.nome}
                  </Link>
                  {assinatura.credencial && <span className="sdb-footnote">{assinatura.credencial}</span>}
                </span>
                <SeloProveniencia tipo="anfitriao" />
              </div>
            ) : (
              blocoAcoes
            )}
            <dl className="sdb-roomhead__meta">
              {dados.map((d) => (
                <div key={d.rotulo}>
                  <dt>{d.rotulo}</dt>
                  <dd>{d.valor}</dd>
                </div>
              ))}
            </dl>
            {assinatura && blocoAcoes}
          </div>
        </div>
      </header>
    </>
  );
}
