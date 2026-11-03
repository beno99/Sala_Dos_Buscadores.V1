import "server-only";
import { todosOsTemas } from "@/data/catalogo";
import type { SalaEditorial, StatusEditorial, VideoEditorial } from "@/data/types";
import { type FormVideo, videoParaForm } from "@/features/admin/formularios";
import { checklistVideo } from "@/features/admin/regras/checklist";
import { extrairIdYoutube, validarDuracao } from "@/features/admin/regras/youtube";
import { editar, transicao } from "@/features/anfitriao/regras/ciclo";
import type { Membro } from "@/modules/conta/conta.contratos";
import type { ModoSalvar } from "../admin/editorial";
import { registrar } from "../auditoria";
import { artigoDoDono, videoDoDono } from "../sessao";
import { acervo, comGravacoesDoPedido, gravarEditorialNoAcervo } from "../store";
import { agora, comPosse, comPosseAsync, erro, falha, hoje, novoId, ok, type ResultadoAcao } from "./comum";
import { aceiteDe, conferirAnfitriao, congelado, ERRO_ACEITE, ERRO_CONGELADO } from "./editorial";

/*
 * Vídeos do anfitrião: nascem numa Sala dele, podem acompanhar artigos dele
 * (em qualquer estado) ou artigos já publicados de outras Salas, e só vão ao
 * ar com a aprovação da curadoria. Mesmo ciclo das Salas e dos artigos:
 * rascunho → em revisão → publicado ou reprovado. Editar um vídeo publicado
 * tira o vídeo do ar até a nova aprovação.
 */

const temaValido = (slug: string) => todosOsTemas().some((t) => t.slug === slug);

/** A Sala do anfitrião pelo endereço (o formulário de vídeo trabalha com o slug). */
function salaDoDonoPorSlug(slug: string, donoId: string): SalaEditorial | undefined {
  return [...acervo().salas.values()].find(
    (s) => s.slug === slug && !s.lixeira && s.origem === "anfitriao" && s.revisao?.donoId === donoId,
  );
}

/** Artigos que o vídeo pode acompanhar: os do anfitrião e os publicados em Salas oficiais ou de outros. */
function artigoLigavel(id: string, donoId: string): boolean {
  const a = acervo().conteudos.get(id);
  if (!a || a.lixeira || a.status === "arquivado") return false;
  if (a.revisao?.donoId === donoId) return true;
  return a.status === "publicado";
}

type Salvo = { id: string; status: StatusEditorial; saiuDoAr: boolean; salvoEm: string };

