# Estado de seção

Container compartilhado para ausência de atividade, biblioteca vazia, busca sem resultado e falha de carregamento. Mantenha geometria, alinhamento e hierarquia; adapte ícone, título, descrição e ação ao contexto.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `EstadoSecao` em `@/components/ds/EstadosInterface`.

HTML: estrutura `.sdb-ui-empty` do exemplo; `aria-labelledby` aponta para seu título. Inclua os estilos e o runtime de `EstadosInterface`.

| Situação | Símbolo | Ação |
| --- | --- | --- |
| Nenhuma atividade | historico | Explorar salas |
| Nada salvo | pasta | Encontrar conteúdos |
| Nenhum resultado | busca | Limpar busca ou filtros |
| Falha ao carregar | alerta | Tentar novamente |

Conecte cada ação aos dados e à navegação reais da tela. Não trate erro de rede como coleção vazia, nem apresente vazio antes de concluir o carregamento. Ícones e cor complementam o texto. A variante compacta reduz a altura, mantendo o mesmo conteúdo.

O CardSala continua no desenho original. EstadoSecao é o estado do container, não substitui os cartões de salas.
