"use client";

import { useId, useState } from "react";
import { Icon } from "./Icon";

export type ReacaoVisualComunidade = "util" | "pensar" | "aprofundar";
const REACOES = [
  { tipo: "util", rotulo: "Útil", icone: "util" },
  { tipo: "pensar", rotulo: "Me fez pensar", icone: "glossario" },
  { tipo: "aprofundar", rotulo: "Quero aprofundar", icone: "busca" },
] as const;

/** Estado controlado: persistência e rollback pertencem à tela, na Fase C. */
export function BarraAcoesComunidade({
  curtidas,
  comentarios,
  curtida,
  salva,
  reacoes = [],
  onCurtir,
  onComentar,
  onSalvar,
  onReagir,
  bloqueada = false,
}: {
  curtidas: number;
  comentarios: number;
  curtida: boolean;
  salva: boolean;
  reacoes?: readonly ReacaoVisualComunidade[];
  onCurtir: () => void;
  onComentar: () => void;
  onSalvar: () => void;
  onReagir: (tipo: ReacaoVisualComunidade) => void;
  bloqueada?: boolean;
}) {
  const id = useId();
  const [abertas, setAbertas] = useState(false);
  return (
    <div className="sdb-community-actions" role="group" aria-label="Ações da publicação">
      <button
        type="button"
        className="sdb-community-actions__button"
        aria-pressed={curtida}
        aria-label={`${curtida ? "Desfazer curtida" : "Curtir"}, ${curtidas} curtidas`}
        disabled={bloqueada}
        onClick={onCurtir}
      >
        <Icon name="util" />
        Curtir <span>{curtidas}</span>
      </button>
      <button
        type="button"
        className="sdb-community-actions__button"
        aria-label={`Comentar, ${comentarios} comentários`}
        onClick={onComentar}
      >
        <Icon name="assistente" />
        Comentar <span>{comentarios}</span>
      </button>
      <button
        type="button"
        className="sdb-community-actions__button"
        aria-expanded={abertas}
        aria-controls={id}
        onClick={() => setAbertas(!abertas)}
      >
        <Icon name="mais" />
        Reagir
      </button>
      <button
        type="button"
        className="sdb-community-actions__button sdb-community-actions__save"
        aria-pressed={salva}
        aria-label={salva ? "Remover publicação dos salvos" : "Salvar publicação"}
        disabled={bloqueada}
        onClick={onSalvar}
      >
        <Icon name="estante" />
      </button>
      <div
        id={id}
        className="sdb-community-actions__reactions"
        role="group"
        aria-label="Reações à publicação"
        hidden={!abertas}
      >
        {REACOES.map((r) => (
          <button
            key={r.tipo}
            type="button"
            className="sdb-community-actions__button"
            aria-pressed={reacoes.includes(r.tipo)}
            disabled={bloqueada}
            onClick={() => onReagir(r.tipo)}
          >
            <Icon name={r.icone} />
            {r.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
