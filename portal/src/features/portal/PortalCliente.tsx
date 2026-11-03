"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { BannerRotativo, type SlideBanner } from "@/components/ds/BannerRotativo";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CardAnuncio } from "@/components/ds/CardAnuncio";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardSala } from "@/components/ds/CardSala";
import { Chip } from "@/components/ds/Chip";
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
import { useSessao } from "@/features/auth/SessaoProvider";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { intercalarSlides } from "@/features/estudo/banner";
import { formatarData } from "@/lib/texto";
import type { ModeloPortal } from "@/server/estudo";
import { comporLeituras, type PreviaComunidade } from "./composicao";
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
export function PortalCliente({
  modelo,
  comunidade = [],
}: {
  modelo: ModeloPortal;
  comunidade?: PreviaComunidade[];
}) {
  const [tema, setTema] = useState<TemaSlug | null>(null);
  const [politica, setPolitica] = useState(false);
  const { membro } = useSessao();
  const temaEscolhido = modelo.temas.find((t) => t.slug === tema);
  const salas = tema ? modelo.salas.filter((s) => s.temas.includes(tema)) : modelo.salas;
  const { retomada, inicio, revisao, sugestoes, novidades } = comporLeituras(modelo);
  const buscaAbrePortas: SlideBanner = {
    id: "destaque-busca-portas",
    tipo: "arte",
    texto:
      "Biblioteca digital de estudos comparados. Sua busca abre novas portas. Entre nas Salas, explore artigos e encontre diferentes maneiras de compreender a existência. Cada leitura é um convite para ampliar seu olhar.",
    midia: { placa: "bordo", imagem: "/imagens/banner/busca-novas-portas.webp" },
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
  const novoOlhar: SlideBanner = {
    id: "destaque-novo-olhar",
    tipo: "arte",
    texto:
      "Um novo olhar começa em você. Dê espaço à curiosidade, à reflexão e ao conhecimento de si. Explore diferentes tradições e construa seu percurso de descoberta, uma pergunta de cada vez.",
    midia: { placa: "bordo", imagem: "/imagens/banner/novo-olhar.webp" },
    acoes: (
      <ButtonLink href="/biblioteca" variant="secondary">
        Explorar o acervo
      </ButtonLink>
    ),
  };
  const salaUrantia = modelo.salas.find(({ sala }) =>
    sala.nome
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .includes("urantia"),
  );
  const horizonte: SlideBanner = {
    id: "destaque-horizonte",
    tipo: "arte",
    texto:
      "Amplie o horizonte das suas perguntas. Conheça a visão de universo apresentada pelo Livro de Urântia. Explore sua cosmologia e suas narrativas espirituais com curiosidade e discernimento.",
    midia: { placa: "grafite", imagem: "/imagens/banner/horizonte-perguntas.webp" },
    acoes: (
      <ButtonLink
        href={salaUrantia ? (`/salas/${salaUrantia.sala.slug}` as Route) : "/salas"}
        variant="secondary"
      >
        {salaUrantia ? "Explorar a Sala" : "Explorar Salas"}
      </ButtonLink>
    ),
  };
  const slides = intercalarSlides(
    buscaAbrePortas,
    [novoOlhar, horizonte, destaque, ...episodios],
    modelo.slidesAnuncio,
  );

  return (
    <div className="sdb-home">
      <h1 className="sdb-sr">Portal</h1>
      <BannerRotativo slides={slides} onPorQue={() => setPolitica(true)} />
      <section className="sdb-home__section sdb-home__salas" aria-labelledby="salas-recomendadas-titulo">
        <Cabecalho
          id="salas-recomendadas-titulo"
          titulo="Encontre sua Sala de estudo"
          acao="Ver todas as Salas"
          href="/salas"
        />
        <p className="sdb-home__intro">Explore os assuntos do acervo e as fontes de cada tradição.</p>
        {modelo.temas.length > 0 && (
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
        )}
        <div className={`sdb-home__grid${salas.length === 1 ? " sdb-home__grid--single" : ""}`}>
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
        </div>
        {salas.length === 0 && (
          <EstadoSecao
            compacto
            simbolo="busca"
            titulo={tema ? "Nenhuma Sala para este tema" : "Nenhuma Sala disponível por enquanto"}
            descricao={
              tema ? "Escolha outro tema ou consulte todas as Salas." : "As Salas publicadas aparecerão aqui."
            }
          />
        )}
        {temaEscolhido && (
          <p className="sdb-footnote" aria-live="polite">
            {salas.length} {salas.length === 1 ? "Sala trata" : "Salas tratam"} de{" "}
            {temaEscolhido.nome.toLowerCase()}.{" "}
            <Link className="sdb-link" href={`/comparar?tema=${temaEscolhido.slug}`}>
              Comparar perspectivas deste tema
            </Link>
          </p>
        )}
      </section>
      <section className="sdb-home__assistant" aria-labelledby="home-assistente">
        <div>
          <h2 id="home-assistente">Assistente do acervo</h2>
          <p>Faça uma pergunta, conecte perspectivas e consulte as fontes das Salas.</p>
        </div>
        <ButtonLink href="/assistente" variant="secondary" icon="assistente">
          Perguntar ao assistente
        </ButtonLink>
      </section>
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
          <section
            className="sdb-home__section sdb-home__leituras"
            aria-labelledby="proximas-leituras-titulo"
          >
            <Cabecalho
              id="proximas-leituras-titulo"
              titulo="Para sua próxima leitura"
              acao="Explorar o acervo"
              href="/biblioteca"
            />
            <div className={`sdb-home__grid${sugestoes.length === 1 ? " sdb-home__grid--single" : ""}`}>
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
            </div>
            {sugestoes.length === 0 && (
              <p className="sdb-home__intro">Explore o acervo para encontrar sua próxima leitura.</p>
            )}
          </section>
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
          {membro?.papel === "membro" && (
            <section className="sdb-home__caminho" aria-labelledby="home-anfitriao">
              <h2 id="home-anfitriao">Seja anfitrião</h2>
              <p>
                Mantenha uma Sala própria com seus estudos e fontes. A curadoria revisa cada Sala antes de ir
                ao ar.
              </p>
              <ButtonLink href={"/ajustes#ser-anfitriao" as Route} variant="secondary" size="sm" icon="salas">
                Quero ser anfitrião
              </ButtonLink>
            </section>
          )}
          {modelo.anuncioPortal && (
            <div className="sdb-home__publicidade">
              <CardAnuncio anuncio={modelo.anuncioPortal} />
              <Button variant="plain" size="sm" onClick={() => setPolitica(true)}>
                Sobre os anúncios
              </Button>
            </div>
          )}
          <section className="sdb-home__section" aria-labelledby="home-comunidade">
            <Cabecalho
              id="home-comunidade"
              titulo="Na Comunidade"
              acao="Abrir Comunidade"
              href="/comunidade"
            />
            <p className="sdb-home__intro">Publicações e conversas de quem participa do Portal.</p>
            <div className="sdb-home__community">
              {comunidade.map((p) => (
                <article key={p.id}>
                  <p className="sdb-footnote">
                    <Link className="sdb-link" href={p.autorHref as Route}>
                      {p.autorNome}
                    </Link>{" "}
                    · <time dateTime={p.criadaEm}>{formatarData(p.criadaEm)}</time>
                  </p>
                  <p className="sdb-body-sm">{p.texto || "Uma nova publicação na Comunidade."}</p>
                  <Link className="sdb-link" href={`/comunidade/p/${p.id}` as Route}>
                    Ver publicação e conversa
                  </Link>
                </article>
              ))}
              {comunidade.length === 0 && (
                <p className="sdb-body-sm">
                  As publicações visíveis da Comunidade aparecerão aqui. Conheça o espaço e suas conversas.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      <ModalPoliticaAnuncios aberto={politica} onFechar={() => setPolitica(false)} />
    </div>
  );
}
