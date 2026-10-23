"use client";

import { Icon } from "@/components/ds/Icon";
import { cx } from "@/lib/cx";
import { useEstante } from "./EstanteProvider";
import type { TipoEstante } from "./estante";

/**
 * Salvar na Estante. `midia`: o botão redondo sobre a imagem dos cards
 * (.sala__save); `card`: o botão pequeno no canto do Card de conteúdo (.sdb-over).
 */
export function BotaoSalvar({
  tipo,
  alvo,
  titulo,
  estilo = "midia",
}: {
  tipo: TipoEstante;
  /** Slug da Sala, "sala/slug" do conteúdo ou id do vídeo. */
  alvo: string;
  titulo: string;
  estilo?: "midia" | "card";
}) {
  const { salvo, alternar } = useEstante();
  const ativo = salvo(tipo, alvo);
  return (
    <button
      type="button"
      className={cx(
        estilo === "midia" ? "sala__save" : "sdb-btn sdb-btn--icon sdb-btn--secondary sdb-btn--sm sdb-over",
      )}
      aria-pressed={ativo}
      aria-label={`Salvar na Estante: ${titulo}`}
      data-tip={estilo === "card" ? (ativo ? "Tirar da Estante" : "Salvar na Estante") : undefined}
      onClick={() => void alternar(tipo, alvo)}
    >
      <Icon name="estante" size={estilo === "card" ? "sm" : undefined} />
    </button>
  );
}
