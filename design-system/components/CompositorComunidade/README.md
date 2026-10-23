# Compositor da comunidade

## Anatomia

`form.sdb-composer`. `.sdb-composer__types` é um fieldset com legenda e radios nativos; `.sdb-composer__fields` contém AreaTexto, campos específicos, Sala, até três temas, CampoImagem e AvisoNeutralidade. `.sdb-composer__foot` reúne regras e Publicar.

## Uso e estados

Quatro tipos: Reflexão (aviso de atribuição), Citação com fonte (trecho, obra, passagem obrigatórios), Pergunta (Sala obrigatória, anfitrião opcional), Achado do acervo (conteúdo obrigatório). Campos de tipos inativos ficam hidden e disabled, para não validar informação irrelevante. Texto até 1.500 caracteres. O lançador `.sdb-composer--launcher` dá lugar à `.sdb-composer__bar.sdb-float` em celular. Dentro da moldura use `.sdb-community--in-app` para reservar a barra de abas; o painel `.sdb-community-dialog--composer` ocupa 100dvh. A Fase C conecta upload, seleção real do acervo e publicação.

## Temas, acessibilidade e contrato

Cores: `material-regular`, `material-thick`, `fill`, `label`, `label-secondary`, `accent`, `accent-soft`, `focus-ring` e tokens dos componentes compostos. Nenhuma cor própria. Geometria em `tokens.json › community`; espaços em `space-*`, cantos em `radius-*`, sombras em `shadow-card`. Compatível com Sólido claro (areia), Sólido escuro, Vidro claro e Vidro escuro.

Use elementos nativos, rótulos explícitos, foco visível e alvos de 44 px. Controles não dependem de hover. Estados de carregamento, vazio e erro pertencem ao container e usam CarregamentoSala/EstadoSecao. Esconder ação não confere permissão: sessão, papel e posse são verificados no servidor nas fases seguintes.

[Exemplo gerado](../../exemplos/CompositorComunidade.html). Fonte: `preview.html`; comportamento de demonstração: `../Comunidade/demo.js`. Gere com `node design-system/scripts/build.mjs`. React em `portal/src/components/ds/` emite as mesmas classes, com dados e callbacks do consumidor; não importa o JavaScript de demonstração.
