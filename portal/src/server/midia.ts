import "server-only";
import { randomBytes } from "node:crypto";
import type { BlocoCorpo } from "@/data/types";
import { campoDoBloco } from "@/features/admin/regras/corpo";
import { type TipoImagem, validarAnexo, validarImagem } from "@/features/anfitriao/regras/imagem";
import { armazenamentoS3 } from "@/modules/midia/armazenamento.s3";
import type { ArmazenamentoDeArquivos } from "@/modules/midia/midia.contratos";
import { acervo, comGravacoesDoPedido, type MidiaGuardada } from "./store";

/*
 * Imagens enviadas (§3.4). Os metadados ficam no banco (tabela midias) e os
 * bytes no armazenamento S3 (modules/midia); são servidas por /midia/[id]
 * (src/app/midia/[id]/route.ts). O tipo vem dos magic bytes, nunca do nome ou
 * do tipo declarado pelo navegador.
 */

let armazenamento: ArmazenamentoDeArquivos = armazenamentoS3;

/** Só para testes: troca o armazenamento de arquivos. */
export function usarArmazenamento(a: ArmazenamentoDeArquivos) {
  armazenamento = a;
}

export const urlDaMidia = (id: string) => `/midia/${id}`;

const LADO_MAXIMO = 2560;

async function compactar(
  bytes: Uint8Array,
  tipo: TipoImagem,
): Promise<{ bytes: Uint8Array; tipo: TipoImagem }> {
  try {
    const { default: sharp } = await import("sharp");
    sharp.cache(false);
    const saida = await sharp(bytes, { animated: true, failOn: "error" })
      .rotate()
      .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100, smartSubsample: true, effort: 5 })
      .toBuffer();
    return saida.byteLength < bytes.byteLength
      ? { bytes: new Uint8Array(saida), tipo: "image/webp" }
      : { bytes, tipo };
  } catch {
    return { bytes, tipo };
  }
}

export async function guardarImagem(
  bytes: Uint8Array,
  donoId: string,
): Promise<{ ok: true; id: string; url: string } | { ok: false; erro: string }> {
  const validacao = validarImagem(bytes);
  if (!validacao.ok) return validacao;
  const id = `m-${randomBytes(9).toString("base64url")}`;
  const chave = `midias/${donoId}/${id}`;
  const final = await compactar(bytes, validacao.tipo);
  await armazenamento.enviar(chave, final.bytes, final.tipo);
  const midia: MidiaGuardada = {
    id,
    chave,
    tipo: final.tipo,
    tamanho: final.bytes.byteLength,
    donoId,
    criadoEm: new Date().toISOString(),
  };
  await comGravacoesDoPedido(() => {
    acervo().midias.set(id, midia);
  });
  return { ok: true, id, url: urlDaMidia(id) };
}

type MidiaServida = { tipo: MidiaGuardada["tipo"]; bytes: Uint8Array };

const LIMITE_CACHE_BYTES = 200 * 1024 * 1024;
const cacheMidias = new Map<string, Promise<MidiaServida | undefined>>();
const tamanhoNoCache = new Map<string, number>();
let bytesNoCache = 0;

function guardarNoCache(id: string, tamanho: number) {
  tamanhoNoCache.set(id, tamanho);
  bytesNoCache += tamanho;
  for (const [antigo, t] of tamanhoNoCache) {
    if (bytesNoCache <= LIMITE_CACHE_BYTES) break;
    tamanhoNoCache.delete(antigo);
    cacheMidias.delete(antigo);
    bytesNoCache -= t;
  }
}

async function carregarMidia(id: string): Promise<MidiaServida | undefined> {
  const midia = acervo().midias.get(id);
  const bytes = midia ? await armazenamento.baixar(midia.chave) : null;
  if (!midia || !bytes) return undefined;
  if (midia.tipo === "application/pdf") return { tipo: midia.tipo, bytes };
  return midia.tipo === "image/webp" && bytes.byteLength < 600 * 1024
    ? { tipo: midia.tipo, bytes }
    : compactar(bytes, midia.tipo);
}

