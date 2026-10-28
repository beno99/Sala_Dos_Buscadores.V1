# PortalInicio · Retomar e descobrir

Composição do frame Figma `WtsqtkYXDtEKBZ3pYiBOE4 / 15:355`, 26/10/2026.
Reutiliza BannerRotativo, IndicadorNumerico, Carrossel, CardConteudo, CardSala,
ListaConteudos, SeloNivel e EspacoPublicitario. As classes em bundle.css são
limitadas a `.sdb-home` ou `[data-portal="inicio"]`; as demais páginas conservam sua composição.

- Largura útil máxima 1136 px; banner 495 px, grid editorial flexível + 312 px, gap 24.
- Ordem no DOM: banner, indicadores, retomada, sugestões, Salas, perguntas,
  novidades, caminho, publicidade, política. Rodapé pertence à moldura.
- Abaixo de 896 px úteis, uma coluna. É uma adaptação responsiva, não um frame aprovado.
- Retomada: `.sdb-retomada` > `.sdb-retomada__media`, imagem decorativa com
  placa de fallback, selo do mesmo registro e `.sdb-retomada__body`. Link na CTA;
  título nunca truncado. Percentual finito, 0–100, aplicado igualmente à barra e texto.
- Card editorial creme apenas nesta vitrine. Nível removido do DOM quando ocultado.
- Trilhos locais acessíveis por setas, toque e teclado. IDs únicos; sem preencher
  listas com duplicatas. Filtros das Salas ficam em details, operável por teclado.
- `.sdb-ad--portal`: label PUBLICIDADE, imagem, anunciante, título, descrição,
  link patrocinado e identificação de demonstração quando indicada no contrato.
  Política fica abaixo, fora do card. Sem anúncio elegível, omitir os dois.
- Todos os materiais e cores vêm dos tokens dos quatro temas. A borda utiliza
  `separator`; fontes Gambetta, Fraunces, Source Serif 4 e Inter são preservadas.
- A retomada fica abaixo da primeira dobra de 900 px. Altura automática; nunca cortar rodapé.

O preview usa dados ilustrativos explícitos. No portal, nenhum progresso ou nome é fixo.

## Salas com progresso

Os cards de Sala usam imagem ao fundo e painel de vidro escuro, inclusive no tema claro/areia. A variante de estudo troca nível/data por percentual, barra nativa dourada e contagem. Calcule concluídos / total com o valor exato; arredonde somente o percentual visível (2 de 3 → 67%). Esse progresso é da Sala e não substitui o percentual de leitura da retomada.

Carregue `CardSala/card-sala.css` com o bundle e use o runtime `refined.js` para os controles da prévia. O exemplo reúne as Salas num carrossel sem alterar o contrato de dados reais do portal.
