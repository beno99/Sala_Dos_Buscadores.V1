import { ErroLixeiraArtigo, planejarLixeiraArtigo } from "@/features/artigos/lixeira";
import { aplicarContaNoLote, bloquearContasDoLote } from "./contas-no-lote";
import { ConflitoEditorial, type PedidoEditorial, planejarEditorial } from "./editorial-atomico";
import { progressoReferenciaArtigo, progressoReferenciaSala } from "./referencias-integridade";
import "server-only";
import { and, asc, eq, getTableColumns } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { DenunciaComunidade } from "@/data/types";
import { candidatoSlugSala, SLUGS_SALA_RESERVADOS } from "@/features/admin/regras/sala";
import {
  ErroLixeiraSala,
  planejarExclusaoPermanenteSala,
  planejarLixeiraSala,
} from "@/features/salas/lixeira";
import { anuncios, candidaturas, convites, perfisAnfitriao } from "@/modules/anfitriao/anfitriao.schema";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { somarVersao } from "@/modules/compartilhado/banco/versao";
import { versaoDados } from "@/modules/compartilhado/banco/versao.schema";
import {
  comentarios,
  denuncias,
  publicacoes,
  reacoes,
  salvos,
  seguindo,
} from "@/modules/comunidade/comunidade.schema";
import { contaRepositorio } from "@/modules/conta/conta.repositorio";
import { perfisBuscador, progressoEstudo } from "@/modules/estudo/estudo.schema";
import { midias } from "@/modules/midia/midia.schema";
import { auditoria, emailsEnviados } from "@/modules/operacao/operacao.schema";
import type { AcervoRepositorio, Colecoes, DadosCarregados, Gravacao, NomeColecao } from "./acervo.contratos";
import { citacoes, conteudos, destaques, fontes, salas, temas, videos } from "./acervo.schema";
import { bloquearAcervoReferenciado, validarNovasReferencias } from "./referencias-integridade";

/* Implementação Postgres do repositório do acervo. */

type Linha = Record<string, unknown>;

/** Campos ausentes no domínio são opcionais (undefined); no banco, null. */
function semNulos<T>(linha: Linha, manterNulos: string[] = []): T {
  const v: Linha = {};
  for (const [k, x] of Object.entries(linha)) if (x !== null || manterNulos.includes(k)) v[k] = x;
  return v as T;
}

interface Mapa<V> {
  tabela: PgTable;
  pk: PgColumn;
  paraLinha: (id: string, valor: V) => Linha;
  deLinha: (linha: Linha) => [string, V];
}

/** O domínio usa os mesmos nomes das colunas: copia só o que é coluna, com null no lugar de undefined. */
function mapaDireto<V>(
  tabela: PgTable,
  pk: PgColumn,
  opcoes: { derivar?: (valor: V) => Linha; omitir?: string[]; manterNulos?: string[] } = {},
): Mapa<V> {
  const colunas = Object.keys(getTableColumns(tabela));
  const chavePk = colunas.find((k) => getTableColumns(tabela)[k] === pk) ?? "id";
  return {
    tabela,
    pk,
    paraLinha: (id, valor) => {
      const origem = { ...(valor as Linha), [chavePk]: id, ...opcoes.derivar?.(valor) };
      return Object.fromEntries(colunas.map((k) => [k, origem[k] ?? null]));
    },
    deLinha: (linha) => {
      const v = semNulos<Linha>(linha, opcoes.manterNulos);
      for (const k of opcoes.omitir ?? []) delete v[k];
      return [String(linha[chavePk]), v as V];
    },
  };
}

