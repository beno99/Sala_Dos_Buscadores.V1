# Área de texto

Várias linhas para notas, contribuições e justificativas.

- `.sdb-control.sdb-control--area` > `textarea`; texto em `reading` 17 px porque é conteúdo.
- Contador: `<span class="sdb-counter" data-count-for="id">`, atualizado sozinho a partir do `maxlength`.
- Estados iguais aos do Campo de texto. Redimensiona só na vertical.

## Com marcações de trecho

`--fmt` inclui a [Barra de formatação](../BarraFormatacao/README.md) dentro do campo, ajuda e contador em `.sdb-field__foot` e prévia segura. Para um campo cujo contrato é um único parágrafo (descrição de Sala e apresentação do anfitrião), use `data-fmt-inline`; no portal, `AreaTexto formatacao`. As propriedades estruturais ficam desabilitadas com explicação. Para conteúdo em blocos, use o Editor de texto marcado.
