import type {
  AssinaturaAnfitriao,
  Candidatura,
  ConteudoEditorial,
  Convite,
  DecisaoRevisao,
  FonteEditorial,
  PerfilAnfitriao,
  SalaEditorial,
  TemaSlug,
} from "@/data/types";
import { duracaoDoTexto, resumoDoTexto } from "@/features/anfitriao/regras/artigo";
import { expiraEm } from "@/features/anfitriao/regras/convite";
import {
  CONTA_ADMIN_DEMONSTRACAO,
  CONTA_ANFITRIAO_DEMONSTRACAO,
  CONTA_CANDIDATA_DEMONSTRACAO,
} from "./contas";

/*
 * Anfitriões de demonstração (§12). As pessoas são fictícias e marcadas como
 * demonstração; as fontes citadas são obras reais do catálogo.
 * - Helena Varga mantém uma Sala publicada com 2 artigos e uma Sala em
 *   revisão com 2 artigos (um deles propõe uma fonte nova).
 * - Tomás Arruda tem uma candidatura pendente.
 * - Há um convite pendente para outra pessoa.
 *
 * TODO(conteudo): o vídeo do primeiro artigo usa um código provisório do
 * YouTube; troque pelo vídeo real do anfitrião antes de publicar o portal.
 */

export const ANFITRIA_DEMO_ID = CONTA_ANFITRIAO_DEMONSTRACAO.id;
export const CANDIDATO_DEMO_ID = CONTA_CANDIDATA_DEMONSTRACAO.id;
const ADMIN = CONTA_ADMIN_DEMONSTRACAO.pseudonimo;

export const ASSINATURA_HELENA: AssinaturaAnfitriao = {
  nome: CONTA_ANFITRIAO_DEMONSTRACAO.pseudonimo,
  credencial: "Pesquisadora de literatura copta · perfil fictício",
  slug: "helena-varga",
};

export function perfisIniciais(): PerfilAnfitriao[] {
  return [
    {
      contaId: "u-ana-demo",
      nome: "Ana Ribeiro",
      slug: "ana-ribeiro",
      credencial: "Leitora de textos herméticos · perfil fictício",
      apresentacao:
        "Perfil de demonstração. Ana compartilha notas de leitura do Corpus Hermeticum e do Caibalion, distinguindo cada obra e suas referências.",
      atualizadoEm: "2026-10-01T12:00:00.000Z",
    },
    {
      contaId: ANFITRIA_DEMO_ID,
      nome: ASSINATURA_HELENA.nome,
      slug: ASSINATURA_HELENA.slug,
      credencial: ASSINATURA_HELENA.credencial,
      apresentacao:
        "Perfil de demonstração. Helena estuda os códices de Nag Hammadi e a recepção do Evangelho de Tomé. Nas Salas dela, cada leitura indica a edição usada e separa o que o texto diz do que os estudiosos propõem sobre ele.",
      atualizadoEm: "2026-08-20T14:30:00.000Z",
    },
  ];
}

const assinatura = { nome: ASSINATURA_HELENA.nome, credencial: ASSINATURA_HELENA.credencial };

function sala(
  dados: Pick<SalaEditorial, "id" | "slug" | "nome" | "descricao" | "periodo" | "status" | "atualizadaEm"> & {
    naComparacao: boolean;
    link?: string;
    jaPublicado: boolean;
    enviadoEm: string;
    decisoes: DecisaoRevisao[];
  },
): SalaEditorial {
  const quando = `${dados.atualizadaEm}T12:00:00.000Z`;
  const s: SalaEditorial = {
    id: dados.id,
    slug: dados.slug,
    nome: dados.nome,
    tradicao: `Sala de anfitrião · ${ASSINATURA_HELENA.nome}`,
    tradicaoCurta: ASSINATURA_HELENA.nome,
    descricao: dados.descricao,
    periodo: dados.periodo,
    placa: "grafite",
    atualizadaEm: dados.atualizadaEm,
    inicial: dados.nome[0]?.toUpperCase() ?? "S",
    origem: "anfitriao",
    naComparacao: dados.naComparacao,
    anfitriao: { ...ASSINATURA_HELENA },
    status: dados.status,
    criadoEm: "2026-08-21T10:00:00.000Z",
    atualizadoEm: quando,
    criadoPor: ASSINATURA_HELENA.nome,
    atualizadoPor: ASSINATURA_HELENA.nome,
    revisao: {
      donoId: ANFITRIA_DEMO_ID,
      jaPublicado: dados.jaPublicado,
      enviadoEm: dados.enviadoEm,
      aceite: { quem: ASSINATURA_HELENA.nome, quando: dados.enviadoEm },
      decisoes: dados.decisoes,
    },
  };
  if (dados.link) s.link = dados.link;
  return s;
}

