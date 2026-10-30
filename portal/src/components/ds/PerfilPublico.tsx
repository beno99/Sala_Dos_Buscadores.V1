import type { ReactNode } from "react";
import { Arc } from "./Arc";
import { Avatar } from "./Avatar";
import type { PessoaComunidadeVisual } from "./LinhaPessoa";
import { Badge } from "./Selos";
/** Mesma anatomia de PerfilPublico/CabecalhoPerfil; recebe somente identificação pública. */
export function CabecalhoPerfilPublico({
  pessoa,
  publicacoes,
  acao,
}: {
  pessoa: PessoaComunidadeVisual;
  publicacoes: number;
  acao?: ReactNode;
}) {
  return (
    <header className="sdb-profilehead">
      <div className="sdb-profilehead__cover">
        <div className="sdb-plate sdb-plate--bordo" aria-hidden="true">
          <Arc on="bordo" />
        </div>
      </div>
      <div className="sdb-profilehead__row">
        <span className="sdb-profilehead__photo">
          <Avatar size="xl" iniciais={pessoa.iniciais} foto={pessoa.foto} />
        </span>
        <div className="sdb-profilehead__info">
          <div className="sdb-profilehead__tags">
            <Badge variant="ink">{pessoa.anfitriao ? "Anfitrião" : "Buscador"}</Badge>
            <Badge>Perfil público</Badge>
          </div>
          <h1 className="sdb-profilehead__name">{pessoa.nome}</h1>
          <ul className="sdb-profilehead__stats" aria-label="Atividade pública">
            <li>
              <b>{publicacoes}</b> {publicacoes === 1 ? "publicação" : "publicações"}
            </li>
          </ul>
        </div>
        {acao && <div className="sdb-profilehead__actions">{acao}</div>}
      </div>
    </header>
  );
}
export function PerfilPublico({ children }: { children: ReactNode }) {
  return <div className="sdb-publicprofile">{children}</div>;
}
