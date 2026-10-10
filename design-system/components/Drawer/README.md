# Drawer

Painel para filtros, detalhes de fonte ou navegação secundária, sem sair da página.

- `.sdb-overlay.sdb-overlay--drawer#id` > `aside.sdb-drawer` com `.sdb-grabber`, `__head`, `__body`, `__foot`. Mesmos gatilhos do Modal.
- Desktop: flutua à direita, 12 px das bordas, raio `radius-xl`. Abaixo de 600 px: sheet inferior com alça, até 86% da altura.
- `.sdb-drawer--wide` (até 560 px) para conteúdo que precisa de largura de leitura, como o assistente aberto pelo Botão flutuante. No cabeçalho, ações extras ("Abrir em tela cheia") ficam antes do fechar.
- Entra com mola em 560 ms pelo lado de onde vem; sai pelo mesmo lado em 300 ms. Com movimento reduzido, só esmaece.
