/*
 * Vídeos do canal (RF-16). Aceita youtube.com/watch, youtu.be e
 * youtube.com/shorts e /embed, extrai o ID e recusa outros domínios. Não chama a API
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
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port) {
    return { ok: false, erro: "use um link público do YouTube, sem credenciais ou porta." };
  }
  const host = url.hostname.toLowerCase();
  let id: string | null = null;
  if (host === "youtu.be") id = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
  else if (HOSTS_YOUTUBE.has(host)) {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else id = /^\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
  } else if (host === "www.youtube-nocookie.com" || host === "youtube-nocookie.com") {
    id = /^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1] ?? null;
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

/** Endereços fixos; nunca consulta o domínio fornecido pelo usuário. */
export function miniaturasYoutube(id: string): string[] {
  if (!ID.test(id)) return [];
  return ["maxresdefault", "hqdefault", "mqdefault"].map(
    (qualidade) => `https://i.ytimg.com/vi/${id}/${qualidade}.jpg`,
  );
}