function artigo(dados: {
  id: string;
  slug: string;
  sala: string;
  titulo: string;
  corpo: string[];
  temas: TemaSlug[];
  fontes: string[];
  periodo: string;
  nivel: 1 | 2 | 3;
  status: ConteudoEditorial["status"];
  publicadoEm: string;
  enviadoEm: string;
  link?: ConteudoEditorial["link"];
  decisoes: DecisaoRevisao[];
}): ConteudoEditorial {
  const c: ConteudoEditorial = {
    id: dados.id,
    slug: dados.slug,
    sala: dados.sala,
    tipo: "artigo",
    titulo: dados.titulo,
    resumo: resumoDoTexto(dados.corpo),
    temas: dados.temas,
    periodo: dados.periodo,
    nivel: dados.nivel,
    formato: dados.link?.tipo === "youtube" ? "video" : "texto",
    proveniencia: "anfitriao",
    duracaoMin: duracaoDoTexto(dados.corpo),
    autoria: { ...assinatura },
    anfitriao: { ...ASSINATURA_HELENA },
    publicadoEm: dados.publicadoEm,
    corpo: dados.corpo,
    fontes: dados.fontes,
    status: dados.status,
    criadoEm: "2026-08-22T10:00:00.000Z",
    atualizadoEm: dados.enviadoEm,
    criadoPor: ASSINATURA_HELENA.nome,
    atualizadoPor: ASSINATURA_HELENA.nome,
    situacaoJuridica: null,
    temaDivergente: false,
    notaDivergencia: "",
    producaoIA: false,
    revisao: {
      donoId: ANFITRIA_DEMO_ID,
      jaPublicado: Boolean(dados.publicadoEm),
      enviadoEm: dados.enviadoEm,
      aceite: { quem: ASSINATURA_HELENA.nome, quando: dados.enviadoEm },
      decisoes: dados.decisoes,
    },
  };
  if (dados.link) c.link = dados.link;
  return c;
}

const APROVADA_EM = "2026-09-21T15:10:00.000Z";
const aprovada = [{ quando: APROVADA_EM, quem: ADMIN, decisao: "aprovado" as const, vista: true }];

export const SALA_TOME_ID = "s-leituras-tome";
export const SALA_PEROLA_ID = "s-hino-perola";
export const FONTE_PROPOSTA_ID = "ferreira-hino-perola";

export function salasDeAnfitrioesIniciais(): SalaEditorial[] {
  return [
    sala({
      id: SALA_TOME_ID,
      slug: "leituras-do-evangelho-de-tome",
      nome: "Leituras do Evangelho de Tomé",
      descricao:
        "Leituras comentadas dos 114 ditos atribuídos a Jesus no segundo códice de Nag Hammadi. Cada leitura parte do texto copta em tradução e indica onde os estudiosos divergem sobre datação e sentido.",
      periodo: "composição debatida, séc. I – II · cópia copta do séc. IV",
      status: "publicado",
      atualizadaEm: "2026-09-21",
      naComparacao: false,
      jaPublicado: true,
      enviadoEm: "2026-09-18T19:40:00.000Z",
      decisoes: aprovada,
    }),
    sala({
      id: SALA_PEROLA_ID,
      slug: "o-hino-da-perola",
      nome: "O Hino da Pérola nos Atos de Tomé",
      descricao:
        "O poema do príncipe que desce ao Egito em busca de uma pérola e esquece quem é, preservado nos Atos de Tomé em siríaco e em grego. A Sala apresenta a narrativa e as hipóteses sobre sua origem.",
      periodo: "séc. II – III (datação incerta)",
      status: "em_revisao",
      atualizadaEm: "2026-10-07",
      naComparacao: false,
      jaPublicado: false,
      enviadoEm: "2026-10-07T21:15:00.000Z",
      decisoes: [],
    }),
  ];
}

