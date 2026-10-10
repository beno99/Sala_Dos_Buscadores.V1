import type { Metadata, Route } from "next";
import Link from "next/link";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { IndicadorNumerico, ListaHistorico } from "@/components/ds/Curadoria";
import { PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type { Proveniencia } from "@/data/types";
import { DIAS_RASCUNHO_PARADO } from "@/features/admin/regras/config";
import { RestaurarAcervo } from "@/features/admin/ui/RestaurarAcervo";
import { resumoPainel } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Painel" };

const hrefItem = (tipo: "artigo" | "video", id: string) =>
  (tipo === "artigo" ? `/admin/artigos/${id}` : `/admin/videos/${id}`) as Route;

/** Visão geral da curadoria (RF-37): só dados do acervo, nunca indicadores de pessoas (RNF-DOM-05). */
export default function PainelCuradoria() {
  const r = resumoPainel();
  const artigos = r.totais.artigos;
  const videos = r.totais.videos;

  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Painel do acervo</h1>
        <div className="sdb-row">
          <ButtonLink href={"/admin/artigos/novo" as Route} variant="primary" icon="mais">
            Novo artigo
          </ButtonLink>
          <ButtonLink href={"/admin/videos/novo" as Route} variant="secondary" icon="video">
            Novo vídeo
          </ButtonLink>
          <ButtonLink href={"/admin/fontes/novo" as Route} variant="secondary" icon="fontePrimaria">
            Nova fonte
          </ButtonLink>
        </div>
      </header>

      <Alerta title="Grade comparativa e assistente ainda não recebem conteúdos novos">
        O que você publica aparece na Sala, na página do conteúdo e na busca por tema. A grade comparativa e
        as respostas do assistente continuam curadas à parte nesta etapa.
      </Alerta>

      <section
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]"
        aria-label="Totais"
      >
        <IndicadorNumerico
          rotulo="Artigos"
          valor={artigos.publicado + artigos.rascunho + artigos.arquivado}
          partes={[
            { rotulo: "Publicados", valor: artigos.publicado },
            { rotulo: "Rascunhos", valor: artigos.rascunho },
            { rotulo: "Arquivados", valor: artigos.arquivado },
          ]}
        />
        <IndicadorNumerico
          rotulo="Vídeos"
          valor={videos.publicado + videos.rascunho + videos.arquivado}
          partes={[
            { rotulo: "Publicados", valor: videos.publicado },
            { rotulo: "Rascunhos", valor: videos.rascunho },
            { rotulo: "Arquivados", valor: videos.arquivado },
          ]}
        />
        <IndicadorNumerico rotulo="Fontes" valor={r.totais.fontes} dica="Obras que o acervo pode citar." />
        <IndicadorNumerico
          rotulo="Com pendência"
          valor={r.comPendencia.length}
          dica="Itens que ainda não podem ser publicados como estão."
        />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-por-sala">
        <h2 id="titulo-por-sala" className="sdb-title-2">
          Por Sala
        </h2>
        <div className="sdb-table-wrap">
          <table className="sdb-table">
            <caption>Artigos por status e vídeos ativos em cada Sala</caption>
            <thead>
              <tr>
                <th scope="col">Sala</th>
                <th scope="col" className="sdb-table__num">
                  Publicados
                </th>
                <th scope="col" className="sdb-table__num">
                  Rascunhos
                </th>
                <th scope="col" className="sdb-table__num">
                  Arquivados
                </th>
                <th scope="col" className="sdb-table__num">
                  Vídeos
                </th>
              </tr>
            </thead>
            <tbody>
              {r.porSala.map((s) => (
                <tr key={s.sala}>
                  <td data-label="Sala">
                    <span className="sdb-table__title">
                      <Link href={`/admin/artigos?sala=${s.sala}` as Route}>{s.nome}</Link>
                    </span>
                  </td>
                  <td data-label="Publicados" className="sdb-table__num">
                    {s.artigos.publicado}
                  </td>
                  <td data-label="Rascunhos" className="sdb-table__num">
                    {s.artigos.rascunho}
                  </td>
                  <td data-label="Arquivados" className="sdb-table__num">
                    {s.artigos.arquivado}
                  </td>
                  <td data-label="Vídeos" className="sdb-table__num">
                    {s.videos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-proveniencia">
        <h2 id="titulo-proveniencia" className="sdb-title-2">
          Por proveniência
        </h2>
        <div className="sdb-table-wrap">
          <table className="sdb-table">
            <caption>Artigos publicados e rascunhos (RNF-DOM-01)</caption>
            <thead>
              <tr>
                <th scope="col">Proveniência</th>
                <th scope="col" className="sdb-table__num">
                  Artigos
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(r.porProveniencia) as Proveniencia[]).map((p) => (
                <tr key={p}>
                  <td data-label="Proveniência">
                    <Link className="sdb-link" href={`/admin/artigos?proveniencia=${p}` as Route}>
                      {PROVENIENCIA_ROTULO[p]}
                    </Link>
                  </td>
                  <td data-label="Artigos" className="sdb-table__num">
                    {r.porProveniencia[p]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3" aria-labelledby="titulo-pendencias">
          <h2 id="titulo-pendencias" className="sdb-title-2">
            Com pendência no checklist
          </h2>
          {r.comPendencia.length === 0 ? (
            <p className="sdb-hint">Nenhum item ativo com pendência.</p>
          ) : (
            <ul className="sdb-list m-0 list-none p-0">
              {r.comPendencia.map((i) => (
                <li key={i.id} className="sdb-list-row">
                  <span className="flex min-w-0 flex-col gap-1">
                    <Link className="sdb-link" href={hrefItem(i.tipo, i.id)}>
                      {i.titulo || "Sem título"}
                    </Link>
                    <span className="sdb-footnote">
                      {i.tipo === "video" ? "Vídeo" : "Artigo"} · falta: {i.pendencias.join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="titulo-parados">
          <h2 id="titulo-parados" className="sdb-title-2">
            Rascunhos parados há mais de {DIAS_RASCUNHO_PARADO} dias
          </h2>
          {r.rascunhosParados.length === 0 ? (
            <p className="sdb-hint">Nenhum rascunho parado.</p>
          ) : (
            <ul className="sdb-list m-0 list-none p-0">
              {r.rascunhosParados.map((i) => (
                <li key={i.id} className="sdb-list-row">
                  <Link className="sdb-link" href={hrefItem(i.tipo, i.id)}>
                    {i.titulo || "Sem título"}
                  </Link>
                  <span className="sdb-footnote">{i.dias} dias sem edição</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-ultimas">
        <div className="sdb-row sdb-row--between">
          <h2 id="titulo-ultimas" className="sdb-title-2">
            Últimas ações
          </h2>
          <ButtonLink href={"/admin/historico" as Route} variant="plain" size="sm" iconEnd="chevronDireita">
            Ver histórico completo
          </ButtonLink>
        </div>
        <ListaHistorico
          registros={r.ultimasAcoes}
          vazio="Nenhuma ação registrada desde que o servidor iniciou."
        />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-demo">
        <h2 id="titulo-demo" className="sdb-headline">
          Acervo de demonstração
        </h2>
        <p className="sdb-footnote">
          Os dados ficam na memória do servidor e voltam ao estado inicial quando ele reinicia ou quando você
          restaura.
        </p>
        <div>
          <RestaurarAcervo />
        </div>
      </section>
    </>
  );
}
