/*
 * Upload de imagem do anfitrião (§3.4): só JPEG, PNG e WebP, até 5 MB. O tipo
 * é conferido pelos primeiros bytes do arquivo (magic bytes), não pelo nome
 * nem pelo tipo que o navegador declara.
 */

export const LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024;

export type TipoImagem = "image/jpeg" | "image/png" | "image/webp";

export type ResultadoImagem = { ok: true; tipo: TipoImagem } | { ok: false; erro: string };

const comeca = (b: Uint8Array, assinatura: number[], desde = 0) =>
  assinatura.every((byte, i) => b[desde + i] === byte);

/** Tipo real da imagem pelos magic bytes; null se não for JPEG, PNG nem WebP. */
export function tipoPelosBytes(b: Uint8Array): TipoImagem | null {
  if (comeca(b, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (comeca(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  // RIFF....WEBP
  if (comeca(b, [0x52, 0x49, 0x46, 0x46]) && comeca(b, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

function megabytes(n: number) {
  return (n / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export function validarImagem(bytes: Uint8Array): ResultadoImagem {
  if (bytes.byteLength === 0) return { ok: false, erro: "o arquivo está vazio. Escolha outra imagem." };
  if (bytes.byteLength > LIMITE_IMAGEM_BYTES) {
    return { ok: false, erro: `a imagem tem ${megabytes(bytes.byteLength)} MB; o limite é 5 MB.` };
  }
  const tipo = tipoPelosBytes(bytes);
  if (!tipo) return { ok: false, erro: "o arquivo precisa ser JPEG, PNG ou WebP." };
  return { ok: true, tipo };
}
