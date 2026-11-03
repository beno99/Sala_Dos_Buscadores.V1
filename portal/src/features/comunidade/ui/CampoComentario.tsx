"use client";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ds/Button";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { LIMITES_COMUNIDADE } from "@/features/comunidade/regras";
import { comentarAcao } from "@/server/comunidade/acoes";
import { useAcaoComunidade } from "./useAcaoComunidade";

export interface Respondendo {
  id: string;
  nome: string;
}

export function CampoComentario({
  publicacaoId,
  respondendo,
  onCancelarResposta,
  limite = LIMITES_COMUNIDADE.comentario,
}: {
  publicacaoId: string;
  /** 150 para buscador, 600 para anfitrião e curadoria (o servidor confere de novo). */
  limite?: number;
  respondendo: Respondendo | null;
  onCancelarResposta: () => void;
}) {
  const { pendente, executar } = useAcaoComunidade();
  const [texto, setTexto] = useState("");
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    executar(
      () => comentarAcao(publicacaoId, texto, respondendo?.id),
      undefined,
      () => {
        setTexto("");
        onCancelarResposta();
      },
    );
  };
  return (
    <form onSubmit={enviar} aria-label="Escrever comentário">
      {respondendo && (
        <p className="sdb-footnote">
          Respondendo a {respondendo.nome}{" "}
          <Button variant="plain" size="sm" onClick={onCancelarResposta}>
            Cancelar
          </Button>
        </p>
      )}
      <AreaTexto
        label="Adicione um comentário…"
        rows={2}
        required
        contador={limite < LIMITES_COMUNIDADE.comentario || texto.length > limite - 100}
        maxLength={limite}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div className="sdb-composer__foot">
        <Button type="submit" variant="primary" disabled={!texto.trim() || pendente}>
          Comentar
        </Button>
      </div>
    </form>
  );
}
