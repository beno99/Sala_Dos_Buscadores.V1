import "server-only";
import {
  type Anuncio,
  anuncioDoPortal,
  type FormAnuncio,
  type ModoAnuncio,
  normalizarAnuncio,
  validarAnuncio,
} from "@/features/anuncios/regras";
import type { Membro } from "@/modules/conta/conta.contratos";
import { agora, falha, novoId, ok, type ResultadoAcao } from "./anfitriao/comum";
import { midiaDoDono, urlDaMidia } from "./midia";
import { acervo, contaNoDiretorio } from "./store";

/*
 * Publicidade do anfitrião. Cada anúncio pertence a uma conta (donoId) e só
 * ela lê o rascunho ou altera o anúncio; o Portal lê só os publicados.
 */

export interface AnuncioNoPortal extends Anuncio {
  imagem: string;
}

const comImagem = (a: Anuncio): AnuncioNoPortal | undefined =>
  a.midia ? { ...a, imagem: urlDaMidia(a.midia) } : undefined;

export function anunciosDoDono(donoId: string): Anuncio[] {
  return [...acervo().anuncios.values()]
    .filter((a) => a.donoId === donoId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function anuncioDoDono(id: string, donoId: string): Anuncio | undefined {
  const a = acervo().anuncios.get(id);
  return a?.donoId === donoId ? a : undefined;
}

// ponytail: sorteia um publicado por visita; rotação ponderada ou por local quando houver muitos anunciantes.
export function anuncioParaOPortal(): AnuncioNoPortal | undefined {
  const publicados = anuncioDoPortal(acervo().anuncios.values())
    .filter((a) => contaNoDiretorio(a.donoId)?.papel === "anfitriao")
    .flatMap((a) => comImagem(a) ?? []);
  return publicados[Math.floor(Math.random() * publicados.length)];
}

export function salvarAnuncio(
  entrada: FormAnuncio,
  dono: Membro,
  modo: ModoAnuncio,
): ResultadoAcao<{ id: string; status: Anuncio["status"] }> {
  if (dono.papel !== "anfitriao") return falha("Erro: só anfitriões criam publicidade.");
  if (modo !== "rascunho" && modo !== "publicar") return falha("Erro: ação inválida.");
  const f = normalizarAnuncio(entrada);
  const anterior = f.id ? anuncioDoDono(f.id, dono.id) : undefined;
  if (f.id && !anterior) return falha("Erro: este anúncio não existe ou não é seu.");
  const erros = validarAnuncio(f, modo);
  const midia = f.midia ? midiaDoDono(f.midia, dono.id) : null;
  if (f.midia && !midia)
    erros["campo-imagem"] = "esta imagem não foi enviada por esta conta. Envie o arquivo de novo.";
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  const quando = agora();
  const status = modo === "publicar" ? "publicado" : "rascunho";
  const anuncio: Anuncio = {
    id: anterior?.id ?? novoId("anuncio"),
    donoId: dono.id,
    status,
    midia: midia ?? null,
    focoX: f.focoX,
    focoY: f.focoY,
    alt: f.alt,
    categoria: f.categoria,
    titulo: f.titulo,
    descricao: f.descricao,
    href: f.href,
    chamada: f.chamada,
    anunciante: f.anunciante,
    criadoEm: anterior?.criadoEm ?? quando,
    atualizadoEm: quando,
    ...(status === "publicado" ? { publicadoEm: anterior?.publicadoEm ?? quando } : {}),
  };
  acervo().anuncios.set(anuncio.id, anuncio);
  return ok(
    { id: anuncio.id, status },
    status === "publicado" ? "Anúncio publicado no Portal." : "Rascunho salvo. Só você vê este anúncio.",
  );
}
