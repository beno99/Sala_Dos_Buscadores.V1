"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { CardAnuncio, type DadosCardAnuncio } from "@/components/ds/CardAnuncio";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import type { StatusEditorial } from "@/data/types";
import {
  aprovarAnuncioAcao,
  aprovarVideoAnfitriaoAcao,
  reprovarAnuncioAcao,
  reprovarVideoAnfitriaoAcao,
} from "@/server/anfitriao/acoes-admin";
import { SheetMotivo } from "../SheetMotivo";

export interface VideoParaRevisao {
  id: string;
  titulo: string;
  salaNome: string;
  url: string;
  duracao: string;
  status: StatusEditorial;
  artigos: number;
  enviadoEm?: string;
}

export interface AnuncioParaRevisao extends DadosCardAnuncio {
  id: string;
  status: StatusEditorial;
}

type Pedido =
  | { tipo: "aprovar-video" | "reprovar-video"; id: string; titulo: string }
  | { tipo: "aprovar-anuncio" | "reprovar-anuncio"; id: string; titulo: string };

/**
 * Revisão dos vídeos e anúncios de um anfitrião. A curadoria só julga:
 * aprova ou reprova com motivo, sem editar. Cada decisão gera um e-mail.
 */
export function RevisaoMidiasAnfitriao({
  videos,
  anuncios,
}: {
  videos: VideoParaRevisao[];
  anuncios: AnuncioParaRevisao[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [ocupado, setOcupado] = useState(false);

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

  const decisao = (tipo: "video" | "anuncio", id: string, titulo: string) => (
    <div className="sdb-row">
      <Button
        variant="primary"
        size="sm"
        icon="check"
        onClick={() =>
          setPedido({ tipo: tipo === "video" ? "aprovar-video" : "aprovar-anuncio", id, titulo })
        }
      >
        Aprovar
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon="devolver"
        onClick={() =>
          setPedido({ tipo: tipo === "video" ? "reprovar-video" : "reprovar-anuncio", id, titulo })
        }
      >
        Reprovar
      </Button>
    </div>
  );

  return (
    <>
      <section className="flex flex-col gap-3" aria-labelledby="rev-videos">
        <h2 id="rev-videos" className="sdb-title-2">
          Vídeos · {videos.length}
        </h2>
        {videos.length === 0 ? (
          <p className="sdb-body-sm sdb-secondary">Nenhum vídeo deste anfitrião.</p>
        ) : (
          <div className="sdb-material sdb-list">
            {videos.map((v) => (
              <div key={v.id} className="sdb-list-row">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="sdb-callout">{v.titulo}</span>
                  <span className="sdb-footnote">
                    {v.salaNome}
                    {v.duracao && ` · ${v.duracao}`} · {v.artigos}{" "}
                    {v.artigos === 1 ? "artigo ligado" : "artigos ligados"}
                  </span>
                  {v.url && (
                    <a
                      className="sdb-link sdb-footnote"
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir no YouTube <Icon name="externo" size="sm" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SeloStatus status={v.status} />
                  {v.status === "em_revisao" && decisao("video", v.id, v.titulo)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="rev-anuncios">
        <h2 id="rev-anuncios" className="sdb-title-2">
          Publicidade · {anuncios.length}
        </h2>
        {anuncios.length === 0 ? (
          <p className="sdb-body-sm sdb-secondary">Nenhum anúncio deste anfitrião.</p>
        ) : (
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,20rem),1fr))]">
            {anuncios.map((a) => (
              <div key={a.id} className="flex flex-col gap-3">
                <div className="sdb-row">
                  <SeloStatus status={a.status} />
                  <span className="sdb-footnote">Destino: {a.href || "sem link"}</span>
                </div>
                <CardAnuncio anuncio={a} />
                {a.status === "em_revisao" && decisao("anuncio", a.id, a.titulo)}
              </div>
            ))}
          </div>
        )}
      </section>

      <ModalConfirmacao
        open={pedido?.tipo === "aprovar-video" || pedido?.tipo === "aprovar-anuncio"}
        titulo={pedido?.tipo === "aprovar-video" ? "Aprovar e publicar o vídeo?" : "Aprovar o anúncio?"}
        icone="check"
        rotuloConfirmar="Aprovar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={() =>
          pedido &&
          executar(() =>
            pedido.tipo === "aprovar-video"
              ? aprovarVideoAnfitriaoAcao(pedido.id)
              : aprovarAnuncioAcao(pedido.id),
          )
        }
      >
        {pedido?.tipo === "aprovar-video"
          ? `“${pedido.titulo}” vai ao ar na Sala do anfitrião (quando a Sala estiver publicada).`
          : `“${pedido?.titulo ?? ""}” passa a aparecer no Portal, identificado como publicidade.`}{" "}
        O anfitrião recebe um e-mail.
      </ModalConfirmacao>

      <SheetMotivo
        aberto={pedido?.tipo === "reprovar-video" || pedido?.tipo === "reprovar-anuncio"}
        titulo={pedido?.tipo === "reprovar-video" ? "Reprovar o vídeo" : "Reprovar o anúncio"}
        rotuloConfirmar="Reprovar"
        carregando={ocupado}
        onFechar={() => setPedido(null)}
        onConfirmar={(motivo) =>
          pedido &&
          executar(() =>
            pedido.tipo === "reprovar-video"
              ? reprovarVideoAnfitriaoAcao(pedido.id, motivo)
              : reprovarAnuncioAcao(pedido.id, motivo),
          )
        }
      >
        <p className="sdb-body-sm m-0">“{pedido?.titulo ?? ""}” volta ao anfitrião com este motivo.</p>
      </SheetMotivo>
    </>
  );
}
