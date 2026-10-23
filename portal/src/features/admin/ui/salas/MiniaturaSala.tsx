import { Arc } from "@/components/ds/Arc";
import type { Placa } from "@/data/types";

/** Miniatura da Sala na tabela (TabelaDados › miniatura): a imagem ou a placa da marca com o arco. */
export function MiniaturaSala({ imagem, placa }: { imagem?: string; placa: Placa }) {
  return (
    <span className="sdb-table__thumb" aria-hidden="true">
      {imagem ? (
        // biome-ignore lint/performance/noImgElement: miniatura decorativa (public/imagens ou /midia).
        <img src={imagem} alt="" decoding="async" />
      ) : (
        <span className={`sdb-plate sdb-plate--${placa}`}>
          <Arc on={placa} />
        </span>
      )}
    </span>
  );
}
