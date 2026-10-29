import "server-only";
import { limparCorpo } from "@/data/corpo";
import { PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type {
  AcaoAuditada,
  BlocoCorpo,
  Citacao,
  ConteudoEditorial,
  FonteEditorial,
  SituacaoJuridica,
  StatusEditorial,
  VideoEditorial,
} from "@/data/types";
import {
  AUTORIA_NAO_IDENTIFICADA,
  artigoParaForm,
  type FormArtigo,
  type FormFonte,
  type FormVideo,
  videoParaForm,
} from "@/features/admin/formularios";
import {
  checklistArtigo,
  checklistVideo,
  erroProvenienciaIA,
  type ItemChecklist,
  temPendencia,
} from "@/features/admin/regras/checklist";
import { rotuloSituacao } from "@/features/admin/regras/csv";
import { gerarSlug, slugUnico, validarSlug } from "@/features/admin/regras/slug";
import { extrairIdYoutube, validarDuracao } from "@/features/admin/regras/youtube";
import { plural } from "@/lib/texto";
import { registrar } from "../auditoria";
import { conferirImagensDoCorpo, midiaDoDono, urlDaMidia } from "../midia";
import { acervo, auditoriaBruta } from "../store";
import { podarDestaques } from "./destaques";
import { erroDaSalaParaConteudo, salaPorSlugNoStore } from "./salas";

/*
 * Regras de escrita da curadoria (RF-13, RF-16). Recebem quem executa a ação
 * já autenticado como administrador: quem chama é src/server/admin/acoes.ts,
 * que confere o papel. Toda mudança passa pelo histórico de auditoria (RNF-04).
 */

export type ResultadoAcao<T = undefined> =
  | { ok: true; valor: T; mensagem: string }
  | { ok: false; mensagem: string; erros?: Record<string, string>; pendencias?: ItemChecklist[] };

export type ModoSalvar = "automatico" | "manual";
export type AcaoStatus = "publicar" | "despublicar" | "arquivar" | "restaurar";

const agora = () => new Date().toISOString();
const hoje = () => agora().slice(0, 10);
const novoId = (prefixo: string) =>
  `${prefixo}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const falha = (mensagem: string, erros?: Record<string, string>, pendencias?: ItemChecklist[]) =>
  ({ ok: false, mensagem, erros, pendencias }) as const;

/**
 * Nada se cria fora de uma Sala: o item nasce numa Sala oficial que existe e
 * não está arquivada, e não muda de Sala pelo formulário (para isso existe
 * "Mover para outra Sala", só para o que nunca foi publicado).
 */
function conferirSala(sala: string, salaAnterior: string | undefined) {
  if (salaAnterior !== undefined && sala !== salaAnterior) {
    const m =
      "o item não muda de Sala ao salvar. Use “Mover para outra Sala” (só para o que nunca foi publicado).";
    return falha(`Erro: ${m}`, { "campo-sala": m });
  }
  const erro = erroDaSalaParaConteudo(sala);
  return erro ? falha(`Erro: ${erro}`, { "campo-sala": erro }) : null;
}

/** A curadoria só julga o conteúdo de anfitrião (aprova ou reprova); nunca o edita. */
const ERRO_ITEM_DE_ANFITRIAO =
  "Erro: este conteúdo é de um anfitrião. A curadoria aprova ou reprova em Revisão de anfitriões, sem editar.";

const STATUS_DESTINO: Record<
  AcaoStatus,
  { de: StatusEditorial[]; para: StatusEditorial; acao: AcaoAuditada }
> = {
  publicar: { de: ["rascunho"], para: "publicado", acao: "publicou" },
  despublicar: { de: ["publicado"], para: "rascunho", acao: "despublicou" },
  arquivar: { de: ["rascunho", "publicado"], para: "arquivado", acao: "arquivou" },
  restaurar: { de: ["arquivado"], para: "rascunho", acao: "restaurou" },
};

/**
 * Evita encher o histórico com o salvamento automático: um novo "editou" só
 * entra se o último registro do item não for um "editou" da mesma pessoa nos
 * últimos 10 minutos. Os registros existentes nunca são alterados.
 */
function deveRegistrarEdicao(itemId: string, quem: string, modo: ModoSalvar): boolean {
  if (modo === "manual") return true;
  const anteriores = [...auditoriaBruta()].reverse();
  const ultimo = anteriores.find((r) => r.itemId === itemId);
  if (ultimo?.acao !== "editou" || ultimo.quem !== quem) return true;
  return Date.now() - new Date(ultimo.quando).getTime() > 10 * 60_000;
}

// ---------- artigos ----------

function situacaoLimpa(s: SituacaoJuridica | null): SituacaoJuridica | null {
  if (!s) return null;
  switch (s.tipo) {
    case "licenca":
      return { tipo: "licenca", licenca: String(s.licenca ?? "").trim() };
    case "cessao":
      return { tipo: "cessao", registro: String(s.registro ?? "").trim() };
    case "dominio-publico":
    case "trecho-permitido":
      return { tipo: s.tipo };
    default:
      return null;
  }
}

function slugsOcupados(sala: string, exceto: string | null): string[] {
  return [...acervo().conteudos.values()]
    .filter((c) => c.sala === sala && c.id !== exceto)
    .map((c) => c.slug);
}

/** Validações que valem para qualquer salvamento, inclusive o rascunho automático. */
function validarArtigoParaSalvar(f: FormArtigo, anterior?: ConteudoEditorial): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-titulo"] = "escreva o título para salvar o rascunho.";
  const erroIA = erroProvenienciaIA(f);
  if (erroIA) erros["campo-proveniencia"] = erroIA;
  const slugTravado = Boolean(anterior?.publicadoEm);
  if (!slugTravado && f.slug.trim()) {
    const erroSlug = validarSlug(f.slug.trim());
    if (erroSlug) erros["campo-slug"] = erroSlug;
    else if (f.sala && slugsOcupados(f.sala, f.id).includes(f.slug.trim())) {
      erros["campo-slug"] =
        "já existe um conteúdo com este endereço nesta Sala. Mude o final, por exemplo com -2.";
    }
  }
  return erros;
}

function montarArtigo(
  f: FormArtigo,
  anterior: ConteudoEditorial | undefined,
  quem: string,
  corpo: BlocoCorpo[],
  donoId?: string,
): ConteudoEditorial {
  const id = anterior?.id ?? f.id ?? novoId("c");
  const sala = f.sala as ConteudoEditorial["sala"];
  const slug = anterior?.publicadoEm
    ? anterior.slug
    : f.slug.trim() || slugUnico(gerarSlug(f.titulo), slugsOcupados(sala, id));
  const autoria = f.autoriaNaoIdentificada
    ? { nome: AUTORIA_NAO_IDENTIFICADA, credencial: f.autoria.credencial.trim() || "Texto anônimo" }
    : { nome: f.autoria.nome.trim(), credencial: f.autoria.credencial.trim() };

  let citacao: string | undefined;
  if (f.temCitacao) {
    citacao = anterior?.citacao ?? `cit-${id}`;
    const c = f.citacao;
    const registro: Citacao = {
      id: citacao,
      sala,
      obra: c.obra.trim(),
      localizacao: c.localizacao.trim(),
      proveniencia: "primaria",
      traducao: c.traducao.trim(),
      referencia: c.referencia.trim(),
      capa: salaPorSlugNoStore(sala)?.placa ?? "bordo",
      inicial: (c.obra.trim()[0] ?? "?").toUpperCase(),
    };
    if (c.rotuloTraducao.trim()) registro.rotuloTraducao = c.rotuloTraducao.trim();
    if (c.originalTexto.trim()) {
      registro.original = {
        texto: c.originalTexto.trim(),
        idioma: c.originalIdioma.trim(),
        lang: c.originalLang.trim(),
      };
    }
    acervo().citacoes.set(citacao, registro);
  } else if (anterior?.citacao) {
    // A citação deixa de ser usada por este conteúdo; o registro fica guardado.
    citacao = undefined;
  }

  const fontesValidas = f.fontes.filter((x) => acervo().fontes.has(x));
  const artigo: ConteudoEditorial = {
    id,
    slug,
    sala,
    tipo: f.tipo,
    titulo: f.titulo.trim(),
    resumo: f.resumo.trim(),
    temas: [...new Set(f.temas)],
    periodo: f.periodo.trim(),
    nivel: f.nivel ?? 1,
    formato: "texto",
    proveniencia: f.proveniencia ?? (f.producaoIA ? "ia" : "curado"),
    duracaoMin: Math.max(1, Math.round(f.duracaoMin ?? 1)),
    autoria,
    publicadoEm: anterior?.publicadoEm ?? "",
    corpo: limparCorpo(corpo),
    fontes: [...new Set(fontesValidas)],
    status: anterior?.status ?? "rascunho",
    criadoEm: anterior?.criadoEm ?? agora(),
    atualizadoEm: agora(),
    criadoPor: anterior?.criadoPor ?? quem,
    atualizadoPor: quem,
    situacaoJuridica: situacaoLimpa(f.situacaoJuridica),
    temaDivergente: Boolean(f.temaDivergente),
    notaDivergencia: f.notaDivergencia.trim(),
    producaoIA: Boolean(f.producaoIA),
  };
  if (citacao) artigo.citacao = citacao;
  const midia = (nova: string | null, atual?: string) =>
    nova && nova === atual ? atual : nova && donoId ? midiaDoDono(nova, donoId) : undefined;
  const card = midia(f.imagemCard, anterior?.midias?.card);
  const thumb = midia(f.thumb, anterior?.midias?.thumb);
  if (card || thumb) artigo.midias = { ...(card ? { card } : {}), ...(thumb ? { thumb } : {}) };
  if (card) artigo.imagem = urlDaMidia(card);
  if (thumb) artigo.thumb = urlDaMidia(thumb);
  return artigo;
}

function citacaoDe(a: ConteudoEditorial) {
  return a.citacao ? acervo().citacoes.get(a.citacao) : undefined;
}

export function salvarArtigo(
  f: FormArtigo,
  quem: string,
  modo: ModoSalvar,
  /** Id da conta que salva: as imagens enviadas para o corpo precisam ser dela. */
  donoId?: string,
): ResultadoAcao<{ id: string; slug: string; salvoEm: string; status: StatusEditorial }> {
  const anterior = f.id ? acervo().conteudos.get(f.id) : undefined;
  if (f.id && !anterior)
    return falha("Erro: este conteúdo não existe mais. Atualize a lista e tente de novo.");
  if (anterior?.revisao) return falha(ERRO_ITEM_DE_ANFITRIAO);
  const erroSala = conferirSala(f.sala, anterior?.sala);
  if (erroSala) return erroSala;
  if (f.proveniencia === "anfitriao") {
    return falha("Erro: confira os campos indicados.", {
      "campo-proveniencia": "a proveniência Anfitrião é só dos artigos de anfitrião.",
    });
  }
  if (anterior?.status === "arquivado") {
    return falha("Erro: conteúdo arquivado não é editado. Restaure-o para rascunho antes de editar.");
  }

  const imagens = conferirImagensDoCorpo(f.corpo, donoId, anterior?.corpo);
  const erros = { ...validarArtigoParaSalvar(f, anterior), ...imagens.erros };
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);

  // Item publicado só aceita alterações que mantêm o checklist completo.
  if (anterior?.status === "publicado") {
    const pendencias = checklistArtigo(f).filter((i) => i.estado === "pendente");
    if (pendencias.length) {
      return falha("Erro: a alteração deixaria o conteúdo publicado com pendências.", undefined, pendencias);
    }
  }

  const artigo = montarArtigo(f, anterior, quem, imagens.corpo, donoId);
  acervo().conteudos.set(artigo.id, artigo);

  if (!anterior) {
    registrar({ quem, acao: "criou", tipoItem: "artigo", itemId: artigo.id, itemTitulo: artigo.titulo });
  } else {
    const mudancas = [
      ["Título", anterior.titulo, artigo.titulo],
      ["Endereço", anterior.slug, artigo.slug],
      ["Sala", anterior.sala, artigo.sala],
      ["Tipo", anterior.tipo, artigo.tipo],
    ]
      .filter(([, a, b]) => a !== b)
      .map(([campo, antes, depois]) => ({ campo: campo ?? "", antes: antes ?? "", depois: depois ?? "" }));
    if (JSON.stringify(anterior.corpo) !== JSON.stringify(artigo.corpo)) {
      mudancas.push({
        campo: "Corpo",
        antes: plural(anterior.corpo.length, "bloco", "blocos"),
        depois: plural(artigo.corpo.length, "bloco", "blocos"),
      });
    }
    if (deveRegistrarEdicao(artigo.id, quem, modo) || mudancas.length) {
      registrar({
        quem,
        acao: "editou",
        tipoItem: "artigo",
        itemId: artigo.id,
        itemTitulo: artigo.titulo,
        mudancas,
      });
    }
    if (anterior.proveniencia !== artigo.proveniencia) {
      registrar({
        quem,
        acao: "alterou-proveniencia",
        tipoItem: "artigo",
        itemId: artigo.id,
        itemTitulo: artigo.titulo,
        mudancas: [
          {
            campo: "Proveniência",
            antes: PROVENIENCIA_ROTULO[anterior.proveniencia],
            depois: PROVENIENCIA_ROTULO[artigo.proveniencia],
          },
        ],
      });
    }
    if (rotuloSituacao(anterior.situacaoJuridica) !== rotuloSituacao(artigo.situacaoJuridica)) {
      registrar({
        quem,
        acao: "alterou-situacao-juridica",
        tipoItem: "artigo",
        itemId: artigo.id,
        itemTitulo: artigo.titulo,
        mudancas: [
          {
            campo: "Situação jurídica",
            antes: rotuloSituacao(anterior.situacaoJuridica),
            depois: rotuloSituacao(artigo.situacaoJuridica),
          },
        ],
      });
    }
  }

  return {
    ok: true,
    valor: { id: artigo.id, slug: artigo.slug, salvoEm: artigo.atualizadoEm, status: artigo.status },
    mensagem: modo === "manual" ? "Alterações salvas." : "Rascunho salvo.",
  };
}

export function mudarStatusArtigo(
  id: string,
  acao: AcaoStatus,
  quem: string,
): ResultadoAcao<StatusEditorial> {
  const artigo = acervo().conteudos.get(id);
  if (!artigo) return falha("Erro: este conteúdo não existe mais.");
  if (artigo.revisao) return falha(ERRO_ITEM_DE_ANFITRIAO);
  if (acao === "publicar") {
    const erroSala = conferirSala(artigo.sala, undefined);
    if (erroSala) return erroSala;
  }
  const regra = STATUS_DESTINO[acao];
  if (!regra.de.includes(artigo.status)) {
    return falha(`Erro: não é possível ${acao} um conteúdo com status “${artigo.status}”.`);
  }
  if (acao === "publicar") {
    // O checklist vale também no servidor: o botão bloqueado não basta (RNF-DOM-01, RNF-DOM-04).
    const pendencias = checklistArtigo(artigoParaForm(artigo, citacaoDe(artigo))).filter(
      (i) => i.estado === "pendente",
    );
    if (temPendencia(pendencias)) {
      return falha(
        "Erro: ainda há pendências no checklist. Resolva-as para publicar.",
        undefined,
        pendencias,
      );
    }
  }
  const atualizado: ConteudoEditorial = {
    ...artigo,
    status: regra.para,
    atualizadoEm: agora(),
    atualizadoPor: quem,
    publicadoEm: acao === "publicar" && !artigo.publicadoEm ? hoje() : artigo.publicadoEm,
  };
  acervo().conteudos.set(id, atualizado);
  // Saiu do publicado: deixa as vagas de Destaques, que voltam a ser automáticas.
  podarDestaques();
  registrar({
    quem,
    acao: regra.acao,
    tipoItem: "artigo",
    itemId: id,
    itemTitulo: artigo.titulo,
    mudancas: [{ campo: "Status", antes: artigo.status, depois: regra.para }],
  });
  const sala = salaPorSlugNoStore(artigo.sala)?.nome ?? "Sala";
  const mensagens: Record<AcaoStatus, string> = {
    publicar: `Publicado na Sala ${sala}.`,
    despublicar: "Voltou a rascunho e saiu do portal.",
    arquivar: "Arquivado. Nada foi apagado; você pode restaurar quando quiser.",
    restaurar: "Restaurado como rascunho.",
  };
  return { ok: true, valor: regra.para, mensagem: mensagens[acao] };
}

export function duplicarArtigo(id: string, quem: string): ResultadoAcao<{ id: string }> {
  const original = acervo().conteudos.get(id);
  if (!original) return falha("Erro: este conteúdo não existe mais.");
  if (original.revisao) return falha(ERRO_ITEM_DE_ANFITRIAO);
  const erroSala = conferirSala(original.sala, undefined);
  if (erroSala) return erroSala;
  const form = artigoParaForm(original, citacaoDe(original));
  const titulo = `Cópia de ${original.titulo}`.slice(0, 120);
  const copia = montarArtigo(
    {
      ...form,
      id: null,
      titulo,
      slug: slugUnico(gerarSlug(titulo), slugsOcupados(original.sala, null)),
    },
    undefined,
    quem,
    form.corpo,
  );
  acervo().conteudos.set(copia.id, copia);
  registrar({
    quem,
    acao: "duplicou",
    tipoItem: "artigo",
    itemId: copia.id,
    itemTitulo: copia.titulo,
    mudancas: [{ campo: "Origem", antes: original.titulo, depois: copia.titulo }],
  });
  return { ok: true, valor: { id: copia.id }, mensagem: "Cópia criada como rascunho." };
}

/**
 * "Mover para outra Sala": só para artigo que nunca foi publicado (o endereço
 * público inclui a Sala) e só entre Salas oficiais ativas. O endereço é
 * refeito se colidir na Sala de destino; vídeos da Sala antiga deixam de se
 * ligar a ele.
 */
export function moverArtigo(
  id: string,
  destino: string,
  quem: string,
): ResultadoAcao<{ sala: string; slug: string }> {
  const artigo = acervo().conteudos.get(id);
  if (!artigo) return falha("Erro: este conteúdo não existe mais.");
  if (artigo.revisao) return falha(ERRO_ITEM_DE_ANFITRIAO);
  if (artigo.publicadoEm) {
    return falha("Erro: artigo já publicado não muda de Sala, porque o endereço público inclui a Sala.");
  }
  if (destino === artigo.sala) return falha("Erro: o artigo já está nesta Sala.");
  const erro = erroDaSalaParaConteudo(destino);
  if (erro) return falha(`Erro: ${erro}`);
  const slug = slugUnico(artigo.slug, slugsOcupados(destino, id));
  const origem = salaPorSlugNoStore(artigo.sala)?.nome ?? artigo.sala;
  const nomeDestino = salaPorSlugNoStore(destino)?.nome ?? destino;
  acervo().conteudos.set(id, { ...artigo, sala: destino, slug, atualizadoEm: agora(), atualizadoPor: quem });
  if (artigo.citacao) {
    const c = acervo().citacoes.get(artigo.citacao);
    if (c) acervo().citacoes.set(c.id, { ...c, sala: destino });
  }
  for (const v of acervo().videos.values()) {
    if (v.artigos.includes(id))
      acervo().videos.set(v.id, { ...v, artigos: v.artigos.filter((a) => a !== id) });
  }
  registrar({
    quem,
    acao: "editou",
    tipoItem: "artigo",
    itemId: id,
    itemTitulo: artigo.titulo,
    mudancas: [{ campo: "Sala", antes: origem, depois: nomeDestino }],
  });
  return { ok: true, valor: { sala: destino, slug }, mensagem: `Artigo movido para a Sala ${nomeDestino}.` };
}

/**
 * Liga (ou desliga) um vídeo a um artigo da mesma Sala, a partir do editor do
 * artigo ("Ligar vídeo existente da Sala"). Vídeo publicado muda o portal na hora.
 */
export function ligarVideo(videoId: string, artigoId: string, ligar: boolean, quem: string): ResultadoAcao {
  const video = acervo().videos.get(videoId);
  const artigo = acervo().conteudos.get(artigoId);
  if (!video || !artigo) return falha("Erro: o vídeo ou o artigo não existe mais.");
  if (artigo.revisao) return falha(ERRO_ITEM_DE_ANFITRIAO);
  if (video.sala !== artigo.sala) return falha("Erro: o vídeo só se liga a artigos da mesma Sala.");
  if (video.status === "arquivado") return falha("Erro: vídeo arquivado não é ligado. Restaure-o antes.");
  const ja = video.artigos.includes(artigoId);
  if (ja === ligar) return { ok: true, valor: undefined, mensagem: "" };
  const artigos = ligar ? [...video.artigos, artigoId] : video.artigos.filter((a) => a !== artigoId);
  acervo().videos.set(videoId, { ...video, artigos, atualizadoEm: agora(), atualizadoPor: quem });
  registrar({
    quem,
    acao: "editou",
    tipoItem: "video",
    itemId: videoId,
    itemTitulo: video.titulo,
    mudancas: [
      { campo: "Artigos ligados", antes: ligar ? "" : artigo.titulo, depois: ligar ? artigo.titulo : "" },
    ],
  });
  return {
    ok: true,
    valor: undefined,
    mensagem: ligar ? "Vídeo ligado ao artigo." : "Vídeo desligado do artigo.",
  };
}

// ---------- vídeos ----------

function montarVideo(f: FormVideo, anterior: VideoEditorial | undefined, quem: string): VideoEditorial {
  const id = anterior?.id ?? f.id ?? novoId("v");
  const url = extrairIdYoutube(f.url);
  const sala = f.sala as VideoEditorial["sala"];
  const artigos = f.artigos.filter((a) => acervo().conteudos.get(a)?.sala === sala);
  return {
    id,
    sala,
    titulo: f.titulo.trim(),
    duracao: f.duracao.trim(),
    tema: (f.tema || "alma") as VideoEditorial["tema"],
    nivel: f.nivel ?? 1,
    episodio: f.episodio.trim(),
    publicadoEm: f.publicadoEm || anterior?.publicadoEm || hoje(),
    url: url.ok ? url.canonica : f.url.trim(),
    youtubeId: url.ok ? url.id : "",
    placa: f.placa,
    artigos: [...new Set(artigos)],
    status: anterior?.status ?? "rascunho",
    criadoEm: anterior?.criadoEm ?? agora(),
    atualizadoEm: agora(),
    criadoPor: anterior?.criadoPor ?? quem,
    atualizadoPor: quem,
  };
}

export function salvarVideo(
  f: FormVideo,
  quem: string,
  modo: ModoSalvar,
): ResultadoAcao<{ id: string; salvoEm: string; status: StatusEditorial }> {
  const anterior = f.id ? acervo().videos.get(f.id) : undefined;
  if (f.id && !anterior) return falha("Erro: este vídeo não existe mais.");
  if (anterior?.status === "arquivado")
    return falha("Erro: vídeo arquivado não é editado. Restaure-o antes.");
  const erroSala = conferirSala(f.sala, anterior?.sala);
  if (erroSala) return erroSala;
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-titulo"] = "escreva o título para salvar o rascunho.";
  if (f.url.trim()) {
    const url = extrairIdYoutube(f.url);
    if (!url.ok) erros["campo-url"] = url.erro;
  }
  if (f.duracao.trim()) {
    const erroDuracao = validarDuracao(f.duracao);
    if (erroDuracao) erros["campo-duracao"] = erroDuracao;
  }
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  if (anterior?.status === "publicado") {
    const pendencias = checklistVideo(f).filter((i) => i.estado === "pendente");
    if (pendencias.length)
      return falha("Erro: a alteração deixaria o vídeo publicado com pendências.", undefined, pendencias);
  }
  const video = montarVideo(f, anterior, quem);
  acervo().videos.set(video.id, video);
  if (!anterior)
    registrar({ quem, acao: "criou", tipoItem: "video", itemId: video.id, itemTitulo: video.titulo });
  else if (deveRegistrarEdicao(video.id, quem, modo)) {
    const mudancas =
      anterior.url !== video.url ? [{ campo: "URL", antes: anterior.url, depois: video.url }] : [];
    registrar({
      quem,
      acao: "editou",
      tipoItem: "video",
      itemId: video.id,
      itemTitulo: video.titulo,
      mudancas,
    });
  }
  return {
    ok: true,
    valor: { id: video.id, salvoEm: video.atualizadoEm, status: video.status },
    mensagem: modo === "manual" ? "Alterações salvas." : "Rascunho salvo.",
  };
}

export function mudarStatusVideo(id: string, acao: AcaoStatus, quem: string): ResultadoAcao<StatusEditorial> {
  const video = acervo().videos.get(id);
  if (!video) return falha("Erro: este vídeo não existe mais.");
  if (acao === "publicar") {
    const erroSala = conferirSala(video.sala, undefined);
    if (erroSala) return erroSala;
  }
  const regra = STATUS_DESTINO[acao];
  if (!regra.de.includes(video.status)) {
    return falha(`Erro: não é possível ${acao} um vídeo com status “${video.status}”.`);
  }
  if (acao === "publicar") {
    const pendencias = checklistVideo(videoParaForm(video)).filter((i) => i.estado === "pendente");
    if (pendencias.length)
      return falha("Erro: ainda há pendências no checklist do vídeo.", undefined, pendencias);
  }
  acervo().videos.set(id, { ...video, status: regra.para, atualizadoEm: agora(), atualizadoPor: quem });
  podarDestaques();
  registrar({
    quem,
    acao: regra.acao,
    tipoItem: "video",
    itemId: id,
    itemTitulo: video.titulo,
    mudancas: [{ campo: "Status", antes: video.status, depois: regra.para }],
  });
  const sala = salaPorSlugNoStore(video.sala)?.nome ?? "Sala";
  const mensagens: Record<AcaoStatus, string> = {
    publicar: `Vídeo publicado na Sala ${sala}.`,
    despublicar: "Vídeo voltou a rascunho e saiu do portal.",
    arquivar: "Vídeo arquivado. Nada foi apagado.",
    restaurar: "Vídeo restaurado como rascunho.",
  };
  return { ok: true, valor: regra.para, mensagem: mensagens[acao] };
}

// ---------- fontes ----------

const ERRO_FONTE_PROPOSTA =
  "Erro: esta fonte foi proposta por um anfitrião e ainda está em revisão com o artigo que a usa.";

const TIPOS_FONTE = ["Fonte primária", "Tradução comentada", "Estudo acadêmico", "Edição crítica"] as const;

export function salvarFonte(f: FormFonte, quem: string): ResultadoAcao<{ id: string }> {
  const anterior = f.id ? acervo().fontes.get(f.id) : undefined;
  if (f.id && !anterior) return falha("Erro: esta fonte não existe mais.");
  if (anterior?.proposta?.pendente) return falha(ERRO_FONTE_PROPOSTA);
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-fonte-titulo"] = "escreva o título da obra.";
  if (!f.autor.trim())
    erros["campo-fonte-autor"] = "escreva o autor, editor ou tradutor, com o papel entre parênteses.";
  if (!f.tradicao.trim()) erros["campo-fonte-tradicao"] = "diga a tradição ou o corpus da obra.";
  if (!f.referencia.trim())
    erros["campo-fonte-referencia"] = "escreva editora e ano, ou o documento de origem.";
  if (!TIPOS_FONTE.includes(f.tipo)) erros["campo-fonte-tipo"] = "escolha o tipo de fonte.";
  if (f.url.trim() && !/^https?:\/\/[^\s]+\.[^\s]+/.test(f.url.trim())) {
    erros["campo-fonte-url"] = "use um endereço completo, começando por https://";
  }
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  const id =
    anterior?.id ?? (gerarSlug(`${f.autor.split(" ")[0] ?? ""} ${f.titulo}`).slice(0, 40) || novoId("f"));
  const idFinal = !anterior && acervo().fontes.has(id) ? `${id}-${Date.now().toString(36)}` : id;
  const fonte: FonteEditorial = {
    id: idFinal,
    titulo: f.titulo.trim(),
    autor: f.autor.trim(),
    tradicao: f.tradicao.trim(),
    tipo: f.tipo,
    referencia: f.referencia.trim(),
    capa: f.capa,
    inicial: (f.inicial.trim() || f.titulo.trim()[0] || "?").slice(0, 1).toUpperCase(),
    criadoEm: anterior?.criadoEm ?? agora(),
    atualizadoEm: agora(),
    criadoPor: anterior?.criadoPor ?? quem,
    atualizadoPor: quem,
  };
  if (f.url.trim()) fonte.url = f.url.trim();
  acervo().fontes.set(fonte.id, fonte);
  registrar({
    quem,
    acao: anterior ? "editou" : "criou",
    tipoItem: "fonte",
    itemId: fonte.id,
    itemTitulo: fonte.titulo,
  });
  return {
    ok: true,
    valor: { id: fonte.id },
    mensagem: anterior ? "Fonte atualizada." : "Fonte cadastrada.",
  };
}

/** Fonte citada por conteúdo publicado não é excluída (RNF-DOM-01); só editada. */
export function excluirFonte(id: string, quem: string): ResultadoAcao {
  const fonte = acervo().fontes.get(id);
  if (!fonte) return falha("Erro: esta fonte não existe mais.");
  if (fonte.proposta?.pendente) return falha(ERRO_FONTE_PROPOSTA);
  const conteudos = [...acervo().conteudos.values()].filter((c) => c.fontes.includes(id));
  const publicados = conteudos.filter((c) => c.status === "publicado");
  if (publicados.length) {
    return falha(
      `Erro: a fonte é citada por ${publicados.length} conteúdo(s) publicado(s). Edite a fonte ou retire-a desses conteúdos antes.`,
    );
  }
  for (const c of conteudos) {
    acervo().conteudos.set(c.id, {
      ...c,
      fontes: c.fontes.filter((f) => f !== id),
      atualizadoEm: agora(),
      atualizadoPor: quem,
    });
  }
  acervo().fontes.delete(id);
  registrar({
    quem,
    acao: "excluiu",
    tipoItem: "fonte",
    itemId: id,
    itemTitulo: fonte.titulo,
    mudancas: conteudos.length
      ? [{ campo: "Retirada de rascunhos", antes: String(conteudos.length), depois: "0" }]
      : [],
  });
  return { ok: true, valor: undefined, mensagem: "Fonte excluída." };
}
