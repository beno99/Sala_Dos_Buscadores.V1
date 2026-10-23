/*
 * Item de imagens do acervo: texto alternativo, foco (object-position) e
 * crédito das fotos de public/imagens, como no manifesto do LEIA-ME.md da
 * pasta. Só entram imagens com origem registrada; sem item, a peça usa
 * alt vazio e não mostra crédito (nunca inventa atribuição).
 */

export interface ItemImagem {
  alt: string;
  foco?: string;
  credito: string;
}

const LEVI: ItemImagem = {
  alt: "Gravura de uma figura coroada e seu reflexo invertido na água, dentro de uma serpente que morde a própria cauda",
  foco: "50% 45%",
  credito:
    "Éliphas Lévi, “O grande símbolo de Salomão”, em Dogme et rituel de la haute magie (1854–1856), domínio público; a coloração é posterior, autoria a confirmar.",
};

const ASTRONOMO: ItemImagem = {
  alt: "Gravura de um astrônomo que mede as estrelas com uma balestilha num terraço de templo egípcio",
  foco: "50% 30%",
  credito: "Gravura colorida do séc. XIX; atribuição a confirmar.",
};

const IMAGENS: Record<string, ItemImagem> = {
  "/imagens/banner/marca.webp": {
    alt: "Gravura de um estudioso lendo um grande livro aberto num atril, ao lado de uma janela gótica",
    foco: "55% 35%",
    credito: "Gravura do séc. XIX; autoria a confirmar.",
  },
  "/imagens/banner/marca-colunata.webp": {
    alt: "Gravura de uma colunata monumental vista entre colunas em primeiro plano, com figuras pequenas no pátio",
    foco: "60% 50%",
    credito: "Gravura arquitetônica, provavelmente séc. XVIII–XIX; autoria e direitos a confirmar.",
  },
  "/imagens/banner/v-poimandres.webp": ASTRONOMO,
  "/imagens/episodios/v-poimandres.webp": ASTRONOMO,
  "/imagens/banner/v-caibalion-principios.webp": LEVI,
  "/imagens/episodios/v-caibalion-principios.webp": LEVI,
  "/imagens/conteudos/sete-principios-hermeticos.webp": LEVI,
  "/imagens/salas/corpus-hermeticum.webp": {
    alt: "Gravura de um astrônomo junto a uma esfera armilar num observatório egípcio, com pirâmides ao fundo",
    foco: "45% 55%",
    credito:
      "Gravura do séc. XIX, frequentemente identificada como Hiparco em Alexandria; atribuição a confirmar.",
  },
  "/imagens/salas/caibalion.webp": {
    alt: "Pintura de um templo no alto de sete degraus, cada um com o nome de uma operação alquímica",
    foco: "50% 60%",
    credito: "Pintura alquímica, provavelmente séc. XVII; acervo e autoria a confirmar.",
  },
};

export function itemDaImagem(src: string | undefined): ItemImagem | undefined {
  return src ? IMAGENS[src] : undefined;
}
