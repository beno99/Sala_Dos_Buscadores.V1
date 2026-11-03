import type { Metadata, Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { ProgressoReal } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { Badge } from "@/components/ds/Selos";
import { ColecaoConquistas } from "@/features/conquistas/ColecaoConquistas";
import { TITULOS } from "@/features/jornada/regras";
import { formatarData } from "@/lib/texto";
import { modeloDaJornada } from "@/server/jornada";
import { progressoDe } from "@/server/progresso";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: "Minha Jornada" };

const HISTORICO_INICIAL = 12;

/** Minha Jornada (Jornada do Buscador v1.0, Etapa 1): percursos por tema, Salas, gemas e histórico. */
export default async function MinhaJornada() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  if (!progressoDe(membro.id).mostrarNiveis)
    return (
      <section className="sdb-material sdb-panel flex max-w-read flex-col gap-3">
        <h1 className="sdb-title-1">Minha Jornada está oculta</h1>
        <p className="sdb-body-sm m-0">Você pode voltar a exibir a Jornada e as gemas nos Ajustes.</p>
        <div>
          <ButtonLink href="/ajustes" variant="secondary">
            Abrir Ajustes
          </ButtonLink>
        </div>
      </section>
    );
  const m = await modeloDaJornada(membro);

  return (
    <div className="flex flex-col gap-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-read flex-col gap-2">
          <p className="sdb-caption sdb-secondary m-0">PORTAL / MINHA JORNADA</p>
          <h1 className="sdb-large-title m-0">Jornada do Buscador</h1>
          <p className="sdb-body-sm sdb-secondary m-0">Seu percurso por temas, Salas e conquistas.</p>
        </div>
        <Badge variant="neutral" icon="cadeado">
          Visibilidade: somente você
        </Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4" aria-labelledby="j-percursos">
          <h2 id="j-percursos" className="sdb-title-2 m-0">
            Percursos por tema
          </h2>
          {m.percursos.length > 0 && (
            <p className="sdb-footnote m-0">
              {m.percursos.filter((t) => t.titulo).length} de {m.percursos.length} temas com título.
            </p>
          )}
          {m.percursos.length === 0 ? (
            <div className="sdb-material sdb-panel flex flex-col gap-2">
              <p className="sdb-body-sm m-0">
                Ao concluir seu primeiro artigo ou vídeo, você se torna Explorador no tema dele. Use “Marcar
                leitura como concluída” no fim do texto.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {m.percursos.map((t) => (
                <article key={t.tema} className="sdb-material sdb-panel flex flex-col gap-3">
                  <p className="sdb-caption sdb-secondary m-0">PERCURSO POR TEMA</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="sdb-title-2 m-0">{t.nomeTema}</h3>
                    {t.titulo && (
                      <Badge variant="topic" icon="trilha">
                        {t.titulo.nome} em {t.nomeTema}
                      </Badge>
                    )}
                  </div>
                  <p className="sdb-footnote m-0">
                    {t.conteudos} {t.conteudos === 1 ? "conteúdo concluído" : "conteúdos concluídos"} ·{" "}
                    {t.salas} {t.salas === 1 ? "Sala" : "Salas"}
                  </p>
                  {t.proximo && (
                    <div className="flex flex-col gap-1">
                      <p className="sdb-body-sm m-0">
                        Próximo título: <b>{t.proximo.nome}</b>
                      </p>
                      <ul className="sdb-footnote m-0 flex flex-wrap gap-x-4 gap-y-1 p-0 list-none">
                        {t.proximo.requisitos.map((r) => (
                          <li key={r.rotulo}>
                            {r.rotulo} {r.atual}/{r.alvo}
                          </li>
                        ))}
                      </ul>
                      {t.proximo.emPreparacao && (
                        <p className="sdb-footnote m-0">
                          Em preparação: {t.proximo.emPreparacao} Novas possibilidades deste percurso serão
                          abertas conforme o acervo e as ferramentas crescerem.
                        </p>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="sdb-material sdb-panel flex flex-col gap-3 self-start"
          aria-labelledby="j-proxima"
        >
          <h2 id="j-proxima" className="sdb-title-2 m-0">
            Próxima descoberta
          </h2>
          {m.proxima ? (
            <>
              <p className="sdb-body-sm m-0">
                {m.proxima.tema ? `Continue em ${m.proxima.tema}: ` : "Uma leitura para começar: "}
                <b>{m.proxima.titulo}</b>, na Sala {m.proxima.sala}.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={m.proxima.href} variant="primary" size="sm" iconEnd="chevronDireita">
                  Abrir leitura
                </ButtonLink>
                <ButtonLink href="/salas" variant="secondary" size="sm">
                  Explorar outro tema
                </ButtonLink>
              </div>
            </>
          ) : (
            <p className="sdb-body-sm m-0">
              Você concluiu tudo o que está publicado agora. Novos conteúdos aparecem aqui quando entrarem no
              acervo.
            </p>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="j-salas">
        <h2 id="j-salas" className="sdb-title-2 m-0">
          Meu progresso nas Salas
        </h2>
        {m.salas.length === 0 ? (
          <p className="sdb-body-sm sdb-secondary m-0">As Salas que você estudar aparecem aqui.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {m.salas.map((s) => (
              <article key={s.sala} className="sdb-material sdb-panel flex flex-col gap-3">
                <h3 className="sdb-title-3 m-0">
                  <Link className="sdb-link" href={s.href}>
                    {s.nome}
                  </Link>
                </h3>
                {s.artigos.total + s.videos.total === 0 ? (
                  <p className="sdb-footnote m-0">Conteúdos em preparação.</p>
                ) : (
                  <>
                    <p className="sdb-footnote m-0">
                      {s.artigos.concluidos} de {s.artigos.total} artigos concluídos
                      {s.videos.total > 0 &&
                        ` · ${s.videos.concluidos} de ${s.videos.total} vídeos concluídos`}
                    </p>
                    {s.artigos.total > 0 && (
                      <ProgressoReal
                        concluidos={s.artigos.concluidos}
                        total={s.artigos.total}
                        rotulo={`Artigos em ${s.nome}`}
                      />
                    )}
                    {s.videos.total > 0 && (
                      <ProgressoReal
                        concluidos={s.videos.concluidos}
                        total={s.videos.total}
                        rotulo={`Vídeos em ${s.nome}`}
                      />
                    )}
                    {s.novosConteudos && (
                      <p className="sdb-footnote m-0">
                        Novos conteúdos disponíveis: o percentual pode ter diminuído, e nada do que você
                        concluiu foi apagado.
                      </p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="j-gemas">
        <div className="flex flex-col gap-1">
          <h2 id="j-gemas" className="sdb-title-2 m-0">
            Gemas da Jornada
          </h2>
          <p className="sdb-body-sm sdb-secondary m-0">
            {m.totais.gemas} de {m.gemas.length} conquistadas. Cada gema reconhece uma forma de estudar ou
            participar; não há ordem obrigatória entre elas.
          </p>
        </div>
        <ColecaoConquistas conquistas={m.gemas} />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="j-historico">
        <h2 id="j-historico" className="sdb-title-2 m-0">
          Histórico da Jornada
        </h2>
        {m.historico.length === 0 ? (
          <p className="sdb-body-sm sdb-secondary m-0">Seu histórico começa na primeira conclusão.</p>
        ) : (
          <HistoricoLista itens={m.historico} />
        )}
      </section>

      <section className="sdb-material sdb-panel flex flex-col gap-4" aria-labelledby="j-como">
        <h2 id="j-como" className="sdb-title-2 m-0">
          Como a Jornada funciona
        </h2>
        <p className="sdb-body m-0">
          Cada descoberta deixa uma marca. Explore temas, percorra Salas, consulte fontes e conecte
          perspectivas. Sua Jornada reconhece os passos do seu estudo, no seu próprio ritmo.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "01",
              "Seu caminho por temas",
              "Títulos por tema reconhecem o que você estudou em cada assunto.",
            ],
            ["02", "Seu progresso em cada Sala", "Artigos e vídeos concluídos, contados à parte."],
            ["03", "Suas gemas e conquistas", "Marcas de modalidades de estudo e de participação."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex flex-col gap-1">
              <span className="sdb-caption sdb-secondary">{n}</span>
              <b>{t}</b>
              <span className="sdb-footnote">{d}</span>
            </div>
          ))}
        </div>
        <p className="sdb-body-sm m-0">
          Títulos por tema: {TITULOS.map((t) => t.nome).join(" → ")}. Hoje está ativo o título Explorador; os
          demais dependem de ferramentas em preparação.
        </p>
        <p className="sdb-footnote m-0">
          As conquistas reconhecem atividades de estudo e participação no acervo. Não representam certificação
          acadêmica, domínio de uma tradição ou superioridade espiritual. Só conta o que você marca como
          concluído; abrir ou rolar uma página não conta como estudo.
        </p>
        <p className="sdb-footnote m-0 flex items-center gap-2">
          <Icon name="cadeado" size="sm" /> Só você vê sua Jornada. Não há placar nem comparação entre
          pessoas.
        </p>
      </section>
    </div>
  );
}

function HistoricoLista({
  itens,
}: {
  itens: { em: string; texto: string; detalhe?: string; href?: Route }[];
}) {
  const linha = (i: (typeof itens)[number]) => (
    <li key={`${i.em}-${i.texto}`} className="sdb-list-row">
      <span className="flex min-w-0 flex-col gap-1">
        {i.href ? (
          <Link className="sdb-link" href={i.href}>
            {i.texto}
          </Link>
        ) : (
          <span>{i.texto}</span>
        )}
        {i.detalhe && <span className="sdb-footnote">{i.detalhe}</span>}
      </span>
      <time className="sdb-footnote" dateTime={i.em}>
        {formatarData(i.em.slice(0, 10))}
      </time>
    </li>
  );
  return (
    <div className="flex flex-col gap-2">
      <ul className="sdb-list sdb-material m-0 list-none p-0">
        {itens.slice(0, HISTORICO_INICIAL).map(linha)}
      </ul>
      {itens.length > HISTORICO_INICIAL && (
        <details>
          <summary className="sdb-link sdb-footnote">Ver o histórico completo ({itens.length})</summary>
          <ul className="sdb-list sdb-material m-0 mt-2 list-none p-0">
            {itens.slice(HISTORICO_INICIAL).map(linha)}
          </ul>
        </details>
      )}
    </div>
  );
}
