export interface ImagemCarregavel {
  src: string;
  naturalWidth: number;
  onload: ((event: Event) => void) | null;
  onerror: ((event: Event | string) => void) | null;
}

/** Carregamento cancelável: fallback em erro, timeout ou placeholder de resolução ausente. */
export function carregarMiniatura(
  urls: string[],
  concluir: (url: string | undefined) => void,
  criar: () => ImagemCarregavel = () => new Image(),
): () => void {
  let cancelada = false;
  let atual: ImagemCarregavel | undefined;
  let tempo: ReturnType<typeof setTimeout> | undefined;
  const limpar = () => {
    clearTimeout(tempo);
    if (atual) {
      atual.onload = null;
      atual.onerror = null;
    }
  };
  const tentar = (indice: number) => {
    if (cancelada) return;
    limpar();
    const url = urls[indice];
    if (!url) {
      concluir(undefined);
      return;
    }
    const img = criar();
    atual = img;
    img.onload = () => {
      if (cancelada || atual !== img) return;
      if (img.naturalWidth <= 120) {
        tentar(indice + 1);
        return;
      }
      limpar();
      concluir(url);
    };
    img.onerror = () => {
      if (!cancelada && atual === img) tentar(indice + 1);
    };
    tempo = setTimeout(() => tentar(indice + 1), 10_000);
    img.src = url;
  };
  tentar(0);
  return () => {
    cancelada = true;
    limpar();
  };
}
