"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { BannerRotativo, type SlideBanner } from "@/components/ds/BannerRotativo";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardSala } from "@/components/ds/CardSala";
import { Carrossel } from "@/components/ds/Carrossel";
import { Chip } from "@/components/ds/Chip";
import { EspacoPublicitario } from "@/components/ds/EspacoPublicitario";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { LinhaConteudo, ListaLinhas } from "@/components/ds/ListaConteudos";
import { PainelIndicadores } from "@/components/ds/PainelIndicadores";
import { RetomadaPortal } from "@/components/ds/RetomadaPortal";
import { SeloNivelProgresso } from "@/components/ds/SeloNivelProgresso";
import { abrirNaMoldura } from "@/components/layout/aberturas";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { TemaSlug } from "@/data/types";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { intercalarSlides } from "@/features/estudo/banner";
import type { ModeloPortal } from "@/server/estudo";
import { comporLeituras } from "./composicao";
import { ModalPoliticaAnuncios } from "./ModalPoliticaAnuncios";

function Cabecalho({ id, titulo, acao, href }: { id: string; titulo: string; acao?: string; href?: Route }) {
  return (
    <div className="sdb-home__head">
      <h2 id={id}>{titulo}</h2>
      {href && (
        <ButtonLink href={href} variant="plain" size="sm">
          {acao}
          <Icon name="chevronDireita" size="sm" />
        </ButtonLink>
      )}
    </div>
  );
}

