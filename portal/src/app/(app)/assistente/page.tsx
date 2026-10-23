import type { Metadata } from "next";
import { Avatar } from "@/components/ds/Avatar";
import { comparacaoDoTema, salaPorSlug, temaPorSlug, todosOsTemas } from "@/data/catalogo";
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
  const comparacao = todosOsTemas()
    .map((tema) => comparacaoDoTema(tema.slug))
    .find((item) => item?.pergunta === pergunta);

  return (
    <section className="sdb-journey-assistant" aria-labelledby="titulo-assistente">
      <header className="sdb-journey-assistant__header">
        <Avatar ai />
        <div>
          <h1 id="titulo-assistente" className="sdb-headline">
            {comparacao ? "Assistente do acervo · continua desta comparação" : "Assistente do acervo"}
          </h1>
          <p className="sdb-footnote">
            {comparacao
              ? `Tema: ${comparacao.temasLigados.map((tema) => temaPorSlug(tema)?.nome ?? tema).join(" e ")} · as fontes numeradas levam aos textos do acervo.`
              : sala
                ? `Conversa restrita à Sala ${sala.nome}. Você pode ampliar o escopo no campo abaixo.`
                : "Pergunte às Salas do portal. Cada resposta identifica a síntese da IA e aponta suas fontes."}
          </p>
        </div>
      </header>
      <PainelAssistente
        key={`${pergunta}|${escopoParam}`}
        perguntaInicial={pergunta}
        escopoInicial={sala ? (sala.slug as SalaSlug) : "todo"}
      />
    </section>
  );
}
