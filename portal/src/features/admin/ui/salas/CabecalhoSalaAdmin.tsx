"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Arc } from "@/components/ds/Arc";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { ButtonLink } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { useToast } from "@/components/ds/Toast";
import type { Placa, StatusEditorial } from "@/data/types";
import { mudarStatusSalaAcao } from "@/server/admin/acoes";

export type AbaSala = "artigos" | "videos";

/**
 * Cabeçalho da Sala oficial na curadoria (§5): caminho, imagem ou placa, nome,
 * tradição, status e se está no portal; ações e as abas Artigos e Vídeos.
 */
export function CabecalhoSalaAdmin({
  sala,
  foraDoAr,
  impacto,
  aba,
  contagens,
  children,
}: {
  sala: {
    id: string;
    slug: string;
    nome: string;
    tradicao: string;
    status: StatusEditorial;
    imagem?: string;
    placa: Placa;
  };
  /** Por que não está no portal; null quando está. */
  foraDoAr: string | null;
  /** O que sai do ar se a Sala for arquivada agora. */
  impacto: { artigos: number; videos: number };
  aba: AbaSala;
  contagens: { artigos: number; videos: number };
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pedido, setPedido] = useState<"arquivar" | "restaurar" | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const arquivada = sala.status === "arquivado";
  const base = `/admin/salas/${sala.slug}`;
  const total = impacto.artigos + impacto.videos;

  const confirmar = async () => {
    if (!pedido) return;
    setOcupado(true);
    const r = await mudarStatusSalaAcao(sala.id, pedido);
    setOcupado(false);
    setPedido(null);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível concluir" });
      return;
    }
    toast(r.mensagem, { icon: pedido === "arquivar" ? "cadeado" : "regenerar" });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/admin/salas" as Route, rotulo: "Salas" }]} atual={sala.nome} />
      <header className="flex flex-col gap-4 md:flex-row md:items-end">
        <figure className="video-embed w-full max-w-[14rem]">
          <div className="video-embed__frame">
            {sala.imagem ? (
              // biome-ignore lint/performance/noImgElement: imagem da Sala (public/imagens ou /midia).
              <img src={sala.imagem} alt="" />
            ) : (
              <div className={`sdb-plate sdb-plate--${sala.placa}`}>
                <Arc on={sala.placa} />
              </div>
            )}
          </div>
        </figure>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="sdb-row">
            <SeloStatus status={sala.status} />
            <span className="sdb-footnote">
              {foraDoAr ? `Fora do portal: ${foraDoAr}` : "Visível no portal"}
            </span>
          </div>
          <h1 className="sdb-title-1">{sala.nome}</h1>
          {sala.tradicao && <p className="sdb-body-sm sdb-secondary">{sala.tradicao}</p>}
          <div className="sdb-row">
            <ButtonLink href={`${base}/editar` as Route} variant="secondary" icon="editar">
              Editar Sala
            </ButtonLink>
            {!foraDoAr && (
              <ButtonLink href={`/salas/${sala.slug}` as Route} variant="plain" icon="externo">
                Ver no portal
              </ButtonLink>
            )}
            <Menu
              titulo={sala.nome}
              triggerLabel={`Mais ações da Sala ${sala.nome}`}
              triggerClassName="sdb-btn sdb-btn--icon sdb-btn--secondary"
              trigger={<Icon name="reticencias" />}
              items={[
                arquivada
                  ? { label: "Restaurar Sala", icon: "regenerar", onSelect: () => setPedido("restaurar") }
                  : {
                      label: "Arquivar",
                      icon: "cadeado",
                      danger: true,
                      onSelect: () => setPedido("arquivar"),
                    },
              ]}
            />
          </div>
        </div>
      </header>

      <Segmented<AbaSala>
        abas="sala"
        label="Conteúdo da Sala"
        value={aba}
        onChange={(v) => router.push((v === "videos" ? `${base}/videos` : base) as Route)}
        options={[
          { value: "artigos", label: "Artigos", count: contagens.artigos },
          { value: "videos", label: "Vídeos", count: contagens.videos },
        ]}
      />
      <div id={`sala-painel-${aba}`} role="tabpanel" aria-labelledby={`sala-aba-${aba}`}>
        {children}
      </div>

      <ModalConfirmacao
        open={pedido === "arquivar"}
        titulo="Arquivar a Sala?"
        icone="cadeado"
        destrutivo
        rotuloConfirmar="Arquivar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={confirmar}
      >
        <b>{sala.nome}</b>
        <br />
        {total
          ? `${impacto.artigos} ${impacto.artigos === 1 ? "artigo" : "artigos"} e ${impacto.videos} ${impacto.videos === 1 ? "vídeo" : "vídeos"} saem do ar de uma vez, sem mudar o status de cada um. Nada é apagado: restaurar devolve tudo como estava.`
          : "Nada desta Sala está no ar agora. Nada é apagado: restaurar devolve tudo como estava."}
      </ModalConfirmacao>
      <ModalConfirmacao
        open={pedido === "restaurar"}
        titulo="Restaurar a Sala?"
        icone="regenerar"
        rotuloConfirmar="Restaurar"
        carregando={ocupado}
        onCancelar={() => setPedido(null)}
        onConfirmar={confirmar}
      >
        <b>{sala.nome}</b>
        <br />A Sala volta ao status de antes do arquivamento, com os artigos e vídeos como estavam.
      </ModalConfirmacao>
    </div>
  );
}