/** Frame 15:355: composição sobre dados privados e recomendações existentes. */
export function PortalCliente({ modelo }: { modelo: ModeloPortal }) {
  const [tema, setTema] = useState<TemaSlug | null>(null);
  const [politica, setPolitica] = useState(false);
  const temaEscolhido = modelo.temas.find((t) => t.slug === tema);
  const salas = tema ? modelo.salas.filter((s) => s.temas.includes(tema)) : modelo.salas;
  const { retomada, inicio, revisao, sugestoes, novidades } = comporLeituras(modelo);
  const marca: SlideBanner = {
    id: "marca",
    tipo: "marca",
    midia: { placa: "bordo", imagem: modelo.imagemMarca },
    acoes: (
      <>
        <ButtonLink href="/comparar" variant="primary">
          Comparar um tema
        </ButtonLink>
        <Button variant="secondary" icon="assistente" onClick={() => abrirNaMoldura("assistente")}>
          Perguntar ao assistente
        </Button>
      </>
    ),
  };
  const episodios: SlideBanner[] = modelo.episodios.map((e) => ({
    id: e.id,
    tipo: "episodio",
    rotulo: e.rotulo,
    titulo: e.titulo,
    sub: e.sub,
    midia: { placa: e.placa, imagem: e.imagem },
    acoes: (
      <a className="sdb-btn sdb-btn--primary" href={e.url} target="_blank" rel="noopener noreferrer">
        <Icon name="play" size="sm" />
        Assistir no YouTube
      </a>
    ),
  }));
  const destaque: SlideBanner = {
    id: "destaque-espiral",
    tipo: "arte",
    texto: "Novo vídeo da Sala dos Buscadores: e se o tempo fosse uma espiral?",
    midia: { placa: "grafite", imagem: "/imagens/banner/destaque-espiral.webp" },
    acoes: (
      <a
        className="sdb-btn sdb-btn--secondary"
        href="https://www.youtube.com/watch?v=WdfozbD1Lyo"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="play" size="sm" />
        Assistir no YouTube
      </a>
    ),
  };
  const slides = intercalarSlides(marca, [destaque, ...episodios], modelo.slidesAnuncio);

  return (
    <div className="sdb-home">
      <div className="sdb-home__intro-head">
        <p className="sdb-meta">Seu percurso de estudo</p>
        <h1 className="sdb-large-title">Sua próxima descoberta começa aqui.</h1>
        <p className="sdb-body-sm sdb-secondary">
          Explore fontes, compare perspectivas e construa seu próprio caminho.
        </p>
      </div>
      <BannerRotativo slides={slides} onPorQue={() => setPolitica(true)} />
      <PainelIndicadores rotulo="Seu progresso no acervo" itens={modelo.indicadores} />
      <div className="sdb-home__columns">
        <div className="sdb-home__editorial">
          <section className="sdb-home__section" aria-labelledby="home-ferramentas">
            <h2 id="home-ferramentas" className="sdb-sr">
              Ferramentas de estudo
            </h2>
            <div className="sdb-home__perguntas">
              <Link className="sdb-home__pergunta" href="/comparar">
                <span>
                  <span className="sdb-home__pergunta-titulo">Comparar um tema</span>
                  <span className="sdb-home__pergunta-acao">
                    Consulte leituras de diferentes Salas com suas fontes.
                  </span>
                </span>
                <Icon name="seta" />
              </Link>
              <Link className="sdb-home__pergunta" href="/biblioteca">
                <span>
                  <span className="sdb-home__pergunta-titulo">Explorar a Biblioteca</span>
                  <span className="sdb-home__pergunta-acao">
                    Encontre conteúdo por tema, formato ou nível de leitura.
                  </span>
                </span>
                <Icon name="seta" />
              </Link>
            </div>
          </section>
          <section className="sdb-home__section" aria-labelledby="home-retomada">
            <Cabecalho
              id="home-retomada"
              titulo={
                retomada ? "Continue sua busca" : revisao ? "Seu progresso de leitura" : "Comece sua busca"
              }
              acao={retomada ? "Ver minha Estante" : "Explorar o acervo"}
              href={retomada ? "/estante" : "/biblioteca"}
            />
            {retomada ? (
              <RetomadaPortal {...retomada} />
            ) : revisao ? (
              <>
                <p className="sdb-home__intro">
                  Você já concluiu leituras no acervo. Continue explorando ou leia de novo.
                </p>
                <RetomadaPortal {...revisao} pct={100} cta="Ler de novo" />
              </>
            ) : inicio ? (
              <>
                <p className="sdb-home__intro">Escolha uma leitura para começar.</p>
                <RetomadaPortal {...inicio} />
              </>
            ) : (
              <EstadoSecao
                compacto
                simbolo="busca"
                titulo="O acervo está aberto à sua busca."
                descricao="Conheça as leituras disponíveis na Biblioteca."
                acao={{ rotulo: "Explorar o acervo", href: "/biblioteca" }}
              />
            )}
          </section>
          <Carrossel
            id="proximas-leituras"
            className="sdb-home__leituras"
            titulo="Para sua próxima leitura"
            rotuloItens="leituras"
            larguraItem={300}
            acoes={
              <ButtonLink href="/biblioteca" variant="plain" size="sm">
                Explorar o acervo
              </ButtonLink>
            }
            rodape={
              sugestoes.length === 0 ? (
                <p className="sdb-home__intro">Explore o acervo para encontrar sua próxima leitura.</p>
              ) : undefined
            }
          >
            {sugestoes.map(({ conteudo }) => (
              <CardConteudo
                key={`${conteudo.sala}/${conteudo.slug}`}
                conteudo={conteudo}
                mostrarNivel={modelo.mostrarNiveis}
                acoes={
                  <BotaoSalvar
                    tipo="conteudo"
                    estilo="card"
                    alvo={`${conteudo.sala}/${conteudo.slug}`}
                    titulo={conteudo.titulo}
                  />
                }
              />
            ))}
          </Carrossel>
          <Carrossel
            id="salas-recomendadas"
            className="sdb-home__salas"
            titulo="Conheça outras Salas"
            rotuloItens="Salas"
            larguraItem={388}
            acoes={
              <ButtonLink href="/salas" variant="plain" size="sm">
                Ver Salas
              </ButtonLink>
            }
            filtros={
              <details className="sdb-home__filtros">
                <summary>Filtrar Salas por tema{temaEscolhido ? `: ${temaEscolhido.nome}` : ""}</summary>
                <div className="sdb-carousel__chips" role="group" aria-label="Filtrar Salas por tema">
                  {modelo.temas.map((t) => (
                    <Chip
                      key={t.slug}
                      areia
                      pressed={tema === t.slug}
                      count={t.contagem}
                      onClick={() => setTema((atual) => (atual === t.slug ? null : t.slug))}
                    >
                      {t.nome}
                    </Chip>
                  ))}
                </div>
              </details>
            }
            rodape={
              temaEscolhido ? (
                <p className="sdb-footnote" aria-live="polite">
                  {salas.length} {salas.length === 1 ? "Sala trata" : "Salas tratam"} de{" "}
                  {temaEscolhido.nome.toLowerCase()}.{" "}
                  <Link className="sdb-link" href={`/comparar?tema=${temaEscolhido.slug}`}>
                    Comparar {temaEscolhido.nome.toLowerCase()} entre as Salas
                  </Link>
                </p>
              ) : salas.length === 0 ? (
                <EstadoSecao
                  compacto
                  simbolo="busca"
                  titulo="Nenhuma Sala disponível por enquanto."
                  descricao="As Salas publicadas aparecerão aqui."
                />
              ) : undefined
            }
          >
            {salas.map((s) => (
              <CardSala
                key={s.sala.slug}
                sala={s.sala}
                progresso={s.progresso}
                ampliar={s.motivo === "ampliar"}
                imagem={s.imagem}
                acoes={<BotaoSalvar estilo="sala" tipo="sala" alvo={s.sala.slug} titulo={s.sala.nome} />}
              />
            ))}
          </Carrossel>
          <section className="sdb-home__section" aria-labelledby="home-perguntas">
            <Cabecalho id="home-perguntas" titulo="Explore uma pergunta" />
            <div className="sdb-home__perguntas">
              {[
                { tema: "alma", texto: "Como as tradições compreendem a alma?" },
                { tema: "morte", texto: "O que acontece após a morte?" },
              ].map((p) => (
                <Link key={p.tema} className="sdb-home__pergunta" href={`/comparar?tema=${p.tema}`}>
                  <span>
                    <span className="sdb-home__pergunta-titulo">{p.texto}</span>
                    <span className="sdb-home__pergunta-acao">Comparar perspectivas</span>
                  </span>
                  <Icon name="seta" />
                </Link>
              ))}
            </div>
          </section>
          <section className="sdb-home__section sdb-home__novidades" aria-labelledby="home-novidades">
            <Cabecalho
              id="home-novidades"
              titulo="Novidades do acervo"
              acao="Ver Biblioteca"
              href="/biblioteca"
            />
            {novidades.length ? (
              <ListaLinhas>
                {novidades.map(({ conteudo }) => (
                  <LinhaConteudo
                    key={`${conteudo.sala}/${conteudo.slug}`}
                    conteudo={conteudo}
                    icone
                    meta={`${TIPO_ROTULO[conteudo.tipo]} · ${salaPorSlug(conteudo.sala)?.nome ?? conteudo.sala}`}
                  />
                ))}
              </ListaLinhas>
            ) : (
              <EstadoSecao
                compacto
                simbolo="busca"
                titulo="Sem novidades por enquanto."
                descricao="Novas publicações do acervo aparecerão aqui."
              />
            )}
          </section>
        </div>
        <div className="sdb-home__apoio">
          <section className="sdb-home__caminho" aria-labelledby="home-caminho">
            <h2 id="home-caminho">Seu caminho</h2>
            <p>Suas leituras e descobertas, um passo de cada vez.</p>
            {modelo.mostrarNiveis && modelo.nivelFoco ? (
              <SeloNivelProgresso {...modelo.nivelFoco} />
            ) : (
              <p>Um espaço para acompanhar suas leituras e descobertas.</p>
            )}
            <ButtonLink href="/conquistas" variant="secondary" size="sm" icon="trilha">
              Ver conquistas
            </ButtonLink>
          </section>
          {modelo.anuncioPainel && (
            <EspacoPublicitario
              anuncio={modelo.anuncioPainel}
              variante="portal"
              onPorQue={() => setPolitica(true)}
            />
          )}
        </div>
      </div>
      <ModalPoliticaAnuncios aberto={politica} onFechar={() => setPolitica(false)} />
    </div>
  );
}
