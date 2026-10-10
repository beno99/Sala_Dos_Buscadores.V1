# Redesign do portal: painel com barra lateral, tema sólido, cadastro obrigatório e onboarding

## Skills obrigatórias

Antes de qualquer outra coisa, ative e siga estas skills durante todo o trabalho:
- `using-superpowers`, com as que ela indicar: `brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging` e `verification-before-completion`;
- `ui-ux-pro-max`;
- `emil-design-eng`.

Elas servem para o design e o código saírem consistentes. Quando uma skill conflitar com as regras deste projeto (`CLAUDE.md` e `design-system/`), valem as regras do projeto. Nesse caso, diga qual foi o conflito.

## Objetivo

Trocar a estrutura do app inteiro por um layout de painel: barra lateral, barra superior, conteúdo, rodapé e botão flutuante do assistente. Além disso:
- tornar o cadastro obrigatório;
- criar o onboarding de primeiro acesso;
- redesenhar por dentro a página inicial (**Portal**, `/`);
- criar versões funcionais das novas seções (Destaques, Biblioteca, Trilhas, Estante, Ajustes).

O redesenho visual detalhado de Sala, Comparar, Assistente e das novas seções virá depois, com referências próprias. Por ora elas só precisam funcionar dentro da nova moldura, usando peças da biblioteca.

## 0. Leitura e plano (antes de qualquer código)

1. Leia `CLAUDE.md`, `design-system/README.md`, `design-system/DIRETRIZES.md` e `portal/README.md`. Leia também o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente:
   - estrutura: `NavegacaoLateral`, `IndicadorNumerico`, `Tabs` (barra de abas), `Paginacao` (pontos);
   - acervo: `CardSala`, `CardConteudo`, `CardVideo`, `SeloNivel`, `TrilhaEstudo`, `Badge`, `ChipTema`;
   - busca: `BarraBusca`, `CommandPalette`;
   - sobreposições e campos: `Modal`, `Drawer`, `Checkbox`, `Switch`, `Botao`.
2. Abra as referências em `docs/referencias/redesign-portal/`:
   - `01-wireframe-portal.png`: **a estrutura pedida**. Banner no topo, Salas com chips de tema, faixa de KPIs, "Continue de onde parou", assuntos relacionados e espaço de anúncio. A lateral tem perfil, "continuar", menu, salvos e progresso. As cores são ilustrativas: siga só a paleta da marca.
   - `02-portal-atual.webp`: **o que deve deixar de existir**. Coluna centralizada sem grade, blocos desalinhados, brilho ambiente dourado e bordô no fundo, Salas soltas numa grade 4+1.
   - `03-human-academy-lateral-aberta.webp` e `04-human-academy-lateral-recolhida.webp`: **referência de estrutura e comportamento**. Lateral recolhível para só ícones, mini card de "continuar" no topo da lateral, itens com etiqueta, barra superior com busca e avatar, carrossel de cards com barra de progresso, painel único de KPIs dividido em células, duas colunas abaixo e botão flutuante da IA. Ignore o tema escuro, o azul e a promoção com contagem regressiva.
   - `05-mantra-lateral-e-cards.png`: **referência de acabamento da lateral**. Fundo claro, cartão de perfil no topo, itens agrupados sob títulos de seção, item ativo com fundo suave, cartão de ação no rodapé.
   - `06-solva-banner-e-rodape.png`: **referência de clima**. Fundo bege chapado, banner em card com título em serifa de dois tons, botão escuro em cápsula, imagem à direita, rodapé em colunas, contraste leve.
3. Leia `portal/public/imagens/LEIA-ME.md`. Ele lista as imagens já recebidas (já com o duotone grafite–bege da marca), o lugar de cada uma, o texto alternativo, o foco (`object-position`), o crédito e o que ainda falta. Abra as imagens para ver como ficam. Onde não houver imagem, use a placa da marca com o arco.
4. Mostre um plano por fases (seção 9), com as peças do design system a criar ou estender e os arquivos do portal a mudar. **Espere meu ok antes de implementar.**

## 1. Decisões do produto

**Visual**
- **Tema Sólido como padrão.** `data-theme="solido-claro"` no `<html>`; `solido-escuro` fica como opção no menu de aparência.
  - Fundo bege chapado, sem brilho ambiente: tire o `.sdb-ambient` ou faça o brilho sumir no tema sólido.
  - Cards e painéis opacos com contraste leve: superfícies claras sobre o bege, borda sutil, sombra curta. Limpo e moderno, como a referência 06.
