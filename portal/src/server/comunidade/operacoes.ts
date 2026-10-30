import "server-only";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { publicacaoComunidadePorId } from "@/data/repositorio";
import type {
  AlvoComunidade,
  ComentarioComunidade,
  DenunciaComunidade,
  EstadoComunidade,
  MotivoDenunciaComunidade,
  Publicacao,
  TipoPublicacao,
  TipoReacaoComunidade,
} from "@/data/types";
import {
  dentroDoLimiteDiario,
  LIMITES_COMUNIDADE,
  MOTIVOS_DENUNCIA,
  normalizarTextoComunidade,
  podeEditarPublicacao,
  podeOcultarComentario,
  podeTransitar,
  validarComentario,
  validarPublicacao,
} from "@/features/comunidade/regras";
import type { Membro } from "@/modules/conta/conta.contratos";
import { agora, erro, novoId, ok, type ResultadoAcao } from "../anfitriao/comum";
import { registrar } from "../auditoria";
import { enviarEmail, URL_PUBLICA } from "../caixa-saida";
import { midiaDoDono, urlDaMidia } from "../midia";
import { acervo, alternarReacao, alternarSalvo, alternarSeguir, contaNoDiretorio } from "../store";

/*
 * Escrita da Comunidade. Recebe a conta já identificada pela Server Action e
 * confere aqui posse, papel e estado: o que a interface esconde não protege.
 * Tudo que vem do formulário é tratado como não confiável.
 */

export interface FormPublicacao {
  tipo: TipoPublicacao;
  texto: string;
  salaSlug?: string;
  temas: string[];
  imagemId?: string;
  imagemAlt?: string;
  citacao?: { trecho: string; obra: string; passagem: string };
  conteudoId?: string;
  dirigirAoAnfitriao?: boolean;
}

type CamposPublicacao = Pick<
  Publicacao,
  "tipo" | "texto" | "salaSlug" | "temas" | "imagem" | "citacao" | "conteudoId" | "perguntaDirigidaA"
>;

const dados = () => acervo().comunidade;
const limpo = (v: unknown) => normalizarTextoComunidade(String(v ?? ""));
const donoDaSala = (slug?: string) =>
  [...acervo().salas.values()].find((s) => s.slug === slug)?.revisao?.donoId;
const rotulo = (texto: string) => texto.slice(0, 80);

function lerPublicacao(form: FormPublicacao, autorId: string): CamposPublicacao | string {
  const conteudo = form.tipo === "achado" ? acervo().conteudos.get(String(form.conteudoId)) : undefined;
  if (form.tipo === "achado" && (conteudo?.status !== "publicado" || !salaPorSlug(conteudo.sala)))
    return "escolha um conteúdo publicado do acervo.";
  const salaSlug = conteudo?.sala ?? (limpo(form.salaSlug) || undefined);
  if (salaSlug && !salaPorSlug(salaSlug)) return "escolha uma Sala disponível.";
  const temas = Array.isArray(form.temas) ? form.temas.map(String) : [];
  if (temas.some((t) => !temaPorSlug(t))) return "escolha temas da lista.";
  const imagemId = midiaDoDono(form.imagemId, autorId);
  if (form.imagemId && !imagemId) return "envie a imagem de novo.";
  const alt = limpo(form.imagemAlt);
  if (imagemId && (!alt || alt.length > LIMITES_COMUNIDADE.descricaoImagem))
    return "descreva a imagem em até 200 caracteres.";
  const dono =
    form.tipo === "pergunta" && form.dirigirAoAnfitriao === true ? donoDaSala(salaSlug) : undefined;
  const campos: CamposPublicacao = {
    tipo: form.tipo,
    texto: limpo(form.texto),
    salaSlug,
    temas,
    imagem: imagemId ? { src: urlDaMidia(imagemId), alt } : undefined,
    citacao:
      form.tipo === "citacao"
        ? {
            trecho: limpo(form.citacao?.trecho),
            obra: limpo(form.citacao?.obra),
            passagem: limpo(form.citacao?.passagem),
          }
        : undefined,
    conteudoId: conteudo?.id,
    perguntaDirigidaA: dono,
  };
  const [primeiro] = validarPublicacao(campos);
  return primeiro ? primeiro.charAt(0).toLowerCase() + primeiro.slice(1) : campos;
}

