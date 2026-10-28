"use client";

import { Icon } from "@/components/ds/Icon";
import { cx } from "@/lib/cx";
import { useEstante } from "./EstanteProvider";
import type { TipoEstante } from "./estante";

/**
 * Salvar na Estante. `sala`: o botão de vidro escuro do Card de Sala (CardSala 1.1);
 * `midia`: o botão redondo sobre a imagem dos cards de conteúdo (.sala__save);
 * `card`: o botão pequeno no canto do Card de conteúdo (.sdb-over).
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
  estilo?: "sala" | "midia" | "card";
}) {
  const { salvo, alternar } = useEstante();
  const ativo = salvo(tipo, alvo);
  return (
    <button
      type="button"
      className={cx(
        estilo === "sala" && "sdb-btn sdb-btn--icon sdb-btn--glass sala__save",
        estilo === "midia" && "sala__save",
        estilo === "card" && "sdb-btn sdb-btn--icon sdb-btn--secondary sdb-btn--sm sdb-over",
      )}
      data-theme={estilo === "sala" ? "solido-escuro" : undefined}
      aria-pressed={ativo}
      aria-label={`Salvar na Estante: ${titulo}`}
      data-tip={estilo === "card" ? (ativo ? "Tirar da Estante" : "Salvar na Estante") : undefined}
      onClick={() => void alternar(tipo, alvo)}
    >
      {estilo === "sala" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 4.5h11v15l-5.5-3.75-5.5 3.75z" strokeLinejoin="round" />
        </svg>
      ) : (
        <Icon name="estante" size={estilo === "card" ? "sm" : undefined} />
      )}
    </button>
  );
}
