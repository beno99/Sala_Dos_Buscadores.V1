import "server-only";
import { randomBytes } from "node:crypto";
import type { Preferencias } from "@/features/onboarding/preferencias";

/*
 * Contas e sessões simuladas, em memória no servidor: reiniciar o servidor
 * apaga tudo. Num backend real, a senha nunca fica em texto (bcrypt, RNF-01)
 * e a sessão usa JWT com expiração configurável; a interface já trata sucesso
 * e erro como uma API.
 */

/** O cadastro é obrigatório; os papéis de conta são estes (RF-08). */
export type Papel = "membro" | "administrador";

export interface Membro {
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

interface Estado {
  contas: Map<string, Registro>;
  sessoes: Map<string, string>;
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

function contasIniciais(): Map<string, Registro> {
  return new Map<string, Registro>([
    [
      CONTA_DEMONSTRACAO.email,
      {
        ...CONTA_DEMONSTRACAO,
        papel: "membro",
        membroDesde: "2026-09-14T13:00:00.000Z",
        preferencias: PREFERENCIAS_DEMONSTRACAO,
      },
    ],
    [
      CONTA_ADMIN_DEMONSTRACAO.email,
      {
        ...CONTA_ADMIN_DEMONSTRACAO,
        papel: "administrador",
        membroDesde: "2026-08-01T12:00:00.000Z",
        preferencias: {
          temas: [],
          salas: [],
          conviccao: { tipo: "pulada" },
          concluidoEm: "2026-08-01T12:00:00.000Z",
        },
      },
    ],
  ]);
}

function estado(): Estado {
  const g = globalThis as ComEstado;
  g[chaveEstado] ??= { contas: contasIniciais(), sessoes: new Map() };
  return g[chaveEstado];
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

/** Cadastro público sempre cria membro; administrador só existe por atribuição (RF-08). */
export function registrar(dados: { pseudonimo: string; email: string; senha: string }): Resultado<Membro> {
  const email = chave(dados.email);
  if (estado().contas.has(email)) {
    return {
      ok: false,
      campo: "email",
      erro: "já existe uma conta com este e-mail. Entre ou redefina a senha.",
    };
  }
  const registro: Registro = {
    pseudonimo: dados.pseudonimo.trim(),
    email,
    senha: dados.senha,
    papel: "membro",
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
