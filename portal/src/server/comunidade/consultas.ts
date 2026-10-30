import "server-only";
import { salaPorSlug, temaPorSlug, todasAsSalas, todosOsTemas } from "@/data/catalogo";
import {
  acervoDeEstudo,
  pessoaPublicaComunidade,
  pessoasPublicasComunidade,
  publicacoesVisiveisComunidade,
} from "@/data/repositorio";
import { emDebate, ordenarFeed, type VisaoComunidade } from "@/features/comunidade/regras";
import { nivelNoAssunto } from "@/features/estudo/niveis";
import { progressoDe } from "@/server/progresso";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";
import { acervo } from "@/server/store";

export interface OpcoesCompositor {
  salas: { slug: string; nome: string; anfitriao?: string }[];
  temas: { slug: string; nome: string }[];
  conteudos: { id: string; titulo: string; salaNome: string }[];
}

/** Cada página obtém a sessão no servidor; nenhuma consulta aceita identidade vinda do cliente. */
export async function consultarComunidade() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const pessoa = pessoaPublicaComunidade(membro.id);
  if (!pessoa) return redirecionarParaEntrar();
  const dados = acervo().comunidade;
  const publicacoes = publicacoesVisiveisComunidade();
  const pessoas = pessoasPublicasComunidade();
  const progresso = progressoDe(membro.id);
  const contexto = {
    pessoaId: membro.id,
    seguindo: dados.seguindo,
    salasTrilhas: Object.keys(progresso.trilhas),
    anfitrioes: pessoas.filter((p) => p.anfitriao).map((p) => p.id),
  };
  const porId = new Map(publicacoes.map((p) => [p.id, p]));
  const ordenar = (aba: "para-voce" | "seguindo") =>
    ordenarFeed(publicacoes, { ...contexto, aba }).flatMap((p) => {
      const item = porId.get(p.id);
      return item ? [item] : [];
    });
  const acompanhamentos = dados.seguindo.filter((s) => s.seguidor === membro.id);
  const seguindoPessoas = acompanhamentos
    .filter((s) => s.alvo.tipo === "pessoa")
    .flatMap((s) => {
      const p = pessoaPublicaComunidade(s.alvo.id);
      return p ? [p] : [];
    });
  const seguindoSalas = acompanhamentos
    .filter((s) => s.alvo.tipo === "sala")
    .flatMap((s) => {
      const sala = salaPorSlug(s.alvo.id);
      return sala ? [{ nome: sala.nome, slug: sala.slug }] : [];
    });
  const minhasReacoes = dados.reacoes.filter((r) => r.pessoa === membro.id);
  const reacoes: VisaoComunidade["reacoes"] = {};
  for (const r of minhasReacoes.filter((r) => r.alvo.tipo === "publicacao"))
    reacoes[r.alvo.id] = [...(reacoes[r.alvo.id] ?? []), r.tipo];
  const visao: VisaoComunidade = {
    pessoaId: membro.id,
    papel: membro.papel,
    salvos: dados.salvos.filter((s) => s.pessoa === membro.id).map((s) => s.publicacaoId),
    reacoes,
    comentariosCurtidos: minhasReacoes
      .filter((r) => r.alvo.tipo === "comentario" && r.tipo === "curtir")
      .map((r) => r.alvo.id),
    salasProprias: [...acervo().salas.values()]
      .filter((s) => s.revisao?.donoId === membro.id)
      .map((s) => s.slug),
    seguindoPessoas: seguindoPessoas.map((p) => p.id),
    seguindoSalas: seguindoSalas.map((s) => s.slug),
  };
  const salasDisponiveis = todasAsSalas();
  const opcoes: OpcoesCompositor = {
    salas: salasDisponiveis.map((s) => ({
      slug: s.slug,
      nome: s.nome,
      anfitriao: s.anfitriao?.nome,
    })),
    temas: todosOsTemas().map((t) => ({ slug: t.slug, nome: t.nome })),
    conteudos: [...acervo().conteudos.values()]
      .filter((c) => c.status === "publicado" && salasDisponiveis.some((s) => s.slug === c.sala))
      .map((c) => ({ id: c.id, titulo: c.titulo, salaNome: salaPorSlug(c.sala)?.nome ?? c.sala })),
  };
  const salaFoco = Object.keys(progresso.trilhas)[0] ?? progresso.salasVisitadas[0];
  const sala = salaFoco ? salaPorSlug(salaFoco) : undefined;
  const nivel = sala
    ? nivelNoAssunto({ tipo: "sala", sala: sala.slug }, acervoDeEstudo(), progresso.leituras).nivel
    : undefined;
  return {
    pessoa,
    publicacoes: ordenar("para-voce"),
    seguindo: ordenar("seguindo"),
    pessoas,
    seguindoPessoas,
    seguindoSalas,
    salvos: dados.salvos
      .filter((s) => s.pessoa === membro.id)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      .flatMap((s) => {
        const p = porId.get(s.publicacaoId);
        return p ? [p] : [];
      }),
    visao,
    opcoes,
    numeros: {
      publicacoes: publicacoes.filter((p) => p.autorId === membro.id).length,
      seguidores: dados.seguindo.filter((s) => s.alvo.tipo === "pessoa" && s.alvo.id === membro.id).length,
      seguindo: seguindoPessoas.length + seguindoSalas.length,
    },
    nivel: nivel && sala && progresso.mostrarNiveis ? { valor: nivel, assunto: sala.nome } : undefined,
    debate: emDebate(
      publicacoes,
      publicacoes.flatMap((p) => p.comentarios),
      new Date(),
    ).map((d) => ({
      ...d,
      temaNome: temaPorSlug(d.tema)?.nome ?? d.tema,
      salaNome: salaPorSlug(d.sala)?.nome ?? d.sala,
    })),
    agora: new Date().toISOString(),
  };
}
export type ModeloComunidade = Awaited<ReturnType<typeof consultarComunidade>>;
