import type { Metadata, Route } from "next";
import { ButtonLink } from "@/components/ds/Button";
import { CardConteudoVitrine } from "@/components/ds/CardConteudoVitrine";
import { CardVideo } from "@/components/ds/CardVideo";
import { ChipLink } from "@/components/ds/Chip";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { ListaDestaques } from "@/components/ds/ListaDestaques";
import { salaPorSlug, todosOsTemas } from "@/data/catalogo";
import { type ConteudoVitrine, listarMaisPesquisados, obterDestaques } from "@/data/repositorio";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { cx } from "@/lib/cx";
import { plural } from "@/lib/texto";

export const metadata: Metadata = { title: "Destaques" };

/*
 * Destaques: vitrine editorial. Duas lógicas na mesma tela:
 * - escolha da curadoria (/admin/destaques): vídeo, quatro cards e cinco artigos;
 * - ranking de buscas: "Mais pesquisados", ranking de conteúdo, nunca de pessoas.
 * Larguras decididas pelo container (@container), não só pela janela.
 */
export default async function Destaques(props: PageProps<"/destaques">) {
  const busca = await props.searchParams;
  const [destaques, maisPesquisados] = await Promise.all([obterDestaques(), listarMaisPesquisados()]);
  // Chips de tema (layout do Figma): com um tema, o mosaico dá lugar a uma grade só com os destaques dele.
  const escolhidos = [...destaques.cards, ...destaques.artigos];
  const temas = todosOsTemas()
    .map((t) => ({
      ...t,
      contagem:
        escolhidos.filter((e) => e.conteudo.temas.includes(t.slug)).length +
        (destaques.video?.tema === t.slug ? 1 : 0),
    }))
    .filter((t) => t.contagem > 0);
  const tema = temas.find((t) => t.slug === busca.tema);
  const [alto, ...horizontais] = destaques.cards;
  const [centro, ...laterais] = destaques.artigos;
  const card = (item: ConteudoVitrine | undefined, formato: "alto" | "horizontal" | "normal") =>
    item && (
      <CardConteudoVitrine
        key={`${item.conteudo.sala}/${item.conteudo.slug}`}
        conteudo={item.conteudo}
        imagem={item.imagem}
        placa={item.placa}
        formato={formato}
        acoes={
          <BotaoSalvar
            tipo="conteudo"
            alvo={`${item.conteudo.sala}/${item.conteudo.slug}`}
            titulo={item.conteudo.titulo}
          />
        }
      />
    );

  const cabecalho = (
    <div className="flex flex-col gap-2 border-x-0 border-t-0 border-b border-solid border-separator pb-5">
      <h1 className="sdb-large-title sdb-brand">Destaques</h1>
      <p className="sdb-footnote m-0">
        <b className="text-label">Escolhidos pela curadoria</b> e os mais pesquisados no acervo nos últimos 30
        dias.
      </p>
      {temas.length > 0 && (
        <nav className="sdb-row mt-3" style={{ gap: 8 }} aria-label="Filtrar destaques por tema">
          {temas.map((t) => (
            <ChipLink
              key={t.slug}
              areia
              atual={tema?.slug === t.slug}
              count={t.contagem}
              href={(tema?.slug === t.slug ? "/destaques" : `/destaques?tema=${t.slug}`) as Route}
            >
              {t.nome}
            </ChipLink>
          ))}
        </nav>
      )}
    </div>
  );

  if (tema) {
    const doTema = escolhidos.filter((e) => e.conteudo.temas.includes(tema.slug));
    return (
      <div className="@container flex flex-col gap-9">
        {cabecalho}
        <section className="flex flex-col gap-5" aria-labelledby="titulo-tema">
          <h2 id="titulo-tema" className="sdb-title-2">
            {tema.nome} nos destaques
          </h2>
          {destaques.video?.tema === tema.slug && <CardVideo video={destaques.video} />}
          {doTema.length > 0 ? (
            <div className="grid grid-cols-3 gap-5 @max-[53.75rem]:grid-cols-2 @max-[37.5rem]:grid-cols-1">
              {doTema.map((e) => card(e, "normal"))}
            </div>
          ) : (
            <EstadoSecao
              simbolo="busca"
              compacto
              titulo={`Nenhum artigo em destaque sobre ${tema.nome.toLowerCase()}.`}
              descricao="Tire o filtro para ver todos os destaques."
              acao={{ rotulo: "Tirar o filtro", href: "/destaques" as Route }}
            />
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="@container flex flex-col gap-9">
      {cabecalho}

      <div className="grid grid-cols-[minmax(0,1fr)_16rem] gap-8 @max-[65rem]:grid-cols-1">
        <section className="flex min-w-0 flex-col gap-5" aria-labelledby="titulo-escolha">
          <h2 id="titulo-escolha" className="sdb-sr">
            Escolhidos pela curadoria
          </h2>
          {destaques.video && <CardVideo video={destaques.video} />}
          <div className="grid min-h-[600px] grid-cols-2 gap-5 @max-[53.75rem]:min-h-0 @max-[37.5rem]:grid-cols-1">
            <div className="grid min-h-0 grid-rows-[2fr_1fr] gap-5 @max-[53.75rem]:grid-rows-none">
              {card(alto, "alto")}
              {card(horizontais[0], "horizontal")}
            </div>
            <div className="grid min-h-0 grid-rows-2 gap-5 @max-[53.75rem]:grid-rows-none">
              {card(horizontais[1], "horizontal")}
              {card(horizontais[2], "horizontal")}
            </div>
          </div>
        </section>

        <ListaDestaques
          id="mais-pesquisados"
          titulo="Mais pesquisados"
          legenda="Mais pesquisados no acervo nos últimos 30 dias."
          itens={maisPesquisados.map((m) => ({
            href: `/salas/${m.conteudo.sala}/${m.conteudo.slug}` as Route,
            titulo: m.conteudo.titulo,
            meta: `${salaPorSlug(m.conteudo.sala)?.nome} · ${plural(m.buscas, "busca", "buscas")}`,
            imagem: m.imagem,
            placa: m.placa,
          }))}
        />
      </div>

      {centro && (
        <section className="flex flex-col gap-5" aria-labelledby="titulo-artigos">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-artigos" className="sdb-title-2">
                Artigos em destaque
              </h2>
              <p className="sdb-footnote m-0">Escolhidos pela curadoria.</p>
            </div>
            <ButtonLink href="/biblioteca" variant="secondary" size="sm">
              Ver tudo
            </ButtonLink>
          </div>
          <div className="grid grid-cols-[1fr_1.7fr_1fr] gap-5 @max-[53.75rem]:grid-cols-2 @max-[37.5rem]:grid-cols-1">
            <div className="col-start-2 row-span-2 row-start-1 grid @max-[53.75rem]:col-span-2 @max-[53.75rem]:col-start-1 @max-[53.75rem]:row-span-1 @max-[53.75rem]:min-h-[520px] @max-[37.5rem]:col-span-1">
              {card(centro, "alto")}
            </div>
            {laterais.map((item, i) => (
              <div
                key={`${item.conteudo.sala}/${item.conteudo.slug}`}
                className={cx(
                  "grid @max-[53.75rem]:col-start-auto @max-[53.75rem]:row-start-auto",
                  i < 2 ? "col-start-1" : "col-start-3",
                  i % 2 === 0 ? "row-start-1" : "row-start-2",
                )}
              >
                {card(item, "normal")}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