- **Vidro só no que flutua sobre o conteúdo:** botão flutuante do assistente, barra superior quando o conteúdo passa por baixo e barra de abas do celular. Hoje o tema sólido zera o desfoque. Por isso, crie no design system uma camada "flutuante" que mantém translucidez e desfoque nos temas sólidos só para essas peças, com fallback opaco em `prefers-reduced-transparency`. Documente no `DIRETRIZES.md`.
- **Alinhamento:** texto alinhado à esquerda (nada de `text-align: justify`) e todos os blocos presos à mesma grade, com a mesma borda esquerda, as mesmas larguras de coluna e o mesmo ritmo vertical.
- **Marca:** só a paleta da marca (grafite, bege, bordô, ouro como emblema). Siga a linha da biblioteca: nomes específicos, sem emoji, sem exclamação. A página inicial se chama **"Portal"**, nunca "Home" ou "Início". A saudação é "Boas-vindas de volta, {pseudônimo}.".

**Acesso (muda o DRS)**
- **Cadastro obrigatório.** Sem sessão, todas as rotas vão para `/entrar?voltar=…`, exceto `/entrar`, `/cadastro` e `/recuperar-senha`.
  - Amplie o `matcher` de `portal/src/proxy.ts`, mantendo a checagem de papel no servidor.
  - Remova todo caminho "continuar sem cadastro" e o aviso de visitante (`BoasVindas`).
  - O campo de tradição de interesse sai do formulário de cadastro e vai para o onboarding.
- **Onboarding de primeiro acesso.** Logo depois do cadastro, ou no primeiro login de uma conta sem preferências, abre uma sequência de pop-ups (`Modal` em sheet, com indicador de etapa em `.sdb-dots`):
  1. **Boas-vindas:** o que é a Sala e para que servem as próximas perguntas.
  2. **Áreas de interesse:** temas transversais e Salas em chips de múltipla escolha, nenhum pré-selecionado. Tem "Pular por agora".
  3. **Religião ou convicção.**
     - Opções em múltipla escolha, nenhuma pré-selecionada, em ordem alfabética depois das três primeiras: "Não tenho religião", "Espiritualidade sem religião", "Prefiro não informar", Budismo, Candomblé, Catolicismo, Esoterismo e hermetismo, Espiritismo, Hinduísmo, Islamismo, Judaísmo, Protestantismo e igrejas evangélicas, Umbanda, "Outra" (com campo de texto).
     - Por LGPD (art. 11) e pelo RNF-LEG-02, esta etapa é **opcional**: "Pular" e "Prefiro não informar" sempre disponíveis. A resposta nunca condiciona o acesso.
     - Mostre a finalidade em texto visível: "Usamos só para sugerir conteúdos. Fica privado, ninguém mais vê, e você pode mudar ou apagar em Ajustes."
     - Se a pessoa informar algo, peça consentimento específico e destacado (checkbox) antes de salvar.
  4. **Resumo:** o que foi salvo, com "Ir para o Portal".
  - Em Ajustes, "Refazer preferências" reabre o onboarding, e as respostas podem ser editadas ou apagadas (RNF-LEG-03).
- **Recomendação ("Salas recomendadas", "Para você").**
  - Usa primeiro os interesses declarados.
  - A religião entra só como sinal fraco e nunca esconde nada do acervo.
  - Sempre há pelo menos uma Sala ou conteúdo fora do perfil declarado, com a etiqueta "Para ampliar o olhar", para evitar bolha de conteúdo.

**Navegação e seções**
- **Menu lateral, em grupos:**
  - **Acervo:** Portal (`/`), Destaques, Biblioteca, Salas;
  - **Estudo:** Trilhas, Estante;
  - **Ferramentas:** Comparar, Assistente;
  - **Conta:** Ajustes, Sair;
  - Curadoria só para administrador, levando ao `/admin`, que mantém a casca própria (`CascaCuradoria`) e não ganha duas laterais.
