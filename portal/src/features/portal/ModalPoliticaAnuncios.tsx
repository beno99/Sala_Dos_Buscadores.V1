"use client";

import type { Route } from "next";
import Link from "next/link";
import { DialogoContextual } from "@/components/ds/DialogoContextual";

/** "Por que estou vendo isto?": a política de publicidade, em linguagem simples. */
export function ModalPoliticaAnuncios({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  return (
    <DialogoContextual
      aberto={aberto}
      onFechar={onFechar}
      titulo="Por que estou vendo isto?"
      simbolo="escudo"
      rotuloVoltar="Fechar"
    >
      <div className="flex flex-col gap-4">
        <p className="sdb-body-sm m-0">
          Os anúncios são publicados pelos anfitriões para apresentar seus produtos. O nome do anunciante
          aparece em cada peça; a oferta e o atendimento são de sua responsabilidade.
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
    </DialogoContextual>
  );
}