function avisarAnfitriao(p: Publicacao, autor: Membro) {
  const donoId = donoDaSala(p.salaSlug);
  const dono = donoId && donoId !== autor.id ? contaNoDiretorio(donoId) : null;
  if (!dono) return;
  enviarEmail({
    para: dono.email,
    assunto: `Nova pergunta em ${salaPorSlug(p.salaSlug as string)?.nome ?? "sua Sala"}`,
    corpo: `${autor.pseudonimo} fez uma pergunta na sua Sala.\n\n${URL_PUBLICA}/comunidade/p/${p.id}`,
  });
}

export function publicar(form: FormPublicacao, autor: Membro): ResultadoAcao<{ id: string }> {
  const registros = [...dados().publicacoes.values()];
  if (!dentroDoLimiteDiario("publicacao", autor.id, registros, new Date()))
    return erro("você chegou ao limite de 10 publicações por dia.");
  const campos = lerPublicacao(form, autor.id);
  if (typeof campos === "string") return erro(campos);
  const p: Publicacao = {
    ...campos,
    id: novoId("p"),
    autorId: autor.id,
    fixada: false,
    estado: "visivel",
    criadaEm: agora(),
  };
  dados().publicacoes.set(p.id, p);
  if (p.tipo === "pergunta") avisarAnfitriao(p, autor);
  return ok({ id: p.id }, "Publicação compartilhada.");
}

export function editarPublicacao(
  id: string,
  form: FormPublicacao,
  autor: Membro,
): ResultadoAcao<{ id: string }> {
  const atual = dados().publicacoes.get(id);
  if (!atual || !podeEditarPublicacao(autor.id, atual)) return erro("só o autor edita a publicação.");
  const campos = lerPublicacao({ ...form, tipo: atual.tipo }, autor.id);
  if (typeof campos === "string") return erro(campos);
  dados().publicacoes.set(id, { ...atual, ...campos, editadaEm: agora() });
  return ok({ id }, "Publicação atualizada.");
}

export function excluirPublicacao(id: string, autor: Membro): ResultadoAcao {
  const p = dados().publicacoes.get(id);
  if (!p || !podeTransitar(p.estado, "removida", autor.papel, p.autorId === autor.id))
    return erro("só o autor exclui a publicação.");
  dados().publicacoes.set(id, { ...p, estado: "removida" });
  return ok(undefined, "Publicação excluída.");
}

export function comentar(
  publicacaoId: string,
  texto: string,
  paiId: string | undefined,
  autor: Membro,
): ResultadoAcao<{ id: string }> {
  if (!publicacaoComunidadePorId(publicacaoId)) return erro("esta publicação não está disponível.");
  const pai = paiId ? dados().comentarios.get(paiId) : undefined;
  if (paiId && !pai) return erro("este comentário não está disponível.");
  const [problema] = validarComentario(texto, pai, publicacaoId);
  if (problema) return erro(problema.charAt(0).toLowerCase() + problema.slice(1));
  if (!dentroDoLimiteDiario("comentario", autor.id, [...dados().comentarios.values()], new Date()))
    return erro("você chegou ao limite de 60 comentários por dia.");
  const c: ComentarioComunidade = {
    id: novoId("k"),
    publicacaoId,
    autorId: autor.id,
    paiId,
    texto: limpo(texto),
    estado: "visivel",
    criadaEm: agora(),
  };
  dados().comentarios.set(c.id, c);
  return ok({ id: c.id }, "Comentário publicado.");
}

export function excluirComentario(id: string, autor: Membro): ResultadoAcao {
  const c = dados().comentarios.get(id);
  if (!c || !podeTransitar(c.estado, "removida", autor.papel, c.autorId === autor.id))
    return erro("só o autor exclui o comentário.");
  dados().comentarios.set(id, { ...c, estado: "removida" });
  return ok(undefined, "Comentário excluído.");
}

