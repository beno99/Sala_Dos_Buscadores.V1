import type { Metadata, Route } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { LinhaPessoa } from "@/components/ds/LinhaPessoa";
import { Badge } from "@/components/ds/Selos";
import { iniciais, truncar } from "@/lib/texto";
import { conversasDaCuradoria } from "@/server/conversa/consultas";

export const metadata: Metadata = { title: "Conversas" };

export default async function ConversasDaCuradoria() {
  const conversas = await conversasDaCuradoria();
  return (
    <>
      <Breadcrumbs itens={[{ href: "/admin" as Route, rotulo: "Curadoria" }]} atual="Conversas" />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Conversas com anfitriões</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Para começar uma conversa nova, abra o anfitrião em Revisão de anfitriões.
        </p>
      </header>
      {conversas.length === 0 ? (
        <EstadoSecao
          simbolo="pasta"
          titulo="Nenhuma conversa ainda"
          descricao="Quando um anfitrião escrever para a curadoria, a conversa aparece aqui."
          acao={{ rotulo: "Revisão de anfitriões", href: "/admin/anfitrioes" as Route }}
        />
      ) : (
        <ul className="flex max-w-read flex-col gap-3">
          {conversas.map((c) => (
            <li key={c.contaId}>
              <LinhaPessoa
                pessoa={{
                  nome: c.nome,
                  iniciais: iniciais(c.nome),
                  href: `/admin/conversas/${c.contaId}`,
                  anfitriao: true,
                  contexto: `${c.ultima.daCuradoria ? "Curadoria: " : ""}${truncar(c.ultima.texto, 90)}`,
                }}
                acao={
                  <span className="sdb-row">
                    {c.aguardando && <Badge variant="review">Aguardando resposta</Badge>}
                    <Link className="sdb-link" href={`/admin/conversas/${c.contaId}` as Route}>
                      Abrir
                    </Link>
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
