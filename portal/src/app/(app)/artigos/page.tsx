import type { Metadata } from "next";
import { todosOsTemas } from "@/data/catalogo";
import { acervoPublico, listarSalas } from "@/data/repositorio";
import { CatalogoArtigos } from "@/features/acervo/CatalogoArtigos";

export const metadata: Metadata = { title: "Artigos" };

export default async function Artigos(props: PageProps<"/artigos">) {
  const { tema } = await props.searchParams;
  const artigos = acervoPublico().conteudos.filter((c) => c.tipo !== "video");
  const salas = (await listarSalas()).map(({ slug, nome, origem }) => ({ slug, nome, origem }));
  const temas = todosOsTemas().map(({ slug, nome }) => ({ slug, nome }));
  return (
    <CatalogoArtigos
      artigos={artigos}
      salas={salas}
      temas={temas}
      temaInicial={typeof tema === "string" ? tema : ""}
    />
  );
}