const MAPAS: { [K in NomeColecao]: Mapa<Colecoes[K]> } = {
  salas: mapaDireto(salas, salas.id, {
    derivar: (s) => ({ donoId: s.revisao?.donoId ?? null }),
    omitir: ["donoId"],
  }),
  conteudos: mapaDireto(conteudos, conteudos.id, {
    derivar: (c) => ({ donoId: c.revisao?.donoId ?? null }),
    omitir: ["donoId"],
    manterNulos: ["situacaoJuridica"],
  }),
  citacoes: mapaDireto(citacoes, citacoes.id),
  videos: mapaDireto(videos, videos.id, {
    derivar: (v) => ({ donoId: v.revisao?.donoId ?? null }),
    omitir: ["donoId"],
  }),
  fontes: mapaDireto(fontes, fontes.id),
  perfis: mapaDireto(perfisAnfitriao, perfisAnfitriao.contaId),
  candidaturas: mapaDireto(candidaturas, candidaturas.id),
  convites: mapaDireto(convites, convites.id),
  midias: mapaDireto(midias, midias.id),
  progresso: {
    tabela: progressoEstudo,
    pk: progressoEstudo.usuarioId,
    paraLinha: (usuarioId, dados) => ({ usuarioId, dados }),
    deLinha: (l) => [String(l.usuarioId), l.dados as Colecoes["progresso"]],
  },
  perfisBuscador: mapaDireto(perfisBuscador, perfisBuscador.usuarioId, { omitir: ["usuarioId"] }),
  temas: mapaDireto(temas, temas.slug),
  publicacoes: mapaDireto(publicacoes, publicacoes.id),
  comentarios: mapaDireto(comentarios, comentarios.id),
  denuncias: mapaDenuncias(),
  anuncios: mapaDireto(anuncios, anuncios.id),
};

/** O domínio guarda o alvo como objeto; a tabela, em duas colunas. */
function mapaDenuncias(): Mapa<DenunciaComunidade> {
  const base = mapaDireto<DenunciaComunidade>(denuncias, denuncias.id, {
    derivar: (d) => ({ alvoTipo: d.alvo.tipo, alvoId: d.alvo.id }),
    omitir: ["alvoTipo", "alvoId"],
  });
  return {
    ...base,
    deLinha: (linha) => {
      const [id, d] = base.deLinha(linha);
      return [id, { ...d, alvo: { tipo: linha.alvoTipo, id: linha.alvoId } as DenunciaComunidade["alvo"] }];
    },
  };
}

async function lerVersao(): Promise<number> {
  const [linha] = await banco().select().from(versaoDados).where(eq(versaoDados.id, 1));
  return linha?.versao ?? 0;
}

async function carregarColecao<K extends NomeColecao>(nome: K): Promise<Map<string, Colecoes[K]>> {
  const mapa = MAPAS[nome] as Mapa<Colecoes[K]>;
  const linhas = (await banco().select().from(mapa.tabela)) as Linha[];
  return new Map(linhas.map(mapa.deLinha));
}

