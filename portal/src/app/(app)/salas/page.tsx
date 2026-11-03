import type { Metadata } from "next";
import { todosOsTemas } from "@/data/catalogo";
import { listarSalas, temasDaSala } from "@/data/repositorio";
import { GradeSalas, type SalaNaGrade } from "@/features/acervo/GradeSalas";
import { imagemDoCardDaSala } from "@/server/imagens";

export const metadata: Metadata = { title: "Salas" };

/**
 * Todas as Salas abertas (RF-09), no layout do Figma: título grande, chips de
 * tema em areia que filtram a grade e a primeira Sala em destaque. As de
 * anfitriões (só as visíveis: publicadas e com artigo no ar) vêm primeiro.
 */
export default async function SalasPage() {
  const salas = await listarSalas();
  const naGrade = (s: (typeof salas)[number]): SalaNaGrade => ({
    sala: s,
    temas: temasDaSala(s.slug),
    imagem: imagemDoCardDaSala(s),
  });
  const oficiais = salas.filter((s) => s.origem === "oficial").map(naGrade);
  const deAnfitrioes = salas.filter((s) => s.origem === "anfitriao").map(naGrade);
  const temas = (grade: SalaNaGrade[]) =>
    todosOsTemas()
      .map((t) => ({
        slug: t.slug,
        nome: t.nome,
        contagem: grade.filter((s) => s.temas.includes(t.slug)).length,
      }))
      .filter((t) => t.contagem > 0);
  const todas = [...deAnfitrioes, ...oficiais];
  return (
    <div className="flex flex-col gap-5">
      <h1 className="sdb-large-title">Salas</h1>
      <GradeSalas
        id="grade-salas"
        temas={temas(todas)}
        secoes={[
          {
            id: "anfitrioes",
            salas: deAnfitrioes,
            cabecalho: (
              <div key="anfitrioes" className="flex flex-col gap-2">
                <h2 id="titulo-anfitrioes" className="sdb-title-1">
                  Salas de anfitriões
                </h2>
                <p className="sdb-footnote m-0 max-w-read">
                  Mantidas por autores convidados e revisadas pela curadoria antes de ir ao ar. Cada Sala
                  responde pelo que afirma, sempre com as fontes indicadas.
                </p>
              </div>
            ),
          },
          {
            id: "curadoria",
            salas: oficiais,
            cabecalho: (
              <div key="curadoria" className="flex flex-col gap-2">
                <h2 id="titulo-curadoria" className="sdb-title-1">
                  Salas da curadoria
                </h2>
                <p className="sdb-footnote m-0">
                  <b className="text-label">{oficiais.length} Salas abertas.</b> “Comece por aqui” vem
                  primeiro; as outras, em ordem alfabética, que não indica importância.
                </p>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
