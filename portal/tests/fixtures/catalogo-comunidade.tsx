import { createRoot } from "react-dom/client";
import { instalarRegistroSalas, instalarRegistroTemas } from "../../src/data/catalogo";
import type { Sala, Video } from "../../src/data/types";
import { CatalogoVideos } from "../../src/features/acervo/CatalogoVideos";
import { FeedComunidade } from "../../src/features/comunidade/ui/FeedComunidade";
import type { ModeloComunidade } from "../../src/server/comunidade/consultas";

const params = new URLSearchParams(location.search);
const papel = params.get("papel") ?? "membro";
const salas = [
  { slug: "nag-demo", nome: "Biblioteca demonstrativa de Nag Hammadi", origem: "oficial" },
  {
    slug: "host-demo",
    nome: "Sala demonstrativa do Anfitrião",
    origem: "anfitriao",
    anfitriao: { nome: "Anfitrião fictício", slug: "demo", credencial: "Demonstração local" },
  },
];
instalarRegistroSalas(() => salas as Sala[]);
instalarRegistroTemas(() => [{ slug: "alma", nome: "Alma", sinonimos: [] }]);
const videos = [
  {
    id: "v-demo",
    sala: "nag-demo",
    titulo: "Vídeo demonstrativo sobre documentos antigos",
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    temas: ["alma"],
    duracao: "12:30",
    nivel: 1,
    placa: "bordo",
    publicadoEm: "2026-11-02",
    artigosRelacionados: [
      { id: "a-demo", sala: "host-demo", slug: "artigo-demo", titulo: "Artigo demonstrativo entre Salas" },
      { id: "a2-demo", sala: "nag-demo", slug: "outro-demo", titulo: "Outra referência demonstrativa" },
    ],
  },
  {
    id: "v-sem",
    sala: "host-demo",
    titulo: "Vídeo demonstrativo sem artigo",
    url: "https://www.youtube.com/watch?v=lmnopqrstuv",
    temas: ["alma"],
    duracao: "08:00",
    nivel: 1,
    placa: "grafite",
    publicadoEm: "2026-11-02",
  },
] as unknown as Video[];
const autor = {
  id: "host-ficticio",
  nome: "Anfitrião fictício",
  iniciais: "AF",
  href: "/anfitrioes/demo",
  anfitriao: true,
};
const publicacoes = [
  {
    id: "p-demo",
    autorId: autor.id,
    autor,
    texto: "Estudo demonstrativo de Nag Hammadi com vídeo do acervo.",
    tipo: "reflexao",
    temas: ["alma"],
    videoId: "v-demo",
    video: videos[0],
    salaSlug: "nag-demo",
    estado: "visivel",
    fixada: false,
    criadaEm: "2026-11-02T12:00:00Z",
    comentarios: [],
    curtidas: 0,
  },
  {
    id: "p2-demo",
    autorId: "curador-ficticio",
    autor: {
      ...autor,
      id: "curador-ficticio",
      nome: "Curadoria fictícia",
      href: "/perfil/curador-ficticio",
      anfitriao: false,
    },
    texto: "Outro estudo demonstrativo sem vídeo.",
    tipo: "reflexao",
    temas: [],
    estado: "visivel",
    fixada: false,
    criadaEm: "2026-11-02T12:00:00Z",
    comentarios: [],
    curtidas: 0,
  },
];
const modelo = {
  pessoa: {
    id: "pessoa-demo",
    nome: "Pessoa demonstrativa",
    iniciais: "PD",
    href: "/perfil/demo",
    anfitriao: papel === "anfitriao",
  },
  publicacoes,
  seguindo: [publicacoes[0]],
  pessoas: [autor],
  seguindoPessoas: [autor],
  seguindoSalas: [],
  salvos: [],
  visao: {
    pessoaId: "pessoa-demo",
    papel,
    salvos: [],
    reacoes: {},
    comentariosCurtidos: [],
    salasProprias: [],
    seguindoPessoas: [autor.id],
    seguindoSalas: [],
  },
  opcoes: {
    salas: salas.map((s) => ({ slug: s.slug, nome: s.nome })),
    temas: [{ slug: "alma", nome: "Alma" }],
    conteudos: [
      {
        id: "a-demo",
        titulo: "Artigo demonstrativo entre Salas",
        salaNome: salas[1]?.nome ?? "Sala demonstrativa",
      },
    ],
    videos: [
      {
        id: "v-demo",
        titulo: videos[0]?.titulo ?? "Vídeo demonstrativo",
        salaNome: salas[0]?.nome ?? "Sala demonstrativa",
      },
    ],
  },
  numeros: { publicacoes: 0, seguidores: 0, seguindo: 1 },
  debate: [],
  agora: "2026-11-02T13:00:00Z",
} as unknown as ModeloComunidade;
const raiz = document.getElementById("root");
if (!raiz) throw new Error("Raiz da fixture ausente");
createRoot(raiz).render(
  <>
    <p>DEMONSTRAÇÃO LOCAL · sem conta real ou banco</p>
    {params.get("modo") === "videos" ? (
      <CatalogoVideos videos={videos} salas={salas as Parameters<typeof CatalogoVideos>[0]["salas"]} />
    ) : (
      <FeedComunidade modelo={modelo} />
    )}
  </>,
);
