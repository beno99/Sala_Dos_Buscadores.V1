import type { Metadata, Route } from "next";
import { notFound, redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { SeloPapel } from "@/features/conversa/ui/Conversa";
import { ConversaDireta } from "@/features/conversa/ui/ConversaDireta";
import { autorVisivel, conversaDireta } from "@/server/conversa/consultas";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";
import { contaNoDiretorio } from "@/server/store";

export const metadata: Metadata = { title: "Mensagem" };

export default async function MensagemDireta(props: PageProps<"/mensagens/[contaId]">) {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const { contaId } = await props.params;
  if (contaId === membro.id) redirect("/mensagens" as Route);
  if (!contaNoDiretorio(contaId)) notFound();
  const outro = autorVisivel(contaId);
  const { mensagens, bloqueada, euBloqueei } = await conversaDireta(membro.id, contaId);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/mensagens" as Route, rotulo: "Mensagens" }]} atual={outro.nome} />
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="sdb-title-1">{outro.nome}</h1>
        <SeloPapel papel={outro.papel} />
      </header>
      <ConversaDireta
        outro={outro}
        eu={autorVisivel(membro.id)}
        mensagens={mensagens}
        bloqueada={bloqueada}
        euBloqueei={euBloqueei}
      />
    </div>
  );
}