function alvoVisivel(alvo: AlvoComunidade): boolean {
  if (alvo?.tipo === "publicacao") return Boolean(publicacaoComunidadePorId(alvo.id));
  if (alvo?.tipo !== "comentario") return false;
  const c = dados().comentarios.get(alvo.id);
  return c?.estado === "visivel" && Boolean(publicacaoComunidadePorId(c.publicacaoId));
}

export function reagir(
  alvo: AlvoComunidade,
  tipo: TipoReacaoComunidade,
  pessoa: Membro,
): ResultadoAcao<{ ativa: boolean }> {
  if (!["curtir", "util", "pensar", "aprofundar"].includes(tipo)) return erro("reação inválida.");
  if (!alvoVisivel(alvo)) return erro("este item não está disponível.");
  return ok({ ativa: alternarReacao({ alvo, pessoa: pessoa.id, tipo }) }, "");
}

export function salvar(publicacaoId: string, pessoa: Membro): ResultadoAcao<{ ativo: boolean }> {
  if (!publicacaoComunidadePorId(publicacaoId)) return erro("esta publicação não está disponível.");
  const ativo = alternarSalvo({ pessoa: pessoa.id, publicacaoId, criadoEm: agora() });
  return ok({ ativo }, ativo ? "Publicação salva." : "Publicação removida dos salvos.");
}

export function seguir(
  alvo: { tipo: "pessoa" | "sala"; id: string },
  pessoa: Membro,
): ResultadoAcao<{ ativo: boolean }> {
  const existe =
    alvo?.tipo === "pessoa" ? contaNoDiretorio(alvo.id) : alvo?.tipo === "sala" && salaPorSlug(alvo.id);
  if (!existe || (alvo.tipo === "pessoa" && alvo.id === pessoa.id)) return erro("não é possível acompanhar.");
  const ativo = alternarSeguir({ seguidor: pessoa.id, alvo: { tipo: alvo.tipo, id: alvo.id } });
  return ok({ ativo }, ativo ? "Agora você acompanha." : "Você deixou de acompanhar.");
}

export function marcarRespostaQueAjudou(
  publicacaoId: string,
  comentarioId: string,
  autor: Membro,
): ResultadoAcao {
  const p = dados().publicacoes.get(publicacaoId);
  const c = dados().comentarios.get(comentarioId);
  if (p?.autorId !== autor.id || p.tipo !== "pergunta" || p.estado !== "visivel")
    return erro("só o autor da pergunta marca a resposta.");
  if (c?.publicacaoId !== publicacaoId || c.estado !== "visivel")
    return erro("este comentário não está disponível.");
  const marcada = p.respostaQueAjudouId !== comentarioId;
  dados().publicacoes.set(publicacaoId, { ...p, respostaQueAjudouId: marcada ? comentarioId : undefined });
  return ok(undefined, marcada ? "Resposta marcada." : "Marcação removida.");
}

export function denunciar(
  alvo: AlvoComunidade,
  motivo: MotivoDenunciaComunidade,
  nota: string | undefined,
  pessoa: Membro,
): ResultadoAcao {
  if (!Object.hasOwn(MOTIVOS_DENUNCIA, motivo)) return erro("escolha um motivo.");
  if (!alvoVisivel(alvo)) return erro("este item não está disponível.");
  const autorId =
    alvo.tipo === "publicacao"
      ? dados().publicacoes.get(alvo.id)?.autorId
      : dados().comentarios.get(alvo.id)?.autorId;
  if (autorId === pessoa.id) return erro("não é possível denunciar o próprio texto.");
  const obs = limpo(nota);
  if (obs.length > LIMITES_COMUNIDADE.nota) return erro("escreva até 500 caracteres.");
  const repetida = [...dados().denuncias.values()].some(
    (d) =>
      d.denuncianteId === pessoa.id &&
      d.alvo.tipo === alvo.tipo &&
      d.alvo.id === alvo.id &&
      d.estado === "pendente",
  );
  if (!repetida) {
    const d: DenunciaComunidade = {
      id: novoId("d"),
      denuncianteId: pessoa.id,
      alvo: { tipo: alvo.tipo, id: alvo.id },
      motivo,
      nota: obs || undefined,
      estado: "pendente",
      criadaEm: agora(),
    };
    dados().denuncias.set(d.id, d);
  }
  return ok(undefined, "Denúncia recebida. A curadoria vai analisar.");
}

