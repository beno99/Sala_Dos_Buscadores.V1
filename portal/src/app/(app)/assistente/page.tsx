import type { Metadata } from "next";
import { comparacaoDoTema, todosOsTemas } from "@/data/catalogo";
import { MODOS_ESTUDO, type ModoEstudo } from "@/features/assistente/contrato";
import { TelaAssistente } from "@/features/assistente/TelaAssistente";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";
import { salasVisiveis } from "@/server/store";

export const metadata: Metadata = {
  title: "Assistente do acervo",
  description: "Explore o acervo, conecte ideias e siga as fontes.",
};
export default async function AssistentePage(props: PageProps<"/assistente">) {
  if (!(await membroAtual())) return redirecionarParaEntrar();
  const params = await props.searchParams;
  const salas = salasVisiveis().map(({ slug, nome }) => ({ slug, nome }));
  const pergunta = typeof params.pergunta === "string" ? params.pergunta.slice(0, 2000) : "";
  const veioDaComparacao = todosOsTemas().some((t) => comparacaoDoTema(t.slug)?.pergunta === pergunta);
  const escopo =
    typeof params.escopo === "string" && salas.some((s) => s.slug === params.escopo) ? params.escopo : "todo";
  const modo =
    typeof params.modo === "string" && Object.hasOwn(MODOS_ESTUDO, params.modo)
      ? (params.modo as ModoEstudo)
      : veioDaComparacao
        ? "comparar"
        : "explorar";
  return (
    <TelaAssistente
      key={`${pergunta}|${escopo}|${modo}`}
      salas={salas}
      perguntaInicial={pergunta}
      escopoInicial={escopo}
      modoInicial={modo}
      aparenciaInicial={params.orb === "gold" || params.orb === "dark" ? params.orb : undefined}
    />
  );
}
