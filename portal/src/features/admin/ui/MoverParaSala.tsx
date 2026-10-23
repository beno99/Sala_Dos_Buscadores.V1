"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { moverArtigoAcao } from "@/server/admin/acoes";

/**
 * "Mover para outra Sala" (curadoria a partir da Sala, §6): só para artigo que
 * nunca foi publicado e só entre Salas oficiais. Confirma antes de mover.
 */
export function MoverParaSala({
  aberto,
  onFechar,
  artigoId,
  titulo,
  salaAtual,
  destinos,
  antesDeMover,
}: {
  aberto: boolean;
  onFechar: () => void;
  artigoId: string;
  titulo: string;
  salaAtual: string;
  destinos: { slug: string; nome: string }[];
  /** Salva o que estiver pendente antes de mover. */
  antesDeMover?: () => Promise<boolean>;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [destino, setDestino] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const mover = async () => {
    if (!destino) {
      setErro("escolha a Sala de destino.");
      return;
    }
    setOcupado(true);
    if (antesDeMover && !(await antesDeMover())) {
      setOcupado(false);
      return;
    }
    const r = await moverArtigoAcao(artigoId, destino);
    setOcupado(false);
    if (!r.ok) {
      setErro(r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    toast(r.mensagem);
    onFechar();
    router.push(`/admin/salas/${r.valor.sala}/artigos/${artigoId}` as Route);
    router.refresh();
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} rotuloId={`${id}-titulo`}>
      <div className="sdb-sheet__bar">
        <Button variant="plain" onClick={onFechar}>
          Cancelar
        </Button>
        <h2 id={`${id}-titulo`} className="sdb-sheet__title">
          Mover para outra Sala
        </h2>
        <Button variant="primary" size="sm" loading={ocupado} onClick={mover}>
          Mover
        </Button>
      </div>
      <div className="sdb-sheet__body">
        <p className="sdb-body-sm m-0">
          “{titulo || "Sem título"}” sai da Sala {salaAtual}. Só artigos que nunca foram publicados mudam de
          Sala, porque o endereço público inclui a Sala. Vídeos da Sala atual deixam de se ligar a ele.
        </p>
        <Select
          id={`${id}-destino`}
          label="Sala de destino"
          value={destino}
          error={erro ?? undefined}
          opcoes={[
            { value: "", label: "Escolha a Sala" },
            ...destinos.map((d) => ({ value: d.slug, label: d.nome })),
          ]}
          onChange={(e) => {
            setDestino(e.target.value);
            setErro(null);
          }}
        />
      </div>
    </Sheet>
  );
}
