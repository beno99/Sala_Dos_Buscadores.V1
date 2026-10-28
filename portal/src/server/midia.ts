import "server-only";
import { randomBytes } from "node:crypto";
import type { BlocoCorpo } from "@/data/types";
import { validarImagem } from "@/features/anfitriao/regras/imagem";
import { armazenamentoS3 } from "@/modules/midia/armazenamento.s3";
import type { ArmazenamentoDeArquivos } from "@/modules/midia/midia.contratos";
import { acervo, aguardarGravacoes, type MidiaGuardada } from "./store";

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

export async function guardarImagem(
  bytes: Uint8Array,
  donoId: string,
): Promise<{ ok: true; id: string; url: string } | { ok: false; erro: string }> {
  const validacao = validarImagem(bytes);
  if (!validacao.ok) return validacao;
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
  acervo().midias.set(id, midia);
  await aguardarGravacoes();
  return { ok: true, id, url: urlDaMidia(id) };
}

export async function obterMidia(
  id: string,
): Promise<{ tipo: MidiaGuardada["tipo"]; bytes: Uint8Array } | undefined> {
  const midia = acervo().midias.get(id);
  const bytes = midia ? await armazenamento.baixar(midia.chave) : null;
  return midia && bytes ? { tipo: midia.tipo, bytes } : undefined;
}

/** A imagem só entra num item se foi enviada pela mesma conta. */
export function midiaDoDono(id: string | null | undefined, donoId: string): string | undefined {
  if (!id) return undefined;
  return acervo().midias.get(id)?.donoId === donoId ? id : undefined;
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
    erros[`campo-corpo-${i}`] = "esta imagem não foi enviada por esta conta. Envie o arquivo de novo.";
    return b;
  });
  return { corpo: conferido, erros };
}
