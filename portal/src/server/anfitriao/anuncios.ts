import "server-only";
import type { AnuncioEditorial, StatusEditorial } from "@/data/types";
import { editar, transicao } from "@/features/anfitriao/regras/ciclo";
import {
  CHAMADA_PADRAO,
  checklistEnvioAnuncio,
  type FormAnuncio,
  validarAnuncioParaSalvar,
} from "@/features/publicidade/regras";
import type { Membro } from "@/modules/conta/conta.contratos";
import type { ModoSalvar } from "../admin/editorial";
import { registrar } from "../auditoria";
import { midiaDoDono, urlDaMidia } from "../midia";
import { anuncioDoDono } from "../sessao";
import { acervo, comGravacoesDoPedido } from "../store";
import { agora, comPosse, erro, falha, novoId, ok, type ResultadoAcao } from "./comum";
import { aceiteDe, conferirAnfitriao, congelado, ERRO_ACEITE, ERRO_CONGELADO } from "./editorial";

/*
 * Anúncios do anfitrião. Rascunho → em revisão → publicado ou reprovado, como
 * Salas e artigos; só o aprovado aparece no Portal. Editar um anúncio no ar
 * tira o anúncio do ar até a nova aprovação.
 */

export function anuncioParaForm(a: AnuncioEditorial): FormAnuncio {
  return {
    id: a.id,
    titulo: a.titulo,
    descricao: a.descricao,
    categoria: a.categoria ?? "",
    href: a.href,
    anunciante: a.anunciante,
    chamada: a.chamada === CHAMADA_PADRAO ? "" : a.chamada,
    textoAlternativo: a.textoAlternativo,
    midia: a.midia ?? null,
    versaoEsperada: a.atualizadoEm,
  };
}

type Salvo = { id: string; status: StatusEditorial; saiuDoAr: boolean; salvoEm: string };

function salvarAnuncioPlano(f: FormAnuncio, dono: Membro, modo: ModoSalvar): ResultadoAcao<Salvo> {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const anterior = f.id ? anuncioDoDono(f.id, dono.id) : undefined;
    if (anterior && congelado(anterior)) return erro(ERRO_CONGELADO);
    if (anterior && f.versaoEsperada !== anterior.atualizadoEm)
      return {
        ok: false,
        conflito: true,
        mensagem: "Este anúncio mudou em outra aba. Reabra o editor; seu texto continua nesta página.",
      };
    const erros = validarAnuncioParaSalvar(f);
    const midia = midiaDoDono(f.midia, dono.id);
    if (f.midia && !midia) erros["campo-imagem"] = "a imagem não está disponível. Envie de novo.";
    if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

    let status: StatusEditorial = "rascunho";
    let saiuDoAr = false;
    if (anterior) {
      const t = editar(anterior.status);
      if (!t.ok) return erro(t.erro);
      if (t.saiDoAr && modo === "automatico")
        return erro("anúncio no ar só muda com confirmação: ele sai do ar até a nova aprovação.");
      status = t.para;
      saiuDoAr = Boolean(t.saiDoAr);
    }

    const momento = agora();
    const anuncio: AnuncioEditorial = {
      id: anterior?.id ?? novoId("a"),
      titulo: f.titulo.trim(),
      descricao: f.descricao.trim(),
      href: f.href.trim() ? new URL(f.href.trim()).toString() : "",
      anunciante: f.anunciante.trim(),
      chamada: f.chamada.trim() || CHAMADA_PADRAO,
      textoAlternativo: f.textoAlternativo.trim(),
      status,
      criadoEm: anterior?.criadoEm ?? momento,
      atualizadoEm: momento,
      criadoPor: anterior?.criadoPor ?? dono.pseudonimo,
      atualizadoPor: dono.pseudonimo,
      revisao: anterior?.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] },
    };
    if (f.categoria.trim()) anuncio.categoria = f.categoria.trim();
    if (midia) {
      anuncio.midia = midia;
      anuncio.imagem = urlDaMidia(midia);
    }
    if (anterior?.publicadoEm) anuncio.publicadoEm = anterior.publicadoEm;

    const chave = (a: AnuncioEditorial) =>
      JSON.stringify([
        a.titulo,
        a.descricao,
        a.categoria ?? "",
        a.href,
        a.anunciante,
        a.chamada,
        a.textoAlternativo,
        a.midia ?? "",
      ]);
    if (anterior && chave(anterior) === chave(anuncio))
      return ok(
        { id: anuncio.id, status: anterior.status, saiuDoAr: false, salvoEm: anterior.atualizadoEm },
        "Nada mudou.",
      );

    acervo().anuncios.set(anuncio.id, anuncio);
    registrar({
      quem: dono.pseudonimo,
      acao: anterior ? "editou" : "criou",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo,
      mudancas: saiuDoAr ? [{ campo: "Status", antes: "publicado", depois: "rascunho" }] : undefined,
    });
    return ok(
      { id: anuncio.id, status, saiuDoAr, salvoEm: anuncio.atualizadoEm },
      saiuDoAr
        ? "Alterações salvas. O anúncio saiu do ar até a curadoria aprovar a nova versão."
        : modo === "manual"
          ? "Alterações salvas."
          : "Rascunho salvo.",
    );
  });
}

