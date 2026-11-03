import type { Metadata } from "next";
import { EditorPerfil } from "@/features/anfitriao/ui/EditorPerfil";
import { painelDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { perfilIncompleto } from "@/server/anfitriao/usuarios";
import { urlDaMidia } from "@/server/midia";

export const metadata: Metadata = { title: "Perfil público" };

export default async function PaginaPerfil(props: PageProps<"/anfitriao/perfil">) {
  const membro = await anfitriaoDaPagina();
  const { "boas-vindas": boasVindas } = await props.searchParams;
  const perfil = painelDoAnfitriao(membro.id).perfil;
  return (
    <EditorPerfil
      inicial={{
        nome: perfil?.nome ?? membro.pseudonimo,
        slug: perfil?.slug ?? "",
        credencial: perfil?.credencial ?? "",
        apresentacao: perfil?.apresentacao ?? "",
        link: perfil?.link ?? "",
        avatar: perfil?.avatar ?? null,
      }}
      avatar={perfil?.avatar ? { id: perfil.avatar, url: urlDaMidia(perfil.avatar) } : null}
      boasVindas={boasVindas === "1" || perfilIncompleto(perfil)}
    />
  );
}
