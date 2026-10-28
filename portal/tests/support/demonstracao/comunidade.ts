import type { ComentarioComunidade, DadosComunidade, Publicacao } from "@/data/types";

/** Pessoas fictícias, obras reais. Datas relativas à inicialização, para o debate semanal não expirar no demo. */
export function comunidadeInicial(agora = new Date()): DadosComunidade {
  const quando = (horas: number) => new Date(agora.getTime() - horas * 3_600_000).toISOString();
  const notas: Omit<Publicacao, "id" | "fixada" | "estado" | "criadaEm">[] = [
    {
      autorId: "u-lucia-demo",
      tipo: "reflexao",
      salaSlug: "corpus-hermeticum",
      temas: ["conhecimento-interior"],
      texto:
        "Voltei ao Poimandres, §24–26, com um caderno ao lado. Estou separando a descrição da subida pelas esferas das interpretações que encontro nas notas. A imagem de abandonar certas atividades em cada esfera me fez pensar na diferença entre resumir uma passagem e já explicá-la. Como vocês organizam essas duas camadas de leitura?",
      imagem: {
        src: "/imagens/salas/corpus-hermeticum.webp",
        alt: "Gravura associada à Sala Corpus Hermeticum",
        credito: "Imagem do acervo do portal",
      },
    },
    {
      autorId: "u-anfitria-demo",
      tipo: "pergunta",
      salaSlug: "nag-hammadi",
      temas: ["conhecimento-interior"],
      texto:
        "Na leitura do dito 3 do Evangelho de Tomé, como a edição de vocês traduz a relação entre conhecer a si mesmo e ser conhecido? Vamos indicar a edição antes de comparar as escolhas.",
      perguntaDirigidaA: "u-anfitria-demo",
    },
    {
      autorId: "u-candidato-demo",
      tipo: "citacao",
      salaSlug: "caibalion",
      temas: ["origem-do-universo"],
      texto:
        "Registrei esta formulação para voltar ao capítulo e observar como o livro desenvolve o princípio do mentalismo.",
      citacao: {
        trecho: "O Todo é Mente; o Universo é Mental.",
        obra: "O Caibalion",
        passagem: "Capítulo II · princípio do mentalismo",
      },
    },
    {
      autorId: "u-ana-demo",
      tipo: "achado",
      salaSlug: "corpus-hermeticum",
      temas: ["alma"],
      texto:
        "Este trecho do Poimandres tem referência por parágrafos. Ajuda a conferir de onde vem cada interpretação durante a conversa.",
      conteudoId: "c-poimandres-subida-pelas-esferas",
    },
    {
      autorId: "u-rafael-demo",
      tipo: "pergunta",
      salaSlug: "urantia",
      temas: ["alma"],
      texto:
        "No Documento 47 de O Livro de Urântia, quais passagens vocês usariam para distinguir a descrição dos mundos das mansões de uma interpretação sobre continuidade pessoal?",
    },
    {
      autorId: "u-buscador",
      tipo: "reflexao",
      salaSlug: "apocrifos-cristianismo-primitivo",
      temas: ["alma"],
      texto:
        "Estou estudando o Evangelho de Maria com atenção às lacunas do manuscrito. Nas minhas notas, marco o que está preservado e deixo as hipóteses em outra coluna. Isso me ajuda a não completar o texto sem perceber.",
    },
    {
      autorId: "u-lucia-demo",
      tipo: "achado",
      salaSlug: "nag-hammadi",
      temas: ["conhecimento-interior"],
      texto:
        "Encontrei os ditos 1 a 3 do Evangelho de Tomé no acervo. Quero comparar a tradução e os comentários sem perder a indicação de qual voz estou lendo.",
      conteudoId: "c-evangelho-de-tome-ditos-1-a-3",
    },
    {
      autorId: "u-ana-demo",
      tipo: "pergunta",
      salaSlug: "caibalion",
      temas: ["origem-do-universo"],
      texto:
        "Como vocês registram a diferença entre o vocabulário do Caibalion e o dos tratados do Corpus Hermeticum? Gostaria de reunir exemplos com capítulo ou parágrafo, sem presumir que os termos dizem a mesma coisa.",
    },
    {
      autorId: "u-candidato-demo",
      tipo: "reflexao",
      salaSlug: "corpus-hermeticum",
      temas: ["meditacao"],
      texto:
        "Relendo o Tratado XIII, estou anotando onde aparece o silêncio e a quem cada fala é atribuída. Por enquanto, prefiro acompanhar o diálogo antes de decidir como descrever o renascimento mencionado no texto.",
    },
    {
      autorId: "u-rafael-demo",
      tipo: "achado",
      salaSlug: "urantia",
      temas: ["origem-do-universo"],
      texto:
        "O artigo do acervo organiza os nomes Paraíso, Havona e superuniversos segundo o livro. Vou usá-lo como índice de leitura e conferir as referências no texto.",
      conteudoId: "c-o-universo-segundo-urantia",
    },
    {
      autorId: "u-anfitria-demo",
      tipo: "reflexao",
      salaSlug: "apocrifos-cristianismo-primitivo",
      temas: ["morte"],
      texto:
        "Ao comparar imagens do além no Apocalipse de Pedro, procuro primeiro identificar a testemunha textual e a tradução. Leituras diferentes precisam conservar suas referências para a conversa continuar verificável.",
    },
    {
      autorId: "u-buscador",
      tipo: "citacao",
      salaSlug: "caibalion",
      temas: ["origem-do-universo"],
      texto:
        "Separei este trecho como uma afirmação do Caibalion, não como conclusão compartilhada pelas outras Salas. Quero acompanhar os exemplos que o capítulo apresenta.",
      citacao: {
        trecho: "Nada está parado; tudo se move; tudo vibra.",
        obra: "O Caibalion",
        passagem: "Capítulo II · princípio da vibração",
      },
    },
    {
      autorId: "u-lucia-demo",
      tipo: "pergunta",
      salaSlug: "apocrifos-cristianismo-primitivo",
      temas: ["alma"],
      texto:
        "Que edição do Evangelho de Maria vocês usam para acompanhar os trechos preservados? Procuro uma leitura que deixe as lacunas visíveis e identifique as passagens citadas.",
    },
    {
      autorId: "u-ana-demo",
      tipo: "reflexao",
      salaSlug: "urantia",
      temas: ["conhecimento-interior"],
      texto:
        "Estou lendo o artigo sobre o Ajustador do Pensamento junto das referências de O Livro de Urântia. Meu exercício é escrever “o livro chama de…” em cada definição, para manter clara a atribuição.",
    },
  ];
  const publicacoes = notas.map(
    (n, i): Publicacao => ({
      ...n,
      id: `p-demo-${i + 1}`,
      fixada: false,
      estado: "visivel",
      criadaEm: quando(2 + i * 8),
    }),
  );
  const comentarios: ComentarioComunidade[] = [];
  const conversas = [
    [
      "p-demo-1",
      "u-candidato-demo",
      "No §25, anotei primeiro a sequência das esferas. Depois comparei o comentário da edição, mantendo a referência em cada nota.",
    ],
    [
      "p-demo-1",
      "u-ana-demo",
      "Vale registrar também o tradutor. Quando duas traduções escolhem palavras diferentes, voltamos à mesma passagem para conversar.",
    ],
    [
      "p-demo-2",
      "u-anfitria-demo",
      "Sugiro começar pelo dito 3 completo e distinguir o trecho traduzido da nota editorial. Assim conseguimos comparar as escolhas sem fundir as leituras.",
    ],
    [
      "p-demo-2",
      "u-buscador",
      "Vou colocar a referência da edição ao lado das minhas notas antes de trazer a comparação.",
    ],
    [
      "p-demo-3",
      "u-ana-demo",
      "Esta é uma formulação do Caibalion. Na comparação com outros textos, mantenho o título e o capítulo junto da frase.",
    ],
    [
      "p-demo-3",
      "u-lucia-demo",
      "A atribuição muda bastante a conversa. Vou reler o capítulo antes de propor uma aproximação com o Poimandres.",
    ],
    [
      "p-demo-5",
      "u-rafael-demo",
      "Separei o Documento 47 por seções para localizar cada descrição. Ainda estou conferindo os termos na edição.",
    ],
    [
      "p-demo-5",
      "u-candidato-demo",
      "Podemos trazer trechos curtos com a numeração das seções e comparar o que cada passagem efetivamente descreve.",
    ],
    [
      "p-demo-6",
      "u-anfitria-demo",
      "Indicar as lacunas é parte da referência. A edição deve deixar claro onde termina o testemunho preservado.",
    ],
    [
      "p-demo-6",
      "u-lucia-demo",
      "Passei a marcar as hipóteses com uma anotação separada. Ficou mais fácil voltar ao texto.",
    ],
    [
      "p-demo-8",
      "u-ana-demo",
      "Vamos escolher uma passagem de cada obra e manter as datas e os contextos de edição em vista.",
    ],
    [
      "p-demo-8",
      "u-buscador",
      "Comecei pelo capítulo II do Caibalion e pelo tratado I do Corpus. Ainda não estou tratando os termos como equivalentes.",
    ],
  ];
  for (const [i, [publicacaoId, autorId, texto]] of conversas.entries()) {
    if (!publicacaoId || !autorId || !texto) continue;
    comentarios.push({
      id: `cm-demo-${i + 1}`,
      publicacaoId,
      autorId,
      texto,
      estado: "visivel",
      criadaEm: new Date(
        Date.parse(publicacoes.find((p) => p.id === publicacaoId)?.criadaEm ?? quando(2)) +
          ((i % 2) + 1) * 15 * 60_000,
      ).toISOString(),
      ...(i === 3 ? { paiId: "cm-demo-3" } : {}),
    });
  }
  return {
    publicacoes: new Map(publicacoes.map((p) => [p.id, p])),
    comentarios: new Map(comentarios.map((c) => [c.id, c])),
    reacoes: publicacoes.flatMap((p) =>
      ["u-buscador", "u-candidato-demo", "u-anfitria-demo"]
        .filter((id) => id !== p.autorId)
        .map((pessoa) => ({
          alvo: { tipo: "publicacao" as const, id: p.id },
          pessoa,
          tipo: "curtir" as const,
        })),
    ),
    seguindo: [
      { seguidor: "u-buscador", alvo: { tipo: "pessoa", id: "u-anfitria-demo" } },
      { seguidor: "u-buscador", alvo: { tipo: "pessoa", id: "u-lucia-demo" } },
      { seguidor: "u-buscador", alvo: { tipo: "sala", id: "corpus-hermeticum" } },
      { seguidor: "u-lucia-demo", alvo: { tipo: "pessoa", id: "u-buscador" } },
    ],
    salvos: [
      { pessoa: "u-buscador", publicacaoId: "p-demo-4", criadoEm: quando(1) },
      { pessoa: "u-buscador", publicacaoId: "p-demo-7", criadoEm: quando(2) },
    ],
    denuncias: new Map(
      [1, 2].map((i) => [
        `d-demo-${i}`,
        {
          id: `d-demo-${i}`,
          denuncianteId: "u-rafael-demo",
          alvo: { tipo: "publicacao" as const, id: `p-demo-${i}` },
          motivo: "sem-fonte" as const,
          nota: "Pedido de conferência da referência citada; relato de demonstração, ainda sem decisão.",
          estado: "pendente" as const,
          criadaEm: quando(1),
        },
      ]),
    ),
  };
}