async function salvarVideoPlano(f: FormVideo, dono: Membro, modo: ModoSalvar): Promise<ResultadoAcao<Salvo>> {
  return comPosseAsync(async () => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const anterior = f.id ? videoDoDono(f.id, dono.id) : undefined;
    if (anterior && congelado(anterior)) return erro(ERRO_CONGELADO);
    const sala = salaDoDonoPorSlug(f.sala, dono.id);
    if (!sala)
      return falha("Erro: escolha uma das suas Salas.", { "campo-sala": "escolha uma das suas Salas." });
    if (congelado(sala)) return erro(ERRO_CONGELADO);
    if (anterior && anterior.sala !== sala.slug) return erro("o vídeo não muda de Sala.");

    const erros: Record<string, string> = {};
    if (!f.titulo.trim()) erros["campo-titulo"] = "escreva o título para salvar o rascunho.";
    if (f.url.trim()) {
      const url = extrairIdYoutube(f.url);
      if (!url.ok) erros["campo-url"] = url.erro;
    }
    if (f.duracao.trim()) {
      const e = validarDuracao(f.duracao);
      if (e) erros["campo-duracao"] = e;
    }
    if (f.temas.some((t) => !temaValido(t))) erros["campo-temas"] = "escolha os temas da lista.";
    const artigos = [...new Set(f.artigos.map(String))];
    if (artigos.some((id) => !artigoLigavel(id, dono.id) && !anterior?.artigos.includes(id)))
      erros["campo-artigos"] = "um artigo não está mais disponível. Atualize a lista e revise a seleção.";
    if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

    let status: StatusEditorial = "rascunho";
    let saiuDoAr = false;
    if (anterior) {
      const t = editar(anterior.status);
      if (!t.ok) return erro(t.erro);
      if (t.saiDoAr && modo === "automatico")
        return erro("vídeo publicado só muda com confirmação: ele sai do ar até a nova aprovação.");
      status = t.para;
      saiuDoAr = Boolean(t.saiDoAr);
    }

    const url = extrairIdYoutube(f.url);
    const momento = agora();
    const video: VideoEditorial = {
      id: anterior?.id ?? novoId("v"),
      sala: sala.slug as VideoEditorial["sala"],
      titulo: f.titulo.trim(),
      duracao: f.duracao.trim(),
      temas: [...new Set(f.temas)],
      nivel: f.nivel ?? 1,
      episodio: f.episodio.trim(),
      publicadoEm: f.publicadoEm || anterior?.publicadoEm || hoje(),
      url: url.ok ? url.canonica : f.url.trim(),
      youtubeId: url.ok ? url.id : "",
      placa: f.placa,
      artigos,
      status,
      criadoEm: anterior?.criadoEm ?? momento,
      atualizadoEm: momento,
      criadoPor: anterior?.criadoPor ?? dono.pseudonimo,
      atualizadoPor: dono.pseudonimo,
      revisao: anterior?.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] },
    };

    const chave = (v: VideoEditorial) =>
      JSON.stringify([
        v.titulo,
        v.duracao,
        v.temas,
        v.nivel,
        v.episodio,
        v.publicadoEm,
        v.url,
        v.placa,
        [...v.artigos].sort(),
      ]);
    if (anterior && chave(anterior) === chave(video))
      return ok(
        { id: video.id, status: anterior.status, saiuDoAr: false, salvoEm: anterior.atualizadoEm },
        "Nada mudou.",
      );

    await gravarEditorialNoAcervo({
      colecao: "videos",
      valor: video,
      esperado: f.versaoEsperada ?? anterior?.atualizadoEm ?? null,
      ator: { id: dono.id, papel: "anfitriao" },
    });
    registrar({
      quem: dono.pseudonimo,
      acao: anterior ? "editou" : "criou",
      tipoItem: "video",
      itemId: video.id,
      itemTitulo: video.titulo,
      mudancas: saiuDoAr ? [{ campo: "Status", antes: "publicado", depois: "rascunho" }] : undefined,
    });
    return ok(
      { id: video.id, status, saiuDoAr, salvoEm: video.atualizadoEm },
      saiuDoAr
        ? "Alterações salvas. O vídeo saiu do ar até a curadoria aprovar a nova versão."
        : modo === "manual"
          ? "Alterações salvas."
          : "Rascunho salvo.",
    );
  });
}

export async function salvarVideo(f: FormVideo, dono: Membro, modo: ModoSalvar) {
  return comGravacoesDoPedido(() => salvarVideoPlano(f, dono, modo));
}

