import type { Placa } from "@/data/types";
import { Arc } from "./Arc";

/**
 * Banner da Sala (BannerSala): a imagem na largura toda, na moldura do Card
 * Vídeo (.video-embed__frame) com proporção 3:1, 2:1 ou 16:10 pelo container.
 * Sem imagem, a placa da marca com o arco. O alt, o foco e o crédito vêm do
 * item de imagens do acervo; sem ele, alt vazio e sem legenda.
 */
export function BannerSala({
  imagem,
  placa,
  alt = "",
  foco,
  credito,
}: {
  imagem?: string;
  placa: Placa;
  alt?: string;
  /** object-position da imagem, ex.: "45% 55%". */
  foco?: string;
  credito?: string;
}) {
  return (
    <figure className="sdb-roombanner">
      <div className="video-embed__frame">
        {imagem ? (
          // biome-ignore lint/performance/noImgElement: imagem da Sala servida de public/imagens ou /midia.
          <img src={imagem} alt={alt} decoding="async" style={foco ? { objectPosition: foco } : undefined} />
        ) : (
          <div className={`sdb-plate sdb-plate--${placa}`} aria-hidden="true">
            <Arc line on={placa} />
          </div>
        )}
      </div>
      {credito && <figcaption className="sdb-footnote sdb-roombanner__credit">{credito}</figcaption>}
    </figure>
  );
}