- **Destaques:** os conteúdos mais pesquisados no acervo, com contagem simulada de buscas dos últimos 30 dias. Legenda: "Mais pesquisados no acervo nos últimos 30 dias". É ranking de conteúdo, nunca de pessoas, e não sugere que um conteúdo seja "mais verdadeiro".
- **Biblioteca:** todos os conteúdos do acervo, com os filtros por Sala, tema, nível e formato (RF-20), reaproveitando `features/busca`.
- **Trilhas e Estante:** entram com dados simulados.
- **Busca:** a lupa na barra superior (e o atalho ⌘K / Ctrl K) abre o componente de busca numa sobreposição no topo da tela. É a `BarraBusca` com os dois modos (Por Sala · Por tema ou pergunta) e a opção de busca comparativa, mais sugestões ao vivo abaixo:
  - Salas;
  - temas ("Comparar «tema» entre as Salas");
  - conteúdos;
  - a ação "Perguntar ao assistente: «texto»".
  - "Comparar" leva a `/comparar`. Isso cobre o RF-17.
- **Sem sininho de notificações** por enquanto: deixe `TODO(notificacoes)` na barra superior.
- **Botão flutuante do assistente:** círculo de vidro (56 px, ícone `assistente`, tooltip). Abre o assistente num Drawer por cima da página atual, reaproveitando `PainelAssistente`, `ConversaProvider` e `AvisoNeutralidade`, com o link "Abrir em tela cheia". Some em `/assistente`.
- **Celular (< 900 px):** a lateral dá lugar à barra de abas inferior (`.sdb-tabbar`, camada flutuante) com Portal, Biblioteca, Trilhas, Estante e Mais. "Mais" abre um Drawer com o resto do menu. O botão flutuante fica acima da barra.

**Gamificação** (RF-24 e RNF-DOM-05 continuam valendo)
- **KPIs do Portal: só progresso pessoal e privado,** 4 células: Salas visitadas (3 de 5), conteúdos lidos, temas comparados, trilhas em andamento. Nada de pontos, nível global ou certificados.
- **Níveis de conhecimento por assunto** (por Sala e por tema), na escala que já existe (Iniciante, Intermediário, Avançado, os degraus do `SeloNivel`): "Intermediário em Corpus Hermeticum".
  - O progresso é contado em leituras e degraus, sem pontos: "faltam 2 leituras para Avançado".
  - A regra é simples e transparente, explicada num Modal "Como os níveis funcionam". O Modal diz que os níveis medem só o estudo no acervo e nada sobre crença ou espiritualidade.
- **Conquistas (badges)** de estudo, em emblema de ouro com glifo preto. Bloqueadas aparecem em `fill-strong` com cadeado e o critério:
  - "Porta aberta": primeira Sala visitada;
  - "Cinco Salas": visitou as cinco Salas;
  - "Lado a lado": primeira comparação de tema;
  - "Na fonte": leu 3 fontes primárias;
  - "Vocabulário": abriu 10 verbetes;
  - "Com as fontes": conferiu as fontes de uma resposta do assistente;
  - "Degrau III": chegou ao Avançado em um assunto.
  - Ao ganhar uma, aparece o Toast "Conquista: Lado a lado.", no passado e sem "parabéns".
- **Tudo privado:** sem perfil público, placar ou comparação entre pessoas. Os nomes nunca falam em evolução espiritual.
- Em Ajustes, o switch "Mostrar níveis e conquistas" desliga essa camada.
- Lógica de níveis, conquistas e recomendação em funções puras e testadas.

**Banner e anúncios**
- **O banner do topo é rotativo** e mistura: o slide de marca do wireframe, episódios do canal e anúncios.
  - Slide de marca: rótulo "Biblioteca digital de estudos comparados"; título "A Sala dos Buscadores" em `display-caps`, a única vez na tela; subtítulo "Um acervo curado para compreender textos, ideias e cosmologias em seus próprios contextos, sem hierarquias, sem respostas prontas."; botões "Comparar um tema" e "Perguntar ao assistente".
  - Troca a cada 7 s.
  - Tem botão visível de pausar e retomar (WCAG 2.2.2), pausa em hover e em foco, e não roda sozinho com `prefers-reduced-motion`. Pontos e setas operáveis por teclado.
