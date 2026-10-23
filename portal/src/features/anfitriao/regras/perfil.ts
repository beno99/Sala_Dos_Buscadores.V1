import { gerarSlug } from "@/features/admin/regras/slug";
import { validarLinkHttps } from "./artigo";

/*
 * Perfil público do anfitrião e candidatura (§2). Funções puras; o servidor
 * confere de novo.
 */

export const LIMITE_APRESENTACAO = 600;
export const LIMITE_CREDENCIAL = 120;

export interface FormCandidatura {
  nome: string;
  credencial: string;
  apresentacao: string;
  link: string;
}

export interface FormPerfil extends FormCandidatura {
  slug: string;
  /** Id de mídia do avatar. */
  avatar: string | null;
}

export function validarCandidatura(f: FormCandidatura): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!f.nome.trim()) erros["campo-nome"] = "escreva o nome público, como ele vai aparecer na assinatura.";
  const credencial = f.credencial.trim();
  if (!credencial) erros["campo-credencial"] = "diga em uma linha de onde vem seu conhecimento do tema.";
  else if (credencial.length > LIMITE_CREDENCIAL) {
    erros["campo-credencial"] = `use até ${LIMITE_CREDENCIAL} caracteres na credencial.`;
  }
  const apresentacao = f.apresentacao.trim();
  if (!apresentacao) erros["campo-apresentacao"] = "apresente-se em poucas linhas.";
  else if (apresentacao.length > LIMITE_APRESENTACAO) {
    erros["campo-apresentacao"] = `use até ${LIMITE_APRESENTACAO} caracteres na apresentação.`;
  }
  const erroLink = validarLinkHttps(f.link);
  if (erroLink) erros["campo-link"] = erroLink;
  return erros;
}

export function validarPerfil(f: FormPerfil, slugsOcupados: Iterable<string>): Record<string, string> {
  const erros = validarCandidatura(f);
  const slug = f.slug.trim();
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    erros["campo-slug"] = "use só letras minúsculas sem acento, números e hífens. Ex.: helena-varga";
  } else if (new Set(slugsOcupados).has(slug)) {
    erros["campo-slug"] = "este endereço já é de outro anfitrião. Mude o final, por exemplo com -2.";
  }
  return erros;
}

export const slugDoNome = (nome: string) => gerarSlug(nome).slice(0, 60) || "anfitriao";
