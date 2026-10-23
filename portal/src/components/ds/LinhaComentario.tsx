import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Avatar } from "./Avatar";
import { Icon } from "./Icon";
import type { PessoaComunidadeVisual } from "./LinhaPessoa";
import { Badge } from "./Selos";

export function LinhaComentario({
  autor,
  texto,
  data,
  tempo,
  resposta,
  destacarAnfitriao,
  ajudou,
  acoes,
}: {
  autor: PessoaComunidadeVisual;
  texto: string;
  data: string;
  tempo: string;
  resposta?: boolean;
  destacarAnfitriao?: boolean;
  ajudou?: boolean;
  acoes?: ReactNode;
}) {
  return (
    <article
      className={cx(
        "sdb-comment",
        resposta && "sdb-comment--reply",
        destacarAnfitriao && autor.anfitriao && "sdb-comment--host",
      )}
    >
      <Avatar iniciais={autor.iniciais} foto={autor.foto} size="sm" />
      <div className="sdb-comment__body">
        {ajudou && (
          <p className="sdb-footnote sdb-comment__helped">
            <Icon name="check" />
            Resposta que ajudou
          </p>
        )}
        <div className="sdb-comment__byline">
          <a className="sdb-comment__name" href={autor.href}>
            {autor.nome}
          </a>
          {autor.anfitriao && <Badge variant="neutral">Anfitrião</Badge>}
        </div>
        <p className="sdb-body-sm sdb-comment__text">{texto}</p>
        <div className="sdb-footnote sdb-comment__meta">
          <time dateTime={data}>{tempo}</time>
          {acoes}
        </div>
      </div>
    </article>
  );
}