function trocarEstado(alvo: AlvoComunidade, para: EstadoComunidade, motivo: string, quem: Membro) {
  const item =
    alvo.tipo === "publicacao" ? dados().publicacoes.get(alvo.id) : dados().comentarios.get(alvo.id);
  if (!item) return;
  if (alvo.tipo === "publicacao") dados().publicacoes.set(alvo.id, { ...(item as Publicacao), estado: para });
  else dados().comentarios.set(alvo.id, { ...(item as ComentarioComunidade), estado: para });
  registrar({
    quem: quem.pseudonimo,
    acao: para === "oculta" ? "ocultou" : "restaurou",
    tipoItem: alvo.tipo,
    itemId: alvo.id,
    itemTitulo: rotulo(item.texto),
    mudancas: [{ campo: "motivo", antes: item.estado, depois: motivo }],
  });
}

/** Anfitrião da Sala ou curadoria: esconde um comentário, com motivo registrado. */
export function ocultarComentario(id: string, motivo: string, quem: Membro): ResultadoAcao {
  const c = dados().comentarios.get(id);
  const p = c && dados().publicacoes.get(c.publicacaoId);
  if (!c || !p || !podeOcultarComentario(quem.papel, quem.id, donoDaSala(p.salaSlug)))
    return erro("só o anfitrião da Sala ou a curadoria ocultam comentários.");
  if (c.estado !== "visivel") return erro("este comentário não está visível.");
  const razao = limpo(motivo);
  if (!razao) return erro("informe o motivo.");
  trocarEstado({ tipo: "comentario", id }, "oculta", razao, quem);
  return ok(undefined, "Comentário ocultado.");
}

/** Só a curadoria (a Server Action exige administrador; a transição confere de novo). */
export function moderar(
  alvo: AlvoComunidade,
  para: "visivel" | "oculta",
  motivo: string,
  admin: Membro,
): ResultadoAcao {
  const item =
    alvo?.tipo === "publicacao"
      ? dados().publicacoes.get(alvo.id)
      : alvo?.tipo === "comentario"
        ? dados().comentarios.get(alvo.id)
        : undefined;
  if (!item || !podeTransitar(item.estado, para, admin.papel, false))
    return erro("este item não permite essa mudança.");
  const razao = limpo(motivo);
  if (!razao) return erro("informe o motivo.");
  trocarEstado(alvo, para, razao, admin);
  return ok(undefined, para === "oculta" ? "Item ocultado." : "Item restaurado.");
}

export function decidirDenuncia(
  id: string,
  decisao: "procedente" | "improcedente",
  motivo: string,
  admin: Membro,
): ResultadoAcao {
  const denuncia = dados().denuncias.get(id);
  if (denuncia?.estado !== "pendente") return erro("esta denúncia já foi decidida.");
  if (decisao !== "procedente" && decisao !== "improcedente") return erro("decisão inválida.");
  const razao = limpo(motivo);
  if (!razao) return erro("informe o motivo.");
  if (decisao === "procedente") {
    const r = moderar(denuncia.alvo, "oculta", razao, admin);
    if (!r.ok) return r;
  }
  for (const d of dados().denuncias.values()) {
    if (d.estado === "pendente" && d.alvo.tipo === denuncia.alvo.tipo && d.alvo.id === denuncia.alvo.id)
      dados().denuncias.set(d.id, {
        ...d,
        estado: decisao,
        decididaPor: admin.pseudonimo,
        motivoDecisao: razao,
      });
  }
  return ok(undefined, "Decisão registrada.");
}