export function artigosDeAnfitrioesIniciais(): ConteudoEditorial[] {
  return [
    artigo({
      id: "c-anf-abertura-tome",
      slug: "os-114-ditos-e-a-abertura",
      sala: "leituras-do-evangelho-de-tome",
      titulo: "Os 114 ditos e a abertura do Evangelho de Tomé",
      corpo: [
        "O ::Evangelho de Tomé:: abre com uma moldura: “Estas são as palavras secretas que Jesus, o Vivente, disse e que Dídimo Judas Tomé escreveu”. Segundo a tradução de Marvin Meyer, o texto não narra a vida de Jesus; reúne 114 *ditos*, quase sempre introduzidos por “Jesus disse”.",
        "O único texto completo está em copta, no segundo códice da biblioteca encontrada em 1945 perto de Nag Hammadi. Fragmentos em grego, achados antes em Oxirrinco, mostram que a coleção circulava em grego, com diferenças de ordem e de redação.",
        "A datação continua em debate: há quem proponha uma primeira coleção no século I e quem situe a composição no século II. Elaine Pagels lê o texto como testemunho de uma comunidade que valorizava o *conhecimento* de si; outros estudiosos preferem não falar em uma comunidade única por trás dele.",
      ],
      temas: ["conhecimento-interior"],
      fontes: ["meyer-nhs", "pagels-evangelhos"],
      periodo: "séc. I – II (datação debatida)",
      nivel: 1,
      status: "publicado",
      publicadoEm: "2026-09-21",
      enviadoEm: "2026-09-18T19:40:00.000Z",
      link: {
        tipo: "youtube",
        url: "https://www.youtube.com/watch?v=TOME0000001",
        youtubeId: "TOME0000001",
      },
      decisoes: aprovada,
    }),
    artigo({
      id: "c-anf-dito-3",
      slug: "o-reino-dentro-e-fora-dito-3",
      sala: "leituras-do-evangelho-de-tome",
      titulo: "O Reino dentro e fora: o dito 3 em leitura comparada",
      corpo: [
        "No dito 3, segundo a tradução reunida por James M. Robinson, Jesus corrige quem procura o Reino no céu ou no mar e afirma que “o Reino está dentro de vós e fora de vós”. A frase termina ligando esse Reino ao conhecimento de si: quem se conhece será conhecido.",
        "Os comentadores costumam comparar o dito com Lucas 17,21, em que o Reino está “no meio de vós” ou “dentro de vós”, conforme a tradução. Marvin Meyer observa que a versão de Tomé acrescenta o “fora de vós”, o que impede ler o Reino apenas como interioridade.",
        "A leitura gnóstica do dito é uma hipótese entre outras. Parte dos estudiosos vê nele uma sabedoria judaica de tipo sapiencial, sem o mito gnóstico completo que aparece em outros tratados da mesma biblioteca.",
      ],
      temas: ["conhecimento-interior", "alma"],
      fontes: ["robinson-nhl", "meyer-nhs"],
      periodo: "séc. I – II (datação debatida)",
      nivel: 2,
      status: "publicado",
      publicadoEm: "2026-09-21",
      enviadoEm: "2026-09-18T19:40:00.000Z",
      decisoes: aprovada,
    }),
    artigo({
      id: "c-anf-perola-narrativa",
      slug: "o-principe-que-esquece",
      sala: "o-hino-da-perola",
      titulo: "O príncipe que esquece: a narrativa do Hino da Pérola",
      corpo: [
        "O ::Hino da Pérola:: é um poema inserido nos ::Atos de Tomé::. Segundo a edição de Bart D. Ehrman, ele conta a história de um príncipe enviado do Oriente ao Egito para buscar uma pérola guardada por uma serpente.",
        "No Egito, o príncipe veste as roupas do lugar, come da comida dos egípcios e esquece a missão. Uma carta dos pais o desperta; ele toma a pérola, volta e recebe de novo a veste que deixara ao partir, na qual se reconhece.",
        "Wilhelm Schneemelcher apresenta o poema como peça mais antiga incorporada aos Atos. Leitores antigos e modernos o leram como alegoria da *alma* que desce ao mundo e precisa lembrar de onde veio; o texto, porém, não explica a própria alegoria.",
      ],
      temas: ["alma"],
      fontes: ["ehrman-lost", "schneemelcher-nta"],
      periodo: "séc. II – III (datação incerta)",
      nivel: 1,
      status: "em_revisao",
      publicadoEm: "",
      enviadoEm: "2026-10-07T21:15:00.000Z",
      decisoes: [],
    }),
    artigo({
      id: "c-anf-perola-origem",
      slug: "quem-compos-o-hino",
      sala: "o-hino-da-perola",
      titulo: "Quem compôs o Hino? Hipóteses sobre a origem siríaca",
      corpo: [
        "O Hino da Pérola chegou até nós em duas línguas: um manuscrito siríaco e uma versão grega dos Atos de Tomé. Segundo Johan Ferreira, que edita os dois textos lado a lado, a maior parte dos estudiosos considera o siríaco mais próximo da forma original.",
        "A data de composição é incerta. As propostas costumam situar o poema entre os séculos II e III, na região de Edessa, mas nenhuma delas se apoia em uma data registrada no próprio texto.",
        "A autoria também é discutida: o poema já foi atribuído a Bardesanes, poeta e filósofo de Edessa, hipótese que hoje muitos estudiosos tratam com cautela. Esta leitura apresenta as hipóteses sem escolher entre elas.",
      ],
      temas: ["alma", "origem-do-universo"],
      fontes: ["schneemelcher-nta", FONTE_PROPOSTA_ID],
      periodo: "séc. II – III (datação incerta)",
      nivel: 2,
      status: "em_revisao",
      publicadoEm: "",
      enviadoEm: "2026-10-07T21:15:00.000Z",
      decisoes: [],
    }),
  ];
}