- **Anúncio** (nos slides do banner e no espaço fixo da coluna direita, onde o wireframe diz "Banner para anúncio"):
  - rótulo "Publicidade" sempre visível, nome do anunciante e o link "Por que estou vendo isto?", que abre a política no Modal;
  - a política segue o DRS: curadoria editorial, vedado charlatanismo, promessa de cura ou manipulação religiosa;
  - nunca usa selo de proveniência nem o contorno tracejado da IA, e nunca imita um card editorial;
  - nunca aparece dentro da Grade comparativa, das respostas do assistente ou da leitura de um conteúdo;
  - sem contagem regressiva nem urgência;
  - anunciantes fictícios coerentes com o produto, por exemplo "Edições Pórtico (anunciante fictício): coleção de bolso de textos antigos em domínio público". Nenhuma marca real.

## 2. Design system primeiro

Ajuste `design-system/` (fonte da verdade) antes de tocar no `portal/`. Para cada peça nova ou estendida: tokens em `tokens.json` (regenere `tokens.css`), CSS em `components/bundle.css`, guia `components/<Nome>/README.md`, exemplo `exemplos/<Nome>.html` e entrada no `catalogo.html`. Nada de cor, raio, sombra ou curva solto: tudo por variável. Depois rode `npm run ds:sync` no `portal/`.

**Tokens e diretrizes**
- Revise `solido-claro` e `solido-escuro` para o contraste leve pedido. Confira AA de todos os pares de texto nos quatro temas.
- Crie os tokens da camada flutuante.
- Atualize no `DIRETRIZES.md`: tema padrão, fundo chapado e a camada flutuante. Atualize também a linha de linguagem visual do `CLAUDE.md`.
- Atualize a seção Imagem do `DIRETRIZES.md`:
  - gravuras, pinturas e documentos de época são aceitos mesmo com sol, lua ou estrelas, quando fazem parte da imagem histórica; esses elementos continuam proibidos como decoração mística;
  - toda imagem recebe o duotone grafite–bege (`portal/scripts/duotone-imagens.py`);
  - crédito visível quando conhecido;
  - imagens moram em `portal/public/imagens/`.

**Estender**
- `NavegacaoLateral` (passa a servir o app todo):
  - títulos de grupo em `meta`;
  - cartão de perfil no topo;
  - mini card "Continuar de onde parou" com barra fina e botão de dispensar;
  - etiqueta por item ("nova", contagem);
  - rodapé com cartões;
  - modo recolhido de 64 px com `data-tip`, que já existe.
- `IndicadorNumerico`:
  - criar o painel agrupado, com várias células num único card, divisórias, `meta`, valor tabular grande, barra e dica opcionais;
  - mudar a regra do guia para "dados do acervo ou do próprio membro, sempre privados; nunca ranking nem comparação entre pessoas".
- `CardSala`: imagem opcional no lugar da placa, barra de progresso do membro com legenda ("Iniciante · 2 de 6 lidos") e etiqueta "Para ampliar o olhar".
- `CardConteudo`: variante em linha (`--row`) com miniatura, Sala, título, progresso e "Retomar leitura". O selo de proveniência continua obrigatório.
- `SeloNivel`: variante com progresso até o próximo nível.

**Criar**
- `BarraSuperior`: título da página e saudação; lupa, aparência e conta. Fixa no topo, com a camada flutuante ao rolar.
- `BannerRotativo`:
  - card largo `radius-xl` com placa ou imagem;
  - texto à esquerda: rótulo, título em serifa de dois tons para episódio e anúncio, subtítulo e botões em cápsula, como a referência 06;
  - mídia à direita;
  - controles: pontos, setas, pausar.
- `Carrossel`: scroll-snap horizontal no padrão da Grade comparativa, com cabeçalho (título, legenda, setas). A página nunca rola de lado.
- `PainelBusca`: sobreposição no topo com a `BarraBusca` e a lista de sugestões. Sem animação, como o command palette.
- `Conquista`: emblema obtido ou bloqueado, em versão mini e em linha de lista.
- `Onboarding`: sheet de várias etapas, com pontos de etapa, ações "Pular" e "Continuar" e área de consentimento.
- `EspacoPublicitario`: versões de banner e de coluna.
- `BotaoFlutuante`.
- `Rodape`: marca e frase, colunas de links e linha final.

