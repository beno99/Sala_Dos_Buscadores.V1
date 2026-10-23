import type { Metadata } from "next";
import { salaPorSlug } from "@/data/catalogo";
import { EditorSala } from "@/features/anfitriao/ui/EditorSala";
import { MarcarVisto } from "@/features/anfitriao/ui/MarcarVisto";
import { salaDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina, ouNaoEncontrado } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Sala" };

/** A Sala do anfitrião; de outra pessoa (ou inexistente) é 404. */
export default async function PaginaSala(props: PageProps<"/anfitriao/salas/[id]">) {
  const { id } = await props.params;
  const membro = await anfitriaoDaPagina();
  const { sala, artigos } = ouNaoEncontrado(() => salaDoAnfitriao(id, membro.id));
  const revisao = sala.revisao;
  return (
    <>
      <MarcarVisto tipo="sala" id={sala.id} pendente={Boolean(revisao?.decisoes.some((d) => !d.vista))} />
      <EditorSala
        // A edição recomeça a cada mudança de status (envio, decisão, retirada).
        key={`${sala.id}-${sala.status}`}
        inicial={{
          id: sala.id,
          nome: sala.nome,
          descricao: sala.descricao,
          periodo: sala.periodo,
          link: sala.link ?? "",
          imagem: sala.midia ?? null,
        }}
        imagem={sala.midia && sala.imagem ? { id: sala.midia, url: sala.imagem } : null}
        status={sala.status}
        atualizadoEm={sala.atualizadoEm}
        jaPublicado={Boolean(revisao?.jaPublicado)}
        congelado={Boolean(revisao?.congelado)}
        ultimoMotivo={revisao?.ultimoMotivo}
        noAr={salaPorSlug(sala.slug) ? `/salas/${sala.slug}` : undefined}
        artigos={artigos
          .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
          .map((a) => ({ id: a.id, titulo: a.titulo, status: a.status, atualizadoEm: a.atualizadoEm }))}
      />
    </>
  );
}