/** Anexo de mensagem: imagem (compactada como as outras) ou PDF guardado como veio. */
export async function guardarAnexo(
  bytes: Uint8Array,
  donoId: string,
): Promise<{ ok: true; id: string; url: string; tipo: MidiaGuardada["tipo"] } | { ok: false; erro: string }> {
  const validacao = validarAnexo(bytes);
  if (!validacao.ok) return validacao;
  if (validacao.tipo !== "application/pdf") {
    const r = await guardarImagem(bytes, donoId);
    return r.ok ? { ...r, tipo: acervo().midias.get(r.id)?.tipo ?? validacao.tipo } : r;
  }
  const id = `m-${randomBytes(9).toString("base64url")}`;
  const chave = `midias/${donoId}/${id}`;
  await armazenamento.enviar(chave, bytes, validacao.tipo);
  const midia: MidiaGuardada = {
    id,
    chave,
    tipo: validacao.tipo,
    tamanho: bytes.byteLength,
    donoId,
    criadoEm: new Date().toISOString(),
  };
  await comGravacoesDoPedido(() => {
    acervo().midias.set(id, midia);
  });
  return { ok: true, id, url: urlDaMidia(id), tipo: validacao.tipo };
}

/** O anexo só entra numa mensagem se foi enviado pela mesma conta. */
export function anexoDoDono(id: string, donoId: string): MidiaGuardada | undefined {
  const midia = acervo().midias.get(id);
  return midia?.donoId === donoId ? midia : undefined;
}

export async function obterMidia(id: string): Promise<MidiaServida | undefined> {
  if (!acervo().midias.has(id)) return undefined;
  const emCache = cacheMidias.get(id);
  if (emCache) {
    cacheMidias.delete(id);
    cacheMidias.set(id, emCache);
    return emCache;
  }
  const carregando = carregarMidia(id);
  cacheMidias.set(id, carregando);
  const resultado = await carregando.catch(() => undefined);
  if (resultado) guardarNoCache(id, resultado.bytes.byteLength);
  else cacheMidias.delete(id);
  return resultado;
}

/** A imagem só entra num item se foi enviada pela mesma conta. */
export function midiaDoDono(id: string | null | undefined, donoId: string): string | undefined {
  if (!id) return undefined;
  const midia = acervo().midias.get(id);
  return midia?.donoId === donoId && midia.tipo.startsWith("image/") ? id : undefined;
}

/**
 * Imagens do corpo em blocos. Com envio (`midia`), a imagem precisa ser da
 * mesma conta e o endereço passa a ser o de /midia; sem envio, só vale um
 * endereço que o item já tinha (as imagens do acervo inicial, em /imagens).
 * Devolve o corpo conferido e os erros por campo do editor (campo-corpo-n).
 */
export function conferirImagensDoCorpo(
  corpo: readonly BlocoCorpo[],
  donoId: string | undefined,
  anterior: readonly BlocoCorpo[] = [],
): { corpo: BlocoCorpo[]; erros: Record<string, string> } {
  const conhecidas = new Set(
    anterior.flatMap((b) => (typeof b !== "string" && b.tipo === "imagem" ? [b.src] : [])),
  );
  const erros: Record<string, string> = {};
  const conferido = corpo.map((b, i): BlocoCorpo => {
    if (typeof b === "string" || b.tipo !== "imagem" || (!b.midia && !b.src.trim())) return b;
    if (b.midia) {
      const id = donoId ? midiaDoDono(b.midia, donoId) : undefined;
      if (id) return { ...b, midia: id, src: urlDaMidia(id) };
    } else if (conhecidas.has(b.src)) {
      return b;
    }
    erros[campoDoBloco(i, undefined, corpo)] =
      "esta imagem não foi enviada por esta conta. Envie o arquivo de novo.";
    return b;
  });
  return { corpo: conferido, erros };
}
