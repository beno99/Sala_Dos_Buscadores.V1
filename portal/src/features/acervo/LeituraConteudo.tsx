import type { Route } from "next";
import Link from "next/link";
import { Alerta } from "@/components/ds/Alerta";
import { AutoriaConteudo, type DadoAutoria } from "@/components/ds/AutoriaConteudo";
import { BannerSala } from "@/components/ds/BannerSala";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { BotaoCompartilhar } from "@/components/ds/BotaoCompartilhar";
import { ButtonLink, classesDoBotao } from "@/components/ds/Button";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardFonte } from "@/components/ds/CardFonte";
import { Carrossel } from "@/components/ds/Carrossel";
import { ChipLink } from "@/components/ds/Chip";
import { CorpoArtigo } from "@/components/ds/CorpoArtigo";
import { Icon } from "@/components/ds/Icon";
import { Badge, SeloNivel, SeloProveniencia } from "@/components/ds/Selos";
import { comparacaoDoTema, temaPorSlug } from "@/data/catalogo";
import { itemDaImagem } from "@/data/imagens";
import { PROVENIENCIA_AJUDA } from "@/data/rotulos";
import type { Citacao, Conteudo, Fonte, Sala, Video } from "@/data/types";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { BotaoConcluir } from "@/features/jornada/BotaoConcluir";
import { formatarData, iniciais } from "@/lib/texto";
import { CardDoVideo } from "./CardDoVideo";

interface LeituraConteudoProps {
  sala: Sala;
  conteudo: Conteudo;
  citacao?: Citacao;
  fontes: Fonte[];
  videos: Video[];
  /** "Continuar a busca": publicados com tema em comum, das outras Salas primeiro. */
  relacionados?: Conteudo[];
  /** Imagem de card recebida por consumidores legados; não substitui o topo do artigo. */
  imagemCard?: string;
  /** Jornada do Buscador: conclusão declarada do artigo e dos vídeos (sem botão em conteúdo próprio). */
  jornada?: {
    artigo: { concluido: boolean; proprio: boolean };
    videosConcluidos: string[];
    videosProprios: string[];
  };
  /** Leitura em sequência dentro da mesma Sala, na ordem da página da Sala. */
  sequencia?: {
    posicao: number;
    total: number;
    anterior?: { titulo: string; href: string };
    proximo?: { titulo: string; href: string };
    /** Artigos da mesma Sala depois deste, para o "Continuar a busca". */
    seguintes: Conteudo[];
  };
}

/**
 * Leitura de um conteúdo com fonte indicada (RF-11, RF-12, RF-15, RF-16), do
 * banner para baixo: título, autoria e dados à esquerda do texto em blocos;
 * vídeos, trecho de fonte primária e fontes na coluna estreita; "Continuar a
 * busca" na largura toda. Usada pela página pública e pelas pré-visualizações
 * da curadoria e do anfitrião, para que a revisão veja exatamente o que o
 * buscador vê. A trilha fica na barra superior, posta pela moldura.
 */
