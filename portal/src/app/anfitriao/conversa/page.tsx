import type { Metadata, Route } from "next";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Conversa } from "@/features/conversa/ui/Conversa";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { escreverACuradoriaAcao } from "@/server/conversa/acoes";
import { conversaDoAnfitriao, nomeDoAnfitriao } from "@/server/conversa/consultas";

export const metadata: Metadata = { title: "Conversa com a curadoria" };

export default async function ConversaDoAnfitriao() {
  const membro = await anfitriaoDaPagina();
  const mensagens = await conversaDoAnfitriao(membro.id);
  return (
    <>
      <Breadcrumbs itens={[{ href: "/anfitriao" as Route, rotulo: "Minhas Salas" }]} atual="Conversa" />
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Conversa com a curadoria</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Tire dúvidas sobre revisões, fontes e suas Salas. A equipe de curadoria responde por aqui e você
          recebe um aviso por e-mail.
        </p>
      </header>
      <Conversa
        mensagens={mensagens}
        anfitriao={{ nome: nomeDoAnfitriao(membro.id), href: "/anfitriao/perfil", anfitriao: true }}
        curadoria={{ nome: "Curadoria", href: "/anfitriao/conversa" }}
        enviar={escreverACuradoriaAcao}
        rotulo="Mensagem para a curadoria"
      />
    </>
  );
}
