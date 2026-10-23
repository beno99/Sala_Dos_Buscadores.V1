import "server-only";
import { randomBytes } from "node:crypto";
import type { Preferencias } from "@/features/onboarding/preferencias";

/*
 * Contas e sessões simuladas, em memória no servidor: reiniciar o servidor
 * apaga tudo. Num backend real, a senha nunca fica em texto (bcrypt, RNF-01)
 * e a sessão usa JWT com expiração configurável; a interface já trata sucesso
 * e erro como uma API.
 */

/**
 * O cadastro é obrigatório; os papéis de conta são estes (RF-08). O anfitrião
 * é um membro que também mantém Salas próprias, com revisão da curadoria.
 */
export type Papel = "membro" | "anfitriao" | "administrador";

export interface Membro {
  /** Identificador estável da conta (dono das Salas e artigos de anfitrião). */
  id: string;
  pseudonimo: string;
  email: string;
  papel: Papel;
  /** Data do cadastro (ISO), mostrada como "Membro desde set 2026". */
  membroDesde: string;
  /** null até o onboarding ser concluído ou pulado (RF-07, agora no onboarding). */
  preferencias: Preferencias | null;
}

interface Registro extends Membro {
  senha: string;
}

/** Conta de demonstração de membro. A dica com a senha aparece na tela de entrar. */
export const CONTA_DEMONSTRACAO = {
  email: "buscador@exemplo.com",
  senha: "escada-de-quem-sobe",
  pseudonimo: "Buscador",
} as const;

/**
 * Conta de demonstração de administrador (curadoria). A senha fica só neste
 * arquivo: não aparece na interface nem no README.
 */
export const CONTA_ADMIN_DEMONSTRACAO = {
  email: "curadoria@saladosbuscadores.org",
  senha: "arco-e-escada-da-curadoria",
  pseudonimo: "Editoria do acervo",
} as const;

/**
 * Conta de demonstração de anfitrião. Pessoa fictícia; a senha fica só neste
 * arquivo, como a da curadoria.
 */
export const CONTA_ANFITRIAO_DEMONSTRACAO = {
  id: "u-anfitria-demo",
  email: "helena.varga@exemplo.com",
  senha: "anfitria-do-codice-ii",
  pseudonimo: "Helena Varga (demonstração)",
} as const;

/** Membro fictício com uma candidatura pendente para ser anfitrião. */
export const CONTA_CANDIDATA_DEMONSTRACAO = {
  id: "u-candidato-demo",
  email: "tomas.arruda@exemplo.com",
  senha: "candidato-ao-arco",
  pseudonimo: "Tomás Arruda (demonstração)",
} as const;

/** Pessoas fictícias adicionais da Comunidade; senhas só nesta configuração. */
export const CONTAS_COMUNIDADE_DEMONSTRACAO = [
  { id: "u-lucia-demo", email: "lucia@exemplo.com", pseudonimo: "Lúcia Mendes", papel: "membro" },
  { id: "u-rafael-demo", email: "rafael@exemplo.com", pseudonimo: "Rafael Souza", papel: "membro" },
  { id: "u-ana-demo", email: "ana@exemplo.com", pseudonimo: "Ana Ribeiro", papel: "anfitriao" },
] as const;

const ID_MEMBRO_DEMO = "u-buscador";
const ID_ADMIN_DEMO = "u-curadoria";

/** Ids das contas de demonstração: "Restaurar acervo" as recompõe; as outras não são tocadas. */
export const IDS_DEMONSTRACAO = [
  ID_MEMBRO_DEMO,
  ID_ADMIN_DEMO,
  ...CONTAS_COMUNIDADE_DEMONSTRACAO.map((c) => c.id),
  CONTA_ANFITRIAO_DEMONSTRACAO.id,
  CONTA_CANDIDATA_DEMONSTRACAO.id,
] as const;

const novoIdConta = () => `u-${randomBytes(6).toString("hex")}`;

interface Estado {
  contas: Map<string, Registro>;
  sessoes: Map<string, string>;
  /** Contas já conferidas pela migração abaixo. */
  migrado?: boolean;
  comunidadeMigrada?: boolean;
}

