import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { NIVEL_ROTULO, PROVENIENCIA_ROTULO } from "@/data/rotulos";

/** Opções dos selects de filtro e de formulário da curadoria. */
export const OPCOES_SALA = [
  { value: "", label: "Todas as Salas" },
  ...todasAsSalas().map((s) => ({ value: s.slug, label: s.nome })),
];
export const OPCOES_TEMA = [
  { value: "", label: "Todos os temas" },
  ...todosOsTemas().map((t) => ({ value: t.slug, label: t.nome })),
];
export const OPCOES_STATUS = [
  { value: "", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "publicado", label: "Publicado" },
  { value: "arquivado", label: "Arquivado" },
];
export const OPCOES_NIVEL = [
  { value: "", label: "Todos os níveis" },
  ...([1, 2, 3] as const).map((n) => ({ value: String(n), label: NIVEL_ROTULO[n] })),
];
export const OPCOES_PROVENIENCIA = [
  { value: "", label: "Todas as proveniências" },
  ...(Object.keys(PROVENIENCIA_ROTULO) as (keyof typeof PROVENIENCIA_ROTULO)[]).map((p) => ({
    value: p,
    label: PROVENIENCIA_ROTULO[p],
  })),
];
export const OPCOES_TIPO = [
  { value: "", label: "Todos os tipos" },
  { value: "artigo", label: "Artigo" },
  { value: "fonte-primaria", label: "Fonte primária" },
];
