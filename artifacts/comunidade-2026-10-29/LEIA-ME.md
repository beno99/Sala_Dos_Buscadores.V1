# Comunidade · refinamento visual · 29/10/2026

Implementação na rota [Comunidade](http://localhost:3000/comunidade), usando o build de produção local. Prévia interativa dos componentes: [catálogo Comunidade](http://127.0.0.1:4174/exemplos/Comunidade.html). A autenticação, o banco, as regras, os serviços e a moldura foram preservados.

## Referências inspecionadas

Os quatro nós do arquivo Figma `WtsqtkYXDtEKBZ3pYiBOE4` foram lidos pela integração oficial, com contexto de design, medidas, camadas e screenshots: desktop `103:615`, mobile `104:710`, comentários/composição `104:574`, componentes `104:933`. As capturas originais estão em [desktop](figma-desktop.png) e [mobile](figma-mobile.png).

Geometria da referência: desktop 1280 px, margens de 64 px, feed 776 px, lateral 352 px, intervalo 24 px. Mobile 390 px, margens de 20 px e cards de 350 px. Cards com raio 24 px e padding 24 px no desktop/20 px no celular; interiores 16 px, botões 12 px, tags 8 px. No portal, as margens externas continuam sob responsabilidade da moldura existente; a grade interna responde à largura disponível.

## O que mudou

- Superfícies brancas no claro e opacas no escuro, em todos os quatro temas; fundo areia e bordas discretas, sem vidro nos cards.
- Tipografia General Sans e Gambetta local, limitada à família Comunidade.
- Ordem do cartão: identificação, contexto, conteúdo, bloco específico, ações e comentários. Texto conserva os parágrafos; o controle de expansão aparece apenas se houver conteúdo truncado.
- Citação sólida com fonte e cópia, pergunta com contexto lilás, achado com procedência real e acesso ao conteúdo; imagens permanecem suportadas.
- Busca desktop junto às abas e busca móvel expansível; compositor em fluxo com quatro acessos em duas linhas no celular; os quatro painéis laterais continuam acessíveis abaixo do feed.
- Comentários com avatar, nome, texto e tempo; diálogo reutiliza o gerenciamento de foco existente. Tooltips junto à borda direita deixaram de causar overflow.
- Formulários do catálogo refinados, mantendo campos condicionais, validação, anexos e limites. Sala, temas e imagem agrupados; campos opcionais expandem por teclado. Corrigidas duas opções com HTML malformado na prévia anterior (conteúdo do Poimandres e destinatária de demonstração).

## Arquivos principais

- [CSS canônico](../../design-system/components/Comunidade/comunidade.css), [tokens](../../design-system/tokens.json), guias e `preview.html` de Comunidade, CardPublicacao, CompositorComunidade, LinhaComentario, LinhaPessoa, CartaoLateralComunidade, BarraAcoesComunidade e PainelComentarios.
- [CardPublicacao React](../../portal/src/components/ds/CardPublicacao.tsx), [BarraAcoesComunidade](../../portal/src/components/ds/BarraAcoesComunidade.tsx), [BlocoCitacao](../../portal/src/components/ds/BlocoCitacao.tsx), [PainelComentarios](../../portal/src/components/ds/PainelComentarios.tsx).
- [FeedComunidade](../../portal/src/features/comunidade/ui/FeedComunidade.tsx) e [PublicacaoLeitura](../../portal/src/features/comunidade/ui/PublicacaoLeitura.tsx).
- Gerador de exemplos, teste de contraste, script de sincronização e importação do CSS no layout. `portal/src/design-system/` foi atualizado exclusivamente por `npm run ds:sync`. As mudanças nos demais exemplos gerados refletem os hashes atualizados dos tokens.

## Capturas reais do navegador

| Contexto | Desktop | Mobile |
| --- | --- | --- |
| Portal autenticado, banco atual sem publicações | [Página completa](portal-desktop.png) | [Página completa](portal-mobile.png) |
| Componentes React reais com fixture isolada, sem gravação no banco | [Quatro tipos](componentes-desktop.png) | [Quatro tipos e painéis](componentes-mobile.png) |
| Formulário demonstrativo do Design System | [Reflexão](compositor-desktop.png) | [Reflexão](compositor-mobile.png) |
| Comentários | [Painel React com fixture](comentarios-react.png) | [Painel demonstrativo com anexos](comentarios-mobile.png) |

[Tema escuro](componentes-escuro.png). [Achado do acervo no formulário móvel](compositor-mobile-achado.png).

Os nomes, textos e números da fixture são dados controlados para avaliação visual, baseados nas referências. Não foram adicionados ao portal nem ao banco. A conta real usada na conferência foi a conta administrativa configurada neste ambiente; nenhuma credencial está nos artefatos.

## Verificação

- `node design-system/scripts/build.mjs` e `--check`: derivados atualizados.
- `node design-system/scripts/contraste.mjs`: AA nos quatro temas, incluindo todos os novos pares de cor da Comunidade. [Log](contraste.log).
- `npm run ds:sync` e `npm run check`: aprovados; 10 testes existentes de marcação, lint e typecheck. Há um aviso preexistente de `useOptionalChain` em `CampoImagem.tsx:38`, sem erro. [Log](check.log).
- `npm run build`: aprovado. [Log](build.log). Houve falhas intermediárias por disco cheio; foram removidos apenas caches regeneráveis do Next e o build final passou.
- Chrome real automatizado por Playwright: **49 verificações aprovadas**, com componentes React, portal autenticado e prévia DS. Incluem os quatro tipos, abas por teclado, busca desktop/mobile, vazio, diálogo, Escape e retorno de foco, expansão de texto, estados indisponíveis, seleção demonstrativa de curtir/salvar, quatro temas, movimento reduzido, zoom 200%, anexos e validações dos quatro formulários. Sem overflow em 1504, 1280, 1024, 768, 390 e 360 px na página isolada; portal real também conferido em desktop, 1024, 768, 390 e 360 px. [Log](navegador.log).
- `git diff --check`: aprovado. As exclusões preexistentes em `docs/figma/conta-onboarding/` não foram alteradas.

Este checkout não disponibiliza scripts `test`/`test:e2e` nem a antiga suíte Vitest/Playwright. A validação foi executada com o Chrome instalado e o Playwright disponível no ambiente, sem adicionar dependências ao projeto. [Script executado](validacao-browser.cjs) e [fixture usada](fixture-visual.tsx); a página temporária foi montada fora da aplicação, em `/tmp/comunidade-validacao`.

## Diferenças e integrações pendentes

1. **A Comunidade neste checkout é somente leitura.** Existe apenas `server/comunidade/consultas.ts`; o feed já informa que publicação e respostas serão habilitadas depois. Curtir, salvar, seguir, reagir e publicar não têm serviços de escrita conectados. Foram mantidos indisponíveis no portal. Abertura de reações, leitura de comentários, busca, abas, links e perfis continuam funcionando. Os formulários e envios demonstrativos do catálogo não foram apresentados como funcionalidades reais.
2. O banco atual não tem publicações para essa conferência. Por isso a captura do portal mostra o vazio legítimo, e os quatro tipos foram avaliados com os mesmos componentes React em uma fixture separada. Não foram alterados seeds, progresso, autenticação, permissões ou moderação.
3. O modelo de citação disponível contém trecho, obra e passagem; não contém campo bibliográfico adicional. A interface mostra a referência existente, sem inventar edição, autoria ou revisão.
4. Mantidos o nível no celular, aviso dispensável, link direto da publicação, cópia de citação e todos os painéis, mesmo quando ausentes do recorte do Figma. Alvos interativos mantêm 44 px; isso aumenta algumas alturas em relação aos alvos de 28/40 px do desenho. As fontes oficiais também produzem pequenas diferenças de quebra em relação às substitutas Inter/Fraunces.
5. O dourado de texto claro foi ajustado de `#8B652F` para `#825D29` apenas no token da Comunidade para passar AA sobre areia e sobre o aviso. O laranja de Intermediário continua vindo do Design System.

**A versão publicada do Design System precisa ser atualizada.** A biblioteca local, o catálogo e a cópia sincronizada do portal já estão atualizados; não houve publicação remota.
