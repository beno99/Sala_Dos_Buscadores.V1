import type { Route } from "next";
import { Alerta } from "@/components/ds/Alerta";
import { Avatar } from "@/components/ds/Avatar";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { ButtonLink } from "@/components/ds/Button";
import { CardFonte } from "@/components/ds/CardFonte";
import { CardVideo } from "@/components/ds/CardVideo";
import { ChipLink } from "@/components/ds/Chip";
import { SeloNivel, SeloProveniencia } from "@/components/ds/Selos";
import { TextoMarcado } from "@/components/ds/TextoMarcado";
import { temaPorSlug } from "@/data/catalogo";
import { FORMATO_ROTULO, PROVENIENCIA_AJUDA, TIPO_ROTULO } from "@/data/rotulos";
import type { Citacao, Conteudo, Fonte, Sala, Video } from "@/data/types";
import { formatarData, iniciais } from "@/lib/texto";

interface LeituraConteudoProps {
  sala: Sala;
  conteudo: Conteudo;
  citacao?: Citacao;
  fontes: Fonte[];
  videos: Video[];
}

/**
 * Leitura de um conteúdo com fonte indicada (RF-11, RF-12, RF-15, RF-16).
 * Usada pela página pública e pela pré-visualização da curadoria, para que
 * o que a equipe revisa seja exatamente o que o buscador vê.
 */
export function LeituraConteudo({ sala, conteudo, citacao, fontes, videos }: LeituraConteudoProps) {
  const temas = conteudo.temas.map((t) => temaPorSlug(t)).filter((t) => t !== undefined);

  return (
    <>
      <Breadcrumbs
        itens={[
          { href: "/salas" as Route, rotulo: "Salas" },
          { href: `/salas/${sala.slug}` as Route, rotulo: sala.nome },
        ]}
        atual={conteudo.titulo}
      />

      <article className="flex max-w-read flex-col gap-6" aria-labelledby="titulo-conteudo">
        <header className="flex flex-col gap-4">
          <p className="sdb-meta sdb-secondary">
            {TIPO_ROTULO[conteudo.tipo]} · {conteudo.duracaoMin} min · {sala.nome}
          </p>
          <h1 id="titulo-conteudo" className="sdb-title-1">
            {conteudo.titulo}
          </h1>
          <p className="sdb-body-sm sdb-secondary">{conteudo.resumo}</p>
          <div className="sdb-byline">
            <Avatar
              iniciais={iniciais(conteudo.autoria.nome)}
              tone={conteudo.proveniencia === "primaria" ? "soft" : undefined}
            />
            <div>
              <div className="sdb-byline__name">{conteudo.autoria.nome}</div>
              <div className="sdb-byline__cred">{conteudo.autoria.credencial}</div>
            </div>
          </div>
        </header>

        <section className="sdb-material sdb-panel" aria-labelledby="titulo-metadados">
          <h2 id="titulo-metadados" className="sdb-caption">
            Sobre este conteúdo
          </h2>
          <dl className="sdb-dl">
            <dt>Proveniência</dt>
            <dd className="flex flex-col items-start gap-1">
              <SeloProveniencia tipo={conteudo.proveniencia} />
              <span className="sdb-footnote">{PROVENIENCIA_AJUDA[conteudo.proveniencia]}</span>
            </dd>
            <dt>Sala</dt>
            <dd>{sala.nome}</dd>
            <dt>{temas.length > 1 ? "Temas" : "Tema"}</dt>
            <dd>{temas.map((t) => t.nome).join(", ")}</dd>
            <dt>Período</dt>
            <dd>{conteudo.periodo}</dd>
            <dt>Nível</dt>
            <dd>
              <SeloNivel nivel={conteudo.nivel} plain />
            </dd>
            <dt>Formato</dt>
            <dd>{FORMATO_ROTULO[conteudo.formato]}</dd>
            <dt>Publicado em</dt>
            <dd>{formatarData(conteudo.publicadoEm)}</dd>
          </dl>
        </section>

        <div className="flex flex-col gap-5">
          {conteudo.corpo.map((paragrafo) => (
            <p key={paragrafo.slice(0, 48)} className="sdb-body">
              <TextoMarcado texto={paragrafo} />
            </p>
          ))}
        </div>

        {conteudo.divergencia && (
          <Alerta variant="warning" title="Atenção: este tema tem leituras divergentes">
            {conteudo.divergencia}
          </Alerta>
        )}

        {citacao && <BlocoCitacao citacao={citacao} />}
      </article>

      {videos.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="titulo-videos-relacionados">
          <h2 id="titulo-videos-relacionados" className="sdb-title-2">
            Vídeos relacionados
          </h2>
          <div className="flex max-w-[1040px] flex-col gap-6">
            {videos.map((v) => (
              <CardVideo key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      {/* TODO(comunidade): comentários vinculados ao conteúdo (RF-32 a RF-36) entram aqui, abaixo da leitura e
          antes das fontes, com moderação humana obrigatória em casos sensíveis. */}

      {fontes.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="titulo-fontes">
          <h2 id="titulo-fontes" className="sdb-title-2">
            Fontes
          </h2>
          <div className="sdb-grid [--sdb-col:320px]">
            {fontes.map((f) => (
              <CardFonte key={f.id} fonte={f} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4" aria-labelledby="titulo-continuar">
        <h2 id="titulo-continuar" className="sdb-title-2">
          Continuar a busca
        </h2>
        <p className="sdb-footnote">Veja como as outras Salas tratam o mesmo tema, lado a lado.</p>
        <div className="sdb-row">
          {temas.map((t) => (
            <ChipLink key={t.slug} href={`/comparar?tema=${t.slug}` as Route}>
              Comparar: {t.nome}
            </ChipLink>
          ))}
        </div>
        <div className="sdb-row">
          <ButtonLink href={`/assistente?escopo=${sala.slug}` as Route} variant="tinted" icon="ia">
            Perguntar ao assistente
          </ButtonLink>
          <ButtonLink href={`/salas/${sala.slug}` as Route} variant="plain" icon="chevronEsquerda">
            Voltar para {sala.nome}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
