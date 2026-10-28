# Selo de nível

Nível de aprofundamento como uma pequena escada de três degraus, sempre com a palavra.

- `<span class="sdb-level" data-level="1|2|3">` com três `<i>`. `--plain` tira a cápsula (uso em linhas de texto).
- Degraus preenchidos em `currentColor`; os demais têm opacidade reduzida. Cor, escada e palavra identificam o nível juntos.
- Iniciante: laranja suave; Intermediário: laranja intenso; Avançado: gradiente roxo com halo discreto e duas passagens de brilho em 3,6 s. O efeito termina sozinho e é desativado com `prefers-reduced-motion`.
- `--plain` mantém a cor de texto própria para o tema e remove fundo, halo e animação.

## Com progresso (`.sdb-levelup`)
- As barras usam o trilho escuro e o gradiente dourado com halo compartilhados em `bundle.css`; não alteram os dados do progresso.
- Nível do membro num assunto (Sala ou tema): `.sdb-levelup__head` (Selo + "em Corpus Hermeticum"), `.sdb-levelup__steps` (três segmentos, um por degrau, `--p` de 0 a 1, decorativos) e `.sdb-levelup__hint` com o que falta, em leituras: "Faltam 2 leituras para Avançado".
- Sem pontos e sem nível global. A regra fica explicada num Modal "Como os níveis funcionam", que diz que os níveis medem só o estudo no acervo e nada sobre crença ou espiritualidade.
- Privado: nunca aparece para outras pessoas nem em comparação entre pessoas.

## Comunidade · Fase A

A especificação da Comunidade permite o selo junto à autoria, sempre contextualizado por Sala/assunto (“Intermediário em Corpus Hermeticum”). Nunca nível global, ponto ou ranking. O restante do progresso e as conquistas continuam privados.
