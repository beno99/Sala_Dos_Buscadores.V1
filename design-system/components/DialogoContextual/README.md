# Diálogo contextual

Diálogo de orientação com o ícone em camadas aprovado, título editorial, descrição e ações. Reutiliza o CSS compartilhado dos estados de interface.

Em frameworks, emita a estrutura HTML do exemplo e reutilize o CSS compartilhado. No portal, use `DialogoContextual` em `@/components/ds/DialogoContextual`.

O estado pertence ao consumidor: feche alterando `aberto`. O callback da ação principal decide quando fechar, navegar ou apresentar resultado. Botão de fechar, Voltar e Escape chamam `onFechar`.

Usa `dialog.showModal()`: foco contido pelo navegador, fundo inerte, Escape e retorno ao gatilho. IDs únicos associam título e descrição. A altura máxima e a rolagem interna permitem o uso no celular.

HTML: `dialog.sdb-ui-dialog` com título/descrição associados. Um gatilho `data-ui-open="id"` abre; `data-ui-close` fecha. O runtime `EstadosInterface/estados-interface.js` liga esses atributos.

É uma variante de orientação. O ModalConfirmacao existente continua responsável por confirmações destrutivas, ação segura inicial e estado de envio.
