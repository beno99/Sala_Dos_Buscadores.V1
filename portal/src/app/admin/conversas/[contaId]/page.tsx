import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Conversa, SeloPapel } from "@/features/conversa/ui/Conversa";
import { responderContaAcao } from "@/server/conversa/acoes";
import { conversaComCuradoria, nomeDaConta } from "@/server/conversa/consultas";
import { acessoAtual } from "@/server/sessao";
import { contaNoDiretorio } from "@/server/store";

export const metadata: Metadata = { title: "Conversa" };

export default async function ConversaComAnfitriao(props: PageProps<"/admin/conversas/[contaId]">) {
  const acesso = await acessoAtual();
  if (acesso.tipo !== "admin") notFound();
  const { contaId } = await props.params;
  const conta = contaNoDiretorio(contaId);
  if (!conta || conta.papel === "administrador") notFound();
  const nome = nomeDaConta(contaId);
  const mensagens = await conversaComCuradoria(contaId, acesso.membro.id);
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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="sdb-title-1">{nome}</h1>
          <SeloPapel papel={conta.papel} />
        </div>
        <p className="sdb-body-sm sdb-secondary">{conta.email}</p>
      </header>
      <Conversa
        mensagens={mensagens}
        eu={{ papel: "administrador" }}
        enviar={responderContaAcao.bind(null, contaId)}
        rotulo={`Resposta para ${nome}`}
      />
    </>
  );
}
