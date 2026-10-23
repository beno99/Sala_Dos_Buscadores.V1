# Perfil público

Composição da página pública de anfitrião, baseada no frame `19537:23004` de Jornada do buscador. Usa Cabeçalho do perfil, Avatar, Badge, Compartilhar, Selo de proveniência, Chip de tema e Card Sala. Carregue `perfil-publico.css` depois do bundle.

## Anatomia

- `.sdb-publicprofile`: coluna de seções, com espaçamento de 48 px.
- `header.sdb-profilehead`: capa da marca 4:1, avatar enviado pelo anfitrião (ou iniciais) sobreposto, papel, nome público, credencial, contagens públicas e compartilhar.
- `.sdb-publicprofile__section`: título com filete e conteúdo.
- `.sdb-publicprofile__about`: apresentação em coluna larga e detalhes em coluna estreita, sobre `material-regular`.
- `.sdb-publicprofile__details`: temas presentes nas Salas publicadas, link cadastrado e data de atualização do perfil.
- Seção Salas: chips com contagem real filtram os cards. Sem publicações, use Estado de seção com acesso ao acervo.

A composição empilha a foto, a identificação e as ações quando o container fica abaixo de 760 px; o painel Sobre passa a uma coluna.

## Dados públicos

O perfil público contém somente o que o anfitrião cadastrou para publicação e dados do seu acervo publicado. Não mostra interesses pessoais, atividade de estudo, conquistas, Estante nem data de cadastro da conta. A capa da marca é decorativa, pois o perfil de anfitrião não possui campo próprio de capa. A agenda do frame só poderá aparecer quando houver eventos cadastrados; não simule eventos ou links.

## Publicações da Comunidade

A aba Publicações reaproveita Tabs e CardPublicacao. O perfil público de um buscador usa a mesma anatomia do cabeçalho, com pseudônimo, avatar e número de publicações visíveis. Nunca reutilize a descrição, a capa ou os números de estudo do perfil privado. Para anfitriões, preserve Sobre e Salas em sua aba e mantenha a origem comunitária de cada publicação explícita.
