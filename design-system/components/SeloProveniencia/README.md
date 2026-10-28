# Selo de proveniência

Diz de onde vem cada conteúdo. Obrigatório em cards, citações, colunas da grade comparativa e respostas do assistente.

| Variante | Classe | Forma |
| --- | --- | --- |
| Fonte primária | `--primaria` | verde suave com ícone `fontePrimaria` |
| Editorial curado | `--curado` | azul suave com ícone `curado` |
| Especialista | `--especialista` | roxo suave com ícone `especialista` |
| Comunidade | `--comunidade` | âmbar suave com ícone `comunidade` |
| Síntese por IA | `--ia` | roxo suave, ícone `ia` e contorno tracejado |
| Anfitrião | `--anfitriao` | roxo suave, contorno contínuo, ícone Phosphor `anfitriao` e complemento "Revisado pela curadoria" |

## Anfitrião
Conteúdo escrito por um anfitrião (autor externo) e aprovado pela curadoria antes de ir ao ar. Leva sempre o complemento, em `.sdb-seal__note` depois do rótulo:

```html
<span class="sdb-seal sdb-seal--anfitriao"><span class="sdb-seal__icon"><span data-icon="anfitriao"></span></span>Anfitrião<span class="sdb-seal__note">Revisado pela curadoria</span></span>
```

- Aparece em toda página, card e citação de conteúdo de anfitrião, inclusive quando o assistente cita esse conteúdo.
- Texto no par semântico roxo do tema e complemento em `label-secondary`; o contorno é contínuo para não confundir com o tracejado da IA.
- No tamanho compacto o complemento some; ponha `title="Anfitrião · revisado pela curadoria"` no selo para não perder a informação.

As variantes usam cantos de 8 px, fundo suave e ícone em base levemente tonalizada. Distinguem-se por ícone, forma e palavra, nunca só por cor. Preserve a biblioteca Phosphor e os pares `tag-*-fill/ink` compartilhados.

## Tamanho compacto
`.sdb-seal--sm` (24 px de altura, ícone de 16 px) para linhas de lista, como na Lista de conteúdos. Mesmas variantes, mesma palavra; só muda a escala. Fora de listas, use o tamanho normal.

## Comunidade · Fase A

Publicações da Comunidade não são conteúdo revisado: use a identificação textual “Publicado por um buscador” ou “Publicado por um anfitrião”. Em citação fornecida pela pessoa, `sdb-seal--comunidade` com “Fonte informada pelo autor” identifica a origem declarada, sem certificar revisão. Um CardConteudo vinculado mantém seu próprio selo editorial, restrito ao card.
