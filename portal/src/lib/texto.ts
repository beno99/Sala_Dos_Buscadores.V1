/** Minúsculas, sem acentos e com espaços simples: base de toda comparação de busca. */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-09-12" → "12 set 2026" (formato dos componentes da biblioteca). */
export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return iso;
  return `${dia} ${MESES[mes - 1]} ${ano}`;
}

/** plural(3, "conteúdo", "conteúdos") → "3 conteúdos" */
export function plural(n: number, singular: string, pluralForma: string): string {
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? singular : pluralForma}`;
}

/** Segundos com uma casa e vírgula, como pede o Indicador de consulta: "3,2 s". */
export function formatarSegundos(ms: number): string {
  return `${(ms / 1000).toFixed(1).replace(".", ",")} s`;
}

/** Trunca em `max` caracteres, sem cortar no meio da palavra quando possível. */
export function truncar(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  const corte = texto.slice(0, max - 1);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > max * 0.6 ? corte.slice(0, espaco) : corte).trimEnd()}…`;
}

/** Iniciais para o Avatar: "Três Iniciados" → "TI". */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}
