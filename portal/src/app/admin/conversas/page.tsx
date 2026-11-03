import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { LinhaPessoa } from "@/components/ds/LinhaPessoa";
import { Badge } from "@/components/ds/Selos";
import { SeloPapel } from "@/features/conversa/ui/Conversa";
import { iniciais, truncar } from "@/lib/texto";
import { conversasDaCuradoria } from "@/server/conversa/consultas";
import { acessoAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Conversas" };

export default async function ConversasDaCuradoria() {
  if ((await acessoAtual()).tipo !== "admin") notFound();
  const conversas = await conversasDaCuradoria();
  return (
    <>
      <Breadcrumbs itens={[{ href: "/admin" as Route, rotulo: "Curadoria" }]} atual="Conversas" />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Conversas com a curadoria</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Para começar uma conversa nova, abra o anfitrião em Revisão de anfitriões.
        </p>
      </header>
      {conversas.length === 0 ? (
        <EstadoSecao
          simbolo="pasta"
          titulo="Nenhuma conversa ainda"
          descricao="Quando um buscador ou anfitrião escrever para a curadoria, a conversa aparece aqui."
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
                  contexto: `${c.daCuradoria ? "Curadoria: " : ""}${truncar(c.ultima, 90)}`,
                }}
                acao={
                  <span className="sdb-row">
                    <SeloPapel papel={c.papel} />
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
