import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import {
  citacaoPorId,
  fontesPorId,
  obterConteudo,
  obterSala,
  relacionadosDoConteudo,
  videosDoConteudo,
} from "@/data/repositorio";
import { LeituraConteudo } from "@/features/acervo/LeituraConteudo";
import { AcompanharLeitura } from "@/features/estudo/AcompanharLeitura";
import { imagemDoCard } from "@/server/imagens";

export async function generateMetadata(props: PageProps<"/salas/[slug]/[conteudo]">): Promise<Metadata> {
  const { slug, conteudo } = await props.params;
  const c = await obterConteudo(slug, conteudo);
  return c ? { title: c.titulo, description: c.resumo } : {};
}

/**
 * Página pública de um conteúdo publicado (RF-11, RF-12, RF-15, RF-16). A
 * trilha ("Salas / {Sala} / {título}") fica na barra superior, posta pela
 * moldura; abaixo de 900 px, "‹ {Sala}" faz esse papel.
 */
export default async function ConteudoPage(props: PageProps<"/salas/[slug]/[conteudo]">) {
  const { slug, conteudo: slugConteudo } = await props.params;
  const [sala, conteudo] = await Promise.all([obterSala(slug), obterConteudo(slug, slugConteudo)]);
  if (!sala || !conteudo) notFound();

  return (
    <>
      <AcompanharLeitura sala={sala.slug} slug={conteudo.slug} alvo="[data-leitura]" />
      <ButtonLink
        href={`/salas/${sala.slug}` as Route}
        variant="secondary"
        size="sm"
        icon="chevronEsquerda"
        className="sdb-roomhead__back"
      >
        {sala.nome}
      </ButtonLink>
      <LeituraConteudo
        sala={sala}
        conteudo={conteudo}
        citacao={conteudo.citacao ? citacaoPorId(conteudo.citacao) : undefined}
        fontes={fontesPorId(conteudo.fontes)}
        videos={videosDoConteudo(sala.slug, conteudo.slug)}
        relacionados={relacionadosDoConteudo(conteudo)}
        imagemCard={imagemDoCard(conteudo)}
      />
    </>
  );
}
