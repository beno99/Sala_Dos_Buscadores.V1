import type { Metadata } from "next";
import { EstadoSecao } from "@/components/ds/EstadosInterface";

export const metadata: Metadata = { title: "Trilhas" };

/* TODO(redesign): versão funcional desta seção na Fase D. */
export default function Pagina() {
  return (
    <section className="flex max-w-read flex-col gap-4" aria-labelledby="titulo-secao">
      <h1 id="titulo-secao" className="sdb-title-1">
        Trilhas
      </h1>
      <p className="sdb-body-sm sdb-secondary">Trilhas de estudo por Sala, do iniciante ao avançado.</p>
      <EstadoSecao
        simbolo="livro"
        titulo="Em preparação"
        descricao="Estamos organizando percursos de leitura. Você pode começar por uma Sala e explorar seus conteúdos introdutórios."
        acao={{ rotulo: "Escolher uma Sala", href: "/salas" }}
      />
    </section>
  );
}
