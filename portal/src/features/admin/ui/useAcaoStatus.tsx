"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import { salaPorSlug } from "@/data/catalogo";
import type { SalaSlug } from "@/data/types";
import { mudarStatusArtigoAcao, mudarStatusVideoAcao } from "@/server/admin/acoes";
import type { AcaoStatus } from "@/server/admin/editorial";

type TipoItem = "artigo" | "video";

export interface AlvoStatus {
  id: string;
  titulo: string;
  sala: SalaSlug | "";
  /** Nome da Sala para o resumo do impacto (uma Sala nova ainda não está no catálogo público). */
  salaNome?: string;
}

const TITULO: Record<AcaoStatus, (t: TipoItem) => string> = {
  publicar: (t) => (t === "video" ? "Publicar este vídeo?" : "Publicar este conteúdo?"),
  despublicar: () => "Despublicar e voltar a rascunho?",
  arquivar: () => "Arquivar?",
  restaurar: () => "Restaurar como rascunho?",
};

const CONFIRMAR: Record<AcaoStatus, string> = {
  publicar: "Publicar",
  despublicar: "Despublicar",
  arquivar: "Arquivar",
  restaurar: "Restaurar",
};

/** Resumo do impacto de cada mudança de status, mostrado antes de confirmar. */
export function impactoDaAcao(acao: AcaoStatus, tipo: TipoItem, sala: string): string {
  const onde = sala ? `da Sala ${sala}` : "da Sala";
  const pagina = tipo === "video" ? "" : ", da página do conteúdo";
  switch (acao) {
    case "publicar":
      return `Vai aparecer na mesma hora na Sala ${sala || ""}${tipo === "video" ? "" : ", na página do conteúdo"} e na busca por tema.`;
    case "despublicar":
      return `Sairá ${onde}${pagina} e dos resultados de busca. Volta a ser rascunho; nada é apagado.`;
    case "arquivar":
      return `Sairá ${onde}${pagina} e dos resultados de busca, se estiver publicado. Nada é apagado: você pode restaurar quando quiser.`;
    case "restaurar":
      return "Volta como rascunho. Para aparecer no portal, publique de novo.";
  }
}

/**
 * Ciclo de publicação: toda mudança de status passa por um Modal com o
 * resumo do impacto. Devolve `pedir(alvo, acao)` e o modal para renderizar.
 */
export function useAcaoStatus(tipo: TipoItem, aoConcluir?: (acao: AcaoStatus) => void) {
  const router = useRouter();
  const toast = useToast();
  const [pedido, setPedido] = useState<{ alvo: AlvoStatus; acao: AcaoStatus } | null>(null);
  const [carregando, setCarregando] = useState(false);

  const confirmar = async () => {
    if (!pedido) return;
    setCarregando(true);
    const acao = tipo === "video" ? mudarStatusVideoAcao : mudarStatusArtigoAcao;
    const r = await acao(pedido.alvo.id, pedido.acao);
    setCarregando(false);
    setPedido(null);
    if (r.ok) {
      toast(r.mensagem, { icon: pedido.acao === "arquivar" ? "cadeado" : "check" });
      aoConcluir?.(pedido.acao);
      router.refresh();
    } else {
      toast(r.pendencias?.map((p) => p.rotulo).join(" · ") || "Tente de novo.", {
        variant: "erro",
        title: r.mensagem,
      });
    }
  };

  const modal: ReactNode = (
    <ModalConfirmacao
      open={pedido !== null}
      titulo={pedido ? TITULO[pedido.acao](tipo) : ""}
      icone={pedido?.acao === "arquivar" ? "cadeado" : pedido?.acao === "publicar" ? "check" : "info"}
      destrutivo={pedido?.acao === "arquivar" || pedido?.acao === "despublicar"}
      rotuloConfirmar={pedido ? CONFIRMAR[pedido.acao] : ""}
      carregando={carregando}
      onCancelar={() => setPedido(null)}
      onConfirmar={confirmar}
    >
      {pedido && (
        <>
          <b>{pedido.alvo.titulo || "Sem título"}</b>
          <br />
          {impactoDaAcao(
            pedido.acao,
            tipo,
            pedido.alvo.salaNome ?? (pedido.alvo.sala ? (salaPorSlug(pedido.alvo.sala)?.nome ?? "") : ""),
          )}
        </>
      )}
    </ModalConfirmacao>
  );

  return { pedir: (alvo: AlvoStatus, acao: AcaoStatus) => setPedido({ alvo, acao }), modal };
}
