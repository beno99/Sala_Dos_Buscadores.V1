"use client";

import type { Route } from "next";
import Link from "next/link";
import { useId } from "react";
import { Button } from "@/components/ds/Button";
import { Sheet } from "@/components/ds/Sheet";

/** "Por que estou vendo isto?": a política de publicidade, em linguagem simples. */
export function ModalPoliticaAnuncios({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const id = useId();
  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <span />
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Por que estou vendo isto?
        </h2>
        <Button variant="plain" onClick={onFechar}>
          Fechar
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          Os anúncios ajudam a manter o acervo aberto. Cada anunciante passa por curadoria editorial antes de
          entrar.
        </p>
        <p className="sdb-body-sm m-0">
          Não aceitamos charlatanismo, promessa de cura, manipulação religiosa, contagem regressiva ou
          urgência. Anúncios nunca aparecem dentro da grade comparativa, das respostas do assistente ou da
          leitura de um conteúdo.
        </p>
        <p className="sdb-help m-0">
          Este anúncio aparece para todos nesta página: não usa seus interesses nem sua religião ou convicção.
        </p>
        <Link className="sdb-link" href={"/sobre#politica-publicidade" as Route} onClick={onFechar}>
          Ler a política de publicidade
        </Link>
      </div>
    </Sheet>
  );
}
