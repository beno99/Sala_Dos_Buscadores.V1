# Cabeçalho do perfil

Abre a página de Perfil do buscador (layout do Figma "Jornada do buscador", out 2026): capa, foto, quem é e como vai o estudo.

## Anatomia
- `header.sdb-profilehead`.
- `.sdb-profilehead__cover`: capa 5:1 (mín. 140 px), `img alt=""` com `object-fit: cover` ou a placa da marca. Opcional, `.sdb-profilehead__cover-action` no canto superior direito ("Trocar capa", botão secundário pequeno com ícone `editar`).
- `.sdb-profilehead__row`:
  - `.sdb-profilehead__photo`: Avatar de 128 px sobreposto à capa, com anel na cor do fundo. Foto que a própria pessoa enviou (`sdb-avatar--foto`) ou iniciais.
  - `.sdb-profilehead__info`: `.sdb-profilehead__tags` (papel em Badge escuro, "Buscador"; e o aviso "Privado · só você vê esta página"), `h1.sdb-profilehead__name`, `p.sdb-profilehead__sub` ("Pseudônimo público: @benoni · Membro desde set 2026") e `ul.sdb-profilehead__stats` (números em `display-lower`: "3/5 Salas visitadas", "6 conteúdos lidos", "2 temas comparados", "4/7 conquistas").
  - `.sdb-profilehead__actions`: "Ajustes" (secundário) e "Editar perfil" (primário).
- Abaixo de 760 px, empilha: foto, dados, ações.

## Regras
- A página é privada: os números são só da própria pessoa, sem placar nem comparação entre pessoas.
- Sem foto, iniciais. Nunca foto de terceiros nem gerada por IA.

## Editar perfil
"Editar perfil" abre um modal em sheet com Campo de imagem para a foto (`quadrado`) e a capa, e Área de texto "Sobre a sua busca" (até 500 caracteres, com contador). Só vale ao salvar.