const chaveEstado = Symbol.for("sala-dos-buscadores.contas");
type ComEstado = typeof globalThis & { [chaveEstado]?: Estado };

/** A conta de demonstração já passou pelo onboarding: 2 interesses e "Prefiro não informar". */
const PREFERENCIAS_DEMONSTRACAO: Preferencias = {
  temas: ["alma"],
  salas: ["corpus-hermeticum"],
  conviccao: { tipo: "nao-informar" },
  concluidoEm: "2026-09-14T13:05:00.000Z",
};

const PREFERENCIAS_PULADAS = (quando: string): Preferencias => ({
  temas: [],
  salas: [],
  conviccao: { tipo: "pulada" },
  concluidoEm: quando,
});

function contasIniciais(): Map<string, Registro> {
  return new Map<string, Registro>([
    ...CONTAS_COMUNIDADE_DEMONSTRACAO.map((c): [string, Registro] => [
      c.email,
      {
        ...c,
        senha: "estudos-em-companhia",
        membroDesde: "2026-10-01T12:00:00.000Z",
        preferencias: PREFERENCIAS_PULADAS("2026-10-01T12:05:00.000Z"),
      },
    ]),
    [
      CONTA_DEMONSTRACAO.email,
      {
        ...CONTA_DEMONSTRACAO,
        id: ID_MEMBRO_DEMO,
        papel: "membro",
        membroDesde: "2026-09-14T13:00:00.000Z",
        preferencias: PREFERENCIAS_DEMONSTRACAO,
      },
    ],
    [
      CONTA_ADMIN_DEMONSTRACAO.email,
      {
        ...CONTA_ADMIN_DEMONSTRACAO,
        id: ID_ADMIN_DEMO,
        papel: "administrador",
        membroDesde: "2026-08-01T12:00:00.000Z",
        preferencias: PREFERENCIAS_PULADAS("2026-08-01T12:00:00.000Z"),
      },
    ],
    [
      CONTA_ANFITRIAO_DEMONSTRACAO.email,
      {
        ...CONTA_ANFITRIAO_DEMONSTRACAO,
        papel: "anfitriao",
        membroDesde: "2026-08-20T14:00:00.000Z",
        preferencias: PREFERENCIAS_PULADAS("2026-08-20T14:05:00.000Z"),
      },
    ],
    [
      CONTA_CANDIDATA_DEMONSTRACAO.email,
      {
        ...CONTA_CANDIDATA_DEMONSTRACAO,
        papel: "membro",
        membroDesde: "2026-09-25T18:00:00.000Z",
        preferencias: PREFERENCIAS_PULADAS("2026-09-25T18:03:00.000Z"),
      },
    ],
  ]);
}

function estado(): Estado {
  const g = globalThis as ComEstado;
  g[chaveEstado] ??= { contas: contasIniciais(), sessoes: new Map(), migrado: true };
  if (!g[chaveEstado].migrado) {
    migrarContas(g[chaveEstado].contas);
    g[chaveEstado].migrado = true;
  }
  if (!g[chaveEstado].comunidadeMigrada) {
    migrarContas(g[chaveEstado].contas);
    g[chaveEstado].comunidadeMigrada = true;
  }
  return g[chaveEstado];
}

/**
 * Contas criadas por uma versão anterior do código (recarga em `next dev`)
 * ganham id e as contas de demonstração que chegaram depois.
 */
function migrarContas(contas: Map<string, Registro>) {
  for (const conta of contas.values()) conta.id ??= novoIdConta();
  for (const [email, conta] of contasIniciais()) if (!contas.has(email)) contas.set(email, conta);
}

const chave = (email: string) => email.trim().toLowerCase();

const semSenha = ({ senha: _senha, ...membro }: Registro): Membro => structuredClone(membro);

export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; erro: string; campo?: "email" | "senha" | "pseudonimo" };

export function autenticar(email: string, senha: string): Resultado<Membro> {
  const conta = estado().contas.get(chave(email));
  if (!conta || conta.senha !== senha) {
    return { ok: false, erro: "e-mail ou senha não conferem. Confira os dois ou redefina a senha." };
  }
  return { ok: true, valor: semSenha(conta) };
}

