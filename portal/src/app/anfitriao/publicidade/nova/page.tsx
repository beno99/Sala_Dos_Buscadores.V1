import type { Metadata } from "next";
import { EditorAnuncio } from "@/features/anuncios/EditorAnuncio";
import { painelDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Criar publicidade" };

export default async function CriarPublicidade() {
  const membro = await anfitriaoDaPagina();
  const nome = painelDoAnfitriao(membro.id).perfil?.nome ?? membro.pseudonimo;
  return (
    <EditorAnuncio
      inicial={{
        id: null,
        midia: null,
        focoX: 50,
        focoY: 50,
        alt: "",
        categoria: "",
        titulo: "",
        descricao: "",
        href: "",
        chamada: "",
        anunciante: nome,
      }}
      imagem={null}
      status="rascunho"
      atualizadoEm={null}
      jaPublicado={false}
      congelado={false}
    />
  );
}
