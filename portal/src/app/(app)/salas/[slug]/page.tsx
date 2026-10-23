import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import { BannerSala } from "@/components/ds/BannerSala";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { ButtonLink, classesDoBotao } from "@/components/ds/Button";
import { CabecalhoSala } from "@/components/ds/CabecalhoSala";
import { CardFonte } from "@/components/ds/CardFonte";
import { ChipLink } from "@/components/ds/Chip";
import { Icon } from "@/components/ds/Icon";
import { SeloNivel } from "@/components/ds/Selos";
import { temaPorSlug, verbetesDaSala } from "@/data/catalogo";
import {
  citacaoDestaque,
  conteudosDaSala,
  fontesDaSala,
  obterSala,
  type SalaResumo,
  temasDaSala,
  videosDaSala,
} from "@/data/repositorio";
import { CardDoVideo } from "@/features/acervo/CardDoVideo";
import { ConteudosDaSala } from "@/features/acervo/ConteudosDaSala";
import { GlossarioDaSala } from "@/features/acervo/GlossarioDaSala";
import { RegistrarEstudo } from "@/features/estudo/RegistrarEstudo";
import { formatarData } from "@/lib/texto";
import { imagemDaSala } from "@/server/imagens";

/** Na coluna lateral, os vídeos mais recentes; o resto fica na Biblioteca. */
const VIDEOS_NA_LATERAL = 3;

export async function generateMetadata(props: PageProps<"/salas/[slug]">): Promise<Metadata> {
  const sala = await obterSala((await props.params).slug);
  return sala ? { title: sala.nome, description: sala.descricao } : {};
}

/**
 * Página de uma Sala (RF-10 a RF-16), na arquitetura do frame: cabeçalho em
 * duas colunas, banner, conteúdos à esquerda e, à direita, vídeos, trecho de
 * fonte primária e comparar; glossário e fontes na largura toda. A trilha
 * ("Salas / {nome}") fica na barra superior, posta pela moldura.
 * Larguras decididas pelo container (@container), não só pela janela.
 */
export default async function SalaPage(props: PageProps<"/salas/[slug]">) {
  const { slug } = await props.params;
  const sala = await obterSala(slug);
  if (!sala) notFound();

  const conteudos = conteudosDaSala(sala.slug);
  const citacao = citacaoDestaque(sala.slug);
  const videos = [...videosDaSala(sala.slug)].sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
  const verbetes = verbetesDaSala(sala.slug);
  const fontes = fontesDaSala(sala.slug);
  const temas = temasDaSala(sala.slug)
    .map((t) => temaPorSlug(t))
    .filter((t) => t !== undefined);

  return (
    <div className="@container flex flex-col gap-8">
      <RegistrarEstudo evento={{ tipo: "sala", sala: sala.slug }} />

      <Cabecalho sala={sala} />

      <BannerSala imagem={imagemDaSala(sala)} placa={sala.placa} />

      <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-8 @max-[65rem]:grid-cols-1">
        <section className="flex min-w-0 flex-col gap-5" aria-labelledby="titulo-conteudos">
          <ConteudosDaSala conteudos={conteudos} nomeSala={sala.nome} />
          {/* TODO(trilhas): a Trilha de estudo da Sala (RF-22, RF-23; componente TrilhaEstudo) entra aqui,
              depois da lista, com etapas iniciante → avançado e sem ranking entre pessoas (RF-24). */}
        </section>

        <div className="flex min-w-0 flex-col gap-8">
          {videos.length > 0 && (
            <section className="flex flex-col gap-4" aria-labelledby="titulo-videos">
              <h2 id="titulo-videos" className="sdb-title-2">
                Vídeos do assunto
              </h2>
              <div className="grid grid-cols-1 gap-4 @max-[65rem]:grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]">
                {videos.slice(0, VIDEOS_NA_LATERAL).map((v) => (
                  <CardDoVideo key={v.id} video={v} nomeSala={sala.nome} />
                ))}
              </div>
              {videos.length > VIDEOS_NA_LATERAL && (
                <ButtonLink
                  href={`/biblioteca?sala=${sala.slug}&formato=video` as Route}
                  variant="secondary"
                  size="sm"
                  className="self-start"
                >
                  Ver os {videos.length} vídeos
                </ButtonLink>
              )}
            </section>
          )}

          {temas.length > 0 && (
            <section className="flex flex-col gap-3" aria-labelledby="titulo-comparar">
              <h2 id="titulo-comparar" className="sdb-headline">
                Comparar um tema com as outras Salas
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
            <section className="flex min-w-0 flex-col gap-4" aria-labelledby="titulo-citacao">
              <h2 id="titulo-citacao" className="sdb-title-2">
                Trecho de fonte primária
              </h2>
              <BlocoCitacao citacao={citacao} estreito />
            </section>
          )}
        </div>
      </div>

      {verbetes.length > 0 && (
        <section
          id="glossario"
          className="flex max-w-read scroll-mt-8 flex-col gap-4"
          aria-labelledby="titulo-glossario"
        >
          <h2 id="titulo-glossario" className="sdb-title-2">
            Glossário da Sala
          </h2>
          <GlossarioDaSala verbetes={verbetes} />
        </section>
      )}

      {fontes.length > 0 && (
        <section className="flex flex-col gap-4" aria-labelledby="titulo-fontes">
          <h2 id="titulo-fontes" className="sdb-title-2">
            Fontes usadas nesta Sala
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4 @max-[32.5rem]:grid-cols-1">
            {fontes.map((f) => (
              <CardFonte key={f.id} fonte={f} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Cabeçalho: na Sala oficial, "Sala · {tradição}" e o assistente (se ela está na
 * comparação); na de anfitrião, a assinatura e o "Site da Sala".
 */
function Cabecalho({ sala }: { sala: SalaResumo }) {
  const anfitriao = sala.anfitriao;
  const dados = [
    { rotulo: "Nível predominante", valor: <SeloNivel nivel={sala.nivelPredominante} plain /> },
    ...(sala.periodo ? [{ rotulo: "Período", valor: sala.periodo }] : []),
    sala.publicadaEm
      ? { rotulo: "Publicada em", valor: formatarData(sala.publicadaEm) }
      : { rotulo: "Atualizada em", valor: formatarData(sala.atualizadaEm) },
  ];
  const acoes = anfitriao
    ? sala.link && (
        <a
          className={classesDoBotao({ variant: "secondary", size: "sm", className: "no-underline" })}
          href={sala.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="externo" />
          Site da Sala
          <span className="sdb-sr"> (abre em nova aba)</span>
        </a>
      )
    : sala.naComparacao && (
        <ButtonLink href={`/assistente?escopo=${sala.slug}` as Route} variant="tinted" size="sm" icon="ia">
          Perguntar ao assistente sobre esta Sala
        </ButtonLink>
      );
  return (
    <CabecalhoSala
      voltar={{ href: "/salas" as Route, rotulo: "Salas" }}
      rotulo={anfitriao ? "Sala de anfitrião" : `Sala · ${sala.tradicao}`}
      titulo={sala.nome}
      descricao={sala.descricao}
      assinatura={
        anfitriao && {
          nome: anfitriao.nome,
          credencial: anfitriao.credencial,
          href: `/anfitrioes/${anfitriao.slug}` as Route,
        }
      }
      dados={dados}
      acoes={acoes || undefined}
    />
  );
}