export function LeituraConteudo({
  sala,
  conteudo,
  citacao,
  fontes,
  videos,
  relacionados = [],
  imagemCard,
  jornada,
  sequencia,
}: LeituraConteudoProps) {
  const temas = conteudo.temas.map((t) => temaPorSlug(t)).filter((t) => t !== undefined);
  const assinatura = conteudo.anfitriao;
  const temExtras = videos.length > 0 || Boolean(citacao) || fontes.length > 0;

  const dados: DadoAutoria[] = [
    {
      rotulo: "Publicado em",
      valor: <time dateTime={conteudo.publicadoEm}>{formatarData(conteudo.publicadoEm)}</time>,
    },
    { rotulo: conteudo.formato === "video" ? "Duração" : "Leitura", valor: `${conteudo.duracaoMin} min` },
    ...(conteudo.periodo ? [{ rotulo: "Período", valor: conteudo.periodo }] : []),
    { rotulo: "Nível", valor: <SeloNivel nivel={conteudo.nivel} plain /> },
    ...(temas.length
      ? [
          {
            rotulo: temas.length > 1 ? "Temas" : "Tema",
            valor: temas.map((t) => (
              <Badge key={t.slug} variant="topic" icon="glossario">
                {t.nome}
              </Badge>
            )),
          },
        ]
      : []),
    {
      rotulo: "Proveniência",
      valor: <SeloProveniencia tipo={conteudo.proveniencia} />,
      ajuda: PROVENIENCIA_AJUDA[conteudo.proveniencia],
    },
    { rotulo: "Compartilhar", valor: <BotaoCompartilhar titulo={conteudo.titulo} /> },
  ];

  return (
    <div className="@container flex min-w-0 flex-col gap-8">
      <Topo conteudo={conteudo} sala={sala} imagemCard={imagemCard} />

      <article
        className={`sdb-article${assinatura ? " sdb-content--host" : ""}`}
        aria-labelledby="titulo-conteudo"
      >
        <h1 id="titulo-conteudo" className="sdb-large-title sdb-article__title">
          {conteudo.titulo}
        </h1>

        <AutoriaConteudo
          className="sdb-article__byline"
          iniciais={iniciais(conteudo.autoria.nome)}
          nome={conteudo.autoria.nome}
          credencial={conteudo.autoria.credencial}
          href={
            assinatura && assinatura.nome === conteudo.autoria.nome
              ? (`/anfitrioes/${assinatura.slug}` as Route)
              : undefined
          }
          suave={conteudo.proveniencia === "primaria"}
          dados={dados}
        />

        {assinatura && (
          <p className="sdb-host-signature">
            Sala de Anfitrião ·{" "}
            <Link href={`/anfitrioes/${assinatura.slug}` as Route}>{assinatura.nome}</Link>
          </p>
        )}
        <CorpoArtigo className="sdb-article__body" corpo={conteudo.corpo}>
          {conteudo.link?.tipo === "site" && (
            <div>
              <a
                className={classesDoBotao({ variant: "secondary", className: "no-underline" })}
                href={conteudo.link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="externo" />
                Ler no site
                <span className="sdb-sr"> (abre em nova aba)</span>
              </a>
            </div>
          )}

          {assinatura && !conteudo.divergencia && <DivergenciaDoAnfitriao temas={temas} />}

          {conteudo.divergencia && (
            <Alerta variant="warning" title="Atenção: este tema tem leituras divergentes">
              {conteudo.divergencia}
            </Alerta>
          )}

          {jornada && !jornada.artigo.proprio && (
            <BotaoConcluir
              alvo={{ tipo: "artigo", sala: sala.slug, slug: conteudo.slug }}
              concluido={jornada.artigo.concluido}
            />
          )}

          {sequencia && sequencia.total > 1 && (
            <nav
              className="sdb-material sdb-panel flex flex-col gap-4"
              aria-label={`Leitura em sequência em ${sala.nome}`}
            >
              <p className="sdb-caption sdb-secondary m-0">
                LEITURA {sequencia.posicao} DE {sequencia.total} EM {sala.nome.toUpperCase()}
              </p>
              {sequencia.proximo ? (
                <div className="flex flex-col gap-3">
                  <p className="sdb-footnote m-0">Próxima leitura</p>
                  <p className="sdb-title-2 m-0">{sequencia.proximo.titulo}</p>
                  <div>
                    <ButtonLink
                      href={sequencia.proximo.href as Route}
                      variant="primary"
                      iconEnd="chevronDireita"
                    >
                      Continuar para a próxima leitura
                    </ButtonLink>
                  </div>
                </div>
              ) : (
                <p className="sdb-body-sm m-0">
                  Você chegou à última leitura desta Sala. Abaixo, conteúdos de outras Salas sobre o mesmo
                  tema.
                </p>
              )}
              {sequencia.anterior && (
                <a className="sdb-link sdb-footnote" href={sequencia.anterior.href}>
                  ← Leitura anterior: {sequencia.anterior.titulo}
                </a>
              )}
            </nav>
          )}

          {/* TODO(comunidade): comentários vinculados ao conteúdo (RF-32 a RF-36) entram aqui, no fim da coluna
              do texto, com moderação humana obrigatória em casos sensíveis. */}
        </CorpoArtigo>

        {temExtras && (
          <aside className="sdb-article__extras" aria-label="Para acompanhar a leitura">
            {videos.length > 0 && (
              <section className="sdb-article__block" aria-labelledby="titulo-videos">
                <h2 id="titulo-videos" className="sdb-title-2">
                  Vídeos do assunto
                </h2>
                <div className="sdb-article__videos">
                  {videos.map((v) => (
                    <div key={v.id} className="flex min-w-0 flex-col gap-2">
                      <CardDoVideo video={v} nomeSala={sala.nome} />
                      {jornada && !jornada.videosProprios.includes(v.id) && (
                        <BotaoConcluir
                          alvo={{ tipo: "video", id: v.id }}
                          concluido={jornada.videosConcluidos.includes(v.id)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {citacao && (
              <section className="sdb-article__block" aria-labelledby="titulo-trecho">
                <h2 id="titulo-trecho" className="sdb-title-2">
                  Trecho de fonte primária
                </h2>
                <BlocoCitacao citacao={citacao} estreito />
              </section>
            )}

            {fontes.length > 0 && (
              <section className="sdb-article__block" aria-labelledby="titulo-fontes">
                <h2 id="titulo-fontes" className="sdb-title-2">
                  Fontes
                </h2>
                <div className="sdb-article__stack">
                  {fontes.map((f) => (
                    <CardFonte key={f.id} fonte={f} />
                  ))}
                </div>
              </section>
            )}
          </aside>
        )}
      </article>

      <ContinuarBusca
        sala={sala}
        temas={temas}
        relacionados={sequencia?.seguintes.length ? sequencia.seguintes : relacionados}
        mesmaSala={Boolean(sequencia?.seguintes.length)}
      />
    </div>
  );
}

/**
 * Topo: o vídeo do YouTube do anfitrião, quando o link é de vídeo; senão o
 * banner com a imagem de topo própria ou, sem ela, a placa da Sala.
 * Alt, foco e crédito vêm do item de imagens do acervo.
 */
function Topo({ conteudo, sala }: { conteudo: Conteudo; sala: Sala; imagemCard?: string }) {
  if (conteudo.link?.tipo === "youtube") {
    return (
      <figure className="video-embed">
        <div className="video-embed__frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${conteudo.link.youtubeId}`}
            title={`Vídeo: ${conteudo.titulo}`}
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <figcaption className="video-embed__legenda">Vídeo indicado pelo anfitrião, no YouTube.</figcaption>
      </figure>
    );
  }
  const imagem = conteudo.thumb;
  const item = itemDaImagem(imagem);
  return (
    <BannerSala
      tituloFallback={conteudo.titulo}
      imagem={imagem}
      placa={sala.placa}
      alt={item?.alt}
      foco={item?.foco}
      credito={item?.credito}
    />
  );
}

/** "Continuar a busca": carrossel de relacionados, com Comparar e o assistente entre o cabeçalho e o trilho. */
function ContinuarBusca({
  sala,
  temas,
  relacionados,
  mesmaSala = false,
}: {
  sala: Sala;
  temas: { slug: string; nome: string }[];
  relacionados: Conteudo[];
  /** Ainda há leituras nesta Sala: o carrossel mostra as próximas dela; outras Salas só depois. */
  mesmaSala?: boolean;
}) {
  const nomes = temas.map((t) => t.nome);
  const listaDeTemas =
    nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : (nomes[0] ?? "este tema");
  const primeiro = temas[0];
  return (
    <Carrossel
      id="continuar"
      className="sdb-article__continue"
      titulo={mesmaSala ? `Próximas leituras em ${sala.nome}` : "Continuar a busca"}
      tituloGrande
      legenda={
        mesmaSala
          ? "Siga a sequência desta Sala. Outras Salas aparecem aqui quando você chegar ao fim dela."
          : relacionados.length
            ? `Outros conteúdos sobre ${listaDeTemas} · primeiro das outras Salas`
            : `Ainda não há outros conteúdos publicados sobre ${listaDeTemas}`
      }
      rotuloItens="conteúdos"
      larguraItem={300}
      acoes={
        relacionados.length > 0 &&
        primeiro && (
          <ButtonLink
            href={`/biblioteca?tema=${primeiro.slug}` as Route}
            variant="plain"
            size="sm"
            iconEnd="chevronDireita"
          >
            Ver todos
          </ButtonLink>
        )
      }
      filtros={
        <div className="sdb-carousel__chips" role="group" aria-label="Comparar e perguntar">
          {temas.map((t) => (
            <ChipLink key={t.slug} areia href={`/comparar?tema=${t.slug}` as Route}>
              Comparar: {t.nome}
            </ChipLink>
          ))}
          <ButtonLink
            href={(sala.naComparacao ? `/assistente?escopo=${sala.slug}` : "/assistente") as Route}
            variant="tinted"
            size="sm"
            icon="ia"
          >
            Perguntar ao assistente
          </ButtonLink>
        </div>
      }
    >
      {relacionados.map((c) => (
        <CardConteudo
          key={`${c.sala}/${c.slug}`}
          conteudo={c}
          acoes={<BotaoSalvar tipo="conteudo" alvo={`${c.sala}/${c.slug}`} titulo={c.titulo} estilo="card" />}
        />
      ))}
    </Carrossel>
  );
}

/**
 * Artigo de anfitrião (§8): os temas do portal têm leituras divergentes entre
 * as Salas (é o que a grade comparativa mostra). Como nos artigos da curadoria,
 * a nota diz isso de forma explícita e leva à comparação.
 */
function DivergenciaDoAnfitriao({ temas }: { temas: { slug: string; nome: string }[] }) {
  const comparaveis = temas.filter((t) => comparacaoDoTema(t.slug as Conteudo["temas"][number]));
  if (!comparaveis.length) return null;
  return (
    <Alerta variant="warning" title="Atenção: este tema tem leituras divergentes">
      Este artigo traz a leitura de um anfitrião. As Salas tratam{" "}
      {comparaveis.map((t) => t.nome.toLowerCase()).join(" e ")} de modos diferentes; veja as leituras lado a
      lado em “Continuar a busca”, abaixo, antes de concluir.
    </Alerta>
  );
}
