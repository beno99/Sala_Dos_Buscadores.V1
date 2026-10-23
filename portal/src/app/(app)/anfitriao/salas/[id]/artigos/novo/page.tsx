import type { Metadata } from "next";
import { artigoVazio } from "@/features/anfitriao/regras/artigo";
import { EditorArtigoAnfitriao } from "@/features/anfitriao/ui/EditorArtigoAnfitriao";
import { salaDoAnfitriao } from "@/server/anfitriao/consultas";
import { dadosDoEditorDeArtigo } from "@/server/anfitriao/editor";
import { anfitriaoDaPagina, ouNaoEncontrado } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Novo artigo" };

export default async function NovoArtigo(props: PageProps<"/anfitriao/salas/[id]/artigos/novo">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const { sala } = ouNaoEncontrado(() => salaDoAnfitriao(id, membro.id));
  const dados = dadosDoEditorDeArtigo(sala, membro.id, membro.pseudonimo);
  return (
    <EditorArtigoAnfitriao
      inicial={artigoVazio(sala.id)}
      status="rascunho"
      atualizadoEm={null}
      jaPublicado={false}
      congelado={Boolean(sala.revisao?.congelado)}
      sala={dados.sala}
      assinatura={dados.assinaturaPadrao}
      fontes={dados.fontes}
      publicados={dados.publicados}
      imagens={{ card: null, thumb: null }}
      publicadoEm=""
      slug=""
    />
  );
}
