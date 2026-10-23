import type { ReactNode } from "react";
import { Avatar } from "./Avatar";
import { Badge } from "./Selos";

/** Identificação pública explícita: não recebe o registro privado da conta. */
export interface PessoaComunidadeVisual {
  nome: string;
  iniciais: string;
  href: string;
  foto?: string;
  anfitriao?: boolean;
  contexto?: string;
}

export function LinhaPessoa({ pessoa, acao }: { pessoa: PessoaComunidadeVisual; acao?: ReactNode }) {
  return (
    <div className="sdb-person">
      <Avatar iniciais={pessoa.iniciais} foto={pessoa.foto} />
      <div className="sdb-person__body">
        <div className="sdb-person__name">
          <a className="sdb-person__link" href={pessoa.href}>
            {pessoa.nome}
          </a>
          {pessoa.anfitriao && <Badge variant="neutral">Anfitrião</Badge>}
        </div>
        {pessoa.contexto && <p className="sdb-footnote sdb-person__meta">{pessoa.contexto}</p>}
      </div>
      {acao}
    </div>
  );
}
