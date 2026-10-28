import bcrypt from "bcryptjs";
import { notInArray, sql } from "drizzle-orm";
import type { ProgressoEstudo } from "@/features/estudo/tipos";
import { progressoVazio } from "@/features/estudo/tipos";
import type { Preferencias } from "@/features/onboarding/preferencias";
import type { Gravacao } from "@/modules/acervo/acervo.contratos";
import { acervoRepositorio } from "@/modules/acervo/acervo.repositorio";
import { semear } from "@/modules/acervo/semente";
import { banco } from "@/modules/compartilhado/banco/cliente";
import { comentarios, publicacoes, reacoes, salvos, seguindo } from "@/modules/comunidade/comunidade.schema";
import { contas } from "@/modules/conta";
import { contaRepositorio } from "@/modules/conta/conta.repositorio";
import { usuarios } from "@/modules/conta/conta.schema";
import { usarArmazenamento } from "@/server/midia";
import { contaNoDiretorio, contasDoDiretorio, esquecerAcervo, sincronizarAcervo } from "@/server/store";
import { bancoDeTeste } from "../banco";
import {
  artigosDeAnfitrioesIniciais,
  candidaturasIniciais,
  convitesIniciais,
  fontesPropostasIniciais,
  perfisIniciais,
  salasDeAnfitrioesIniciais,
} from "./anfitrioes";
import { comunidadeInicial } from "./comunidade";
import {
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_ANFITRIAO_DEMONSTRACAO,
  CONTA_CANDIDATA_DEMONSTRACAO,
  CONTA_DEMONSTRACAO,
  CONTAS_COMUNIDADE_DEMONSTRACAO,
  type Papel,
} from "./contas";
import { DESTAQUES_INICIAIS } from "./destaques";

/*
 * Cenário de demonstração dos testes, num Postgres em memória (PGlite):
 * acervo oficial da semente, contas fictícias, anfitriões (Helena, Tomás),
 * comunidade, destaques e o histórico de estudo do Buscador.
 */

export * from "./anfitrioes";
export { comunidadeInicial } from "./comunidade";
export * from "./contas";

const PULADAS = (quando: string): Preferencias => ({
  temas: [],
  salas: [],
  conviccao: { tipo: "pulada" },
  concluidoEm: quando,
});

const CONTAS: {
  id: string;
  email: string;
  senha: string;
  pseudonimo: string;
  papel: Papel;
  desde: string;
  preferencias: Preferencias;
}[] = [
  ...CONTAS_COMUNIDADE_DEMONSTRACAO.map((c) => ({
    ...c,
    senha: "estudos-em-companhia",
    desde: "2026-10-01T12:00:00.000Z",
    preferencias: PULADAS("2026-10-01T12:05:00.000Z"),
  })),
  {
    ...CONTA_DEMONSTRACAO,
    papel: "membro",
    desde: "2026-09-14T13:00:00.000Z",
    preferencias: {
      temas: ["alma"],
      salas: ["corpus-hermeticum"],
      conviccao: { tipo: "nao-informar" },
      concluidoEm: "2026-09-14T13:05:00.000Z",
    },
  },
  {
    ...CONTA_ADMIN_DEMONSTRACAO,
    papel: "administrador",
    desde: "2026-08-01T12:00:00.000Z",
    preferencias: PULADAS("2026-08-01T12:00:00.000Z"),
  },
  {
    ...CONTA_ANFITRIAO_DEMONSTRACAO,
    papel: "anfitriao",
    desde: "2026-08-20T14:00:00.000Z",
    preferencias: PULADAS("2026-08-20T14:05:00.000Z"),
  },
  {
    ...CONTA_CANDIDATA_DEMONSTRACAO,
    papel: "membro",
    desde: "2026-09-25T18:00:00.000Z",
    preferencias: PULADAS("2026-09-25T18:03:00.000Z"),
  },
];

/** bcrypt de custo baixo, calculado uma vez por arquivo de teste. */
const hashes = new Map<string, Promise<string>>();
const hashDe = (senha: string) => {
  if (!hashes.has(senha)) hashes.set(senha, bcrypt.hash(senha, 4));
  return hashes.get(senha) as Promise<string>;
};

