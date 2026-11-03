import type { Enquadramento } from "./tipos";

/** A mesma janela e transformação são usadas no editor, na prévia e no Portal. */
export function ImagemPublicidade({
  src,
  alt,
  enquadramento,
}: {
  src: string;
  alt: string;
  enquadramento: Enquadramento;
}) {
  const x = Math.min(100, Math.max(0, enquadramento.x));
  const y = Math.min(100, Math.max(0, enquadramento.y));
  const zoom = Math.min(3, Math.max(1, enquadramento.zoom));
  return (
    <div className="sdb-publicidade__imagem">
      {/* biome-ignore lint/performance/noImgElement: mídia autenticada e blob local preservam a mesma geometria. */}
      <img
        src={src}
        alt={alt}
        width={700}
        height={500}
        decoding="async"
        style={{ objectPosition: `${x}% ${y}%`, transform: `scale(${zoom})`, transformOrigin: `${x}% ${y}%` }}
      />
    </div>
  );
}
