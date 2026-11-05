import type { Metadata } from "next";
import { GerenciadorTemas } from "@/features/admin/ui/GerenciadorTemas";
import { temas as tabelaTemas } from "@/modules/acervo/acervo.schema";
import { banco } from "@/modules/compartilhado/banco/cliente";

export const metadata: Metadata = { title: "Temas" };

export default async function PaginaTemas() {
  const temas = await banco().select().from(tabelaTemas).orderBy(tabelaTemas.nome);
  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Temas do acervo</h1>
        <p className="sdb-body-sm sdb-secondary">
          Temas transversais que alimentam a busca comparativa. Um tema criado aqui vale para todo o acervo.
        </p>
      </header>
      <GerenciadorTemas temasList={temas} />
    </>
  );
}