/** Histórico do Buscador: 3 Salas, 6 leituras e uma em andamento. */
function progressoDemonstracao(): ProgressoEstudo {
  const lida = (sala: string, slug: string, dia: string) => ({
    sala,
    slug,
    pct: 100,
    atualizadaEm: `${dia}T14:00:00.000Z`,
    concluidaEm: `${dia}T14:00:00.000Z`,
  });
  return {
    ...progressoVazio(),
    salasVisitadas: ["nag-hammadi", "corpus-hermeticum", "caibalion"],
    leituras: [
      lida("nag-hammadi", "evangelho-de-tome-114-ditos", "2026-09-15"),
      lida("nag-hammadi", "evangelho-de-tome-ditos-1-a-3", "2026-09-16"),
      lida("corpus-hermeticum", "poimandres-a-mente-que-fala", "2026-09-20"),
      lida("corpus-hermeticum", "tratado-xiii-renascimento-silencio", "2026-09-24"),
      lida("caibalion", "caibalion-principio-do-mentalismo", "2026-09-26"),
      lida("caibalion", "sete-principios-hermeticos", "2026-09-27"),
      {
        sala: "corpus-hermeticum",
        slug: "poimandres-subida-pelas-esferas",
        pct: 38,
        atualizadaEm: "2026-10-06T19:30:00.000Z",
      },
    ],
    temasComparados: ["morte", "alma"],
    verbetesAbertos: ["Pleroma", "Sofia", "Nous", "Ogdóade", "Gnose", "Mentalismo"],
    trilhas: { "corpus-hermeticum": 2 },
    estante: [
      { tipo: "sala", ref: "urantia", em: "2026-09-21T10:00:00.000Z" },
      { tipo: "sala", ref: "apocrifos-cristianismo-primitivo", em: "2026-09-22T10:00:00.000Z" },
      { tipo: "conteudo", ref: "urantia/documento-47-mundos-das-mansoes", em: "2026-09-28T10:00:00.000Z" },
      {
        tipo: "conteudo",
        ref: "apocrifos-cristianismo-primitivo/apocalipse-de-pedro-imagens-do-alem",
        em: "2026-10-01T10:00:00.000Z",
      },
    ],
    conquistas: {
      "porta-aberta": "2026-09-14T13:10:00.000Z",
      "lado-a-lado": "2026-09-18T20:00:00.000Z",
      "degrau-iii": "2026-09-24T14:00:00.000Z",
    },
  };
}

/** Cria ou recompõe as contas da demonstração (papel, senha e preferências), com ids fixos. */
async function gravarContas({ comAdmin }: { comAdmin: boolean }) {
  for (const c of CONTAS) {
    if (c.papel === "administrador" && !comAdmin) continue;
    const linha = {
      id: c.id,
      email: c.email,
      pseudonimo: c.pseudonimo,
      papel: c.papel,
      senhaHash: await hashDe(c.senha),
      membroDesde: c.desde,
      preferencias: c.papel === "administrador" ? null : c.preferencias,
    };
    await banco().insert(usuarios).values(linha).onConflictDoUpdate({ target: usuarios.id, set: linha });
  }
}

