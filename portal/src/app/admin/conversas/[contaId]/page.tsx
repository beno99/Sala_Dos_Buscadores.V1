import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Conversa } from "@/features/conversa/ui/Conversa";
import { responderAnfitriaoAcao } from "@/server/conversa/acoes";
import { conversaDoAnfitriao, nomeDoAnfitriao } from "@/server/conversa/consultas";
import { contaNoDiretorio } from "@/server/store";

export const metadata: Metadata = { title: "Conversa" };

export default async function ConversaComAnfitriao(props: PageProps<"/admin/conversas/[contaId]">) {
  const { contaId } = await props.params;
  const conta = contaNoDiretorio(contaId);
  if (conta?.papel !== "anfitriao") notFound();
  const nome = nomeDoAnfitriao(contaId);
  const mensagens = await conversaDoAnfitriao(contaId);
  return (
    <>
      <Breadcrumbs
        itens={[
          { href: "/admin" as Route, rotulo: "Curadoria" },
          { href: "/admin/conversas" as Route, rotulo: "Conversas" },
        ]}
        atual={nome}
      />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">{nome}</h1>
        <p className="sdb-body-sm sdb-secondary">{conta.email}</p>
      </header>
      <Conversa
        mensagens={mensagens}
        anfitriao={{ nome, href: `/admin/anfitrioes/${contaId}`, anfitriao: true }}
        curadoria={{ nome: "Curadoria", href: "/admin/conversas" }}
        enviar={responderAnfitriaoAcao.bind(null, contaId)}
        rotulo={`Resposta para ${nome}`}
      />
    </>
  );
}
