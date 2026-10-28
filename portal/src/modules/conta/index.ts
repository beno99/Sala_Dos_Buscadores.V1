import "server-only";
import { autenticar } from "./casos-de-uso/autenticar";
import { definirPapel } from "./casos-de-uso/papel";
import { apagarConviccao, salvarPreferencias } from "./casos-de-uso/preferencias";
import { linkDeRedefinicaoValido, pedirRedefinicao, redefinirSenha } from "./casos-de-uso/redefinir";
import { registrar } from "./casos-de-uso/registrar";
import { abrirSessao, encerrarSessao, membroDaSessao } from "./casos-de-uso/sessao";
import type { DepsConta } from "./conta.contratos";
import { contaRepositorio, redefinicaoRepositorio, sessaoRepositorio } from "./conta.repositorio";

/* Composição do módulo: os casos de uso já ligados à persistência Postgres. */

const deps: DepsConta = {
  contas: contaRepositorio,
  sessoes: sessaoRepositorio,
  redefinicoes: redefinicaoRepositorio,
};

type SemDeps<F> = F extends (deps: never, ...args: infer A) => infer R ? (...args: A) => R : never;
const ligar = <F extends (deps: DepsConta, ...args: never[]) => unknown>(f: F): SemDeps<F> =>
  ((...args: never[]) => f(deps, ...args)) as SemDeps<F>;

export const contas = {
  autenticar: ligar(autenticar),
  registrar: ligar(registrar),
  abrirSessao: ligar(abrirSessao),
  membroDaSessao: ligar(membroDaSessao),
  encerrarSessao: ligar(encerrarSessao),
  salvarPreferencias: ligar(salvarPreferencias),
  apagarConviccao: ligar(apagarConviccao),
  definirPapel: ligar(definirPapel),
  pedirRedefinicao: ligar(pedirRedefinicao),
  redefinirSenha: ligar(redefinirSenha),
  linkDeRedefinicaoValido: ligar(linkDeRedefinicaoValido),
  porId: (id: string) => contaRepositorio.porId(id),
  porEmail: (email: string) => contaRepositorio.porEmail(email),
  listar: () => contaRepositorio.listar(),
};

export type { Membro, Papel, Resultado } from "./conta.contratos";
