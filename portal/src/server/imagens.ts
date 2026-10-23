import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";

/*
 * Fotos do portal em public/imagens/{banner,salas,episodios,anuncios,conteudos}
 * (nomes e proporções no LEIA-ME.md da pasta). Sem arquivo, devolve undefined
 * e a peça mostra a placa da marca com o arco.
 */
export type PastaImagem = "banner" | "salas" | "episodios" | "anuncios" | "conteudos";

const BASE = join(process.cwd(), "public", "imagens");

export function imagem(pasta: PastaImagem, nome: string): string | undefined {
  for (const ext of ["webp", "jpg"]) {
    if (existsSync(join(BASE, pasta, `${nome}.${ext}`))) return `/imagens/${pasta}/${nome}.${ext}`;
  }
  return undefined;
}

/** Imagem da Sala: a enviada pelo anfitrião (/midia) ou a foto de public/imagens/salas. */
export function imagemDaSala(sala: { slug: string; imagem?: string }): string | undefined {
  return sala.imagem ?? imagem("salas", sala.slug);
}

/** Imagem do card do conteúdo: a enviada pelo anfitrião ou a foto de public/imagens/conteudos. */
export function imagemDoCard(conteudo: { slug: string; imagem?: string }): string | undefined {
  return conteudo.imagem ?? imagem("conteudos", conteudo.slug);
}