/** Envia o vídeo para a curadoria: precisa do checklist completo e do aceite de direitos. */
export function enviarVideo(videoId: string, aceite: boolean, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const recusa = conferirAnfitriao(dono);
    if (recusa) return erro(recusa);
    const video = videoDoDono(videoId, dono.id);
    if (congelado(video)) return erro(ERRO_CONGELADO);
    if (!aceite) return falha(`Erro: ${ERRO_ACEITE}`, { "campo-aceite": ERRO_ACEITE });
    const t = transicao(video.status, "enviar");
    if (!t.ok) return erro(t.erro);
    const pendentes = checklistVideo(videoParaForm(video)).filter((i) => i.estado === "pendente");
    if (pendentes.length)
      return erro(`ainda há pendências: ${pendentes.map((p) => p.rotulo.toLowerCase()).join(", ")}.`);
    const quando = agora();
    acervo().videos.set(video.id, {
      ...video,
      status: t.para,
      atualizadoEm: quando,
      atualizadoPor: dono.pseudonimo,
      revisao: {
        ...(video.revisao ?? { donoId: dono.id, jaPublicado: false, decisoes: [] }),
        enviadoEm: quando,
        aceite: aceiteDe(dono),
      },
    });
    registrar({
      quem: dono.pseudonimo,
      acao: "enviou-para-revisao",
      tipoItem: "video",
      itemId: video.id,
      itemTitulo: video.titulo,
    });
    return ok(undefined, "Vídeo enviado para revisão.");
  });
}

/** Tira do ar sem apagar (vai para arquivado). */
export function retirarVideo(videoId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const video = videoDoDono(videoId, dono.id);
    if (congelado(video)) return erro(ERRO_CONGELADO);
    const t = transicao(video.status, "retirar");
    if (!t.ok) return erro(t.erro);
    acervo().videos.set(video.id, {
      ...video,
      status: t.para,
      atualizadoEm: agora(),
      atualizadoPor: dono.pseudonimo,
    });
    registrar({
      quem: dono.pseudonimo,
      acao: "arquivou",
      tipoItem: "video",
      itemId: video.id,
      itemTitulo: video.titulo,
      mudancas: [{ campo: "Status", antes: "publicado", depois: "arquivado" }],
    });
    return ok(undefined, "Vídeo retirado do ar. Nada foi apagado.");
  });
}

/** Exclui um vídeo que nunca foi ao ar. Publicado uma vez, só sai do ar (arquivado). */
export function excluirVideo(videoId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const video = videoDoDono(videoId, dono.id);
    if (congelado(video)) return erro(ERRO_CONGELADO);
    if (video.revisao?.jaPublicado)
      return erro("este vídeo já esteve no ar: retire-o do ar em vez de excluir.");
    if (video.status === "em_revisao") return erro("o vídeo está em revisão. Espere a decisão da curadoria.");
    acervo().videos.delete(video.id);
    registrar({
      quem: dono.pseudonimo,
      acao: "excluiu",
      tipoItem: "video",
      itemId: video.id,
      itemTitulo: video.titulo,
    });
    return ok(undefined, "Vídeo excluído.");
  });
}

export function marcarVideoVisto(videoId: string, dono: Membro): ResultadoAcao {
  return comPosse(() => {
    const video = videoDoDono(videoId, dono.id);
    if (!video.revisao?.decisoes.some((d) => !d.vista)) return ok(undefined, "");
    acervo().videos.set(video.id, {
      ...video,
      revisao: { ...video.revisao, decisoes: video.revisao.decisoes.map((d) => ({ ...d, vista: true })) },
    });
    return ok(undefined, "");
  });
}

/** Artigos que o anfitrião pode ligar ao vídeo, os dele primeiro. */
export function artigosLigaveisDoAnfitriao(donoId: string) {
  return [...acervo().conteudos.values()]
    .filter((a) => artigoLigavel(a.id, donoId))
    .map((a) => {
      const sala = [...acervo().salas.values()].find((s) => s.slug === a.sala);
      return {
        id: a.id,
        titulo: a.titulo,
        sala: a.sala,
        salaNome: sala?.nome ?? a.sala,
        status: a.status,
        criadoEm: a.criadoEm,
        meu: a.revisao?.donoId === donoId,
      };
    })
    .sort((a, b) => Number(b.meu) - Number(a.meu) || b.criadoEm.localeCompare(a.criadoEm));
}

/** Confere que o artigo é do anfitrião (para abrir "Novo vídeo neste artigo"). */
export function artigoDoAnfitriaoParaVideo(artigoId: string, donoId: string) {
  return artigoDoDono(artigoId, donoId);
}
