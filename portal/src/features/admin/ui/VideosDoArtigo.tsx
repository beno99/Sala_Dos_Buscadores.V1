"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { SeloStatus } from "@/components/ds/Curadoria";
import { useToast } from "@/components/ds/Toast";
import type { StatusEditorial } from "@/data/types";
import { ligarVideoAcao } from "@/server/admin/acoes";

export interface VideoResumo {
  id: string;
  titulo: string;
  status: StatusEditorial;
  duracao: string;
}

/**
 * "Vídeos deste artigo" (curadoria a partir da Sala, §6): os vídeos ligados,
 * "Novo vídeo neste artigo" (já chega com o artigo marcado) e "Ligar vídeo
 * existente da Sala". Só aparece depois do primeiro salvamento do artigo.
 */
export function VideosDoArtigo({
  salaSlug,
  artigoId,
  ligados,
  disponiveis,
}: {
  salaSlug: string;
  artigoId: string;
  ligados: VideoResumo[];
  disponiveis: VideoResumo[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [escolhido, setEscolhido] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const ligar = async (videoId: string, sim: boolean) => {
    setOcupado(true);
    const r = await ligarVideoAcao(videoId, artigoId, sim);
    setOcupado(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível ligar" });
      return;
    }
    if (r.mensagem) toast(r.mensagem);
    setEscolhido("");
    router.refresh();
  };

  return (
    <section className="sdb-material sdb-panel" aria-labelledby="sec-videos-artigo">
      <div className="sdb-row sdb-row--between">
        <h2 id="sec-videos-artigo" className="sdb-headline">
          Vídeos deste artigo
        </h2>
        <ButtonLink
          href={`/admin/salas/${salaSlug}/videos/novo?artigo=${artigoId}` as Route}
          variant="tinted"
          size="sm"
          icon="mais"
        >
          Novo vídeo neste artigo
        </ButtonLink>
      </div>
      <p className="sdb-help">
        Os vídeos ligados aparecem em “Vídeos relacionados” na página do artigo, quando os dois estão
        publicados.
      </p>
      {ligados.length === 0 ? (
        <p className="sdb-hint">Nenhum vídeo ligado a este artigo.</p>
      ) : (
        <div className="sdb-list">
          {ligados.map((v) => (
            <div key={v.id} className="sdb-list-row">
              <span className="flex flex-col gap-1">
                <Link className="sdb-link" href={`/admin/salas/${salaSlug}/videos/${v.id}` as Route}>
                  {v.titulo || "Sem título"}
                </Link>
                <span className="sdb-footnote">{v.duracao || "sem duração"}</span>
              </span>
              <SeloStatus status={v.status} />
              <Button variant="secondary" size="sm" disabled={ocupado} onClick={() => ligar(v.id, false)}>
                Desligar
              </Button>
            </div>
          ))}
        </div>
      )}
      {disponiveis.length > 0 && (
        <div className="flex flex-col gap-2">
          <Select
            id="campo-ligar-video"
            label="Ligar vídeo existente da Sala"
            value={escolhido}
            opcoes={[
              { value: "", label: "Escolha um vídeo da Sala" },
              ...disponiveis.map((v) => ({ value: v.id, label: v.titulo || "Sem título" })),
            ]}
            onChange={(e) => setEscolhido(e.target.value)}
          />
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={!escolhido}
              loading={ocupado}
              onClick={() => ligar(escolhido, true)}
            >
              Ligar vídeo
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
