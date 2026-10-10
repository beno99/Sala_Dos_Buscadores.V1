import type { Metadata } from "next";
import { salaPorSlug } from "@/data/catalogo";
import type { SalaSlug } from "@/data/types";
import { artigoVazio } from "@/features/admin/formularios";
import { EditorArtigo } from "@/features/admin/ui/EditorArtigo";
import { listarFontes } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Novo artigo" };

export default async function NovoArtigo(props: PageProps<"/admin/artigos/novo">) {
  const { sala } = await props.searchParams;
  const inicialSala = typeof sala === "string" && salaPorSlug(sala) ? (sala as SalaSlug) : "";
  return (
    <EditorArtigo
      inicial={artigoVazio(inicialSala)}
      status="rascunho"
      atualizadoEm={null}
      slugTravado={false}
      fontes={listarFontes()}
    />
  );
}
