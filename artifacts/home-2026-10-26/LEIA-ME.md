# Nova home · validação de 26/10/2026

Implementação do frame `WtsqtkYXDtEKBZ3pYiBOE4 / 15:355`, conferido com contexto e screenshot pela integração oficial do Figma. O Figma não foi alterado.

## Conferência local

- Produção local: http://localhost:3001/ (servidor iniciado com `npm run start -- --port 3001`).
- Conta de demonstração: `buscador@exemplo.com`, senha `escada-de-quem-sobe`, papel membro.
- Capturas feitas no Chrome, no build de produção, com o slide institucional pausado.
- Os dados são os seeds existentes, sem alterar progresso para reproduzir o mockup: 3 de 6 Salas visitadas, retomada de “Poimandres, §24–26: a subida pelas esferas” (fonte primária, 6 min, 38%), uma sugestão disponível e nível calculado pelo avaliador existente.
- `medidas.json` registra as caixas medidas no DOM. Todos os seis tamanhos tiveram overflow horizontal de página igual a zero. Gambetta, Fraunces, Source Serif 4 e Inter carregaram; nenhuma imagem quebrada nem interativos aninhados encontrados.

| Viewport | Banner | Colunas úteis |
| --- | --- | --- |
| 1504 × 900 | 1136 × 495, x328/y104 | 800 + 24 + 312 |
| 1440 × 900 | 1088 × 495, x320/y104 | 752 + 24 + 312 |
| 1024 × 768 | 672 × 406,5 | uma coluna |
| 768 × 1024 | 720 × 414,1 | uma coluna |
| 390 × 844 | 358 × 501,8, altura automática | uma coluna |
| 360 × 800 | 328 × 501,8, altura automática | uma coluna |

## Capturas reais

- [1504: primeira dobra](desktop-1504-dobra.jpg) · [página inteira](desktop-1504-completa.jpg)
- [1440: primeira dobra](desktop-1440-dobra.jpg) · [página inteira](desktop-1440-completa.jpg)
- [1024: página inteira](tablet-1024-completa.jpg)
- [768: página inteira](tablet-768-completa.jpg)
- [390: página inteira](mobile-390-completa.jpg)
- [360: página inteira](mobile-360-completa.jpg)

O botão da retomada aparece integralmente após rolar; não cabe inteiro na primeira dobra de 900 px. A altura do card cresce para acomodar o título real. O rodapé foi preservado inteiro. As capturas de página inteira registram os elementos fixos na posição inicial da viewport; durante a rolagem, a tabbar permanece na base da tela.

## Adaptações autorizadas

- Margens simétricas com largura máxima 1136: em 1504, o início do conteúdo é x328, 8 px após o frame; em 1440, x320.
- Histórico → “Ver minha Estante” `/estante`; sugestões → “Explorar o acervo” `/biblioteca`; novidades → “Ver Biblioteca” `/biblioteca`.
- Uma sugestão real, sem clonar IDs. Carrosséis mantêm controles e teclado; filtros de tema das Salas ficam em disclosure acessível.
- Salas conservam nomes, imagens e contagens das próprias entidades. Onde falta capa, permanece a placa do DS.
- Publicidade fictícia de Edições Pórtico, com slot neutro porque não há asset próprio. Sem marca da embalagem do PNG, campanha real, tracking ou selo editorial.
- Tablet/mobile são adaptações responsivas desta implementação, não frames aprovados no Figma.

## Arquivos principais

- `portal/src/features/portal/PortalCliente.tsx`: composição e destinos.
- `portal/src/features/portal/composicao.ts`: deduplicação de fontes existentes, início honesto e percentual limitado.
- `portal/src/server/estudo.ts`: reutilização de `nivelEmFoco` e fallback de capa correspondente.
- `portal/src/components/ds/RetomadaPortal.tsx`, `ImagemAcervo.tsx`: retomada e fallback de mídia.
- Variantes existentes de CardConteudo, CardSala, EspacoPublicitario e ListaConteudos.
- `design-system/components/bundle.css`, `components/PortalInicio/README.md` e `preview.html`: fonte canônica e documentação; catálogo/exemplos e cópia do portal gerados pelos scripts.
- Moldura preservada, com escopo de estilos apenas na home, avatar real e atalho de busca correspondente à plataforma.

## Alcance da validação

Os testes de componente cobrem conta sem retomada, primeira leitura, listas vazias, ausência de anúncio, ocultação de níveis, imagem com erro, deduplicação e igualdade entre barra e percentual. Os testes E2E cobrem navegação, salvar/remover, assistente, busca, comparação, carrossel, retomada, cadastro novo, temas, movimento reduzido, perfil e conquistas. Loading conserva o esqueleto do roteador e erro conserva o boundary existente.

O zoom nativo de 200% não foi concluído: a tentativa de controle nativo do Chrome foi interrompida pelo uso do navegador. Os seis viewports e o reflow por largura foram verificados; não os apresentamos como um teste de zoom nativo.

A versão publicada do design system precisa ser atualizada; nenhuma publicação externa foi realizada.

## Checks executados e resultados

- `npm run check`: **455 testes em 71 arquivos passaram**, com ds:check, ds:test, lint e typecheck aprovados.
- `npm run build`: **passou**, incluindo TypeScript; o preview local foi reiniciado com esse build.
- `node design-system/scripts/build.mjs --check`: **em dia**.
- `node design-system/scripts/contraste.mjs`: **todos os pares verificados passam AA** nos quatro temas.
- `npm run ds:sync` e `npm run ds:check`: **sincronizado**.
- E2E final focado em `home-responsiva`, `moldura`, `portal`, `estados-interface` e `conquistas`: **36 passaram, 2 ignorados por dispositivo, nenhuma falha**. Inclui os fluxos salvar/remover com persistência, perguntas alma/morte, assistente, busca, carrossel por teclado e retomada.
- Suíte E2E completa executada: **71 passaram, 7 falharam, 6 ignorados**. Três falhas eram expectativas antigas/espera de foco dos testes afetados; foram corrigidas e passaram na rodada focada acima. As quatro restantes correspondem a dois testes antigos de curadoria (artigo e vídeo, desktop/mobile) que aguardam `combobox` “Sala” ausente na interface atual. Os formulários de curadoria não foram alterados nesta implementação. A suíte completa não é apresentada como aprovada.
- `git diff --check`: **sem erros**.

Logs preservados nesta pasta: `check.log`, `build.log`, `contraste.log`, `e2e-completo.log`, `e2e-home-final.log`.
