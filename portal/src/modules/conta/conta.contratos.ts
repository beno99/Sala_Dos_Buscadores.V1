import type { Preferencias } from "@/features/onboarding/preferencias";

/*
 * Contratos do módulo de conta: o formato que sai para as telas e as
 * interfaces que a persistência implementa (conta.repositorio.ts).
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
  /** null até o onboarding ser concluído ou pulado (RF-07). */
  preferencias: Preferencias | null;
  /** null até confirmar o e-mail; enquanto nulo, o app todo redireciona para /confirmar-email. */
  emailVerificadoEm: string | null;
}

export type Resultado<T> =
  | { ok: true; valor: T }
  | { ok: false; erro: string; campo?: "email" | "senha" | "pseudonimo" };

export interface NovaConta {
  id: string;
  pseudonimo: string;
  email: string;
  senhaHash: string;
  papel: Papel;
}

export interface ContaRepositorio {
  /** Com o hash da senha, só para a autenticação. */
  credenciais(email: string): Promise<{ membro: Membro; senhaHash: string } | null>;
  porId(id: string): Promise<Membro | null>;
  porEmail(email: string): Promise<Membro | null>;
  listar(): Promise<Membro[]>;
  criar(conta: NovaConta): Promise<Membro>;
  definirPapel(id: string, papel: Papel): Promise<Membro | null>;
  definirPreferencias(id: string, preferencias: Preferencias | null): Promise<Membro | null>;
  definirSenha(id: string, senhaHash: string): Promise<void>;
  marcarEmailVerificado(id: string): Promise<Membro | null>;
}

export interface SessaoRepositorio {
  criar(sessao: { tokenHash: string; usuarioId: string; expiraEm: Date }): Promise<void>;
  /** Só sessões ainda válidas em `agora`. */
  membro(tokenHash: string, agora: Date): Promise<Membro | null>;
  apagar(tokenHash: string): Promise<void>;
  apagarDoUsuario(usuarioId: string): Promise<void>;
}

export interface RedefinicaoRepositorio {
  criar(pedido: { tokenHash: string; usuarioId: string; expiraEm: Date }): Promise<void>;
  consumir(tokenHash: string, agora: Date): Promise<string | null>;
  valido(tokenHash: string, agora: Date): Promise<boolean>;
}

export interface VerificacaoRepositorio {
  criar(pedido: { tokenHash: string; usuarioId: string; expiraEm: Date }): Promise<void>;
  consumir(tokenHash: string, agora: Date): Promise<string | null>;
}

export interface DepsConta {
  contas: ContaRepositorio;
  sessoes: SessaoRepositorio;
  redefinicoes: RedefinicaoRepositorio;
  verificacoes: VerificacaoRepositorio;
}
