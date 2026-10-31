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
import { candidaturas, convites, perfisAnfitriao } from "@/modules/anfitriao/anfitriao.schema";
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
import type { AcervoRepositorio, Colecoes, DadosCarregados, NomeColecao } from "./acervo.contratos";
import { citacoes, conteudos, destaques, fontes, salas, temas, videos } from "./acervo.schema";

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
  videos: mapaDireto(videos, videos.id),
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

export const acervoRepositorio: AcervoRepositorio = {
  versao: lerVersao,

  async mudarLixeiraSala(pedido) {
    return banco().transaction(async (tx) => {
      const [linha] = await tx.select().from(salas).where(eq(salas.id, pedido.id)).for("update");
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
      const [linha] = await tx.select().from(salas).where(eq(salas.id, pedido.id)).for("update");
      const sala = linha ? MAPAS.salas.deLinha(linha)[1] : undefined;
      const { registro } = planejarExclusaoPermanenteSala(sala, pedido);
      const slug = sala?.slug as string;
      const [conteudosApagados, videosApagados, citacoesApagadas] = await Promise.all([
        tx.delete(conteudos).where(eq(conteudos.sala, slug)).returning({ id: conteudos.id }),
        tx.delete(videos).where(eq(videos.sala, slug)).returning({ id: videos.id }),
        tx.delete(citacoes).where(eq(citacoes.sala, slug)).returning({ id: citacoes.id }),
      ]);
      await tx.delete(salas).where(eq(salas.id, pedido.id));
      await tx.insert(auditoria).values({ ...registro, mudancas: registro.mudancas ?? null });
      return {
        conteudosIds: conteudosApagados.map((c) => c.id),
        videosIds: videosApagados.map((v) => v.id),
        citacoesIds: citacoesApagadas.map((c) => c.id),
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
          // A exclusão/restauração é exclusiva da operação atômica acima. Um autosave antigo não restaura a Sala.
          if (g.colecao === "salas") {
            const [s] = await tx.select().from(salas).where(eq(salas.id, g.id)).for("update");
            if (s?.lixeira)
              throw new ErroLixeiraSala("Esta Sala está na lixeira. Peça ao curador para restaurá-la.");
          }
          if (g.colecao === "conteudos" || g.colecao === "videos" || g.colecao === "citacoes") {
            const [anterior] = await tx.select().from(mapa.tabela).where(eq(mapa.pk, g.id));
            // Conferir origem e destino impede uma gravação atrasada de mover conteúdo para fora da lixeira.
            for (const slug of [
              ...new Set([g.valor.sala, ...(anterior ? [String(anterior.sala)] : [])]),
            ].sort()) {
              const [s] = await tx.select().from(salas).where(eq(salas.slug, slug)).for("update");
              if (s?.lixeira)
                throw new ErroLixeiraSala("Esta Sala está na lixeira. Peça ao curador para restaurá-la.");
            }
          }
          await tx
            .insert(mapa.tabela)
            .values(linha)
            .onConflictDoUpdate({ target: mapa.pk, set: atualizacao });
          break;
        }
        case "apagar": {
          const mapa = MAPAS[g.colecao];
          if (g.colecao === "salas") throw new ErroLixeiraSala("Use a lixeira para excluir uma Sala.");
          if (g.colecao === "conteudos" || g.colecao === "videos" || g.colecao === "citacoes") {
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
      return somarVersao(tx);
    });
  },
};
