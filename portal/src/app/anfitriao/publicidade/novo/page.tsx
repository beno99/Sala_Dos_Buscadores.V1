import type { Metadata } from "next";
import { anuncioVazio } from "@/features/publicidade/regras";
import { EditorAnuncio } from "@/features/publicidade/ui/EditorAnuncio";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Criar publicidade" };

export default async function CriarPublicidade() {
  await anfitriaoDaPagina();
  return (
    <EditorAnuncio
      inicial={anuncioVazio()}
      imagemInicial={null}
      status="rascunho"
      atualizadoEm={null}
      jaPublicado={false}
      congelado={false}
    />
  );
}
