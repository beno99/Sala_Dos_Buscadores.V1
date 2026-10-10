/** Retorna apenas um vídeo do YouTube; buscas e destinos ausentes não são links finais. */
export function youtubeVideoUrl(input, startAt = 0) {
  if (typeof input !== 'string' || !input.trim()) return null;
  let source;
  try { source = new URL(input); } catch { return null; }
  if (!['https:', 'http:'].includes(source.protocol)) return null;
  let id;
  if (source.hostname === 'youtu.be') id = source.pathname.slice(1);
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(source.hostname)) {
    if (source.pathname === '/watch') id = source.searchParams.get('v');
    else id = /^\/(?:shorts|embed|live)\/([^/]+)\/?$/.exec(source.pathname)?.[1];
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  const destination = new URL('https://www.youtube.com/watch');
  destination.searchParams.set('v', id);
  if (Number.isFinite(startAt) && startAt > 0) destination.searchParams.set('t', `${Math.floor(startAt)}s`);
  return destination.href;
}
