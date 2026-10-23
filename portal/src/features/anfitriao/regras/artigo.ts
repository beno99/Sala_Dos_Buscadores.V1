import { paragrafosDoCorpo, textoDoCorpo } from "@/data/corpo";
import type { BlocoCorpo, LinkArtigo, Nivel, Placa, TemaSlug, TipoFonte } from "@/data/types";
import conteudo from "@/design-system/conteudo.json";
import { textoSemMarcas } from "@/design-system/marcacao.mjs";
import { type ItemChecklist, regrasDoCorpo } from "@/features/admin/regras/checklist";
import { extrairIdYoutube } from "@/features/admin/regras/youtube";

/*
 * Formulários e campos calculados da Sala e do artigo de anfitrião (§3.1,
 * §3.2). Funções puras, usadas pela área do anfitrião e pelo servidor (que
 * confere tudo de novo).
 */

// ---------- Sala ----------

export interface FormSalaAnfitriao {
  id: string | null;
  nome: string;
  descricao: string;
  /** Opcional; aparece na página da Sala quando preenchido. Datas incertas ficam incertas. */
  periodo: string;
  /** Link geral da Sala (site ou canal), só https. */
  link: string;
  /** Id de mídia da imagem enviada. */
  imagem: string | null;
}

export const salaVazia = (): FormSalaAnfitriao => ({
  id: null,
  nome: "",
  descricao: "",
  periodo: "",
  link: "",
  imagem: null,
});

export const LIMITE_NOME_SALA = 80;
export const LIMITE_DESCRICAO_SALA = 600;

export function validarSala(f: FormSalaAnfitriao): Record<string, string> {
  const erros: Record<string, string> = {};
  const nome = f.nome.trim();
  if (!nome) erros["campo-sala-nome"] = "escreva o nome da Sala.";
  else if (nome.length > LIMITE_NOME_SALA) {
    erros["campo-sala-nome"] = `use até ${LIMITE_NOME_SALA} caracteres no nome.`;
  }
  if (f.descricao.trim().length > LIMITE_DESCRICAO_SALA) {
    erros["campo-sala-descricao"] = `use até ${LIMITE_DESCRICAO_SALA} caracteres na descrição.`;
  }
  const erroLink = validarLinkHttps(f.link);
  if (erroLink) erros["campo-sala-link"] = erroLink;
  return erros;
}

/** Para enviar a Sala: nome e descrição (o card e a página não ficam com buracos). */
export function pendenciasEnvioSala(f: Pick<FormSalaAnfitriao, "nome" | "descricao">): string[] {
  const faltas: string[] = [];
  if (!f.nome.trim()) faltas.push("o nome da Sala");
  if (!f.descricao.trim()) faltas.push("a descrição da Sala");
  return faltas;
}

/** Campos da Sala que o anfitrião não preenche: tirados do nome e do perfil. */
export function camposCalculadosSala(nome: string, anfitriao: string) {
  return {
    tradicao: `Sala de anfitrião · ${anfitriao}`,
    tradicaoCurta: anfitriao,
    inicial: (nome.trim()[0] ?? "S").toUpperCase(),
    placa: "grafite" as Placa,
  };
}

/** Link de Sala, de perfil ou de site: opcional, mas, se vier, só https. */
export function validarLinkHttps(entrada: string): string | null {
  const texto = entrada.trim();
  if (!texto) return null;
  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return "use um endereço completo, começando por https://";
  }
  if (url.protocol !== "https:") return "só aceitamos endereços seguros, começando por https://";
  if (!url.hostname.includes(".")) return "o endereço não parece completo. Ex.: https://www.exemplo.org";
  return null;
}

// ---------- artigo ----------

export interface FormArtigoAnfitriao {
  id: string | null;
  /** Id da Sala do próprio anfitrião. */
  salaId: string;
  titulo: string;
  /** Blocos do texto; parágrafos com marcação mínima (*termo*, _obra_). O primeiro é o lead. */
  corpo: BlocoCorpo[];
  temas: TemaSlug[];
  /** Ids de fontes do catálogo ou propostas pelo próprio anfitrião. */
  fontes: string[];
  /** Opcional; sem escolha, Iniciante. */
  nivel: Nivel | null;
  /** Um link só: YouTube (vira player) ou site (vira "Ler no site"). */
  link: string;
  /** Ids de mídia. */
  imagemCard: string | null;
  thumb: string | null;
}

export const artigoVazio = (salaId: string): FormArtigoAnfitriao => ({
  id: null,
  salaId,
  titulo: "",
  corpo: [""],
  temas: [],
  fontes: [],
  nivel: null,
  link: "",
  imagemCard: null,
  thumb: null,
});

export const LIMITE_TITULO = 120;
export const LIMITE_RESUMO = conteudo.limiteResumoLead;
export const PALAVRAS_POR_MINUTO = 200;

const semMarcacao = (texto: string) => textoSemMarcas(texto).replace(/\s+/g, " ").trim();

