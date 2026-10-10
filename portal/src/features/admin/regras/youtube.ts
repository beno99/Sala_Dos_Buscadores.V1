/*
 * Vídeos do canal (RF-16). Aceita youtube.com/watch, youtu.be e
 * youtube.com/shorts, extrai o ID e recusa outros domínios. Não chama a API
 * do YouTube.
 */

const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS_YOUTUBE = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);

export type ResultadoUrl = { ok: true; id: string; canonica: string } | { ok: false; erro: string };

export function urlCanonica(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function extrairIdYoutube(entrada: string): ResultadoUrl {
  const texto = entrada.trim();
  if (!texto) return { ok: false, erro: "cole o endereço do vídeo no YouTube." };
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(texto) ? texto : `https://${texto}`);
  } catch {
    return { ok: false, erro: "o endereço não é válido. Ex.: https://www.youtube.com/watch?v=…" };
  }
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.split("/")[1] ?? null;
  else if (HOSTS_YOUTUBE.has(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] ?? null;
  } else {
    return { ok: false, erro: "só aceitamos vídeos do YouTube (youtube.com ou youtu.be)." };
  }
  if (!id || !ID.test(id)) {
    return { ok: false, erro: "não encontramos o código do vídeo. Use o link de “Compartilhar” do YouTube." };
  }
  return { ok: true, id, canonica: urlCanonica(id) };
}

/** Duração no formato mm:ss (minutos com 1 a 3 dígitos, segundos de 00 a 59). */
export function validarDuracao(duracao: string): string | null {
  const v = duracao.trim();
  if (!v) return "informe a duração no formato mm:ss. Ex.: 18:42";
  const m = /^(\d{1,3}):([0-5]\d)$/.exec(v);
  if (!m) return "use o formato mm:ss, com segundos de 00 a 59. Ex.: 18:42";
  if (Number(m[1]) === 0 && Number(m[2]) === 0) return "a duração não pode ser 00:00.";
  return null;
}