type Transacao = Parameters<Parameters<ReturnType<typeof banco>["transaction"]>[0]>[0];
async function aplicarNaTransacao(tx: Transacao, g: Gravacao): Promise<void> {
  await validarNovasReferencias(tx, g);
  switch (g.tipo) {
    case "gravar": {
      const mapa = MAPAS[g.colecao] as Mapa<unknown>;
      const linha = mapa.paraLinha(g.id, g.valor);
      // Uma Sala existente nunca troca de endereço, mesmo com snapshot antigo.
      const atualizacao = { ...linha };
      if (g.colecao === "salas") {
        delete atualizacao.slug;
        delete atualizacao.lixeira;
      }
      if (g.colecao === "conteudos") delete atualizacao.lixeira;
      // Vínculos só mudam pelo comando editorial com releitura bloqueada.
      if (g.colecao === "videos") delete atualizacao.artigos;
      // A exclusão/restauração é exclusiva da operação atômica acima. Um autosave antigo não restaura a Sala.
      if (g.colecao === "salas") {
        const [s] = await tx.select().from(salas).where(eq(salas.id, g.id)).for("update");
        if (s?.lixeira)
          throw new ErroLixeiraSala("Esta Sala está na lixeira. Peça ao curador para restaurá-la.");
      }
      if (g.colecao === "conteudos" || g.colecao === "videos" || g.colecao === "citacoes") {
        const [anterior] = await tx.select().from(mapa.tabela).where(eq(mapa.pk, g.id));
        if (g.colecao === "conteudos" && anterior?.lixeira)
          throw new ErroLixeiraArtigo("Este artigo está na lixeira. Peça ao curador para restaurá-lo.");
        // Conferir origem e destino impede uma gravação atrasada de mover conteúdo para fora da lixeira.
        for (const slug of [
          ...new Set([g.valor.sala, ...(anterior ? [String(anterior.sala)] : [])]),
        ].sort()) {
          const [s] = await tx.select().from(salas).where(eq(salas.slug, slug)).for("update");
          if (s?.lixeira)
            throw new ErroLixeiraSala("Esta Sala está na lixeira. Peça ao curador para restaurá-la.");
        }
      }
      if (g.colecao === "conteudos") {
        const [conteudoAtual] = await tx.select().from(conteudos).where(eq(conteudos.id, g.id)).for("update");
        if (conteudoAtual?.lixeira) throw new ErroLixeiraArtigo("Este artigo está na lixeira.");
      }
      if (g.esperado !== undefined) {
        const [atual] = await tx.select().from(mapa.tabela).where(eq(mapa.pk, g.id)).for("update");
        if ((atual?.atualizadoEm ?? null) !== g.esperado) throw new ConflitoEditorial();
      }
      await tx.insert(mapa.tabela).values(linha).onConflictDoUpdate({ target: mapa.pk, set: atualizacao });
      break;
    }
    case "apagar": {
      const mapa = MAPAS[g.colecao];
      if (g.colecao === "conteudos") throw new ErroLixeiraArtigo("Use a lixeira para excluir artigos.");
      if (g.colecao === "salas") throw new ErroLixeiraSala("Use a lixeira para excluir uma Sala.");
      if (g.colecao === "videos" || g.colecao === "citacoes") {
        const [item] = await tx.select().from(mapa.tabela).where(eq(mapa.pk, g.id));
        if (item) {
          const [s] = await tx
            .select()
            .from(salas)
            .where(eq(salas.slug, String(item.sala)))
            .for("update");
          if (s?.lixeira) throw new ErroLixeiraSala("Esta Sala está na lixeira.");
        }
      }
      await tx.delete(mapa.tabela).where(eq(mapa.pk, g.id));
      break;
    }
    case "destaques":
      await tx
        .insert(destaques)
        .values({ id: 1, escolha: g.valor })
        .onConflictDoUpdate({ target: destaques.id, set: { escolha: g.valor } });
      break;
    case "auditoria":
      // RNF-04: só inclusão.
      await tx.insert(auditoria).values({ ...g.valor, mudancas: g.valor.mudancas ?? null });
      break;
    case "email":
      await tx.insert(emailsEnviados).values(g.valor);
      break;
    case "reacao": {
      const { alvo, pessoa, tipo } = g.valor;
      if (g.acao === "incluir")
        await tx
          .insert(reacoes)
          .values({ alvoTipo: alvo.tipo, alvoId: alvo.id, pessoa, tipo })
          .onConflictDoNothing();
      else
        await tx
          .delete(reacoes)
          .where(
            and(
              eq(reacoes.alvoTipo, alvo.tipo),
              eq(reacoes.alvoId, alvo.id),
              eq(reacoes.pessoa, pessoa),
              eq(reacoes.tipo, tipo),
            ),
          );
      break;
    }
    case "seguir": {
      const { seguidor, alvo } = g.valor;
      if (g.acao === "incluir")
        await tx
          .insert(seguindo)
          .values({ seguidor, alvoTipo: alvo.tipo, alvoId: alvo.id })
          .onConflictDoNothing();
      else
        await tx
          .delete(seguindo)
          .where(
            and(
              eq(seguindo.seguidor, seguidor),
              eq(seguindo.alvoTipo, alvo.tipo),
              eq(seguindo.alvoId, alvo.id),
            ),
          );
      break;
    }
    case "salvo":
      if (g.acao === "incluir") await tx.insert(salvos).values(g.valor).onConflictDoNothing();
      else
        await tx
          .delete(salvos)
          .where(and(eq(salvos.pessoa, g.valor.pessoa), eq(salvos.publicacaoId, g.valor.publicacaoId)));
      break;
  }
}
async function salvarEditorialNaTransacao(tx: Transacao, pedido: PedidoEditorial) {
  // Ordem única compartilhada com lixeira: Sala → artigo → vídeo. Releitura
  // bloqueada evita substituição de arrays antigos em instâncias distintas.
  const ss = await tx.select().from(salas).orderBy(asc(salas.id)).for("update");
  const cs = await tx.select().from(conteudos).orderBy(asc(conteudos.id)).for("update");
  const vs = await tx.select().from(videos).orderBy(asc(videos.id)).for("update");
  const resultado = planejarEditorial(pedido, {
    salas: ss.map((s) => MAPAS.salas.deLinha(s)[1]),
    conteudos: cs.map((c) => MAPAS.conteudos.deLinha(c)[1]),
    videos: vs.map((v) => MAPAS.videos.deLinha(v)[1]),
  });
  const mapa = MAPAS[pedido.colecao] as Mapa<unknown>;
  const linha = mapa.paraLinha(resultado.valor.id, resultado.valor);
  await tx.insert(mapa.tabela).values(linha).onConflictDoUpdate({ target: mapa.pk, set: linha });
  for (const video of resultado.videos) {
    // Apenas associação e versão: o metadado de outro editor é preservado.
    await tx
      .update(videos)
      .set({ artigos: video.artigos, atualizadoEm: video.atualizadoEm })
      .where(eq(videos.id, video.id));
  }
  if (resultado.citacao) {
    const q = MAPAS.citacoes.paraLinha(resultado.citacao.id, resultado.citacao);
    await tx
      .insert(citacoes)
      .values(q as typeof citacoes.$inferInsert)
      .onConflictDoUpdate({ target: citacoes.id, set: q });
  }
  return resultado;
}

