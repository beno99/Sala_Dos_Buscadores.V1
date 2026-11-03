import type { Metadata } from "next";
import { salaVazia } from "@/features/anfitriao/regras/artigo";
import { EditorSala } from "@/features/anfitriao/ui/EditorSala";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Nova Sala" };

export default async function NovaSala() {
  await anfitriaoDaPagina();
  return (
    <EditorSala
      inicial={salaVazia()}
      imagem={null}
      status="rascunho"
      atualizadoEm={null}
      jaPublicado={false}
      congelado={false}
      artigos={[]}
    />
  );
}
