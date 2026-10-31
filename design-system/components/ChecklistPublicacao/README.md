# Checklist de publicação

O que falta para um item ir ao ar. Enquanto houver pendência, o botão Publicar fica desabilitado.

- `section.sdb-checklist` (material) > cabeçalho com título e contagem (`.sdb-checklist__count`, "5 de 8"), trilho de progresso `.sdb-checklist__rail` com `--p` de 0 a 1 e a lista `.sdb-checklist__list`.
- Cada item é um link `a.sdb-checklist__item` para o campo correspondente, com `data-state`:
  - `ok`: disco `accent-fill` com check;
  - `pendente`: círculo vazado em `critical`, texto normal e a palavra "Pendente" para leitores de tela;
  - `alerta`: disco de ouro com glifo preto (`aviso`). Não bloqueia; serve para a revisão de voz.
- Explicação curta em `<small>` com o critério ("Toda afirmação precisa de origem rastreável").
- O estado nunca é só cor: forma do marcador e palavra.

## Revisão editorial 31/10/2026

O resumo com `role="status"` informa “Faltam N itens obrigatórios para publicar”; recomendações são separadas e não entram na contagem. Salvar rascunho não publica. Os textos orientam a ação (“Adicione um parágrafo de abertura”, “Descreva a imagem para quem não pode vê-la”). Pendências do corpo apontam para identidade estável do bloco, conservada ao mover e salvar, e não somente para sua posição. Os campos são focados por `aoIrParaCampo`.
