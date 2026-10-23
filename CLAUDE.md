# A Sala dos Buscadores · MVP

Portal de conhecimento que organiza tradições religiosas, espirituais, filosóficas e textos antigos em **Salas** (Biblioteca de Nag Hammadi, Corpus Hermeticum, O Caibalion, O Livro de Urântia, Apócrifos do Cristianismo Primitivo…), com busca comparativa por tema e um assistente de IA que consulta o próprio acervo. Posicionamento: curador de museu, não pregador. Toda a interface e o conteúdo são em português do Brasil.

## Design system: obrigatório em toda tela

- A interface usa **somente** a biblioteca em `design-system/`. Antes de criar ou mudar uma tela, leia `design-system/README.md`, `design-system/DIRETRIZES.md` e o guia de cada peça que for usar (`design-system/components/<Nome>/README.md`), e copie a estrutura HTML do exemplo (`design-system/exemplos/<Nome>.html`).
- Carregue `design-system/tokens.css`, `design-system/components/bundle.css` e `design-system/components/bundle.js`. Classes `sdb-*`; comportamentos por atributos `data-*`; chame `SalaBuscadores.hydrate()` depois de inserir HTML dinâmico.
- Temas via `data-theme` no `<html>`: `solido-claro` (padrão, paleta areia desde out 2026), `solido-escuro`, `vidro-claro`, `vidro-escuro`. Fundo chapado nos sólidos (areia no claro, grafite no escuro); `.sdb-ambient` só acende brilho nos temas de vidro.
- Nunca escreva cores, fontes, raios, sombras ou curvas soltos: use as variáveis dos tokens (`var(--label)`, `var(--radius-lg)`…). Se faltar uma peça ou variação, estenda o design system primeiro (`tokens.json`, `components/bundle.css`, guia e `preview.html` da peça; depois `node design-system/scripts/build.mjs` regenera `tokens.css`, exemplos e catálogo, e `node design-system/scripts/contraste.mjs` confere AA) e avise o usuário que a versão publicada (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.
- Linguagem visual aprovada: Apple Human Interface Guidelines, no tema Sólido claro com a paleta areia do Figma "Sala_Dos_Buscadores › Jornada do buscador" (fundo areia chapado, lateral caramelo, cards de Sala e de conteúdo em areia quente, citações e painéis em creme, layout de painel com barra lateral, tudo alinhado à mesma grade, texto à esquerda). Vidro só na camada flutuante (botão do assistente, barra superior ao rolar, barra de abas do celular); botões e chips em cápsula; cantos contínuos; movimento com mola, interrompível, com resposta no pressionar. O estilo editorial de cantos retos foi rejeitado.
- Marca: cores grafite `#111313`, bege `#F6E7CE`, bordô `#390007`, ouro `#D3C759` (só emblema/filete, nunca texto nem fundo de leitura), preto e branco; a paleta areia do tema claro (areia, caramelo, marrom `label-brand`, dourado escuro do item ativo, verde "nova", vermelho só em "Sair") está nos tokens e passa AA. Texto sobre fundo só nos pares das Diretrizes. O Avatar pode mostrar a foto que a própria pessoa enviou (lateral e Perfil); sem foto, iniciais. Único símbolo: o arco com escada. Sem cristais, mandalas, lua, velas, fumaça, gradiente roxo ou símbolos de tradições. Hident está provisoriamente trocada por Fraunces.
- Para conferir visualmente, abra `design-system/catalogo.html` no navegador.

## Conteúdo e voz

- Precisa, serena, didática, firme. Nunca dogmática, sensacionalista, condescendente ou decorativa.
- Toda afirmação é atribuída a uma fonte ("Segundo o Poimandres…"); nunca "a verdade é…". Datas incertas ficam incertas.
- Todo conteúdo mostra o Selo de proveniência; toda resposta da IA é identificada como IA, separa trecho documental, interpretação editorial e síntese, cita fontes e vem com o Aviso de neutralidade.
- Use conteúdo real do universo do projeto nos exemplos, nunca lorem ipsum.

## Tecnologia

- O MVP fica em `portal/`: Next.js 16 (App Router, Turbopack, React Compiler, typed routes) + TypeScript + Tailwind 4, lint e formatação com Biome, testes com Vitest + Testing Library e E2E com Playwright. Dados simulados em `portal/src/data`. Ver `portal/README.md`.
- `portal/src/design-system/` é uma cópia gerada por `npm run ds:sync` (tokens, bundle.css, bundle.js, fontes, `icons.generated.ts`, `fontes.generated.ts` e, desde a 1.0, `themes.css`, `refinement.css`, `card-sala.css`, `card-video.css`, `card-comparativo.css`, `assistant-orb.css` e o renderizador `gold-orb.js`). A fonte da verdade é `design-system/` na raiz: mude lá e rode o sync; nunca edite a cópia. O `build` falha se ela divergir. `components/refined-layout.css` é só da página de estudo do catálogo e não entra no portal.
- Componentes React em `portal/src/components/ds/` emitem as mesmas classes e atributos dos exemplos (`sdb-*` e, nas peças refeitas na 1.0, `sala*`, `video*`, `comparativo*`/`comparison*`, `orb-*`/`assistant-chat*`); os comportamentos do `bundle.js` e dos módulos da 1.0 foram portados para React (eles não são carregados). A exceção é o desenho WebGL do orbe (`gold-orb.js`), usado como está. Não reescreva o CSS nem invente estilos inline; ajustes em linha só quando o exemplo da biblioteca faz o mesmo.
- Tailwind entra sem preflight e só para layout de elementos de estrutura, com o tema mapeado para os tokens.
- O acervo editável vive na memória do servidor (`portal/src/server/store.ts`); as telas leem só o que está publicado, por `portal/src/data/repositorio.ts`. A curadoria fica em `/admin`, restrita ao papel administrador, e toda Server Action confere o papel.
- Papéis: `membro` (lê e pode se candidatar a anfitrião em `/ajustes`), `anfitriao` (mantém as próprias Salas e artigos em `app/(app)/anfitriao`, que só vão ao ar depois da revisão da curadoria; não publica direto nem acessa `/admin`) e `administrador` (curadoria em `/admin`, publica direto nas Salas oficiais, revisa anfitriões em `/admin/anfitrioes` sem editar o conteúdo deles, gerencia usuários, candidaturas e convites). As Salas não são fixas: oficiais e de anfitriões vivem no store; o catálogo (`portal/src/data/catalogo.ts`) lê as visíveis de um registro instalado pelo store e pelo layout raiz. Toda ação de anfitrião confere papel e posse no servidor (`exigirAnfitriao`, `exigirDonoDaSala`, `exigirDonoDoArtigo` em `portal/src/server/sessao.ts`); regras puras em `portal/src/features/anfitriao/regras/`.
- Acesso: o cadastro é obrigatório. Sem sessão, todas as rotas vão para `/entrar` (proxy + checagem no layout `app/(app)`), menos `/entrar`, `/cadastro` (inclusive o cadastro por convite de anfitrião, `/cadastro?convite=…`) e `/recuperar-senha`. Telas novas do app entram em `app/(app)`, dentro da moldura (lateral, barra superior, rodapé, botão do assistente). Interesses e religião ou convicção são perguntados no onboarding, sempre opcionais; a convicção só é salva com consentimento.
- Antes de concluir uma mudança no portal: `npm run check` (e `npm run test:e2e` quando mexer em fluxo).

## Referências

- Requisitos do produto: `Sala_dos_Buscadores_Documento_de_Requisitos_v1.docx`.
- DNA criativo da marca: `BRANDIG_DNA/DNA.pdf`.
- Referências visuais: `DESIGN SYSTEM/` (imagens e a fonte Gambetta original).
