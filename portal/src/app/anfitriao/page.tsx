import type { Metadata, Route } from "next";
import Link from "next/link";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { IndicadorNumerico } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { ListaSalasAnfitriao } from "@/features/anfitriao/ui/ListaSalasAnfitriao";
import { formatarData, plural } from "@/lib/texto";
import { type Novidade, painelDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { perfilIncompleto } from "@/server/anfitriao/usuarios";

export const metadata: Metadata = { title: "Painel" };

const ROTA: Record<Novidade["tipo"], string> = {
  sala: "/anfitriao/salas",
  artigo: "/anfitriao/artigos",
  video: "/anfitriao/videos",
  anuncio: "/anfitriao/publicidade",
};
const ITEM: Record<Novidade["tipo"], (t: string) => string> = {
  sala: (t) => `A Sala “${t}”`,
  artigo: (t) => `O artigo “${t}”`,
  video: (t) => `O vídeo “${t}”`,
  anuncio: (t) => `O anúncio “${t}”`,
};

const hrefNovidade = (n: Novidade) => `${ROTA[n.tipo]}/${n.id}` as Route;

function textoNovidade(n: Novidade) {
  const item = ITEM[n.tipo](n.titulo);
  return n.decisao.decisao === "aprovado"
    ? `${item} foi ${n.tipo === "sala" ? "publicada" : n.tipo === "anuncio" ? "aprovado" : "publicado"}.`
    : `${item} voltou para ajustes.`;
}

/** Painel do anfitrião (§5): indicadores, decisões ainda não vistas e as Salas. */
export default async function PainelAnfitriao() {
  const membro = await anfitriaoDaPagina();
  const p = painelDoAnfitriao(membro.id);

  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Anfitrião · {p.perfil?.nome ?? membro.pseudonimo}</p>
        <h1 className="sdb-title-1">Painel</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Salas, artigos, vídeos e publicidade vão para a revisão da curadoria antes de ir ao ar. Editar algo
          publicado tira o item do ar até a nova aprovação.
        </p>
        <div className="sdb-row">
          <ButtonLink href={"/anfitriao/salas/nova" as Route} variant="primary" icon="mais">
            Criar Sala
          </ButtonLink>
          <ButtonLink href={"/anfitriao/artigos/novo" as Route} variant="secondary" icon="artigo">
            Criar artigo
          </ButtonLink>
          <ButtonLink href={"/anfitriao/videos/novo" as Route} variant="secondary" icon="play">
            Criar vídeo
          </ButtonLink>
          <ButtonLink href={"/anfitriao/publicidade/nova" as Route} variant="secondary" icon="editar">
            Criar publicidade
          </ButtonLink>
        </div>
      </header>

      {perfilIncompleto(p.perfil) && (
        <Alerta
          variant="warning"
          title="Atenção: complete seu perfil público"
          actions={
            <ButtonLink href={"/anfitriao/perfil" as Route} variant="secondary" size="sm">
              Completar perfil
            </ButtonLink>
          }
        >
          A credencial e a apresentação aparecem na sua página pública e na assinatura dos artigos.
        </Alerta>
      )}

      <section
        className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr))]"
        aria-label="Totais"
      >
        <IndicadorNumerico rotulo="Salas" valor={p.indicadores.salas} />
        <IndicadorNumerico
          rotulo="Publicados"
          valor={p.indicadores.publicados}
          dica="Artigos, vídeos e anúncios no ar."
        />
        <IndicadorNumerico rotulo="Vídeos" valor={p.indicadores.videos} />
        <IndicadorNumerico rotulo="Anúncios" valor={p.indicadores.anuncios} />
        <IndicadorNumerico
          rotulo="Em revisão"
          valor={p.indicadores.emRevisao}
          dica="Esperando a decisão da curadoria."
        />
        <IndicadorNumerico
          rotulo="Reprovados"
          valor={p.indicadores.reprovados}
          dica="Voltaram com motivo para você corrigir."
        />
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-novidades">
        <h2 id="titulo-novidades" className="sdb-title-2">
          Novidades{p.novidades.length > 0 && ` · ${p.novidades.length}`}
        </h2>
        {p.novidades.length === 0 ? (
          <p className="sdb-body-sm sdb-secondary">Nenhuma decisão nova da curadoria.</p>
        ) : (
          <div className="sdb-material sdb-list">
            {p.novidades.map((n) => (
              <div key={`${n.tipo}-${n.id}-${n.decisao.quando}`} className="sdb-list-row">
                <div className="flex flex-col gap-1">
                  <span className="sdb-callout">
                    <Link href={hrefNovidade(n)}>{textoNovidade(n)}</Link>
                  </span>
                  {n.decisao.motivo && <span className="sdb-footnote">Motivo: {n.decisao.motivo}</span>}
                  <span className="sdb-footnote sdb-tabular">
                    {formatarData(n.decisao.quando.slice(0, 10))}
                  </span>
                </div>
                {n.decisao.decisao === "aprovado" ? (
                  <span className="sdb-badge sdb-badge--published">
                    <Icon name="check" size="sm" />
                    Publicado
                  </span>
                ) : (
                  <span className="sdb-badge sdb-badge--critical">
                    <Icon name="devolver" size="sm" />
                    Reprovado
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="titulo-salas">
        <h2 id="titulo-salas" className="sdb-title-2">
          Salas
        </h2>
        <ListaSalasAnfitriao
          salas={p.salas.map(({ sala, artigos }) => ({
            id: sala.id,
            nome: sala.nome,
            status: sala.status,
            atualizadaEm: sala.atualizadaEm,
            artigos,
            novidades: p.novidades.filter((n) => n.salaId === sala.id).length,
          }))}
        />
        <p className="sdb-footnote">{plural(p.indicadores.salas, "Sala", "Salas")} no total.</p>
      </section>
    </>
  );
}
