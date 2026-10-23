import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { artigoVazio } from "@/features/admin/formularios";
import { EditorArtigo } from "@/features/admin/ui/EditorArtigo";
import { listarFontes } from "@/server/admin/consultas";
import { destinosDe, salaDoItem } from "@/server/admin/editores";
import { salaOficialDaRota } from "@/server/admin/rotas";

export const metadata: Metadata = { title: "Novo artigo" };

/** O artigo nasce dentro da Sala: a Sala vem da rota, não de um campo. */
export default async function NovoArtigoNaSala(props: PageProps<"/admin/salas/[slug]/artigos/novo">) {
  const sala = salaOficialDaRota((await props.params).slug);
  if (sala.status === "arquivado") redirect(`/admin/salas/${sala.slug}` as Route);
  return (
    <EditorArtigo
      inicial={artigoVazio(sala.slug)}
      status="rascunho"
      atualizadoEm={null}
      slugTravado={false}
      fontes={listarFontes()}
      sala={salaDoItem(sala)}
      salasDestino={destinosDe(sala)}
    />
  );
}
