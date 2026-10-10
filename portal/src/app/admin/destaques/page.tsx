import type { Metadata } from "next";
import { salaPorSlug } from "@/data/catalogo";
import { candidatosDestaques, vagasDestaques } from "@/data/repositorio";
import { EditorDestaques, type GrupoEditavel } from "@/features/admin/ui/EditorDestaques";
import { GRUPOS_VAGA } from "@/features/destaques/vagas";
import { NOME_GRUPO, nomeDaVaga } from "@/server/admin/destaques";
import { acervo } from "@/server/store";

export const metadata: Metadata = { title: "Destaques" };

const AJUDA = {
  video: "Um episódio publicado, no topo da página.",
  cards: "Quatro conteúdos publicados. A primeira vaga é o card vertical alto.",
  artigos: "Cinco textos publicados. A primeira vaga vai para o centro do mosaico.",
};

/** Curadoria da página Destaques. A lista "Mais pesquisados" vem das buscas e não se edita aqui. */
export default function PaginaDestaques() {
  const vagas = vagasDestaques();
  const escolha = acervo().destaques;
  const candidatos = candidatosDestaques();
  const titulo = (id: string | null) =>
    candidatos.find((c) => c.id === id)?.titulo ?? "nenhum item disponível";
  const sala = (id: string) => {
    const c = acervo().conteudos.get(id) ?? acervo().videos.get(id);
    return c ? (salaPorSlug(c.sala)?.nome ?? "") : "";
  };
  const grupos: GrupoEditavel[] = GRUPOS_VAGA.map((g) => ({
    grupo: g,
    nome: NOME_GRUPO[g],
    ajuda: AJUDA[g],
    vagas: vagas[g].map((v, i) => ({
      nome: nomeDaVaga(g, i),
      escolhido: v.automatica ? null : (escolha[g][i] ?? null),
      titulo: titulo(v.id),
      automatica: v.automatica,
    })),
    opcoes: candidatos
      .filter((c) => c.grupos.includes(g))
      .map((c) => ({ value: c.id, label: `${c.titulo} · ${sala(c.id)}` })),
  }));
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Destaques</h1>
        <p className="sdb-body-sm sdb-secondary">
          Escolha o que aparece na vitrine. Um item não se repete na página; vaga vazia recebe o publicado
          mais recente. Toda mudança entra no histórico.
        </p>
      </header>
      <EditorDestaques grupos={grupos} />
    </>
  );
}
