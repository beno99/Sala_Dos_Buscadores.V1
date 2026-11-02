import type { SalaEditorial } from "../src/data/types";
import { slugDaSala } from "../src/features/admin/regras/sala";
import { ErroLixeiraArtigo, planejarLixeiraArtigo } from "../src/features/artigos/lixeira";
import {
  ErroLixeiraSala,
  planejarExclusaoPermanenteSala,
  planejarLixeiraSala,
} from "../src/features/salas/lixeira";
import type { AcervoRepositorio, Colecoes, DadosCarregados } from "../src/modules/acervo/acervo.contratos";
import { validarContaNoLote } from "../src/modules/acervo/contas-no-lote";
import { ConflitoEditorial, planejarEditorial } from "../src/modules/acervo/editorial-atomico";
import { aguardarGravacoes, sincronizarAcervo, usarRepositorioDoAcervo } from "../src/server/store";

const nomes = [
  "salas",
  "conteudos",
  "citacoes",
  "videos",
  "fontes",
  "perfis",
  "candidaturas",
  "convites",
  "midias",
  "progresso",
  "perfisBuscador",
  "temas",
  "publicacoes",
  "comentarios",
  "denuncias",
] as const;

/** Repositório isolado: nenhum teste abre conexão com DATABASE_URL. */
export async function prepararAcervoEmMemoria(): Promise<DadosCarregados> {
  await aguardarGravacoes();
  const dados: DadosCarregados = {
    versao: 0,
    contas: new Map(),
    colecoes: Object.fromEntries(nomes.map((n) => [n, new Map()])) as DadosCarregados["colecoes"],
    destaques: null,
    comunidade: { reacoes: [], seguindo: [], salvos: [] },
    auditoria: [],
    caixaSaida: [],
  };
  const repositorio: AcervoRepositorio = {
    async aplicarLote(operacoes) {
      const antes = structuredClone(dados);
      try {
        for (const op of operacoes) {
          if (op.tipo === "editorial") await repositorio.salvarEditorial(op.pedido);
          else if (op.tipo === "papel-conta" || op.tipo === "excluir-conta") {
            validarContaNoLote(op, dados.contas);
            const atual = dados.contas.get(op.id);
            if (op.tipo === "excluir-conta") {
              dados.contas.delete(op.id);
              dados.colecoes.perfis.delete(op.id);
            } else if (atual) dados.contas.set(op.id, { ...atual, papel: op.papel });
          } else {
            if (op.tipo === "auditoria" && dados.auditoria.some((a) => a.id === op.valor.id))
              throw new Error("auditoria duplicada");
            await repositorio.aplicar(op);
          }
        }
        dados.versao = antes.versao + 1;
        return dados.versao;
      } catch (e) {
        Object.assign(dados, antes);
        throw e;
      }
    },
    async salvarEditorial(pedido) {
      const r = planejarEditorial(pedido, {
        salas: [...dados.colecoes.salas.values()],
        conteudos: [...dados.colecoes.conteudos.values()],
        videos: [...dados.colecoes.videos.values()],
      });
      (dados.colecoes[r.colecao] as Map<string, unknown>).set(r.valor.id, structuredClone(r.valor));
      for (const v of r.videos) dados.colecoes.videos.set(v.id, structuredClone(v));
      if (r.citacao) dados.colecoes.citacoes.set(r.citacao.id, structuredClone(r.citacao));
      return { ...r, versao: ++dados.versao };
    },
    async mudarLixeiraArtigo(pedido) {
      const resultado = planejarLixeiraArtigo(dados.colecoes.conteudos.get(pedido.id), pedido);
      const sala = [...dados.colecoes.salas.values()].find((s) => s.slug === resultado.artigo.sala);
      if (sala?.lixeira) throw new ErroLixeiraArtigo("Restaure a Sala antes de alterar o artigo.");
      dados.colecoes.conteudos.set(pedido.id, structuredClone(resultado.artigo));
      dados.auditoria.push(resultado.registro);
      return { ...resultado, versao: ++dados.versao };
    },
    async excluirArtigoPermanentemente(pedido) {
      const artigo = dados.colecoes.conteudos.get(pedido.id);
      if (pedido.ator.papel !== "administrador" || !artigo?.lixeira)
        throw new ErroLixeiraArtigo("Somente a curadoria pode excluir definitivamente um artigo na lixeira.");
      if (
        [...dados.colecoes.videos.values()].some((v) => v.artigos.includes(pedido.id)) ||
        [...dados.colecoes.publicacoes.values()].some((p) => p.conteudoId === pedido.id)
      )
        throw new ErroLixeiraArtigo("Resolva os vínculos dependentes antes da exclusão definitiva.");
      const registro = {
        id: pedido.auditoriaId,
        quando: pedido.quando,
        quem: pedido.ator.pseudonimo,
        acao: "excluiu-definitivamente" as const,
        tipoItem: "artigo" as const,
        itemId: artigo.id,
        itemTitulo: artigo.titulo,
      };
      dados.colecoes.conteudos.delete(pedido.id);
      dados.auditoria.push(registro);
      return { registro, versao: ++dados.versao };
    },
    async mudarLixeiraSala(pedido) {
      const sala = dados.colecoes.salas.get(pedido.id);
      if (
        pedido.acao === "excluir" &&
        [...dados.colecoes.conteudos.values()].some((c) => c.sala === sala?.slug && !c.lixeira)
      )
        throw new ErroLixeiraSala(
          "Mova todos os artigos desta Sala para a lixeira antes de excluí-la, inclusive rascunhos e arquivados.",
        );
      const resultado = planejarLixeiraSala(dados.colecoes.salas.get(pedido.id), pedido);
      dados.colecoes.salas.set(pedido.id, structuredClone(resultado.sala));
      dados.auditoria.push(resultado.registro);
      return { ...resultado, versao: ++dados.versao };
    },
    async excluirSalaPermanentemente(pedido) {
      const { registro } = planejarExclusaoPermanenteSala(dados.colecoes.salas.get(pedido.id), pedido);
      const slug = dados.colecoes.salas.get(pedido.id)?.slug;
      const porSala = <T extends { sala: string }>(m: Map<string, T>) =>
        [...m.entries()].filter(([, v]) => v.sala === slug).map(([id]) => id);
      const conteudosIds = porSala(dados.colecoes.conteudos);
      const videosIds = porSala(dados.colecoes.videos);
      const citacoesIds = porSala(dados.colecoes.citacoes);
      if (
        conteudosIds.length ||
        videosIds.length ||
        citacoesIds.length ||
        [...dados.colecoes.publicacoes.values()].some((p) => p.salaSlug === slug)
      )
        throw new ErroLixeiraSala("Resolva todos os vínculos dependentes antes da exclusão definitiva.");
      for (const id of conteudosIds) dados.colecoes.conteudos.delete(id);
      for (const id of videosIds) dados.colecoes.videos.delete(id);
      for (const id of citacoesIds) dados.colecoes.citacoes.delete(id);
      dados.colecoes.salas.delete(pedido.id);
      dados.auditoria.push(registro);
      return { conteudosIds, videosIds, citacoesIds, registro, versao: ++dados.versao };
    },
    async versao() {
      return dados.versao;
    },
    async carregar() {
      return structuredClone(dados);
    },
    async aplicar(g) {
      if (g.tipo === "gravar" && g.esperado !== undefined) {
        const atual = (dados.colecoes[g.colecao] as Map<string, { atualizadoEm?: string }>).get(g.id);
        if ((atual?.atualizadoEm ?? null) !== g.esperado) throw new ConflitoEditorial();
      }
      if (g.tipo === "gravar")
        (dados.colecoes[g.colecao] as Map<string, Colecoes[keyof Colecoes]>).set(
          g.id,
          structuredClone(g.valor),
        );
      if (g.tipo === "auditoria") dados.auditoria.push(g.valor);
      return ++dados.versao;
    },
    async criarSala(sala: SalaEditorial) {
      // Simula o contrato de conflito único do banco, incluindo linhas ausentes no snapshot.
      const base = slugDaSala(sala.nome);
      let slug = base;
      let n = 2;
      while (slug === "nova" || [...dados.colecoes.salas.values()].some((s) => s.slug === slug))
        slug = `${base}-${n++}`;
      const salva = { ...sala, slug };
      dados.colecoes.salas.set(sala.id, structuredClone(salva));
      return { sala: salva, versao: ++dados.versao };
    },
  };
  usarRepositorioDoAcervo(repositorio);
  await sincronizarAcervo();
  return dados;
}
