"use client";

import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { BannerRotativo, type SlideBanner } from "@/components/ds/BannerRotativo";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CardSala } from "@/components/ds/CardSala";
import { Carrossel } from "@/components/ds/Carrossel";
import { Chip } from "@/components/ds/Chip";
import { EspacoPublicitario } from "@/components/ds/EspacoPublicitario";
import { Icon } from "@/components/ds/Icon";
import { ItemCompacto, LinhaConteudo, LinhaMais, ListaLinhas } from "@/components/ds/ListaConteudos";
import { PainelIndicadores } from "@/components/ds/PainelIndicadores";
import { BlocoPainel, PainelProgresso } from "@/components/ds/PainelProgresso";
import { abrirNaMoldura } from "@/components/layout/aberturas";
import { salaPorSlug } from "@/data/catalogo";
import { TIPO_ROTULO } from "@/data/rotulos";
import type { TemaSlug } from "@/data/types";
import { intercalarSlides } from "@/features/estudo/banner";
import { formatarData } from "@/lib/texto";
import type { ModeloPortal } from "@/server/estudo";
import { ModalPoliticaAnuncios } from "./ModalPoliticaAnuncios";

/** Portal: a página inicial do membro, na grade do wireframe. */
export function PortalCliente({ modelo }: { modelo: ModeloPortal }) {
  const [tema, setTema] = useState<TemaSlug | null>(null);
  const [politica, setPolitica] = useState(false);
  const temaEscolhido = modelo.temas.find((t) => t.slug === tema);
  const salas = tema ? modelo.salas.filter((s) => s.temas.includes(tema)) : modelo.salas;

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
  const slides = intercalarSlides(marca, episodios, modelo.slidesAnuncio);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="sdb-sr">Portal</h1>
      <BannerRotativo slides={slides} onPorQue={() => setPolitica(true)} />

      <Carrossel
        id="salas-recomendadas"
        titulo="Salas recomendadas"
        legenda={`Acesso rápido às Salas · ${modelo.salas.length} abertas`}
        rotuloItens="Salas"
        larguraItem={320}
        filtros={
          <div className="sdb-row" style={{ gap: 8 }} role="group" aria-label="Filtrar Salas por tema">
            {modelo.temas.map((t) => (
              <Chip
                key={t.slug}
                pressed={tema === t.slug}
                count={t.contagem}
                onClick={() => setTema((atual) => (atual === t.slug ? null : t.slug))}
              >
                {t.nome}
              </Chip>
            ))}
          </div>
        }
        rodape={
          temaEscolhido && (
            <p className="sdb-footnote m-0" aria-live="polite">
              {salas.length} {salas.length === 1 ? "Sala trata" : "Salas tratam"} de{" "}
              {temaEscolhido.nome.toLowerCase()}.{" "}
              <a className="sdb-link" href={`/comparar?tema=${temaEscolhido.slug}`}>
                Comparar {temaEscolhido.nome.toLowerCase()} entre as Salas
              </a>
            </p>
          )
        }
      >
        {salas.length > 0 ? (
          salas.map((s) => (
            <CardSala
              key={s.sala.slug}
              sala={s.sala}
              progresso={s.progresso}
              ampliar={s.motivo === "ampliar"}
              imagem={s.imagem}
            />
          ))
        ) : (
          <Alerta
            title={`Nenhuma Sala trata de ${temaEscolhido?.nome.toLowerCase()} ainda.`}
            actions={
              <Button variant="secondary" size="sm" onClick={() => setTema(null)}>
                Tirar o filtro
              </Button>
            }
          >
            Tire o filtro de tema para ver todas as Salas.
          </Alerta>
        )}
      </Carrossel>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="titulo-progresso" className="sdb-title-2">
              Seu progresso
            </h2>
            <p className="sdb-footnote m-0">Só você vê estes números.</p>
          </div>
          {modelo.mostrarNiveis && (
            <div className="sdb-row" style={{ gap: 4 }}>
              <Button variant="plain" size="sm" onClick={() => abrirNaMoldura("niveis")}>
                Como os níveis funcionam
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="trilha"
                onClick={() => abrirNaMoldura("conquistas")}
              >
                Ver conquistas
              </Button>
            </div>
          )}
        </div>

        <PainelProgresso
          tituloId="titulo-progresso"
          indicadores={<PainelIndicadores rotulo="Seu progresso no acervo" itens={modelo.indicadores} />}
          anuncio={
            modelo.anuncioPainel && (
              <EspacoPublicitario
                anuncio={modelo.anuncioPainel}
                variante="painel"
                onPorQue={() => setPolitica(true)}
              />
            )
          }
        >
          {modelo.emAndamento.length > 0 ? (
            <BlocoPainel
              id="titulo-continuar"
              titulo="Continue de onde parou"
              sub="Retome a leitura no ponto em que parou."
            >
              <ul className="sdb-entries">
                {modelo.emAndamento.slice(0, 1).map(({ conteudo, imagem, pct }) => (
                  <li key={conteudo.slug}>
                    <ItemCompacto
                      conteudo={conteudo}
                      imagem={imagem}
                      progresso={pct}
                      acao="Retomar leitura"
                    />
                  </li>
                ))}
              </ul>
            </BlocoPainel>
          ) : (
            modelo.comecePorAqui.length > 0 && (
              <BlocoPainel
                id="titulo-comece"
                titulo="Comece por aqui"
                sub="Três leituras de nível iniciante, de Salas diferentes."
              >
                <ul className="sdb-entries">
                  {modelo.comecePorAqui.map(({ conteudo, imagem }) => (
                    <li key={conteudo.slug}>
                      <ItemCompacto conteudo={conteudo} imagem={imagem} acao="Começar a leitura" />
                    </li>
                  ))}
                </ul>
              </BlocoPainel>
            )
          )}

          <BlocoPainel
            id="titulo-recentes"
            titulo="Publicados recentemente"
            sub="Conteúdos que entraram no acervo"
          >
            <ListaLinhas>
              {modelo.recentes.map(({ conteudo }) => (
                <LinhaConteudo
                  key={`${conteudo.sala}/${conteudo.slug}`}
                  conteudo={conteudo}
                  meta={`${salaPorSlug(conteudo.sala)?.nome} · ${TIPO_ROTULO[conteudo.tipo]} · publicado em ${formatarData(conteudo.publicadoEm)}`}
                />
              ))}
              <LinhaMais href="/biblioteca">Ver tudo na Biblioteca</LinhaMais>
            </ListaLinhas>
          </BlocoPainel>

          {modelo.ampliar && (
            <BlocoPainel id="titulo-ampliar" titulo="Para ampliar o olhar" sub={modelo.ampliar.motivo}>
              <ListaLinhas>
                <LinhaConteudo
                  conteudo={modelo.ampliar.conteudo}
                  meta={`${salaPorSlug(modelo.ampliar.conteudo.sala)?.nome} · ${TIPO_ROTULO[modelo.ampliar.conteudo.tipo]} · ${modelo.ampliar.conteudo.duracaoMin} min de leitura`}
                />
              </ListaLinhas>
            </BlocoPainel>
          )}
        </PainelProgresso>
      </div>

      <ModalPoliticaAnuncios aberto={politica} onFechar={() => setPolitica(false)} />
    </div>
  );
}
