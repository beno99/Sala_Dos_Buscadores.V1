import "server-only";
import { editar, transicao } from "@/features/anfitriao/regras/ciclo";
import {
  type Anuncio,
  anuncioDoPortal,
  checklistEnvioAnuncio,
  type FormAnuncio,
  normalizarAnuncio,
  revisaoDoAnuncio,
  validarAnuncio,
} from "@/features/anuncios/regras";
import type { Membro } from "@/modules/conta/conta.contratos";
import type { ModoSalvar } from "./admin/editorial";
import { agora, comPosse, erro, falha, novoId, ok, type ResultadoAcao } from "./anfitriao/comum";
import { aceiteDe, congelado, ERRO_ACEITE, ERRO_CONGELADO } from "./anfitriao/editorial";
import { registrar } from "./auditoria";
import { midiaDoDono, urlDaMidia } from "./midia";
import { AcessoNegado } from "./sessao";
import { acervo, contaNoDiretorio } from "./store";

/*
 * Publicidade do anfitrião. Cada anúncio pertence a uma conta (donoId) e só
 * ela lê o rascunho ou altera o anúncio. Segue o ciclo de Salas e artigos:
 * rascunho → em revisão → publicado ou reprovado. Só o que a curadoria
 * aprovou aparece no Portal, e editar um anúncio no ar tira-o do ar até a
 * nova aprovação.
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

/** Como anuncioDoDono, mas nega o acesso (para as operações de escrita). */
function exigirAnuncio(id: string, donoId: string): Anuncio {
  const a = anuncioDoDono(id, donoId);
  if (!a) throw new AcessoNegado("este anúncio não existe ou não é seu.");
  return a;
}

/** Índice estável em [0, n) a partir de um texto (rodízio sem estado). */
function rodizio(texto: string, n: number): number {
  if (n <= 1) return 0;
  let h = 0;
  for (const c of texto) h = (h * 31 + (c.codePointAt(0) ?? 0)) >>> 0;
  return h % n;
}

/**
 * Um anúncio aprovado pela curadoria, de quem ainda é anfitrião. Com `chave`
 * (o id de quem visita), a mesma pessoa vê o mesmo anúncio o dia todo.
 */
export function anuncioParaOPortal(chave?: string): AnuncioNoPortal | undefined {
  const publicados = anuncioDoPortal(acervo().anuncios.values())
    .filter((a) => !congelado(a) && contaNoDiretorio(a.donoId)?.papel === "anfitriao")
    .sort((a, b) => a.id.localeCompare(b.id))
    .flatMap((a) => comImagem(a) ?? []);
  const vez = chave
    ? rodizio(`${chave}:${agora().slice(0, 10)}`, publicados.length)
    : Math.floor(Math.random() * publicados.length);
  return publicados[vez];
}

type Salvo = { id: string; status: Anuncio["status"]; saiuDoAr: boolean; salvoEm: string };

/** Campos que contam como mudança (o resto é metadado). */
const conteudo = (a: Omit<FormAnuncio, "id" | "versaoEsperada">) =>
  JSON.stringify([
    a.midia,
    a.focoX,
    a.focoY,
    a.alt,
    a.categoria,
    a.titulo,
    a.descricao,
    a.href,
    a.chamada,
    a.anunciante,
  ]);

/**
 * Salva o rascunho (o envio à curadoria é outra ação). Exige só os limites e
 * um link válido; os obrigatórios são cobrados no envio. Num anúncio no ar,
 * só o salvamento manual (confirmado) vale, e o anúncio sai do ar.
 */