/** Fonte nova proposta por Helena no artigo em revisão: só ela a vê até a aprovação. */
export function fontesPropostasIniciais(): FonteEditorial[] {
  return [
    {
      id: FONTE_PROPOSTA_ID,
      titulo: "The Hymn of the Pearl: The Syriac and Greek Texts",
      autor: "Johan Ferreira (ed. e trad.)",
      tradicao: "Cristianismo siríaco · Atos de Tomé",
      tipo: "Tradução comentada",
      referencia: "Sydney: St Pauls Publications, 2002",
      capa: "grafite",
      inicial: "H",
      criadoEm: "2026-10-07T20:50:00.000Z",
      atualizadoEm: "2026-10-07T20:50:00.000Z",
      criadoPor: ASSINATURA_HELENA.nome,
      atualizadoPor: ASSINATURA_HELENA.nome,
      proposta: { donoId: ANFITRIA_DEMO_ID, pendente: true },
    },
  ];
}

export function candidaturasIniciais(): Candidatura[] {
  return [
    {
      id: "cand-tomas-arruda",
      contaId: CANDIDATO_DEMO_ID,
      email: CONTA_CANDIDATA_DEMONSTRACAO.email,
      nome: CONTA_CANDIDATA_DEMONSTRACAO.pseudonimo,
      credencial: "Mestrando em literatura siríaca antiga · perfil fictício",
      apresentacao:
        "Perfil de demonstração. Estudo a poesia siríaca dos séculos III e IV, em especial Efrém de Nísibis, e gostaria de manter uma Sala com leituras comentadas dos hinos, sempre indicando a edição e a tradução usadas.",
      status: "pendente",
      enviadaEm: "2026-10-06T16:20:00.000Z",
    },
  ];
}

/** Convite pendente, criado há 2 dias: vence 5 dias depois de restaurar o acervo. */
export function convitesIniciais(agora = new Date()): Convite[] {
  const criado = new Date(agora.getTime() - 2 * 86_400_000);
  return [
    {
      id: "conv-marina-couto",
      token: "convite-demonstracao-marina",
      email: "marina.couto@exemplo.com",
      criadoEm: criado.toISOString(),
      expiraEm: expiraEm(criado).toISOString(),
      criadoPor: ADMIN,
      status: "pendente",
    },
  ];
}
