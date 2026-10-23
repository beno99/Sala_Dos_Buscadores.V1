import type { Metadata } from "next";
import { Suspense } from "react";
import { detectarTemas, lerFiltros, paraQueryString } from "@/features/busca/busca";
import { GradeComparativaEsqueleto } from "@/features/busca/GradeComparativa";
import { Resultados } from "@/features/busca/Resultados";
import { RegistrarEstudo } from "@/features/estudo/RegistrarEstudo";

export const metadata: Metadata = {
  title: "Busca comparativa",
  description: "A mesma pergunta respondida por cada Sala, lado a lado, sem síntese única.",
};

/** Busca por Sala ou por tema e comparação transversal (RF-17 a RF-21). */
export default async function CompararPage(props: PageProps<"/comparar">) {
  const filtros = lerFiltros(await props.searchParams);
  const chave = paraQueryString(filtros);
  // Conta como tema comparado quando a grade de um tema aparece (escolhido ou reconhecido na pergunta).
  const tema = filtros.temas[0] ?? (filtros.modo === "tema" ? detectarTemas(filtros.q)[0] : undefined);

  return (
    <>
      {tema && <RegistrarEstudo evento={{ tipo: "comparacao", tema }} />}
      <Suspense
        key={chave}
        fallback={
          <div className="sdb-journey-compare">
            <GradeComparativaEsqueleto />
          </div>
        }
      >
        <Resultados filtros={filtros} />
      </Suspense>
    </>
  );
}
