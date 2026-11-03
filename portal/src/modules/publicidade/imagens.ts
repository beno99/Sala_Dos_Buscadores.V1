import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { validarImagem } from "@/features/anfitriao/regras/imagem";
import { urlImagemPublicidade } from "@/features/publicidade/tipos";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { armazenamentoS3 } from "@/modules/midia/armazenamento.s3";
import { publicidadeImagens } from "./publicidade.schema";

export async function conferirImagemPublicidade(bytes: Uint8Array) {
  const r = validarImagem(bytes);
  if (!r.ok) return r;
  try {
    // Decodifica o arquivo inteiro antes de aceitar. Limita também imagens comprimidas enormes.
    const img = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" });
    const meta = await img.metadata();
    if (!meta.width || !meta.height || (meta.pages ?? 1) > 1)
      return { ok: false as const, erro: "Use uma imagem estática válida." };
    await img.stats();
    return r;
  } catch {
    return {
      ok: false as const,
      erro: "Não foi possível ler esta imagem. Escolha um JPG, PNG ou WebP válido.",
    };
  }
}
export async function enviarImagemPublicidade(bytes: Uint8Array, donoId: string) {
  const r = await conferirImagemPublicidade(bytes);
  if (!r.ok) return { ok: false as const, mensagem: r.erro };
  const id = randomUUID();
  const chave = `publicidade/${donoId}/${id}`;
  await armazenamentoS3.enviar(chave, bytes, r.tipo);
  await banco().insert(publicidadeImagens).values({
    id,
    donoId,
    chave,
    tipo: r.tipo,
    tamanho: bytes.byteLength,
    criadoEm: new Date().toISOString(),
  });
  return { ok: true as const, imagem: { id, url: urlImagemPublicidade(id) } };
}
