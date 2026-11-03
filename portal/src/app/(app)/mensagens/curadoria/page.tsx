import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Conversa } from "@/features/conversa/ui/Conversa";
import { escreverACuradoriaAcao } from "@/server/conversa/acoes";
import { conversaComCuradoria } from "@/server/conversa/consultas";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: "Conversa com a curadoria" };

export default async function ConversaComCuradoria() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  if (membro.papel === "administrador") redirect("/admin/conversas" as Route);
  if (membro.papel === "anfitriao") redirect("/anfitriao/conversa" as Route);
  const mensagens = await conversaComCuradoria(membro.id, membro.id);
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/mensagens" as Route, rotulo: "Mensagens" }]} atual="Curadoria" />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Conversa com a curadoria</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Dúvidas sobre o acervo, sugestões e denúncias. A equipe de curadoria responde por aqui e você recebe
          um aviso por e-mail.
        </p>
      </header>
      <Conversa
        mensagens={mensagens}
        eu={{ papel: membro.papel }}
        enviar={escreverACuradoriaAcao}
        rotulo="Mensagem para a curadoria"
      />
    </div>
  );
}
