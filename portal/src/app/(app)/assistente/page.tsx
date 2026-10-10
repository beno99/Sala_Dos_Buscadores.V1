import type { Metadata } from "next";
import { salaPorSlug } from "@/data/catalogo";
import type { SalaSlug } from "@/data/types";
import { PainelAssistente } from "@/features/assistente/PainelAssistente";

export const metadata: Metadata = {
  title: "Assistente de IA",
  description:
    "Pergunte ao acervo. Cada resposta separa documento, interpretação e síntese, e cita as fontes.",
};

/** Assistente de IA baseado no acervo (RF-26 a RF-31). */
export default async function AssistentePage(props: PageProps<"/assistente">) {
  const params = await props.searchParams;
  const pergunta = typeof params.pergunta === "string" ? params.pergunta.slice(0, 2000) : "";
  const escopoParam = typeof params.escopo === "string" ? params.escopo : "";
  const sala = salaPorSlug(escopoParam);

  return (
    <div className="flex max-w-read flex-col gap-6">
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Assistente de IA</p>
        <h1 className="sdb-title-1">Pergunte ao acervo</h1>
        <p className="sdb-body-sm sdb-secondary">
          O assistente é uma inteligência artificial. Ele consulta só as Salas do portal, mostra de onde vem
          cada trecho e não se coloca como autoridade espiritual.
          {sala &&
            ` Esta conversa começa restrita à Sala ${sala.nome}; você pode ampliar o escopo no campo abaixo.`}
        </p>
      </header>
      <PainelAssistente
        key={`${pergunta}|${escopoParam}`}
        perguntaInicial={pergunta}
        escopoInicial={sala ? (sala.slug as SalaSlug) : "todo"}
      />
    </div>
  );
}
