import { type FormPublicidade, formularioVazio, TEXTO_LINK_PADRAO } from "./tipos";

/** Também recebe entradas desconhecidas: a validação do navegador não é uma fronteira de confiança. */
export function validarPublicidade(
  entrada: unknown,
  publicar: boolean,
): { form: FormPublicidade; erros: Record<string, string> } {
  const erros: Record<string, string> = {};
  const form = formularioVazio();
  const raw =
    entrada && typeof entrada === "object" && !Array.isArray(entrada)
      ? (entrada as Record<string, unknown>)
      : {};
  const limites = {
    alt: 500,
    categoria: 40,
    titulo: 80,
    descricao: 240,
    href: 2048,
    textoLink: 30,
    anunciante: 80,
  } as const;
  for (const [campo, limite] of Object.entries(limites) as [keyof typeof limites, number][]) {
    if (raw[campo] !== undefined && typeof raw[campo] !== "string") erros[campo] = "Informe um texto válido.";
    const texto = typeof raw[campo] === "string" ? raw[campo].trim() : "";
    form[campo] = texto;
    if (texto.length > limite) erros[campo] = `Use até ${limite} caracteres.`;
  }
  form.textoLink ||= TEXTO_LINK_PADRAO;
  if (
    raw.imagemId !== undefined &&
    raw.imagemId !== null &&
    (typeof raw.imagemId !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(raw.imagemId))
  )
    erros.imagemId = "Envie uma imagem válida.";
  else form.imagemId = typeof raw.imagemId === "string" ? raw.imagemId : null;
  if (raw.enquadramento !== undefined) {
    const e = raw.enquadramento as Record<string, unknown> | null;
    if (
      !e ||
      typeof e !== "object" ||
      ![e.x, e.y, e.zoom].every((v) => typeof v === "number" && Number.isFinite(v)) ||
      Number(e.x) < 0 ||
      Number(e.x) > 100 ||
      Number(e.y) < 0 ||
      Number(e.y) > 100 ||
      Number(e.zoom) < 1 ||
      Number(e.zoom) > 3
    )
      erros.enquadramento = "Ajuste o enquadramento dentro dos limites indicados.";
    else form.enquadramento = { x: Number(e.x), y: Number(e.y), zoom: Number(e.zoom) };
  }
  if (form.href) {
    try {
      const url = new URL(form.href);
      if (
        !/^https?:\/\//i.test(form.href) ||
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname ||
        url.username ||
        url.password
      )
        throw new Error("url");
    } catch {
      erros.href = "Informe um endereço válido começando com http:// ou https://.";
    }
  }
  if (publicar) {
    if (!form.imagemId) erros.imagemId = "Envie a imagem do produto antes de publicar.";
    for (const campo of ["alt", "titulo", "descricao", "href", "anunciante"] as const)
      if (!form[campo]) erros[campo] = "Preencha este campo para publicar.";
  }
  return { form, erros };
}
