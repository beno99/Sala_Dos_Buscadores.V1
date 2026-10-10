import type { Metadata } from "next";
import { Alerta } from "@/components/ds/Alerta";

export const metadata: Metadata = { title: "Biblioteca" };

/* TODO(redesign): versão funcional desta seção na Fase D; o redesenho visual aguarda referências. */
export default function Pagina() {
  return (
    <section className="flex max-w-read flex-col gap-4" aria-labelledby="titulo-secao">
      <h1 id="titulo-secao" className="sdb-title-1">
        Biblioteca
      </h1>
      <p className="sdb-body-sm sdb-secondary">
        Todos os conteúdos do acervo, com filtros por Sala, tema, nível e formato.
      </p>
      <Alerta title="Seção em preparação">Esta seção entra na próxima etapa do redesenho do portal.</Alerta>
    </section>
  );
}
