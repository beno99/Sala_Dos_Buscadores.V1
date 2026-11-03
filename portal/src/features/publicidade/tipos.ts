export interface Enquadramento {
  x: number;
  y: number;
  zoom: number;
}
export interface FormPublicidade {
  imagemId: string | null;
  alt: string;
  categoria: string;
  titulo: string;
  descricao: string;
  href: string;
  textoLink: string;
  anunciante: string;
  enquadramento: Enquadramento;
}
export interface Anuncio extends FormPublicidade {
  id: string;
  donoId: string;
  status: "rascunho" | "publicado";
  versao: number;
  criadoEm: string;
  atualizadoEm: string;
}
export type AnuncioPublico = FormPublicidade & { id: string };
export type AcaoPublicidade = "rascunho" | "publicar" | "salvar";
export type ResultadoPublicidade =
  | { ok: true; anuncio: Anuncio; mensagem: string }
  | { ok: false; mensagem: string; erros?: Record<string, string> };
export const TEXTO_LINK_PADRAO = "Conhecer o produto";
export function formularioVazio(anunciante = ""): FormPublicidade {
  return {
    imagemId: null,
    alt: "",
    categoria: "",
    titulo: "",
    descricao: "",
    href: "",
    textoLink: TEXTO_LINK_PADRAO,
    anunciante,
    enquadramento: { x: 50, y: 50, zoom: 1 },
  };
}
export const urlImagemPublicidade = (id: string) => `/api/publicidade/imagens/${encodeURIComponent(id)}`;