/**
 * Cadastro público sempre cria membro; administrador só existe por atribuição
 * (RF-08). O cadastro por convite válido cria anfitrião: quem confere o
 * convite é src/server/anfitriao, antes de chamar aqui.
 */
export function registrar(
  dados: { pseudonimo: string; email: string; senha: string },
  opcoes: { papel?: Exclude<Papel, "administrador"> } = {},
): Resultado<Membro> {
  const email = chave(dados.email);
  if (estado().contas.has(email)) {
    return {
      ok: false,
      campo: "email",
      erro: "já existe uma conta com este e-mail. Entre ou redefina a senha.",
    };
  }
  const registro: Registro = {
    id: novoIdConta(),
    pseudonimo: dados.pseudonimo.trim(),
    email,
    senha: dados.senha,
    papel: opcoes.papel ?? "membro",
    membroDesde: new Date().toISOString(),
    preferencias: null,
  };
  estado().contas.set(email, registro);
  return { ok: true, valor: semSenha(registro) };
}

/** Recuperação de senha (RF-03). Responde igual exista ou não a conta, para não revelar cadastros. */
export function solicitarRedefinicao(_email: string): Resultado<{ validadeMin: number }> {
  return { ok: true, valor: { validadeMin: 30 } };
}

/** Grava as preferências do onboarding (já validadas). */
export function salvarPreferencias(email: string, preferencias: Preferencias): Resultado<Membro> {
  const conta = estado().contas.get(chave(email));
  if (!conta) return { ok: false, erro: "conta não encontrada. Entre de novo." };
  conta.preferencias = structuredClone(preferencias);
  return { ok: true, valor: semSenha(conta) };
}

/** Apaga só a resposta de religião ou convicção (RNF-LEG-03); os interesses ficam. */
export function apagarConviccao(email: string): Resultado<Membro> {
  const conta = estado().contas.get(chave(email));
  if (!conta) return { ok: false, erro: "conta não encontrada. Entre de novo." };
  if (conta.preferencias) conta.preferencias = { ...conta.preferencias, conviccao: { tipo: "pulada" } };
  return { ok: true, valor: semSenha(conta) };
}

// ---------- consulta e papel (curadoria) ----------

export function contaPorId(id: string): Membro | null {
  for (const conta of estado().contas.values()) if (conta.id === id) return semSenha(conta);
  return null;
}

export function contaPorEmail(email: string): Membro | null {
  const conta = estado().contas.get(chave(email));
  return conta ? semSenha(conta) : null;
}

export function listarContas(): Membro[] {
  return [...estado().contas.values()].map(semSenha);
}

/** Muda o papel entre membro e anfitrião. O papel de administrador não é dado nem tirado por aqui. */
export function definirPapel(id: string, papel: Exclude<Papel, "administrador">): Resultado<Membro> {
  const conta = [...estado().contas.values()].find((c) => c.id === id);
  if (!conta) return { ok: false, erro: "conta não encontrada." };
  if (conta.papel === "administrador") {
    return { ok: false, erro: "o papel de administrador não muda por aqui." };
  }
  conta.papel = papel;
  return { ok: true, valor: semSenha(conta) };
}

/** Volta as contas de demonstração ao estado inicial (papel, preferências); as demais ficam como estão. */
export function restaurarContasDemonstracao(): void {
  const iniciais = contasIniciais();
  for (const [email, conta] of iniciais) estado().contas.set(email, conta);
}

// ---------- sessões ----------

export function abrirSessao(email: string): string {
  const token = randomBytes(24).toString("base64url");
  estado().sessoes.set(token, chave(email));
  return token;
}

export function membroDaSessao(token: string | undefined): Membro | null {
  if (!token) return null;
  const email = estado().sessoes.get(token);
  const conta = email ? estado().contas.get(email) : undefined;
  return conta ? semSenha(conta) : null;
}

export function encerrarSessao(token: string | undefined): void {
  if (token) estado().sessoes.delete(token);
}

/** Só para testes: volta ao estado inicial. */
export function reiniciarContas() {
  const e = estado();
  e.contas = contasIniciais();
  e.sessoes.clear();
}