export async function salvarAnuncio(f: FormAnuncio, dono: Membro, modo: ModoSalvar) {
  return comGravacoesDoPedido(() => salvarAnuncioPlano(f, dono, modo));
}

export function enviarAnuncio(anuncioId: string, aceite: boolean, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const anuncio = anuncioDoDono(anuncioId, dono.id);
    if (congelado(anuncio)) return erro(ERRO_CONGELADO);
    if (!aceite) return falha(`Erro: ${ERRO_ACEITE}`, { "campo-aceite": ERRO_ACEITE });
    const t = transicao(anuncio.status, "enviar");
    if (!t.ok) return erro(t.erro);
    const pendentes = checklistEnvioAnuncio(anuncioParaForm(anuncio)).filter((i) => i.estado === "pendente");
    if (pendentes.length)
      return erro(`ainda há pendências: ${pendentes.map((p) => p.rotulo.toLowerCase()).join(", ")}.`);
    const quando = agora();
    acervo().anuncios.set(anuncio.id, {
      ...anuncio,
      status: t.para,
      atualizadoEm: quando,
      atualizadoPor: dono.pseudonimo,
      revisao: { ...anuncio.revisao, enviadoEm: quando, aceite: aceiteDe(dono) },
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
    const anuncio = anuncioDoDono(anuncioId, dono.id);
    if (congelado(anuncio)) return erro(ERRO_CONGELADO);
    const t = transicao(anuncio.status, "retirar");
    if (!t.ok) return erro(t.erro);
    acervo().anuncios.set(anuncio.id, {
      ...anuncio,
      status: t.para,
      atualizadoEm: agora(),
      atualizadoPor: dono.pseudonimo,
    });
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
    const anuncio = anuncioDoDono(anuncioId, dono.id);
    if (anuncio.revisao.jaPublicado)
      return erro("este anúncio já esteve no ar: retire-o do ar em vez de excluir.");
    if (anuncio.status === "em_revisao")
      return erro("o anúncio está em revisão. Espere a decisão da curadoria.");
    acervo().anuncios.delete(anuncio.id);
    registrar({
      quem: dono.pseudonimo,
      acao: "excluiu",
      tipoItem: "anuncio",
      itemId: anuncio.id,
      itemTitulo: anuncio.titulo,
    });
    return ok(undefined, "Anúncio excluído.");
  });
}

export function marcarAnuncioVisto(anuncioId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const anuncio = anuncioDoDono(anuncioId, dono.id);
    if (!anuncio.revisao.decisoes.some((d) => !d.vista)) return ok(undefined, "");
    acervo().anuncios.set(anuncio.id, {
      ...anuncio,
      revisao: { ...anuncio.revisao, decisoes: anuncio.revisao.decisoes.map((d) => ({ ...d, vista: true })) },
    });
    return ok(undefined, "");
  });
}
