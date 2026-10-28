"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Arc } from "@/components/ds/Arc";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Switch } from "@/components/ds/Switch";
import { useToast } from "@/components/ds/Toast";
import type { Placa, StatusEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import {
  aprovarArtigoAcao,
  aprovarSalaAcao,
  arquivarSalaAnfitriaoAcao,
  definirNaComparacaoAcao,
  reprovarArtigoAcao,
  reprovarSalaAcao,
} from "@/server/anfitriao/acoes-admin";
import { SheetMotivo } from "../SheetMotivo";

export interface ArtigoEmRevisao {
  id: string;
  titulo: string;
  resumo: string;
  status: StatusEditorial;
  link?: { tipo: "youtube" | "site"; url: string };
  fontes: { id: string; titulo: string; autor: string; nova: boolean }[];
  ultimoMotivo?: string;
  enviadoEm?: string;
}

export interface SalaEmRevisao {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  periodo: string;
  link?: string;
  imagem?: string;
  placa: Placa;
  status: StatusEditorial;
  naComparacao: boolean;
  congelada: boolean;
  enviadoEm?: string;
  aceite?: { quem: string; quando: string };
  ultimoMotivo?: string;
  noAr: boolean;
}

type Pedido =
  | { tipo: "aprovar-sala" }
  | { tipo: "reprovar-sala" }
  | { tipo: "arquivar-sala" }
  | { tipo: "aprovar-artigo"; artigo: ArtigoEmRevisao }
  | { tipo: "reprovar-artigo"; artigo: ArtigoEmRevisao };

/**
 * Revisão de anfitriões, nível 3 (§6): a Sala em revisão, cada artigo com
 * prévia completa e as decisões. Nenhum campo editável: a curadoria julga.
 */
export function RevisaoSala({
  contaId,
  anfitriao,
  sala,
  artigos,
}: {
  contaId: string;
  anfitriao: string;
  sala: SalaEmRevisao;
  artigos: ArtigoEmRevisao[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [comparacao, setComparacao] = useState(sala.naComparacao);

  const emRevisao = artigos.filter((a) => a.status === "em_revisao");
  const salaEmRevisao = sala.status === "em_revisao";
  const salaPublicada = sala.status === "publicado";

  const executar = async (acao: () => Promise<{ ok: boolean; mensagem: string }>) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), {
        variant: "erro",
        title: "Erro: a decisão não foi registrada",
      });
      return;
    }
    setPedido(null);
    toast(r.mensagem);
    router.refresh();
  };

  const alternarComparacao = async (incluir: boolean) => {
    setComparacao(incluir);
    const r = await definirNaComparacaoAcao(sala.id, incluir);
    if (!r.ok) {
      setComparacao(!incluir);
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível mudar" });
      return;
    }
    if (r.mensagem) toast(r.mensagem);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/admin" as Route, rotulo: "Curadoria" },
          { href: "/admin/anfitrioes" as Route, rotulo: "Anfitriões" },
          { href: `/admin/anfitrioes/${contaId}` as Route, rotulo: anfitriao },
        ]}
        atual={sala.nome}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={sala.status} />
          {sala.enviadoEm && (
            <span className="sdb-footnote">Enviada em {formatarData(sala.enviadoEm.slice(0, 10))}</span>
          )}
          {sala.noAr && (
            <Link className="sdb-link sdb-footnote" href={`/salas/${sala.slug}` as Route}>
              Ver no portal
            </Link>
          )}
        </div>
        <h1 className="sdb-title-1">{sala.nome}</h1>
        <p className="sdb-footnote">Sala de {anfitriao}</p>
      </header>

      {sala.congelada && (
        <Alerta title="Sala congelada">
          O anfitrião perdeu o papel e escolheu-se manter o conteúdo no ar, sem edição. A curadoria pode
          arquivar a Sala ou transferi-la em Usuários.
        </Alerta>
      )}
      {sala.status === "reprovado" && sala.ultimoMotivo && (
        <Alerta variant="warning" title="Atenção: esta Sala voltou ao anfitrião">
          Último motivo: {sala.ultimoMotivo}
        </Alerta>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="sdb-material sdb-panel" aria-labelledby="sec-sala">
            <h2 id="sec-sala" className="sdb-headline">
              A Sala
            </h2>
            <figure className="video-embed max-w-[30rem]">
              <div className="video-embed__frame">
                {sala.imagem ? (
                  // biome-ignore lint/performance/noImgElement: imagem enviada pelo anfitrião, servida por /midia.
                  <img src={sala.imagem} alt="" />
                ) : (
                  <div className={`sdb-plate sdb-plate--${sala.placa}`}>
                    <Arc on={sala.placa} />
                  </div>
                )}
              </div>
              <figcaption className="video-embed__legenda">
                {sala.imagem ? "Imagem enviada pelo anfitrião." : "Sem imagem: o card usa a placa da marca."}
              </figcaption>
            </figure>
            <dl className="sdb-dl">
              <dt>Descrição</dt>
              <dd>{sala.descricao || "Sem descrição."}</dd>
              {sala.periodo && (
                <>
                  <dt>Período</dt>
                  <dd>{sala.periodo}</dd>
                </>
              )}
              <dt>Link</dt>
              <dd>
                {sala.link ? (
                  <a className="sdb-link" href={sala.link} target="_blank" rel="noopener noreferrer">
                    {sala.link}
                  </a>
                ) : (
                  "Sem link"
                )}
              </dd>
              {sala.aceite && (
                <>
                  <dt>Aceite de direitos</dt>
                  <dd>
                    {sala.aceite.quem}, {formatarData(sala.aceite.quando.slice(0, 10))}
                  </dd>
                </>
              )}
            </dl>
          </section>

          <section className="flex flex-col gap-3" aria-labelledby="sec-artigos">
            <h2 id="sec-artigos" className="sdb-title-2">
              Artigos · {artigos.length}
            </h2>
            {artigos.length === 0 ? (
              <p className="sdb-body-sm sdb-secondary">Esta Sala ainda não tem artigos.</p>
            ) : (
              <div className="sdb-material sdb-list">
                {artigos.map((a) => (
                  <article key={a.id} className="sdb-list-row" aria-labelledby={`artigo-${a.id}`}>
                    <div className="flex flex-col gap-2">
                      <div className="sdb-row">
                        <SeloStatus status={a.status} />
                        {a.link && (
                          <span className="sdb-badge sdb-badge--neutral">
                            <Icon name={a.link.tipo === "youtube" ? "video" : "externo"} size="sm" />
                            {a.link.tipo === "youtube" ? "Vídeo do YouTube" : "Link para site"}
                          </span>
                        )}
                      </div>
                      <h3 id={`artigo-${a.id}`} className="sdb-headline m-0">
                        {a.titulo}
                      </h3>
                      <p className="sdb-footnote m-0">{a.resumo}</p>
                      <ul
                        className="flex flex-col gap-1 p-0 m-0 list-none"
                        aria-label={`Fontes de ${a.titulo}`}
                      >
                        {a.fontes.map((f) => (
                          <li key={f.id} className="sdb-row">
                            <span className="sdb-footnote">
                              {f.titulo} · {f.autor}
                            </span>
                            {f.nova && (
                              <span className="sdb-badge sdb-badge--new">
                                <Icon name="assistente" size="sm" />
                                Nova
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {a.status === "reprovado" && a.ultimoMotivo && (
                        <p className="sdb-footnote m-0">Último motivo: {a.ultimoMotivo}</p>
                      )}
                      <div className="sdb-row">
                        <a
                          className="sdb-btn sdb-btn--secondary sdb-btn--sm no-underline"
                          href={`/admin/anfitrioes/artigos/${a.id}/previa`}
                          target="_blank"
                          rel="noopener"
                        >
                          <Icon name="olho" />
                          Prévia
                        </a>
                        {a.status === "em_revisao" && salaPublicada && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon="check"
                            onClick={() => setPedido({ tipo: "aprovar-artigo", artigo: a })}
                          >
                            Aprovar este artigo
                          </Button>
                        )}
                        {a.status === "em_revisao" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="devolver"
                            onClick={() => setPedido({ tipo: "reprovar-artigo", artigo: a })}
                          >
                            Reprovar este artigo
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Decisão">
          <div className="sdb-material sdb-panel">
            <h2 className="sdb-headline">Decisão</h2>
            {salaEmRevisao ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  block
                  icon="check"
                  onClick={() => setPedido({ tipo: "aprovar-sala" })}
                >
                  Aprovar Sala
                </Button>
                <Button
                  variant="secondary"
                  block
                  icon="devolver"
                  onClick={() => setPedido({ tipo: "reprovar-sala" })}
                >
                  Reprovar Sala
                </Button>
                <p className="sdb-footnote">
                  Aprovar publica a Sala e os {emRevisao.length}{" "}
                  {emRevisao.length === 1 ? "artigo" : "artigos"} em revisão. Reprove antes os artigos que não
                  podem ir ao ar.
                </p>
              </div>
            ) : (
              <p className="sdb-footnote">
                {emRevisao.length
                  ? "Os artigos em revisão desta Sala são decididos um a um, na lista."
                  : "Nada desta Sala espera decisão agora."}
              </p>
            )}
            {salaPublicada && (
              <Button
                variant="destructive"
                block
                icon="cadeado"
                onClick={() => setPedido({ tipo: "arquivar-sala" })}
              >
                Arquivar Sala
              </Button>
            )}
          </div>
          <div className="sdb-material sdb-list">
            <Switch
              label="Incluir na comparação e no assistente"
              help="Liga a Sala na grade comparativa e no acervo do assistente. Desligar não despublica nada."
              checked={comparacao}
              onChange={(e) => void alternarComparacao(e.target.checked)}
            />
          </div>
        </aside>
      </div>

      <ModalConfirmacao
        open={pedido?.tipo === "aprovar-sala"}
        titulo="Aprovar e publicar a Sala?"
        icone="check"
        rotuloConfirmar="Aprovar e publicar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() => executar(() => aprovarSalaAcao(sala.id))}
      >
        A Sala “{sala.nome}” vai ao ar com {emRevisao.length} {emRevisao.length === 1 ? "artigo" : "artigos"}.
        As fontes novas desses artigos entram no catálogo. O anfitrião recebe um e-mail.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={pedido?.tipo === "aprovar-artigo"}
        titulo="Aprovar e publicar o artigo?"
        icone="check"
        rotuloConfirmar="Aprovar e publicar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() =>
          pedido?.tipo === "aprovar-artigo" && executar(() => aprovarArtigoAcao(pedido.artigo.id))
        }
      >
        “{pedido?.tipo === "aprovar-artigo" ? pedido.artigo.titulo : ""}” vai ao ar na Sala {sala.nome}.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={pedido?.tipo === "arquivar-sala"}
        titulo="Arquivar a Sala?"
        icone="cadeado"
        destrutivo
        rotuloConfirmar="Arquivar Sala"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() => executar(() => arquivarSalaAnfitriaoAcao(sala.id))}
      >
        A Sala e os artigos dela saem do portal. Nada é apagado.
      </ModalConfirmacao>

      <SheetMotivo
        aberto={pedido?.tipo === "reprovar-sala"}
        titulo="Reprovar a Sala"
        rotuloConfirmar="Reprovar"
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(motivo) => executar(() => reprovarSalaAcao(sala.id, motivo))}
      >
        <p className="sdb-body-sm m-0">
          A Sala e os {emRevisao.length} {emRevisao.length === 1 ? "artigo" : "artigos"} em revisão voltam ao
          anfitrião com este motivo.
        </p>
      </SheetMotivo>

      <SheetMotivo
        aberto={pedido?.tipo === "reprovar-artigo"}
        titulo="Reprovar o artigo"
        rotuloConfirmar="Reprovar"
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(motivo) =>
          pedido?.tipo === "reprovar-artigo" && executar(() => reprovarArtigoAcao(pedido.artigo.id, motivo))
        }
      >
        <p className="sdb-body-sm m-0">
          “{pedido?.tipo === "reprovar-artigo" ? pedido.artigo.titulo : ""}” volta ao anfitrião; os demais
          artigos seguem na fila.
        </p>
      </SheetMotivo>
    </div>
  );
}