export const acervoRepositorio: AcervoRepositorio = {
  versao: lerVersao,
  async salvarEditorial(pedido) {
    return banco().transaction(async (tx) => ({
      ...(await salvarEditorialNaTransacao(tx, pedido)),
      versao: await somarVersao(tx),
    }));
  },

  async mudarLixeiraArtigo(pedido) {
    return banco().transaction(async (tx) => {
      const [prev] = await tx.select().from(conteudos).where(eq(conteudos.id, pedido.id));
      const [sala] = prev ? await tx.select().from(salas).where(eq(salas.slug, prev.sala)).for("update") : [];
      if (sala?.lixeira) throw new ErroLixeiraArtigo("Restaure a Sala antes de alterar o artigo.");
      const [linha] = await tx.select().from(conteudos).where(eq(conteudos.id, pedido.id)).for("update");
      const resultado = planejarLixeiraArtigo(linha ? MAPAS.conteudos.deLinha(linha)[1] : undefined, pedido);
      await tx
        .update(conteudos)
        .set({
          lixeira: resultado.artigo.lixeira ?? null,
          atualizadoEm: resultado.artigo.atualizadoEm,
          atualizadoPor: resultado.artigo.atualizadoPor,
        })
        .where(eq(conteudos.id, pedido.id));
      await tx
        .insert(auditoria)
        .values({ ...resultado.registro, mudancas: resultado.registro.mudancas ?? null });
      return { ...resultado, versao: await somarVersao(tx) };
    });
  },
  async excluirArtigoPermanentemente(pedido) {
    return banco().transaction(async (tx) => {
      await bloquearAcervoReferenciado(tx);
      const [linha] = await tx.select().from(conteudos).where(eq(conteudos.id, pedido.id)).for("update");
      if (pedido.ator.papel !== "administrador" || !linha?.lixeira)
        throw new ErroLixeiraArtigo("Somente a curadoria pode excluir definitivamente um artigo na lixeira.");
      const [vs, ps, cs, ds, es, qs] = await Promise.all([
        tx.select().from(videos),
        tx.select().from(publicacoes),
        tx.select().from(conteudos),
        tx.select().from(destaques),
        tx.select().from(progressoEstudo),
        tx.select().from(citacoes),
      ]);
      if (
        vs.some((v) => v.artigos.includes(linha.id)) ||
        ps.some((p) => p.conteudoId === linha.id) ||
        cs.some(
          (c) =>
            c.id !== linha.id &&
            (JSON.stringify(c.corpo).includes(linha.slug) ||
              JSON.stringify(c.link ?? {}).includes(linha.slug)),
        ) ||
        ds.some((d) => JSON.stringify(d.escolha).includes(linha.id)) ||
        es.some((e) => progressoReferenciaArtigo(e.dados, linha)) ||
        qs.some(
          (q) => q.referencia.includes(linha.id) || q.referencia.includes(`/${linha.sala}/${linha.slug}`),
        )
      )
        throw new ErroLixeiraArtigo(
          "Este artigo possui vídeos, conversas ou referências dependentes. Resolva esses vínculos antes da exclusão definitiva.",
        );
      const registro = {
        id: pedido.auditoriaId,
        quando: pedido.quando,
        quem: pedido.ator.pseudonimo,
        atorId: pedido.ator.id,
        acao: "excluiu-definitivamente" as const,
        tipoItem: "artigo" as const,
        itemId: linha.id,
        itemTitulo: linha.titulo,
      };
      await tx.delete(conteudos).where(eq(conteudos.id, pedido.id));
      await tx.insert(auditoria).values(registro);
      return { registro, versao: await somarVersao(tx) };
    });
  },

  async mudarLixeiraSala(pedido) {
    return banco().transaction(async (tx) => {
      const [linha] = await tx.select().from(salas).where(eq(salas.id, pedido.id)).for("update");
      if (pedido.acao === "excluir" && linha) {
        const artigos = await tx.select().from(conteudos).where(eq(conteudos.sala, linha.slug));
        if (artigos.some((a) => !a.lixeira))
          throw new ErroLixeiraSala(
            "Mova todos os artigos desta Sala para a lixeira antes de excluí-la, inclusive rascunhos e arquivados.",
          );
      }
      const resultado = planejarLixeiraSala(linha ? MAPAS.salas.deLinha(linha)[1] : undefined, pedido);
      await tx
        .update(salas)
        .set({
          lixeira: resultado.sala.lixeira ?? null,
          atualizadoEm: resultado.sala.atualizadoEm,
          atualizadoPor: resultado.sala.atualizadoPor,
        })
        .where(eq(salas.id, pedido.id));
      await tx
        .insert(auditoria)
        .values({ ...resultado.registro, mudancas: resultado.registro.mudancas ?? null });
      return { ...resultado, versao: await somarVersao(tx) };
    });
  },

  async excluirSalaPermanentemente(pedido) {
    return banco().transaction(async (tx) => {
      await bloquearAcervoReferenciado(tx);
      const [linha] = await tx.select().from(salas).where(eq(salas.id, pedido.id)).for("update");
      const sala = linha ? MAPAS.salas.deLinha(linha)[1] : undefined;
      const { registro } = planejarExclusaoPermanenteSala(sala, pedido);
      const slug = sala?.slug as string;
      const [cs, vs, qs, ps, ds, fs, es] = await Promise.all([
        tx.select().from(conteudos),
        tx.select().from(videos),
        tx.select().from(citacoes).where(eq(citacoes.sala, slug)),
        tx.select().from(publicacoes).where(eq(publicacoes.salaSlug, slug)),
        tx.select().from(destaques),
        tx
          .select()
          .from(seguindo)
          .where(and(eq(seguindo.alvoTipo, "sala"), eq(seguindo.alvoId, slug))),
        tx.select().from(progressoEstudo),
      ]);
      if (
        cs.some(
          (c) =>
            c.sala === slug ||
            JSON.stringify(c.corpo).includes(`/${slug}/`) ||
            JSON.stringify(c.link ?? {}).includes(`/${slug}/`),
        ) ||
        qs.length ||
        ps.length ||
        fs.length ||
        vs.some(
          (v) => v.sala === slug || v.artigos.some((id) => cs.some((c) => c.sala === slug && c.id === id)),
        ) ||
        ds.some((d) => JSON.stringify(d.escolha).includes(slug)) ||
        es.some((e) => progressoReferenciaSala(e.dados, slug))
      )
        throw new ErroLixeiraSala(
          "Esta Sala possui conteúdos, vídeos, citações, conversas ou vínculos dependentes. Resolva todos antes da exclusão definitiva.",
        );
      await tx.delete(salas).where(eq(salas.id, pedido.id));
      await tx.insert(auditoria).values({ ...registro, mudancas: registro.mudancas ?? null });
      return {
        conteudosIds: [],
        videosIds: [],
        citacoesIds: [],
        registro,
        versao: await somarVersao(tx),
      };
    });
  },

  async criarSala(sala) {
    return banco().transaction(async (tx) => {
      // O UNIQUE existente arbitra concorrência entre processos. DO NOTHING
      // mantém a transação válida após colisão e permite tentar o próximo sufixo.
      for (let tentativa = 1; ; tentativa += 1) {
        const slug = candidatoSlugSala(sala.nome, tentativa);
        if (SLUGS_SALA_RESERVADOS.has(slug)) continue;
        const criada = { ...sala, slug };
        const linha = MAPAS.salas.paraLinha(criada.id, criada);
        const [inserida] = await tx
          .insert(salas)
          .values(linha as typeof salas.$inferInsert)
          .onConflictDoNothing({ target: salas.slug })
          .returning({ id: salas.id });
        if (inserida) return { sala: criada, versao: await somarVersao(tx) };
      }
    });
  },

  async carregar() {
    const versao = await lerVersao();
    const nomes = Object.keys(MAPAS) as NomeColecao[];
    const mapas = await Promise.all(nomes.map((n) => carregarColecao(n)));
    const colecoes = Object.fromEntries(nomes.map((n, i) => [n, mapas[i]])) as DadosCarregados["colecoes"];
    const db = banco();
    const [escolha] = await db.select().from(destaques).where(eq(destaques.id, 1));
    const [contas, reas, segs, salvs, auds, emails] = await Promise.all([
      contaRepositorio.listar(),
      db.select().from(reacoes),
      db.select().from(seguindo),
      db.select().from(salvos),
      // ponytail: o histórico inteiro vai para a memória; paginar no banco quando passar de algumas dezenas de milhares.
      db.select().from(auditoria).orderBy(asc(auditoria.quando)),
      db.select().from(emailsEnviados).orderBy(asc(emailsEnviados.quando)),
    ]);
    return {
      versao,
      colecoes,
      contas: new Map(contas.map((c) => [c.id, c])),
      destaques: escolha?.escolha ?? null,
      comunidade: {
        reacoes: reas.map((r) => ({
          alvo: { tipo: r.alvoTipo, id: r.alvoId },
          pessoa: r.pessoa,
          tipo: r.tipo,
        })),
        seguindo: segs.map((s) => ({ seguidor: s.seguidor, alvo: { tipo: s.alvoTipo, id: s.alvoId } })),
        salvos: salvs,
      },
      auditoria: auds.map((a) => semNulos(a)),
      caixaSaida: emails,
    };
  },

  async aplicar(g) {
    return banco().transaction(async (tx) => {
      await bloquearAcervoReferenciado(tx);
      await aplicarNaTransacao(tx, g);
      return somarVersao(tx);
    });
  },
  async aplicarLote(operacoes) {
    return banco().transaction(async (tx) => {
      await bloquearAcervoReferenciado(tx);
      await bloquearContasDoLote(
        tx,
        operacoes.filter((op) => op.tipo === "papel-conta" || op.tipo === "excluir-conta"),
      );
      for (const op of operacoes) {
        if (op.tipo === "editorial") await salvarEditorialNaTransacao(tx, op.pedido);
        else if (op.tipo === "papel-conta" || op.tipo === "excluir-conta") await aplicarContaNoLote(tx, op);
        else await aplicarNaTransacao(tx, op);
      }
      return somarVersao(tx);
    });
  },
};