/** O resumo sai do primeiro parágrafo (o lead): cerca de 180 caracteres, cortado em palavra. */
export function resumoDoTexto(corpo: readonly BlocoCorpo[]): string {
  const primeiro = semMarcacao(paragrafosDoCorpo(corpo).find((p) => p.trim()) ?? "");
  if (primeiro.length <= LIMITE_RESUMO) return primeiro;
  const corte = primeiro.slice(0, LIMITE_RESUMO + 1);
  const ate = corte.lastIndexOf(" ");
  return `${(ate > 60 ? corte.slice(0, ate) : corte.slice(0, LIMITE_RESUMO)).replace(/[\s,;:.–-]+$/, "")}…`;
}

/** Tempo de leitura pela contagem de palavras do texto (imagens não contam), arredondado para cima; no mínimo 1 minuto. */
export function duracaoDoTexto(corpo: readonly BlocoCorpo[]): number {
  const palavras = textoDoCorpo(corpo).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(palavras / PALAVRAS_POR_MINUTO));
}

export type ResultadoLink = { ok: true; link: LinkArtigo | null } | { ok: false; erro: string };

const HOST_YOUTUBE = /(^|\.)youtube\.com$|^youtu\.be$/i;

/** O link do artigo: vazio, vídeo do YouTube ou site externo em https. */
export function interpretarLink(entrada: string): ResultadoLink {
  const texto = entrada.trim();
  if (!texto) return { ok: true, link: null };
  let host = "";
  try {
    host = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`).hostname;
  } catch {
    return { ok: false, erro: "o endereço não é válido. Cole o link completo do vídeo ou do site." };
  }
  if (HOST_YOUTUBE.test(host)) {
    const yt = extrairIdYoutube(texto);
    return yt.ok ? { ok: true, link: { tipo: "youtube", url: yt.canonica, youtubeId: yt.id } } : yt;
  }
  const erro = validarLinkHttps(texto);
  return erro ? { ok: false, erro } : { ok: true, link: { tipo: "site", url: new URL(texto).toString() } };
}

/** Validações que valem para qualquer salvamento, inclusive o rascunho automático. */
export function validarArtigoParaSalvar(f: FormArtigoAnfitriao): Record<string, string> {
  const erros: Record<string, string> = {};
  const titulo = f.titulo.trim();
  if (!titulo) erros["campo-titulo"] = "escreva o título para salvar o rascunho.";
  else if (titulo.length > LIMITE_TITULO) erros["campo-titulo"] = `use até ${LIMITE_TITULO} caracteres.`;
  const link = interpretarLink(f.link);
  if (!link.ok) erros["campo-link"] = link.erro;
  return erros;
}

const item = (id: string, ok: boolean, rotulo: string, campo: string, ajuda: string): ItemChecklist => ({
  id,
  rotulo,
  estado: ok ? "ok" : "pendente",
  campo,
  requisito: "Anfitriões §3.2",
  ajuda,
});

/** O que falta para poder enviar o artigo: título, texto, tema, fonte e aceite (§5). */
export function checklistEnvioArtigo(f: FormArtigoAnfitriao, aceite: boolean): ItemChecklist[] {
  return [
    item(
      "titulo",
      Boolean(f.titulo.trim()),
      "Título",
      "campo-titulo",
      "O título aparece no card e na página.",
    ),
    item(
      "texto",
      paragrafosDoCorpo(f.corpo).some((p) => p.trim()),
      "Texto",
      "campo-corpo",
      "O primeiro parágrafo vira o resumo do card.",
    ),
    ...regrasDoCorpo(f, "Anfitriões §3.2").filter((i) => i.estado === "pendente"),
    item(
      "temas",
      f.temas.length > 0,
      "Pelo menos um tema",
      "campo-temas",
      "Os temas ligam o artigo à busca por tema do portal.",
    ),
    item(
      "fontes",
      f.fontes.length > 0,
      "Pelo menos uma fonte",
      "campo-fontes",
      "Toda afirmação é atribuída a uma fonte. Escolha no catálogo ou cadastre uma nova.",
    ),
    item(
      "aceite",
      aceite,
      "Declaração de direitos",
      "campo-aceite",
      "Declare que tem direito de usar as imagens e os textos enviados.",
    ),
  ];
}

export const temPendencia = (itens: ItemChecklist[]) => itens.some((i) => i.estado === "pendente");

// ---------- fonte proposta (§3.3) ----------

export const TIPOS_FONTE: TipoFonte[] = [
  "Fonte primária",
  "Tradução comentada",
  "Estudo acadêmico",
  "Edição crítica",
];

export interface FormFonteProposta {
  titulo: string;
  autor: string;
  tipo: TipoFonte | "";
  /** Editora e ano, ou o documento de origem. */
  localizacao: string;
}

export function validarFonteProposta(f: FormFonteProposta): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-fonte-titulo"] = "escreva o título da obra.";
  if (!f.autor.trim()) {
    erros["campo-fonte-autor"] = "escreva o autor, editor ou tradutor, com o papel entre parênteses.";
  }
  if (!TIPOS_FONTE.includes(f.tipo as TipoFonte)) erros["campo-fonte-tipo"] = "escolha o tipo de fonte.";
  if (!f.localizacao.trim())
    erros["campo-fonte-localizacao"] = "escreva editora e ano, ou o documento de origem.";
  return erros;
}
