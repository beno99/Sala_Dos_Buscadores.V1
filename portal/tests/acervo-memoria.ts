import type { SalaEditorial } from "../src/data/types";
import { slugDaSala } from "../src/features/admin/regras/sala";
import { planejarExclusaoPermanenteSala, planejarLixeiraSala } from "../src/features/salas/lixeira";
import type { AcervoRepositorio, Colecoes, DadosCarregados } from "../src/modules/acervo/acervo.contratos";
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
  const repositorio = {
    async mudarLixeiraSala(pedido) {
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
  } satisfies AcervoRepositorio;
  usarRepositorioDoAcervo(repositorio);
  await sincronizarAcervo();
  return dados;
}
