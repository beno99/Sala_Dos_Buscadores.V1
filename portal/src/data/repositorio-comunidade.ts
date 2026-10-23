import "server-only";
import type { PessoaComunidadeVisual } from "@/components/ds/LinhaPessoa";
import { contaPorId } from "@/features/auth/contas";
import { ordenarComentarios } from "@/features/comunidade/regras";
import { nivelNoAssunto } from "@/features/estudo/niveis";
import { iniciais } from "@/lib/texto";
import { urlDaMidia } from "@/server/midia";
import { perfilDe } from "@/server/perfilBuscador";
import { progressoDe } from "@/server/progresso";
import { acervo, salasVisiveis } from "@/server/store";
import { acervoDeEstudo, conteudoParaPublico } from "./repositorio";
import type { ComentarioComunidade, Conteudo, Nivel, Publicacao } from "./types";

export interface PessoaPublicaComunidade extends PessoaComunidadeVisual {
  id: string;
}
export interface ComentarioPublicoComunidade extends ComentarioComunidade {
  autor: PessoaPublicaComunidade;
  curtidas: number;
}
export interface PublicacaoPublica extends Publicacao {
  autor: PessoaPublicaComunidade;
  salaNome?: string;
  nivel?: { valor: Nivel; assunto: string };
  conteudo?: Conteudo;
  comentarios: ComentarioPublicoComunidade[];
  curtidas: number;
  dirigidaA?: PessoaPublicaComunidade;
}
/** Projeção explícita. Não espalhar Membro/PerfilBuscador: contêm e-mail, convicção e descrição privada. */
export function pessoaPublicaComunidade(id: string): PessoaPublicaComunidade | undefined {
  const conta = contaPorId(id);
  if (!conta) return undefined;
  const perfil = conta.papel === "anfitriao" ? acervo().perfis.get(id) : undefined;
  const nome = perfil?.nome ?? conta.pseudonimo;
  const foto = perfil?.avatar ? urlDaMidia(perfil.avatar) : perfilDe(id).foto;
  return {
    id,
    nome,
    iniciais: iniciais(nome),
    href: perfil ? `/anfitrioes/${perfil.slug}` : `/perfil/${id}`,
    anfitriao: conta.papel === "anfitriao",
    ...(foto ? { foto } : {}),
  };
}
export function pessoasPublicasComunidade(): PessoaPublicaComunidade[] {
  const ids = new Set(
    publicacoesVisiveisComunidade().flatMap((p) => [p.autorId, ...p.comentarios.map((c) => c.autorId)]),
  );
  return [...ids]
    .flatMap((id) => {
      const p = pessoaPublicaComunidade(id);
      return p ? [p] : [];
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
/** Apenas publicações visíveis e Salas no ar. Referências editoriais passam pelo mesmo filtro do acervo. */
export function publicacoesVisiveisComunidade(): PublicacaoPublica[] {
  const dados = acervo().comunidade;
  const salas = new Map(salasVisiveis().map((s) => [s.slug, s]));
  const anfitrioes = [...new Set([...dados.comentarios.values()].map((c) => c.autorId))].filter(
    (id) => contaPorId(id)?.papel === "anfitriao",
  );
  return [...dados.publicacoes.values()].flatMap((p) => {
    const autor = pessoaPublicaComunidade(p.autorId);
    if (!autor || p.estado !== "visivel" || (p.salaSlug && !salas.has(p.salaSlug))) return [];
    const comentarios = ordenarComentarios(
      [...dados.comentarios.values()].filter((c) => c.publicacaoId === p.id),
      p,
      anfitrioes,
    ).flatMap((c) => {
      const autor = pessoaPublicaComunidade(c.autorId);
      return autor
        ? [
            {
              ...structuredClone(c),
              autor,
              curtidas: dados.reacoes.filter(
                (r) => r.alvo.tipo === "comentario" && r.alvo.id === c.id && r.tipo === "curtir",
              ).length,
            },
          ]
        : [];
    });
    const conta = contaPorId(p.autorId);
    const progresso = conta ? progressoDe(conta.email) : undefined;
    const sala = p.salaSlug ? salas.get(p.salaSlug) : undefined;
    const nivel =
      sala && progresso?.mostrarNiveis && progresso.leituras.some((l) => l.sala === sala.slug)
        ? {
            valor: nivelNoAssunto({ tipo: "sala", sala: sala.slug }, acervoDeEstudo(), progresso.leituras)
              .nivel,
            assunto: sala.nome,
          }
        : undefined;
    const c = p.conteudoId ? acervo().conteudos.get(p.conteudoId) : undefined;
    return [
      {
        ...structuredClone(p),
        autor,
        nivel,
        comentarios,
        salaNome: p.salaSlug ? salas.get(p.salaSlug)?.nome : undefined,
        conteudo: c?.status === "publicado" && salas.has(c.sala) ? conteudoParaPublico(c) : undefined,
        dirigidaA: p.perguntaDirigidaA ? pessoaPublicaComunidade(p.perguntaDirigidaA) : undefined,
        curtidas: dados.reacoes.filter(
          (r) => r.alvo.tipo === "publicacao" && r.alvo.id === p.id && r.tipo === "curtir",
        ).length,
      },
    ];
  });
}
export function publicacaoComunidadePorId(id: string) {
  return publicacoesVisiveisComunidade().find((p) => p.id === id);
}
