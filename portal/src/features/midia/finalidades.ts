import { LIMITE_IMAGEM_BYTES } from "@/features/anfitriao/regras/imagem";

/*
 * Dimensões recomendadas por finalidade (revisão de imagens de 31/10/2026).
 * Fonte única para o texto junto ao campo de upload, o diagnóstico depois da
 * escolha, a prévia e o manual de operação (docs/manual-operacao.md).
 *
 * As medidas saíram do layout real, medido em 390, 768, 1280, 1440 e 1920 px
 * de largura de tela, e dobradas para telas de densidade 2×. São recomendações:
 * só formato, arquivo inválido e o limite de tamanho bloqueiam o envio. Toda
 * imagem é exibida inteira (sem recorte nem deformação); quando a proporção do
 * arquivo difere da moldura, sobra fundo.
 */

export type Finalidade =
  | "banner-sala"
  | "card-sala"
  | "card-artigo"
  | "topo-artigo"
  | "corpo-artigo"
  | "avatar"
  | "capa-perfil"
  | "comunidade"
  | "anuncio";

export interface OrientacaoImagem {
  /** Nome da finalidade, como aparece no campo ("Banner da Sala"). */
  rotulo: string;
  /** Breve orientação editorial exibida acima do upload. */
  descricao: string;
  largura: number;
  altura: number;
  /** Proporção largura:altura, ex.: "3:1". */
  proporcao: string;
  /** A altura acompanha o arquivo: a moldura não impõe proporção. */
  alturaLivre?: boolean;
  /** A imagem preenche a moldura e quem envia escolhe o enquadramento. */
  enquadravel?: boolean;
  /** Como a imagem aparece, em linguagem de quem opera o portal. */
  exibicao: string;
  /** Onde o mesmo arquivo aparece. */
  usos: string[];
}

export const FORMATOS_IMAGEM = "JPEG, PNG ou WebP";
export const LIMITE_IMAGEM_MB = LIMITE_IMAGEM_BYTES / 1048576;

