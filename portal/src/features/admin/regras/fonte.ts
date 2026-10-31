import type { FormFonte } from "../formularios";
import type { ItemChecklist } from "./checklist";

const TIPOS = ["Fonte primária", "Tradução comentada", "Estudo acadêmico", "Edição crítica"];
export function errosDaFonte(f: FormFonte): Record<string, string> {
  const erros: Record<string, string> = {};
  if (!f.titulo.trim()) erros["campo-fonte-titulo"] = "escreva o título da obra.";
  if (!f.autor.trim())
    erros["campo-fonte-autor"] = "escreva o autor, editor ou tradutor, com o papel entre parênteses.";
  if (!f.tradicao.trim()) erros["campo-fonte-tradicao"] = "diga a tradição ou o conjunto de textos da obra.";
  if (!f.referencia.trim())
    erros["campo-fonte-referencia"] = "escreva editora e ano, ou o documento de origem.";
  if (!TIPOS.includes(f.tipo)) erros["campo-fonte-tipo"] = "escolha o tipo de fonte.";
  if (f.url.trim()) {
    try {
      const url = new URL(f.url.trim());
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".")) throw new Error();
    } catch {
      erros["campo-fonte-url"] = "use um endereço completo, começando por https://";
    }
  }
  return erros;
}

export function checklistFonte(f: FormFonte): ItemChecklist[] {
  const erros = errosDaFonte(f);
  const campos: [string, string, string][] = [
    ["titulo", "Título da obra", "Use o título da própria fonte; a inicial da capa é automática."],
    [
      "autor",
      "Autor, editor ou tradutor",
      "Indique quem responde pela obra e seu papel. Não invente autoria.",
    ],
    ["tradicao", "Tradição", "Identifique a tradição ou o conjunto de textos estudados."],
    ["tipo", "Tipo de fonte", "Escolha a classificação bibliográfica."],
    ["referencia", "Referência", "Informe editora e ano ou documento de origem."],
  ];
  if (f.url.trim())
    campos.push(["url", "Endereço válido", "O endereço é opcional; quando informado, precisa ser válido."]);
  return campos.map(([id, rotulo, ajuda]) => ({
    id,
    rotulo,
    ajuda,
    campo: `campo-fonte-${id}`,
    requisito: "Cadastro da fonte",
    estado: erros[`campo-fonte-${id}`] ? "pendente" : "ok",
  }));
}
