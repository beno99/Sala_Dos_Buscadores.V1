import type { Metadata, Route } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ds/Avatar";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Badge } from "@/components/ds/Selos";
import { SeloPapel } from "@/features/conversa/ui/Conversa";
import { formatarData, iniciais, truncar } from "@/lib/texto";
import { caixaDeEntrada } from "@/server/conversa/consultas";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: "Mensagens" };

export default async function Mensagens() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const conversas = await caixaDeEntrada(membro.id);
  const canal =
    membro.papel === "administrador"
      ? { href: "/admin/conversas", texto: "Conversas da curadoria com as contas" }
      : membro.papel === "anfitriao"
        ? { href: "/anfitriao/conversa", texto: "Dúvidas sobre revisões, fontes e suas Salas" }
        : { href: "/mensagens/curadoria", texto: "Dúvidas, sugestões e denúncias" };
  return (
    <div className="flex max-w-read flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="sdb-title-1">Mensagens</h1>
        <p className="sdb-body-sm sdb-secondary">
          Conversas diretas com outras pessoas do portal. Para escrever a alguém, abra o perfil da pessoa e
          use “Enviar mensagem”.
        </p>
      </header>
      <Link
        href={canal.href as Route}
        className="sdb-material sdb-panel flex items-center gap-3 no-underline"
      >
        <SeloPapel papel="administrador" />
        <span className="flex min-w-0 flex-col">
          <b>Curadoria</b>
          <span className="sdb-footnote">{canal.texto}</span>
        </span>
      </Link>
      {conversas.length === 0 ? (
        <EstadoSecao
          simbolo="pasta"
          titulo="Nenhuma conversa ainda"
          descricao="Quando você trocar mensagens com alguém, a conversa aparece aqui."
          compacto
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {conversas.map((c) => (
            <li key={c.outro.id}>
              <Link
                href={`/mensagens/${c.outro.id}` as Route}
                className="sdb-comment sdb-mensagem no-underline"
                aria-label={`Conversa com ${c.outro.nome}${c.naoLidas ? `, ${c.naoLidas} não lidas` : ""}`}
              >
                <Avatar iniciais={iniciais(c.outro.nome)} foto={c.outro.foto} size="sm" />
                <span className="sdb-comment__body flex flex-col gap-1">
                  <span className="sdb-comment__byline">
                    <b className="sdb-comment__name">{c.outro.nome}</b>
                    <SeloPapel papel={c.outro.papel} />
                    {c.naoLidas > 0 && <Badge variant="new">{c.naoLidas} nova(s)</Badge>}
                  </span>
                  <span className="sdb-footnote">
                    {c.minha ? "Você: " : ""}
                    {truncar(c.ultima, 90)} · <time dateTime={c.criadaEm}>{formatarData(c.criadaEm)}</time>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
