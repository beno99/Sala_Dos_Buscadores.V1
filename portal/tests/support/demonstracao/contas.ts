/* Contas fictícias usadas nos testes (o banco real nasce só com o administrador da semente). */

export type { Membro, Papel } from "@/modules/conta/conta.contratos";

export const CONTA_DEMONSTRACAO = {
  id: "u-buscador",
  email: "buscador@exemplo.com",
  senha: "escada-de-quem-sobe",
  pseudonimo: "Buscador",
} as const;

export const CONTA_ADMIN_DEMONSTRACAO = {
  id: "u-curadoria",
  email: "curadoria@saladosbuscadores.org",
  senha: "arco-e-escada-da-curadoria",
  pseudonimo: "Editoria do acervo",
} as const;

export const CONTA_ANFITRIAO_DEMONSTRACAO = {
  id: "u-anfitria-demo",
  email: "helena.varga@exemplo.com",
  senha: "anfitria-do-codice-ii",
  pseudonimo: "Helena Varga (demonstração)",
} as const;

export const CONTA_CANDIDATA_DEMONSTRACAO = {
  id: "u-candidato-demo",
  email: "tomas.arruda@exemplo.com",
  senha: "candidato-ao-arco",
  pseudonimo: "Tomás Arruda (demonstração)",
} as const;

export const CONTAS_COMUNIDADE_DEMONSTRACAO = [
  { id: "u-lucia-demo", email: "lucia@exemplo.com", pseudonimo: "Lúcia Mendes", papel: "membro" },
  { id: "u-rafael-demo", email: "rafael@exemplo.com", pseudonimo: "Rafael Souza", papel: "membro" },
  { id: "u-ana-demo", email: "ana@exemplo.com", pseudonimo: "Ana Ribeiro", papel: "anfitriao" },
] as const;
