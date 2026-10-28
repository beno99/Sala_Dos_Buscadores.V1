import type { Metadata, Route } from "next";
import Link from "next/link";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { IndicadorNumerico, ListaHistorico } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type { Proveniencia } from "@/data/types";
import { DIAS_RASCUNHO_PARADO } from "@/features/admin/regras/config";
import { resumoPainel } from "@/server/admin/consultas";
import { rotaDoArtigo, rotaDoVideo } from "@/server/admin/rotas";
import { listarCandidaturas, totalPendenteRevisao } from "@/server/anfitriao/consultas";

export const metadata: Metadata = { title: "Painel" };

/** Artigos e vídeos vivem dentro da Sala: o link vai direto ao editor dentro dela. */
const hrefItem = (tipo: "artigo" | "video", id: string) =>
  ((tipo === "artigo" ? rotaDoArtigo(id) : rotaDoVideo(id)) ?? "/admin/salas") as Route;

/** Visão geral da curadoria (RF-37): só dados do acervo, nunca indicadores de pessoas (RNF-DOM-05). */
export default function PainelCuradoria() {
  const r = resumoPainel();
  const artigos = r.totais.artigos;
  const videos = r.totais.videos;
  const revisao = totalPendenteRevisao();
  const candidaturas = listarCandidaturas().filter((c) => c.status === "pendente").length;

  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Painel do acervo</h1>
        <div className="sdb-row">
          <ButtonLink href={"/admin/salas/nova" as Route} variant="primary" icon="mais">
            Nova Sala
          </ButtonLink>
          <ButtonLink href={"/admin/fontes/novo" as Route} variant="secondary" icon="fontePrimaria">
            Nova fonte
          </ButtonLink>
        </div>
      </header>

      <section className="sdb-material sdb-panel" aria-labelledby="titulo-revisao-anfitrioes">
        <div className="sdb-row sdb-row--between">
          <h2 id="titulo-revisao-anfitrioes" className="sdb-headline">
            Revisão de anfitriões
          </h2>
          <span className={revisao ? "sdb-badge sdb-badge--review" : "sdb-badge sdb-badge--published"}>
            <Icon name={revisao ? "editar" : "check"} size="sm" />
            {revisao ? `${revisao} em revisão` : "Nada pendente"}
          </span>
        </div>
        <p className="sdb-body-sm">
          {revisao
            ? `${revisao} ${revisao === 1 ? "item espera" : "itens esperam"} a sua decisão (Salas e artigos de anfitriões).`
            : "Nenhuma Sala ou artigo de anfitrião espera decisão agora."}
          {candidaturas > 0 &&
            ` ${candidaturas} ${candidaturas === 1 ? "candidatura espera" : "candidaturas esperam"} resposta em Usuários.`}
        </p>
        <div className="sdb-row">
          <ButtonLink
            href={"/admin/anfitrioes" as Route}
            variant={revisao ? "primary" : "secondary"}
            icon="anfitriao"
          >
            Abrir a revisão
          </ButtonLink>
          {candidaturas > 0 && (
            <ButtonLink href={"/admin/usuarios?aba=candidaturas" as Route} variant="secondary">
              Ver candidaturas
            </ButtonLink>
          )}
        </div>
      </section>

      <Alerta title="Grade comparativa e assistente ainda não recebem conteúdos novos">
        O que você publica aparece na Sala, na página do conteúdo e na busca por tema. A grade comparativa e
        as respostas do assistente continuam curadas à parte nesta etapa. As Salas de anfitrião entram nelas
        quando você liga “Incluir na comparação e no assistente” na revisão.
      </Alerta>

      <section
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))]"
        aria-label="Totais"
      >
        <Link
          href={"/admin/salas" as Route}
          className="text-inherit no-underline"
          aria-label="Artigos: ver nas Salas"
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
        </Link>
        <Link
          href={"/admin/salas" as Route}
          className="text-inherit no-underline"
          aria-label="Vídeos: ver nas Salas"
        >
          <IndicadorNumerico
            rotulo="Vídeos"
            valor={videos.publicado + videos.rascunho + videos.arquivado}
            partes={[
              { rotulo: "Publicados", valor: videos.publicado },
              { rotulo: "Rascunhos", valor: videos.rascunho },
              { rotulo: "Arquivados", valor: videos.arquivado },
            ]}
          />
        </Link>
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
          <table className="sdb-table sdb-table--nav">
            <caption>Artigos por status e vídeos ativos em cada Sala oficial</caption>
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
                <th scope="col">
                  <span className="sdb-sr">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {r.porSala.map((s) => (
                <tr key={s.sala}>
                  <td data-label="Sala">
                    <span className="sdb-table__title">
                      <Link href={`/admin/salas/${s.sala}` as Route}>{s.nome}</Link>
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
                  <td className="sdb-table__go" aria-hidden="true">
                    <Icon name="chevronDireita" />
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
                  <td data-label="Proveniência">{PROVENIENCIA_ROTULO[p]}</td>
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
        <ListaHistorico registros={r.ultimasAcoes} vazio="Nenhuma ação registrada ainda." />
      </section>
    </>
  );
}
