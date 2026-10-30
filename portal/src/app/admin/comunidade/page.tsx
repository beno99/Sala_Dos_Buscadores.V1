import type { Metadata } from "next";
import { ModeracaoComunidade } from "@/features/admin/ui/ModeracaoComunidade";
import { filaDeModeracao } from "@/server/comunidade/moderacao";
import { acessoAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Comunidade" };

export default async function PaginaComunidade() {
  if ((await acessoAtual()).tipo !== "admin") return null;
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Comunidade</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Denúncias e itens ocultos. A curadoria decide o que fica visível, com motivo registrado no
          histórico, e não edita o texto de ninguém.
        </p>
      </header>
      <ModeracaoComunidade fila={filaDeModeracao()} />
    </>
  );
}