async function semearDemonstracao() {
  await gravarContas({ comAdmin: false });
  const g: Gravacao[] = [
    ...salasDeAnfitrioesIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "salas", id: valor.id, valor }),
    ),
    ...fontesPropostasIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "fontes", id: valor.id, valor }),
    ),
    ...artigosDeAnfitrioesIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "conteudos", id: valor.id, valor }),
    ),
    ...perfisIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "perfis", id: valor.contaId, valor }),
    ),
    ...candidaturasIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "candidaturas", id: valor.id, valor }),
    ),
    ...convitesIniciais().map(
      (valor): Gravacao => ({ tipo: "gravar", colecao: "convites", id: valor.id, valor }),
    ),
    { tipo: "gravar", colecao: "progresso", id: CONTA_DEMONSTRACAO.id, valor: progressoDemonstracao() },
    { tipo: "destaques", valor: DESTAQUES_INICIAIS },
  ];
  for (const x of g) await acervoRepositorio.aplicar(x);

  const comunidade = comunidadeInicial();
  const db = banco();
  const pubs = [...comunidade.publicacoes.values()];
  if (pubs.length) await db.insert(publicacoes).values(pubs);
  const coms = [...comunidade.comentarios.values()];
  if (coms.length) await db.insert(comentarios).values(coms);
  if (comunidade.reacoes.length)
    await db.insert(reacoes).values(
      comunidade.reacoes.map((r) => ({
        alvoTipo: r.alvo.tipo,
        alvoId: r.alvo.id,
        pessoa: r.pessoa,
        tipo: r.tipo,
      })),
    );
  if (comunidade.seguindo.length)
    await db
      .insert(seguindo)
      .values(
        comunidade.seguindo.map((s) => ({ seguidor: s.seguidor, alvoTipo: s.alvo.tipo, alvoId: s.alvo.id })),
      );
  if (comunidade.salvos.length) await db.insert(salvos).values(comunidade.salvos);
}

/**
 * Banco novo com o cenário de demonstração e o snapshot carregado. Os testes
 * chamam no beforeEach; substitui o antigo "restaurar acervo".
 */
export async function prepararDemonstracao({ demonstracao = true }: { demonstracao?: boolean } = {}) {
  await bancoDeTeste();
  esquecerAcervo();
  // O administrador da semente é a conta de curadoria da demonstração (id fixo para os testes).
  await contaRepositorio.criar({
    id: CONTA_ADMIN_DEMONSTRACAO.id,
    email: CONTA_ADMIN_DEMONSTRACAO.email,
    pseudonimo: CONTA_ADMIN_DEMONSTRACAO.pseudonimo,
    papel: "administrador",
    senhaHash: await hashDe(CONTA_ADMIN_DEMONSTRACAO.senha),
  });
  await semear({ email: CONTA_ADMIN_DEMONSTRACAO.email, senha: CONTA_ADMIN_DEMONSTRACAO.senha });
  if (demonstracao) await semearDemonstracao();
  await sincronizarAcervo();
}

/** Conta pelo e-mail, do diretório do snapshot (síncrono, como as regras leem). */
export const contaPorEmail = (email: string) =>
  contasDoDiretorio().find((c) => c.email === email.trim().toLowerCase()) ?? null;
export const contaPorId = contaNoDiretorio;
export const registrar = contas.registrar;

/** Armazenamento de arquivos em memória, no lugar do S3. */
const arquivos = new Map<string, Uint8Array>();
usarArmazenamento({
  enviar: async (chave, bytes) => {
    arquivos.set(chave, new Uint8Array(bytes));
  },
  baixar: async (chave) => arquivos.get(chave) ?? null,
});

/**
 * E2E: volta o banco apontado por DATABASE_URL ao cenário de demonstração,
 * sem derrubar as sessões das contas da demonstração. Auditoria e caixa de
 * saída ficam. A versão dos dados só sobe, então o servidor recarrega.
 */
export async function restaurarDemonstracaoNoBanco() {
  const db = banco();
  await db.execute(
    sql.raw(
      "TRUNCATE salas, conteudos, citacoes, videos, fontes, destaques, perfis_anfitriao, candidaturas, convites, midias, progresso_estudo, perfis_buscador, publicacoes, comentarios, reacoes, seguindo, salvos, denuncias CASCADE",
    ),
  );
  await db.delete(usuarios).where(
    notInArray(
      usuarios.id,
      CONTAS.map((c) => c.id),
    ),
  );
  await gravarContas({ comAdmin: true });
  await semear({ email: CONTA_ADMIN_DEMONSTRACAO.email, senha: CONTA_ADMIN_DEMONSTRACAO.senha });
  await semearDemonstracao();
}

/** Token de sessão de uma conta da demonstração (para o cookie simulado). */
export async function abrirSessao(email: string): Promise<string> {
  const conta = await contas.porEmail(email);
  if (!conta) throw new Error(`conta de demonstração inexistente: ${email}`);
  return contas.abrirSessao(conta.id);
}