export const FINALIDADES: Record<Finalidade, OrientacaoImagem> = {
  // Página da Sala: até 1.088 px de largura em 1440 e 1.568 px em 1920.
  "banner-sala": {
    rotulo: "Banner da Sala",
    descricao: "Envie uma imagem para apresentar sua Sala.",
    largura: 2400,
    altura: 800,
    proporcao: "3:1",
    alturaLivre: true,
    exibicao: "Aparece inteira, na largura da página da Sala; a altura acompanha a proporção do arquivo.",
    usos: ["topo da página da Sala; não substitui a imagem do card"],
  },
  // Card vertical: de 274 × 552 (celular) a 491 × 552 (1920), quase sempre perto de 3:5.
  "card-sala": {
    rotulo: "Imagem do card da Sala",
    descricao: "Escolha a imagem que representa sua Sala no acervo.",
    largura: 1200,
    altura: 1800,
    proporcao: "2:3",
    exibicao:
      "Aparece inteira dentro do card vertical; arquivos de outra proporção ganham fundo em cima e embaixo ou nas laterais.",
    usos: ["cards da Sala no Portal, em Salas, na Biblioteca, na Estante e no Perfil"],
  },
  // Card de conteúdo 16:10, de 342 × 214 (celular) a 604 × 378 (Destaques em 1920).
  "card-artigo": {
    rotulo: "Imagem do card do artigo",
    descricao: "Escolha a imagem que apresenta o artigo nas listagens.",
    largura: 1600,
    altura: 1000,
    proporcao: "16:10",
    exibicao:
      "Aparece inteira no card do artigo; arquivos de outra proporção ganham fundo em cima e embaixo ou nas laterais.",
    usos: [
      "cards do artigo no Portal, em Destaques, na Biblioteca e na Sala; não substitui a imagem de topo",
    ],
  },
  // Mesma peça do banner da Sala, na página do artigo.
  "topo-artigo": {
    rotulo: "Imagem de topo do artigo",
    descricao: "Envie a imagem de abertura do artigo.",
    largura: 2400,
    altura: 800,
    proporcao: "3:1",
    alturaLivre: true,
    exibicao: "Aparece inteira, na largura da página do artigo; a altura acompanha a proporção do arquivo.",
    usos: ["topo da página do artigo"],
  },
  // Coluna de leitura de 46rem (736 px), dobrada para telas 2×.
  "corpo-artigo": {
    rotulo: "Imagem do corpo do artigo",
    descricao: "Adicione uma imagem para ilustrar este trecho.",
    largura: 1472,
    altura: 981,
    proporcao: "3:2",
    alturaLivre: true,
    exibicao:
      "Aparece inteira, na largura da coluna de texto; a altura acompanha a proporção do arquivo (vertical e quadrada também servem).",
    usos: ["corpo do artigo, no ponto em que o bloco foi inserido"],
  },
  // Avatar de até 120 px (Perfil) e 48 px (lateral).
  avatar: {
    rotulo: "Foto de perfil",
    descricao: "Use uma foto quadrada, com o rosto no centro.",
    largura: 512,
    altura: 512,
    proporcao: "1:1",
    exibicao:
      "Aparece num círculo. Envie a foto quadrada, com o rosto no centro: fora do quadrado, as bordas do arquivo ficam de fora do círculo.",
    usos: ["lateral do portal", "cabeçalho do Perfil", "publicações e comentários na Comunidade"],
  },
  // Capa do Perfil: 1.088 × 218 em 1440; mínimo de 140 px de altura no celular.
  "capa-perfil": {
    rotulo: "Capa do perfil",
    descricao: "Escolha uma imagem para o topo do seu perfil.",
    largura: 2400,
    altura: 480,
    proporcao: "5:1",
    exibicao:
      "Aparece inteira no topo do Perfil; arquivos de outra proporção ganham fundo em cima e embaixo ou nas laterais.",
    usos: ["topo do Perfil"],
  },
  // Publicação da Comunidade: coluna do feed de até 720 px.
  comunidade: {
    rotulo: "Imagem da publicação",
    descricao: "Adicione uma imagem para acompanhar sua publicação.",
    largura: 1440,
    altura: 1080,
    proporcao: "4:3",
    alturaLivre: true,
    exibicao: "Aparece inteira, na largura da publicação; a altura acompanha a proporção do arquivo.",
    usos: ["publicação na Comunidade"],
  },
  // Card de publicidade do Portal: até ~420 px de largura, dobrado para telas 2×.
  anuncio: {
    rotulo: "Imagem do produto",
    descricao: "Mostre o produto com clareza, sem texto sobre a imagem.",
    largura: 1400,
    altura: 1000,
    proporcao: "7:5",
    enquadravel: true,
    exibicao: "Preenche a moldura 7:5 do card, sem deformar; ajuste o enquadramento depois do envio.",
    usos: ["card de publicidade no Portal"],
  },
};

const numero = (n: number) => n.toLocaleString("pt-BR");

/** "2.400 × 800 px" */
export function dimensoes(o: Pick<OrientacaoImagem, "largura" | "altura">): string {
  return `${numero(o.largura)} × ${numero(o.altura)} px`;
}

/** Razão largura/altura de uma proporção "3:1". */
export function razao(proporcao: string): number {
  const [l, a] = proporcao.split(":").map(Number);
  return l && a ? l / a : 1;
}

/** Proporção legível de um arquivo: a mais próxima de uma lista comum, ou "≈ 2,28:1". */
export function proporcaoDoArquivo(largura: number, altura: number): string {
  const r = largura / altura;
  const comuns = [
    "1:1",
    "3:1",
    "2:1",
    "16:9",
    "16:10",
    "3:2",
    "4:3",
    "5:4",
    "5:1",
    "2:3",
    "3:4",
    "4:5",
    "9:16",
    "3:5",
    "7:5",
  ];
  const perto = comuns.find((p) => Math.abs(razao(p) / r - 1) < 0.015);
  if (perto) return perto;
  return r >= 1
    ? `≈ ${r.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}:1`
    : `≈ 1:${(1 / r).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
}

export interface Diagnostico {
  /** Abaixo da largura recomendada: pode perder nitidez. Não bloqueia. */
  baixaResolucao: boolean;
  /** Proporção diferente da moldura: será exibida inteira com fundo ou outra altura. Não bloqueia. */
  outraProporcao: boolean;
}

/** Diagnóstico do arquivo escolhido para a finalidade (só avisos; nada aqui bloqueia). */
export function diagnosticar(o: OrientacaoImagem, largura: number, altura: number): Diagnostico {
  return {
    baixaResolucao: largura < o.largura,
    outraProporcao: Math.abs(largura / altura / razao(o.proporcao) - 1) > 0.05,
  };
}
