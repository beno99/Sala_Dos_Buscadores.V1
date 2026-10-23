import "server-only";
import type { SalaEditorial, StatusEditorial } from "@/data/types";
import {
  checklistSala,
  type FormSalaOficial,
  motivoForaDoAr,
  slugDaSala,
  validarSalaOficial,
} from "@/features/admin/regras/sala";
import { slugUnico } from "@/features/admin/regras/slug";
import { salaVisivel } from "@/features/anfitriao/regras/visibilidade";
import type { Membro } from "@/features/auth/contas";
import { registrar } from "../auditoria";
import { midiaDoDono, urlDaMidia } from "../midia";
import { acervo } from "../store";
import type { ModoSalvar, ResultadoAcao } from "./editorial";

/*
 * Salas oficiais (curadoria a partir da Sala). A curadoria cria a Sala
 * primeiro; artigos e vídeos nascem dentro dela. O ciclo é rascunho,
 * publicado e arquivado, publicado direto, sem fila. Arquivar nunca exclui:
 * tira do ar a Sala e tudo o que está nela de uma vez, sem mudar o status de
 * cada item; restaurar devolve tudo como estava.
 */

const agora = () => new Date().toISOString();
const hoje = () => agora().slice(0, 10);
const novoId = () => `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const falha = (mensagem: string, erros?: Record<string, string>) => ({ ok: false, mensagem, erros }) as const;

// ---------- leitura ----------

/** Sala pelo slug, de qualquer origem e status (a curadoria vê tudo). */
export function salaPorSlugNoStore(slug: string): SalaEditorial | undefined {
  for (const s of acervo().salas.values()) if (s.slug === slug) return s;
  return undefined;
}

/** Sala oficial pelo slug, em qualquer status. */
export function salaOficial(slug: string): SalaEditorial | undefined {
  const s = salaPorSlugNoStore(slug);
  return s?.origem === "oficial" ? s : undefined;
}

/**
 * A Sala em que a curadoria cria ou edita um artigo ou vídeo: tem de existir,
 * ser oficial e não estar arquivada. Devolve o erro na voz da casa, ou null.
 */
export function erroDaSalaParaConteudo(slug: string | null | undefined): string | null {
  if (!slug) return "escolha a Sala: nada se cria fora de uma Sala.";
  const s = salaPorSlugNoStore(slug);
  if (!s) return "esta Sala não existe. Abra a Sala em Curadoria › Salas e crie o item dentro dela.";
  if (s.origem !== "oficial") return "esta Sala é de um anfitrião: a curadoria revisa, mas não escreve nela.";
  if (s.status === "arquivado") return "esta Sala está arquivada. Restaure a Sala para trabalhar nela.";
  return null;
}

function itensDaSala(slug: string) {
  const artigos = [...acervo().conteudos.values()].filter(
    (c) => c.sala === slug && (c.tipo === "artigo" || c.tipo === "fonte-primaria"),
  );
  const videos = [...acervo().videos.values()].filter((v) => v.sala === slug);
  return { artigos, videos };
}

export interface ResumoSalaAdmin {
  sala: SalaEditorial;
  artigos: { publicados: number; total: number };
  videos: number;
  visivel: boolean;
  /** Por que não está no portal ("Sem artigo publicado", "Arquivada"…); null quando está. */
  foraDoAr: string | null;
  /** Nome do anfitrião, nas Salas de anfitrião. */
  anfitriao?: string;
  /** Conta do anfitrião, para o link de revisão. */
  donoId?: string;
}

export function resumirSalaAdmin(sala: SalaEditorial): ResumoSalaAdmin {
  const { artigos, videos } = itensDaSala(sala.slug);
  const publicados = artigos.filter((a) => a.status === "publicado").length;
  const visivel = salaVisivel(sala, acervo().conteudos.values());
  return {
    sala: structuredClone(sala),
    artigos: { publicados, total: artigos.length },
    videos: videos.filter((v) => v.status !== "arquivado").length,
    visivel,
    foraDoAr: visivel ? null : motivoForaDoAr(sala, publicados),
    anfitriao: sala.anfitriao?.nome,
    donoId: sala.revisao?.donoId,
  };
}

/** Todas as Salas (oficiais e de anfitriões, de qualquer status), oficiais primeiro e pelo nome. */
export function listarSalasAdmin(): ResumoSalaAdmin[] {
  return [...acervo().salas.values()]
    .sort(
      (a, b) =>
        (a.origem === "oficial" ? 0 : 1) - (b.origem === "oficial" ? 0 : 1) ||
        a.nome.localeCompare(b.nome, "pt-BR"),
    )
    .map(resumirSalaAdmin);
}

/** Salas oficiais ativas (não arquivadas), para "Mover para outra Sala". */
export function salasOficiaisAtivas(): { slug: string; nome: string }[] {
  return [...acervo().salas.values()]
    .filter((s) => s.origem === "oficial" && s.status !== "arquivado")
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map((s) => ({ slug: s.slug, nome: s.nome }));
}

export function salaParaForm(s: SalaEditorial): FormSalaOficial {
  return {
    id: s.id,
    nome: s.nome,
    slug: s.slug,
    tradicao: s.tradicao,
    tradicaoCurta: s.tradicaoCurta,
    descricao: s.descricao,
    periodo: s.periodo,
    placa: s.placa,
    inicial: s.inicial,
    imagem: s.midia ?? null,
    link: s.link ?? "",
  };
}

// ---------- escrita ----------

function slugsDeOutras(id: string | null): string[] {
  return [...acervo().salas.values()].filter((s) => s.id !== id).map((s) => s.slug);
}

export function salvarSalaOficial(
  f: FormSalaOficial,
  admin: Pick<Membro, "id" | "pseudonimo">,
  modo: ModoSalvar,
): ResultadoAcao<{ id: string; slug: string; salvoEm: string; status: StatusEditorial }> {
  const quem = admin.pseudonimo;
  const anterior = f.id ? acervo().salas.get(f.id) : undefined;
  if (f.id && !anterior) return falha("Erro: esta Sala não existe mais. Atualize a lista e tente de novo.");
  if (anterior && anterior.origem !== "oficial") {
    return falha(
      "Erro: esta Sala é de um anfitrião. A curadoria aprova ou reprova em Revisão de anfitriões.",
    );
  }
  if (anterior?.status === "arquivado") {
    return falha("Erro: Sala arquivada não é editada. Restaure a Sala antes de editar.");
  }
  const slugTravado = Boolean(anterior?.publicadaEm);
  const erros = validarSalaOficial(f, slugsDeOutras(anterior?.id ?? null), slugTravado);
  if (Object.keys(erros).length) return falha("Erro: confira os campos indicados.", erros);
  if (anterior?.status === "publicado") {
    if (modo === "automatico") {
      return falha("Erro: Sala publicada só muda com “Salvar alterações”, porque o portal atualiza na hora.");
    }
    const pendencias = checklistSala(f).filter((i) => i.estado === "pendente");
    if (pendencias.length) {
      return falha(
        `Erro: a alteração deixaria a Sala publicada sem ${pendencias.map((p) => p.rotulo.toLowerCase()).join(", ")}.`,
      );
    }
  }

  const nome = f.nome.trim();
  const id = anterior?.id ?? novoId();
  const slug = slugTravado
    ? (anterior?.slug ?? "")
    : slugUnico(f.slug.trim() || slugDaSala(nome) || "sala", slugsDeOutras(id));
  const imagem = midiaDoDono(f.imagem, admin.id);
  const momento = agora();
  const sala: SalaEditorial = {
    id,
    slug,
    nome,
    tradicao: f.tradicao.trim(),
    tradicaoCurta: f.tradicaoCurta.trim(),
    descricao: f.descricao.trim(),
    periodo: f.periodo.trim(),
    placa: f.placa,
    atualizadaEm: hoje(),
    inicial: (f.inicial.trim() || nome[0] || "S").toUpperCase(),
    origem: "oficial",
    naComparacao: true,
    status: anterior?.status ?? "rascunho",
    criadoEm: anterior?.criadoEm ?? momento,
    atualizadoEm: momento,
    criadoPor: anterior?.criadoPor ?? quem,
    atualizadoPor: quem,
  };
  if (anterior?.publicadaEm) sala.publicadaEm = anterior.publicadaEm;
  if (f.link.trim()) sala.link = new URL(f.link.trim()).toString();
  if (imagem) {
    sala.midia = imagem;
    sala.imagem = urlDaMidia(imagem);
  }
  acervo().salas.set(id, sala);

  // Antes da primeira publicação, o endereço acompanha o nome: os itens da Sala vão junto.
  if (anterior && anterior.slug !== slug) {
    for (const c of acervo().conteudos.values())
      if (c.sala === anterior.slug) acervo().conteudos.set(c.id, { ...c, sala: slug });
    for (const v of acervo().videos.values())
      if (v.sala === anterior.slug) acervo().videos.set(v.id, { ...v, sala: slug });
    for (const c of acervo().citacoes.values())
      if (c.sala === anterior.slug) acervo().citacoes.set(c.id, { ...c, sala: slug });
  }

  if (!anterior) registrar({ quem, acao: "criou", tipoItem: "sala", itemId: id, itemTitulo: nome });
  else if (modo === "manual" || anterior.nome !== nome || anterior.slug !== slug) {
    const mudancas = [
      ["Nome", anterior.nome, nome],
      ["Endereço", anterior.slug, slug],
    ]
      .filter(([, a, b]) => a !== b)
      .map(([campo, antes, depois]) => ({ campo: campo ?? "", antes: antes ?? "", depois: depois ?? "" }));
    registrar({ quem, acao: "editou", tipoItem: "sala", itemId: id, itemTitulo: nome, mudancas });
  }
  return {
    ok: true,
    valor: { id, slug, salvoEm: momento, status: sala.status },
    mensagem: modo === "manual" ? "Alterações salvas." : "Rascunho salvo.",
  };
}

export type AcaoSala = "publicar" | "arquivar" | "restaurar";

/** Quantos itens saem do ar se a Sala for arquivada agora (para o Modal de confirmação). */
export function impactoDeArquivar(slug: string): { artigos: number; videos: number } {
  const s = salaOficial(slug);
  if (!s || !salaVisivel(s, acervo().conteudos.values())) return { artigos: 0, videos: 0 };
  const { artigos, videos } = itensDaSala(slug);
  return {
    artigos: artigos.filter((a) => a.status === "publicado").length,
    videos: videos.filter((v) => v.status === "publicado").length,
  };
}

export function mudarStatusSala(
  id: string,
  acao: AcaoSala,
  quem: string,
): ResultadoAcao<{ status: StatusEditorial; foraDoAr?: { artigos: number; videos: number } }> {
  const sala = acervo().salas.get(id);
  if (!sala) return falha("Erro: esta Sala não existe mais.");
  if (sala.origem !== "oficial") {
    return falha("Erro: esta Sala é de um anfitrião. A curadoria decide em Revisão de anfitriões.");
  }
  const momento = agora();
  if (acao === "publicar") {
    if (sala.status !== "rascunho")
      return falha(`Erro: só Sala em rascunho é publicada; esta está ${sala.status}.`);
    const pendencias = checklistSala(salaParaForm(sala)).filter((i) => i.estado === "pendente");
    if (pendencias.length) {
      return falha(
        `Erro: falta ${pendencias.map((p) => p.rotulo.toLowerCase()).join(", ")} para publicar a Sala.`,
      );
    }
    acervo().salas.set(id, {
      ...sala,
      status: "publicado",
      publicadaEm: sala.publicadaEm ?? hoje(),
      atualizadaEm: hoje(),
      atualizadoEm: momento,
      atualizadoPor: quem,
    });
    registrar({
      quem,
      acao: "publicou",
      tipoItem: "sala",
      itemId: id,
      itemTitulo: sala.nome,
      mudancas: [{ campo: "Status", antes: sala.status, depois: "publicado" }],
    });
    const comArtigo = impactoDeArquivar(sala.slug).artigos > 0;
    return {
      ok: true,
      valor: { status: "publicado" },
      mensagem: comArtigo
        ? `Sala ${sala.nome} publicada e no portal.`
        : `Sala ${sala.nome} publicada. Ela aparece no portal quando tiver um artigo publicado.`,
    };
  }
  if (acao === "arquivar") {
    if (sala.status === "arquivado") return falha("Erro: esta Sala já está arquivada.");
    const foraDoAr = impactoDeArquivar(sala.slug);
    acervo().salas.set(id, {
      ...sala,
      status: "arquivado",
      statusAntesDeArquivar: sala.status,
      atualizadoEm: momento,
      atualizadoPor: quem,
    });
    registrar({
      quem,
      acao: "arquivou",
      tipoItem: "sala",
      itemId: id,
      itemTitulo: sala.nome,
      mudancas: [{ campo: "Status", antes: sala.status, depois: "arquivado" }],
    });
    const n = foraDoAr.artigos + foraDoAr.videos;
    return {
      ok: true,
      valor: { status: "arquivado", foraDoAr },
      mensagem: n
        ? `Sala arquivada. ${n} ${n === 1 ? "item saiu" : "itens saíram"} do ar; nada foi apagado.`
        : "Sala arquivada. Nada foi apagado.",
    };
  }
  if (sala.status !== "arquivado") return falha("Erro: só Sala arquivada é restaurada.");
  const volta = sala.statusAntesDeArquivar ?? "rascunho";
  const { statusAntesDeArquivar: _antes, ...semAntes } = sala;
  acervo().salas.set(id, { ...semAntes, status: volta, atualizadoEm: momento, atualizadoPor: quem });
  registrar({
    quem,
    acao: "restaurou",
    tipoItem: "sala",
    itemId: id,
    itemTitulo: sala.nome,
    mudancas: [{ campo: "Status", antes: "arquivado", depois: volta }],
  });
  return {
    ok: true,
    valor: { status: volta },
    mensagem: "Sala restaurada. Os artigos e vídeos voltam como estavam.",
  };
}
