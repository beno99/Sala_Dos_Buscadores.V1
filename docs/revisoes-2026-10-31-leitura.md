# Revisão C03, C04 e C07 — 31/10/2026

## Alterações

- C03: parágrafos e abertura de CorpoArtigo, strings legadas e blocos, recebem justificação, última linha à esquerda, idioma pt-BR e hifenização automática. Não altera conteúdo persistido. Títulos, listas, metadados e destaques não são justificados; quebras de citação/destaque permanecem com `pre-line`. Diretrizes/guia DS registram a exceção autorizada.
- C04: imagem do corpo e sua prévia mantêm largura da coluna e proporção natural, sem `cover` ou altura máxima. CampoImagem recebe variante `corpoArtigo`; orientações precedem o upload. Recomendação deriva de 46rem × 16px × 2 = 1472px, altura livre. Formatos JPEG/PNG/WebP e máximo5MB coincidem com validação existente no servidor. Depois do envio mostra dimensões naturais/tamanho e aviso não bloqueante para largura abaixo da recomendada. Imagens existentes sem metadado de tamanho informam essa ausência. Upload preserva os bytes originais, retirando conversão/redução silenciosa; derivados futuros devem manter o original.
- C07: CardFonte usa coluna `minmax(0, 1fr)` e tags permitem quebra integral. Título, autor e referência/URLs continuam com quebra de palavra longa. Sem truncamento nem reticências. Exemplo DS inclui “Hermetismo moderno e Novo Pensamento”.

## Verificação isolada, sem banco ou conta real

Chrome headless via Playwright; fixtures locais, upload interceptado e nenhuma escrita remota.

1. `/tmp/test-sdb-leitura.cjs`: matriz390/768/1280/1440, normal e reflow equivalente a200% (viewport CSS dividido por2; não confundir com zoom nativo do Chrome). Antes, tag excedia o card; depois, todas8combinações sem overflow, tag integral, parágrafo justificado/última linha esquerda e proporção720×1080 mantida. Capturas e `leitura-matriz.json` em `docs/evidencias-2026-10-31/`.
2. `/tmp/test-sdb-upload.cjs`: runtime DS com PNG local720×1080, dimensões e29KB exibidos, aviso de baixa resolução, rejeição acima5MB, remoção limpa aviso. Proporção2:3 preservada. `upload-corpo-390.png` e `upload-resultados.json`.
3. `/tmp/test-sdb-react-upload.cjs`: CampoImagem React real empacotado por esbuild; fetch mock recebe arquivo `original.png`, MIMEPNG, mesmos736274bytes e último byte do original. A fixture é maior que600KB para cobrir a antiga conversão. Ajuda aparece antes da área de envio, imagem carrega720×1080 e aviso visível. `upload-react-resultados.json`.
4. `/tmp/test-sdb-curadoria.cjs`: CamposFonte/EditorBlocos/ToastProvider/ChecklistPublicacao reais. Versão antes carregada por `git show HEAD` em plugin esbuild; versão depois usa arquivos correntes. Inicial antigaX editável não acompanhava título; nova inicialO somente leitura muda paraH após Hermetica. Reordenação de destaque preserva ID e foco; os4links de erro focam imagem/alt/crédito/atribuição corretos. Capturas fonte/editor antes/depois em1280 e390 e `curadoria-react-resultados.json`.
5. Matriz React CardFonte: sem overflow em todas8combinações. A extensão C06 autorizada corrigiu também overflow do editor: contador sem quebra, menus fechados e pseudo-elementos de tooltip invisíveis. CSS restrito ao editor; menus/tooltip abertos ficam contidos nas respectivas barras. A matriz final não apresenta overflow documental em nenhuma das8combinações, também com menu Adicionar aberto e tooltip em hover. Ao mover imagem, foco permanece no botão de mover (estável); ao mover destaque vai ao textarea.

Capturas foram abertas e conferidas. São ensaios de componentes reais/DS, não capturas da sessão autenticada nem comprovação de publicação.

Biome dos arquivos CorpoArtigo/CampoImagem passou sem erros (informativo de onLoad em img). TypeScript no ponto da execução não apresentou erro nesses arquivos; falhou em rotas geradas desatualizadas, ícone livro ainda sem sync e MiniaturaVideo/variant em trabalho concorrente. Integrador executará build do DS, sync e `npm run check` depois da união. Não foram gerados derivados nem commits neste subtrabalho.

A biblioteca publicada precisa receber a nova versão após validação integrada.

Extensão C06: apenas `bundle.css` e guia EditorTextoMarcado alterados nesta etapa; nenhuma mudança adicional nos componentes React. Menus com Escape mantêm retorno ao gatilho. Scripts executáveis de reprodução ficam em `/tmp/test-sdb-curadoria.cjs`, `/tmp/test-sdb-react-upload.cjs`, `/tmp/test-sdb-upload.cjs` e `/tmp/test-sdb-leitura.cjs` nesta sessão.

## Fechamento integrado

Consulte o [relatório final](revisoes-2026-10-31.md) para checks, capturas e limitações consolidados. O build/sync do DS, contraste, check e build do portal passaram após integração. Os harnesses de navegador foram preservados em `portal/tests/*.browser.cjs`, sem caminhos pessoais fixos; comparações históricas usam `78355fb`.
