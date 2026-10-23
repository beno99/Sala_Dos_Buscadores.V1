# Selo de proveniência

Diz de onde vem cada conteúdo. Obrigatório em cards, citações, colunas da grade comparativa e respostas do assistente.

| Variante | Classe | Forma |
| --- | --- | --- |
| Fonte primária | `--primaria` | cápsula bordô, ícone em ouro. O único selo preenchido com cor de profundidade. |
| Editorial curado | `--curado` | `accent-soft`, disco `accent-fill` |
| Especialista | `--especialista` | `fill`, emblema de ouro com glifo preto |
| Comunidade | `--comunidade` | `fill`, texto secundário |
| Síntese por IA | `--ia` | contorno tracejado, sem fundo: o mesmo tracejado marca todo texto escrito pela IA |
| Anfitrião | `--anfitriao` | contorno contínuo em `accent`, sem fundo, disco `accent-fill` com o ícone `anfitriao` (o arco com uma pessoa à porta) e o complemento "Revisado pela curadoria" |

## Anfitrião
Conteúdo escrito por um anfitrião (autor externo) e aprovado pela curadoria antes de ir ao ar. Leva sempre o complemento, em `.sdb-seal__note` depois do rótulo:

```html
<span class="sdb-seal sdb-seal--anfitriao"><span class="sdb-seal__icon"><span data-icon="anfitriao"></span></span>Anfitrião<span class="sdb-seal__note">Revisado pela curadoria</span></span>
```

- Aparece em toda página, card e citação de conteúdo de anfitrião, inclusive quando o assistente cita esse conteúdo.
- Texto em `accent` (bordô sobre bege no claro, bege sobre grafite no escuro) e complemento em `label-secondary`; o contorno é contínuo para não confundir com o tracejado da IA.
- No tamanho compacto o complemento some; ponha `title="Anfitrião · revisado pela curadoria"` no selo para não perder a informação.

As variantes se distinguem por ícone, forma e palavra, nunca só por cor.

## Tamanho compacto
`.sdb-seal--sm` (24 px de altura, ícone de 16 px) para linhas de lista, como na Lista de conteúdos. Mesmas variantes, mesma palavra; só muda a escala. Fora de listas, use o tamanho normal.

## Comunidade · Fase A

Publicações da Comunidade não são conteúdo revisado: use a identificação textual “Publicado por um buscador” ou “Publicado por um anfitrião”. Em citação fornecida pela pessoa, `sdb-seal--comunidade` com “Fonte informada pelo autor” identifica a origem declarada, sem certificar revisão. Um CardConteudo vinculado mantém seu próprio selo editorial, restrito ao card.
