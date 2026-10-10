import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { ButtonLink } from "@/components/ds/Button";
import { CardFonte } from "@/components/ds/CardFonte";
import { CardVideo } from "@/components/ds/CardVideo";
import { ChipLink } from "@/components/ds/Chip";
import { SeloNivel } from "@/components/ds/Selos";
import { temaPorSlug, verbetesDaSala } from "@/data/catalogo";
import {
  citacaoDestaque,
  conteudosDaSala,
  fontesDaSala,
  obterSala,
  temasDaSala,
  videosDaSala,
} from "@/data/repositorio";
import { ConteudosDaSala } from "@/features/acervo/ConteudosDaSala";
import { GlossarioDaSala } from "@/features/acervo/GlossarioDaSala";
import { RegistrarEstudo } from "@/features/estudo/RegistrarEstudo";
import { formatarData, plural } from "@/lib/texto";

export async function generateMetadata(props: PageProps<"/salas/[slug]">): Promise<Metadata> {
  const sala = await obterSala((await props.params).slug);
  return sala ? { title: sala.nome, description: sala.descricao } : {};
}

/** Página de uma Sala (RF-10 a RF-16): conteúdos, citação, vídeos, glossário e fontes. */
export default async function SalaPage(props: PageProps<"/salas/[slug]">) {
  const { slug } = await props.params;
  const sala = await obterSala(slug);
  if (!sala) notFound();

  const conteudos = conteudosDaSala(sala.slug);
  const citacao = citacaoDestaque(sala.slug);
  const videos = videosDaSala(sala.slug);
  const verbetes = verbetesDaSala(sala.slug);
  const fontes = fontesDaSala(sala.slug);
  const temas = temasDaSala(sala.slug)
    .map((t) => temaPorSlug(t))
    .filter((t) => t !== undefined);

  return (
    <>
      <RegistrarEstudo evento={{ tipo: "sala", sala: sala.slug }} />
      <Breadcrumbs itens={[{ href: "/salas" as Route, rotulo: "Salas" }]} atual={sala.nome} />

      <header className="flex max-w-read flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Sala · {sala.tradicao}</p>
        <h1 className="sdb-large-title">{sala.nome}</h1>
        <p className="sdb-body">{sala.descricao}</p>
        <dl className="sdb-dl">
          <dt>Nível predominante</dt>
          <dd>
            <SeloNivel nivel={sala.nivelPredominante} plain />
          </dd>
          <dt>Acervo</dt>
          <dd>
            {plural(sala.totalConteudos, "conteúdo", "conteúdos")} ·{" "}
            {plural(videos.length, "vídeo", "vídeos")} · {plural(verbetes.length, "verbete", "verbetes")}
          </dd>
          <dt>Período</dt>
          <dd>{sala.periodo}</dd>
          <dt>Atualizada em</dt>
          <dd>{formatarData(sala.atualizadaEm)}</dd>
        </dl>
        <div className="sdb-row">
          <ButtonLink href={`/assistente?escopo=${sala.slug}` as Route} variant="tinted" icon="ia">
            Perguntar ao assistente sobre esta Sala
          </ButtonLink>
        </div>
      </header>

      {temas.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="titulo-comparar">
          <h2 id="titulo-comparar" className="sdb-headline">
            Comparar um tema desta Sala com as demais
          </h2>
          <div className="sdb-row" style={{ gap: 8 }}>
            {temas.map((t) => (
              <ChipLink key={t.slug} href={`/comparar?tema=${t.slug}` as Route}>
                {t.nome}
              </ChipLink>
            ))}
          </div>
        </section>
      )}

      {citacao && (
        <section className="flex max-w-read flex-col gap-4" aria-labelledby="titulo-citacao">
          <h2 id="titulo-citacao" className="sdb-title-2">
            Trecho de fonte primária
          </h2>
          <BlocoCitacao citacao={citacao} />
        </section>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="titulo-conteudos">
        <h2 id="titulo-conteudos" className="sdb-title-2">
          Conteúdos
        </h2>
        <ConteudosDaSala conteudos={conteudos} nomeSala={sala.nome} />
      </section>

      {/* TODO(trilhas): a Trilha de estudo da Sala (RF-22, RF-23; componente TrilhaEstudo) entra aqui, entre os
          conteúdos e os vídeos, com etapas iniciante → avançado e sem ranking entre pessoas (RF-24). */}

      {videos.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="titulo-videos">
          <h2 id="titulo-videos" className="sdb-title-2">
            Vídeos do canal
          </h2>
          <div className="flex max-w-[1040px] flex-col gap-6">
            {videos.map((v) => (
              <CardVideo key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      <section
        id="glossario"
        className="flex max-w-read scroll-mt-8 flex-col gap-4"
        aria-labelledby="titulo-glossario"
      >
        <h2 id="titulo-glossario" className="sdb-title-2">
          Glossário
        </h2>
        <GlossarioDaSala verbetes={verbetes} />
      </section>

      {fontes.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="titulo-fontes">
          <h2 id="titulo-fontes" className="sdb-title-2">
            Fontes usadas nesta Sala
          </h2>
          <div className="sdb-grid" style={{ "--sdb-col": "320px" } as CSSProperties}>
            {fontes.map((f) => (
              <CardFonte key={f.id} fonte={f} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
