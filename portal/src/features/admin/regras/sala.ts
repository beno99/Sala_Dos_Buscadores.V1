import type { Placa } from "@/data/types";
import { validarLinkHttps } from "@/features/anfitriao/regras/artigo";
import type { ItemChecklist } from "./checklist";
import { gerarSlug } from "./slug";

/*
 * Sala oficial da curadoria (curadoria a partir da Sala, §4). Funções puras:
 * o formulário e o servidor usam as mesmas regras. O ciclo é o da curadoria
 * (rascunho, publicado, arquivado), publicado direto, sem fila.
 */

export interface FormSalaOficial {
  id: string | null;
  nome: string;
  /** Gerado no servidor no primeiro salvamento; somente leitura daí em diante. */
  slug: string;
  tradicao: string;
  /** Rótulo curto da coluna na grade comparativa. */
  tradicaoCurta: string;
  descricao: string;
  periodo: string;
  placa: Placa;
  inicial: string;
  /** Id de mídia do banner enviado (opcional; sem ele, a placa). */
  imagem: string | null;
  /** Id de mídia da imagem do card (opcional; sem ela, o card usa o banner). */
  imagemCard: string | null;
  /** Link geral, só https (opcional). */
  link: string;
}

export const salaOficialVazia = (): FormSalaOficial => ({
  id: null,
  nome: "",
  slug: "",
  tradicao: "",
  tradicaoCurta: "",
  descricao: "",
  periodo: "",
  placa: "bordo",
  inicial: "",
  imagem: null,
  imagemCard: null,
  link: "",
});

export const LIMITE_NOME_SALA_OFICIAL = 80;
export const LIMITE_TRADICAO_CURTA = 40;
export const LIMITE_DESCRICAO_SALA_OFICIAL = 600;

/** Endereços usados por rotas de criação, comuns às Salas oficiais e de anfitriões. */
export const SLUGS_SALA_RESERVADOS: ReadonlySet<string> = new Set(["nova"]);

export const slugDaSala = (nome: string) => gerarSlug(nome).slice(0, 60).replace(/-+$/g, "") || "sala";

/** Candidato determinístico; a reserva definitiva é feita pelo UNIQUE do Postgres. */
export function candidatoSlugSala(nome: string, tentativa = 1): string {
  const base = slugDaSala(nome);
  return tentativa === 1 ? base : `${base}-${tentativa}`;
}

/** Validações de qualquer salvamento. O endereço não é uma entrada do usuário. */
export function validarSalaOficial(f: FormSalaOficial) {
  const erros: Record<string, string> = {};
  const nome = f.nome.trim();
  if (!nome) erros["campo-sala-nome"] = "escreva o nome da Sala para salvar o rascunho.";
  else if (nome.length > LIMITE_NOME_SALA_OFICIAL) {
    erros["campo-sala-nome"] = `use até ${LIMITE_NOME_SALA_OFICIAL} caracteres no nome.`;
  }
  if (f.tradicaoCurta.trim().length > LIMITE_TRADICAO_CURTA) {
    erros["campo-sala-tradicao-curta"] =
      `use até ${LIMITE_TRADICAO_CURTA} caracteres: é o rótulo da coluna na grade.`;
  }
  if (f.descricao.trim().length > LIMITE_DESCRICAO_SALA_OFICIAL) {
    erros["campo-sala-descricao"] = `use até ${LIMITE_DESCRICAO_SALA_OFICIAL} caracteres na descrição.`;
  }
  const inicial = f.inicial.trim();
  if (inicial && !/^\p{L}$/u.test(inicial)) erros["campo-sala-inicial"] = "use uma letra só. Ex.: H";
  const erroLink = validarLinkHttps(f.link);
  if (erroLink) erros["campo-sala-link"] = erroLink;
  return erros;
}

const item = (id: string, ok: boolean, rotulo: string, campo: string, ajuda: string): ItemChecklist => ({
  id,
  rotulo,
  estado: ok ? "ok" : "pendente",
  campo,
  requisito: "Curadoria §4",
  ajuda,
});

/** O que falta para publicar a Sala (o mesmo ChecklistPublicacao dos artigos). */
export function checklistSala(f: FormSalaOficial): ItemChecklist[] {
  return [
    item(
      "nome",
      Boolean(f.nome.trim()),
      "Nome",
      "campo-sala-nome",
      "O nome aparece no card e no topo da Sala.",
    ),
    item(
      "tradicao",
      Boolean(f.tradicao.trim()),
      "Tradição",
      "campo-sala-tradicao",
      "Tradição ou corpus em uma linha, abaixo do nome no card.",
    ),
    item(
      "tradicao-curta",
      Boolean(f.tradicaoCurta.trim()),
      "Tradição curta",
      "campo-sala-tradicao-curta",
      "Rótulo da coluna da Sala na grade comparativa.",
    ),
    item(
      "descricao",
      Boolean(f.descricao.trim()),
      "Descrição",
      "campo-sala-descricao",
      "Apresenta a Sala no topo da página: descreva, não prometa.",
    ),
    item(
      "inicial",
      /^\p{L}$/u.test(f.inicial.trim()),
      "Inicial",
      "campo-sala-inicial",
      "Uma letra para as capas compostas.",
    ),
  ];
}

/** Por que a Sala não está no portal (ou null quando está). */
export function motivoForaDoAr(sala: { status: string }, artigosPublicados: number): string | null {
  if (sala.status === "arquivado") return "Arquivada";
  if (sala.status !== "publicado") return "Rascunho: publique a Sala";
  if (artigosPublicados === 0) return "Sem artigo publicado";
  return null;
}