No fim, liste as mudanças da biblioteca e lembre que a versão publicada (https://claude.ai/artifact/1rSk2ixfmNQXjLu2AHBBJB) precisa ser atualizada.

## 3. Página Portal (`/`)

Grade com largura máxima de cerca de 1280 px e a mesma borda esquerda em todas as seções. Ordem, seguindo o wireframe:

1. **Banner rotativo** (seção 1).
2. **Salas recomendadas** (`Carrossel` + `CardSala` com progresso).
   - Legenda "Acesso rápido às Salas · 5 abertas".
   - Acima, os chips de tema com contagem. Escolher um filtra o carrossel para as Salas que tratam o tema e mostra o link "Comparar {tema} entre as Salas" (RF-21).
   - Ordem: Salas em andamento, depois as que batem com os interesses, depois sempre uma "Para ampliar o olhar".
3. **KPIs** (painel agrupado, 4 células): Salas visitadas (3 de 5, com barra), conteúdos lidos (com a dica "4 fontes primárias"), temas comparados e trilhas em andamento. O número e o texto carregam a informação; a barra é complemento.
4. **Duas colunas.**
   - Esquerda:
     - "Continue de onde parou" (`CardConteudo --row` com "Retomar leitura");
     - "Publicados recentemente" (3 linhas);
     - "Para ampliar o olhar" (conteúdo de outra Sala sobre um tema que a pessoa já leu).
   - Direita: `EspacoPublicitario` ocupando a coluna.
5. **Rodapé global.** Colunas:
   - **Acervo:** Destaques, Biblioteca, Salas, Comparar, Assistente;
   - **Sobre:** Como funciona o assistente, Política editorial, Política de publicidade;
   - **Legal:** Termos em linguagem simples, Privacidade e LGPD;
   - **Canal:** YouTube.
   - Linha final: "A Sala dos Buscadores · Curador de museu, não pregador" e o aviso de dados simulados que já existe.

**Lateral para o membro, de cima para baixo:**
- marca (arco + nome em `display-lower`) e botão de recolher;
- cartão de perfil (iniciais, pseudônimo, "Membro desde set 2026", menu da conta);
- mini card "Continuar";
- menu em grupos;
- no rodapé, os cartões "Salvos para depois" (contagem, link para Estante) e "Seu nível em {assunto em foco}" (`SeloNivel` com progresso e o link "Ver conquistas", que abre um Modal com as obtidas e as bloqueadas).
- O estado recolhido fica guardado no navegador, com `localStorage` protegido por try/catch.

**Estados:**
- carregando: esqueletos;
- membro novo, sem leituras: "Comece por aqui", com 3 conteúdos iniciantes de Salas diferentes no lugar de "Continue";
- filtro de tema sem Salas: dizer o que remover;
- erro: `Alerta` começando por "Erro:", com "Tentar de novo".

## 4. Novas seções (versão funcional, só com peças da biblioteca)

Cada página leva o comentário `TODO(redesign): aguarda referências`.
- **Destaques:** lista ordenada dos mais pesquisados (`CardConteudo` com a contagem de buscas como `meta`).
- **Biblioteca:** todos os conteúdos, com `FiltrosBusca` (Drawer no celular), chips de filtro ativos, paginação e estado vazio que diz qual filtro remover.
- **Trilhas:** trilhas por Sala com `TrilhaEstudo` (estados concluído, em andamento, disponível e bloqueado) e o botão "Concluir degrau N" funcionando sobre os dados simulados (RF-22, RF-23). Sem ranking (RF-24).
- **Estante:** Salas e conteúdos salvos. Remover oferece "Desfazer" no Toast. Os botões de estante de `CardSala` e `CardConteudo` passam a salvar de verdade na sessão.
- **Ajustes:** aparência (claro ou escuro), "Mostrar níveis e conquistas", "Refazer preferências", editar ou apagar interesses e religião, "Sair".

## 5. Dados simulados

Siga o padrão existente (`portal/src/data/mock`, `repositorio.ts`, `server/store.ts`, sessão em `server/sessao.ts`).
- **Conta de demonstração de membro** (`CONTA_DEMONSTRACAO`):
  - onboarding já feito, com 2 interesses e "Prefiro não informar";
  - Salas visitadas;
  - leituras com porcentagem, uma delas em andamento;
  - temas comparados;
  - trilhas em andamento;
  - itens na estante;
  - verbetes abertos;
  - conquistas obtidas.
- **Conta nova criada no cadastro:** começa vazia e passa pelo onboarding.
- **Mocks próprios:** contagem de buscas por conteúdo (Destaques), slides do banner (marca e episódios), anúncios fictícios e trilhas por Sala.
- **Imagens:** `portal/public/imagens/{banner,salas,episodios,anuncios,conteudos}`, conforme o manifesto em `LEIA-ME.md`.
  - Cada componente recebe `imagem?`, mais texto alternativo, foco e crédito do manifesto, e cai na placa da marca quando o arquivo não existe.
  - Use `next/image` com tamanhos responsivos.
  - Mostre o crédito em `footnote`: no rodapé do slide do banner e no Modal ou tooltip de informação da imagem nos cards.
  - O slide de marca do banner usa `banner/marca.webp`. Os slides de episódio usam `banner/<id-do-video>.webp` quando existir.
  - Não use imagens nas colunas da Grade comparativa: as placas por Sala continuam lá.

## 6. Fora do escopo agora

- Redesenho visual detalhado de Sala, Comparar, Assistente, autenticação, das novas seções e de `/admin`. Todas precisam continuar funcionando na nova moldura.
- Notificações, comunidade, certificados e anúncio em vídeo.

## 7. Acessibilidade e voz

- WCAG 2.1 AA (RNF-USA-01).
- Lateral: `nav` com `aria-label`, `aria-current="page"`, recolher com `aria-expanded`, foco em ordem lógica.
- Carrossel e banner operáveis por teclado, com pausa (2.2.2).
- Onboarding: foco preso no Modal, título anunciado, etapa atual anunciada ("Etapa 2 de 4").
- `prefers-reduced-motion` e `prefers-reduced-transparency` respeitados.
- Voz da marca: precisa, serena, sem exclamação, sem emoji, controles com verbo exato, confirmações no passado, erros começando por "Erro:".

## 8. Documentação

- Em `portal/README.md`, registre as mudanças que contrariam o DRS v1 e precisam ser levadas ao documento:
  - **RF-01 e RF-05:** o cadastro passou a ser obrigatório; o ator "Visitante" e a Jornada 7.2 mudam;
  - **RF-07:** a coleta passou para o onboarding, continua opcional;
  - **RF-24:** adendo dizendo que níveis privados de conhecimento por assunto e conquistas de estudo são permitidos;
  - **Publicidade:** saiu do roadmap e entrou no MVP.
- Atualize o `CLAUDE.md` onde ele descreve o acesso e a linguagem visual.

## 9. Fases e verificação

Trabalhe em fases e rode a verificação ao fim de cada uma (no `portal/`: `npm run ds:sync`, `npm run check` e, a partir da fase B, `npm run test:e2e`):

- **Fase A, design system:** tema sólido padrão, camada flutuante e as peças da seção 2, com guias, exemplos e catálogo.
- **Fase B, moldura e acesso:** lateral, barra superior, barra de abas do celular, botão flutuante, painel de busca, rodapé, cadastro obrigatório e onboarding.
- **Fase C, Portal:** a página `/` completa, com níveis, conquistas e anúncios.
- **Fase D, novas seções:** Destaques, Biblioteca, Trilhas, Estante e Ajustes.

**Testes novos**
- Unitários: nível por assunto, conquistas, recomendação (sempre há um item "Para ampliar o olhar") e rotação do banner.
- Testing Library: lateral aberta e recolhida, e as etapas do onboarding, incluindo pular a religião.
- Playwright:
  - sem sessão, qualquer rota leva a `/entrar`;
  - cadastro novo passa pelo onboarding e chega ao Portal;
  - a conta de demonstração vê KPIs, "Continuar" e conquistas;
  - a lupa abre a busca e "Comparar" leva à grade;
  - o botão flutuante abre o assistente;
  - o banner pausa;
  - em 390 px, a barra inferior e o "Mais" funcionam.
- Atualize os testes existentes que supunham acesso sem cadastro.

**Conferência visual:** abra o app no navegador em 1440, 1024 e 390 px, nos temas claro e escuro, com a conta de demonstração e com uma conta nova. Compare com `01-wireframe-portal.png`: mesma ordem e estrutura, blocos alinhados à grade, fundo bege chapado.

**Entrega:** um resumo com:
- o que mudou no design system;
- o lembrete de atualizar o artifact publicado;
- as divergências do DRS registradas;
- o que ficou como TODO;
- quais imagens de `portal/public/imagens/` ainda faltam.