export function salvarAnuncio(entrada: FormAnuncio, dono: Membro, modo: ModoSalvar): ResultadoAcao<Salvo> {
  return comPosse(() => {
    if (dono.papel !== "anfitriao") return falha("Erro: só anfitriões criam publicidade.");
    const f = normalizarAnuncio(entrada);
    const anterior = f.id ? exigirAnuncio(f.id, dono.id) : undefined;
    if (anterior && congelado(anterior)) return erro(ERRO_CONGELADO);
    if (anterior && f.versaoEsperada && f.versaoEsperada !== anterior.atualizadoEm)
      return {
        ok: false,
        conflito: true,
        mensagem: "Este anúncio mudou em outra aba. Reabra o editor; seu texto continua nesta página.",
      };
    const erros = validarAnuncio(f, "rascunho");
    const midia = f.midia ? midiaDoDono(f.midia, dono.id) : undefined;
    if (f.midia && !midia)
      erros["campo-imagem"] = "esta imagem não foi enviada por esta conta. Envie o arquivo de novo.";
    if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

    let status: Anuncio["status"] = "rascunho";
    let saiuDoAr = false;
    if (anterior) {
      const t = editar(anterior.status);
      if (!t.ok) return erro(t.erro);
      if (t.saiDoAr && modo === "automatico")
        return erro("anúncio no ar só muda com confirmação: ele sai do ar até a nova aprovação.");
      status = t.para;
      saiuDoAr = Boolean(t.saiDoAr);
    }

    const quando = agora();
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
      revisao: anterior ? revisaoDoAnuncio(anterior) : { donoId: dono.id, jaPublicado: false, decisoes: [] },
    };
    if (anterior?.publicadoEm) anuncio.publicadoEm = anterior.publicadoEm;

    if (anterior && conteudo(anterior) === conteudo(anuncio))
      return ok(
        { id: anterior.id, status: anterior.status, saiuDoAr: false, salvoEm: anterior.atualizadoEm },
        "Nada mudou.",
      );

    acervo().anuncios.set(anuncio.id, anuncio);
    registrar({
      quem: dono.pseudonimo,
      acao: anterior ? "editou" : "criou",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo || "Anúncio sem título",
      mudancas: saiuDoAr ? [{ campo: "Status", antes: "publicado", depois: "rascunho" }] : undefined,
    });
    return ok(
      { id: anuncio.id, status, saiuDoAr, salvoEm: quando },
      saiuDoAr
        ? "Alterações salvas. O anúncio saiu do ar até a curadoria aprovar a nova versão."
        : "Rascunho salvo. Só você vê este anúncio.",
    );
  });
}

export function enviarAnuncio(anuncioId: string, aceite: boolean, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const anuncio = exigirAnuncio(anuncioId, dono.id);
    if (congelado(anuncio)) return erro(ERRO_CONGELADO);
    if (!aceite) return falha(`Erro: ${ERRO_ACEITE}`, { "campo-aceite": ERRO_ACEITE });
    const t = transicao(anuncio.status, "enviar");
    if (!t.ok) return erro(t.erro);
    const erros = validarAnuncio(normalizarAnuncio(anuncio), "publicar");
    if (anuncio.midia && !midiaDoDono(anuncio.midia, dono.id))
      erros["campo-imagem"] = "a imagem não está disponível. Envie de novo.";
    if (Object.keys(erros).length) {
      const pendentes = checklistEnvioAnuncio(anuncio).filter((i) => i.estado === "pendente");
      const lista = pendentes.map((p) => p.rotulo.toLowerCase()).join(", ") || "imagem do produto";
      return falha(`Erro: ainda há pendências: ${lista}.`, erros);
    }
    const quando = agora();
    acervo().anuncios.set(anuncio.id, {
      ...anuncio,
      status: t.para,
      atualizadoEm: quando,
      revisao: { ...revisaoDoAnuncio(anuncio), enviadoEm: quando, aceite: aceiteDe(dono) },
    });
    registrar({
      quem: dono.pseudonimo,
      acao: "enviou-para-revisao",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo,
    });
    return ok(undefined, "Anúncio enviado para revisão.");
  });
}

export function retirarAnuncio(anuncioId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const anuncio = exigirAnuncio(anuncioId, dono.id);
    if (congelado(anuncio)) return erro(ERRO_CONGELADO);
    const t = transicao(anuncio.status, "retirar");
    if (!t.ok) return erro(t.erro);
    acervo().anuncios.set(anuncio.id, { ...anuncio, status: t.para, atualizadoEm: agora() });
    registrar({
      quem: dono.pseudonimo,
      acao: "arquivou",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo,
      mudancas: [{ campo: "Status", antes: "publicado", depois: "arquivado" }],
    });
    return ok(undefined, "Anúncio retirado do ar. Nada foi apagado.");
  });
}

/** Exclui um anúncio que nunca foi ao ar; o que já esteve no ar só é retirado. */
export function excluirAnuncio(anuncioId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const anuncio = exigirAnuncio(anuncioId, dono.id);
    if (revisaoDoAnuncio(anuncio).jaPublicado || anuncio.publicadoEm)
      return erro("este anúncio já esteve no ar: retire-o do ar em vez de excluir.");
    if (anuncio.status === "em_revisao")
      return erro("o anúncio está em revisão. Espere a decisão da curadoria.");
    acervo().anuncios.delete(anuncio.id);
    registrar({
      quem: dono.pseudonimo,
      acao: "excluiu",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo || "Anúncio sem título",
    });
    return ok(undefined, "Anúncio excluído.");
  });
}

export function marcarAnuncioVisto(anuncioId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const anuncio = exigirAnuncio(anuncioId, dono.id);
    const revisao = revisaoDoAnuncio(anuncio);
    if (!revisao.decisoes.some((d) => !d.vista)) return ok(undefined, "");
    acervo().anuncios.set(anuncio.id, {
      ...anuncio,
      revisao: { ...revisao, decisoes: revisao.decisoes.map((d) => ({ ...d, vista: true })) },
    });
    return ok(undefined, "");
  });
}
