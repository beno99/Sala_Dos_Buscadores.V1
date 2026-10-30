"use client";
import { useState } from "react";
import { AreaTexto, Select } from "@/components/ds/CamposExtras";
import { ModalConfirmacao } from "@/components/ds/Modal";
import type { AlvoComunidade, MotivoDenunciaComunidade } from "@/data/types";
import { LIMITES_COMUNIDADE, MOTIVOS_DENUNCIA } from "@/features/comunidade/regras";
import {
  denunciarAcao,
  excluirComentarioAcao,
  excluirPublicacaoAcao,
  moderarAcao,
  ocultarComentarioAcao,
} from "@/server/comunidade/acoes";
import { useAcaoComunidade } from "./useAcaoComunidade";

export type DialogoItem = "excluir" | "denunciar" | "ocultar" | null;

const OPCOES_MOTIVO = [
  { value: "", label: "Escolha um motivo" },
  ...Object.entries(MOTIVOS_DENUNCIA).map(([value, label]) => ({ value, label })),
];

/** Confirmações do menu de uma publicação ou de um comentário. */
export function DialogosItem({
  dialogo,
  alvo,
  onFechar,
}: {
  dialogo: DialogoItem;
  alvo: AlvoComunidade;
  onFechar: () => void;
}) {
  const { pendente, executar } = useAcaoComunidade();
  const [motivo, setMotivo] = useState("");
  const [nota, setNota] = useState("");
  const nome = alvo.tipo === "publicacao" ? "publicação" : "comentário";
  const fechar = () => {
    setMotivo("");
    setNota("");
    onFechar();
  };
  const incompleto = (dialogo === "denunciar" && !motivo) || (dialogo === "ocultar" && !nota.trim());
  const confirmar = () => {
    if (incompleto) return;
    if (dialogo === "excluir")
      executar(
        () => (alvo.tipo === "publicacao" ? excluirPublicacaoAcao(alvo.id) : excluirComentarioAcao(alvo.id)),
        undefined,
        fechar,
      );
    if (dialogo === "denunciar")
      executar(() => denunciarAcao(alvo, motivo as MotivoDenunciaComunidade, nota), undefined, fechar);
    if (dialogo === "ocultar")
      executar(
        () =>
          alvo.tipo === "publicacao"
            ? moderarAcao(alvo, "oculta", nota)
            : ocultarComentarioAcao(alvo.id, nota),
        undefined,
        fechar,
      );
  };
  return (
    <ModalConfirmacao
      open={dialogo !== null}
      titulo={
        dialogo === "excluir"
          ? `Excluir ${nome}?`
          : dialogo === "denunciar"
            ? `Denunciar ${nome}`
            : `Ocultar ${nome}`
      }
      destrutivo={dialogo === "excluir"}
      rotuloConfirmar={
        dialogo === "excluir" ? "Excluir" : dialogo === "denunciar" ? "Enviar denúncia" : "Ocultar"
      }
      carregando={pendente}
      onConfirmar={confirmar}
      onCancelar={fechar}
    >
      {dialogo === "excluir" && <p>Deixa de aparecer para todas as pessoas. Não é possível desfazer.</p>}
      {dialogo === "denunciar" && (
        <>
          <Select
            label="Motivo"
            opcoes={OPCOES_MOTIVO}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
          />
          <AreaTexto
            label="Comentário (opcional)"
            rows={3}
            maxLength={LIMITES_COMUNIDADE.nota}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        </>
      )}
      {dialogo === "ocultar" && (
        <AreaTexto
          label="Motivo registrado"
          rows={3}
          maxLength={LIMITES_COMUNIDADE.nota}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          required
        />
      )}
    </ModalConfirmacao>
  );
}
