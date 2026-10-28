# TelaAssistente · Um acervo, muitas perspectivas

Tela completa aprovada em 27/10/2026. Reúne um único Assistente do Acervo, seleção de Sala, modos de estudo e duas aparências da esfera. A composição é escura dentro de `.sdb-assistant-screen`, inclusive quando o catálogo usa um tema claro ou areia.

## Arquitetura da informação

- Navegação do portal e conversas de exemplo na lateral; navegação compacta e diálogo de conversas no celular.
- Acolhimento com esfera, título e convite para perguntar.
- Campo de pergunta como ação principal, com modo e Sala visíveis no mesmo conjunto.
- Três sugestões editáveis: entender um conceito, comparar tradições e explorar um texto.
- Após o envio, espaço principal dedicado à conversa, com contexto, fontes e ações de consulta e cópia.
- Aviso de neutralidade e identificação explícita da demonstração.

## Modos, contexto e aparência

| Controle | Opções |
| --- | --- |
| Modo de estudo | Explorar; Comparar; Leitura guiada |
| Sala | Todo o acervo; Biblioteca de Nag Hammadi; Corpus Hermeticum; O Caibalion; O Livro de Urântia; Apócrifos do Cristianismo Primitivo |
| Esfera | Dourada: ouro líquido com três anéis; Escura: grafite texturizado em WebGL, sem anéis |

A seleção de esfera não muda o modo, a Sala ou a conversa. `?orb=gold` e `?orb=dark` permitem abrir cada aparência diretamente. O exemplo mantém as escolhas somente durante a visita; a aparência também aparece na URL, sem armazenamento local ou persistência de conversas.

## Arquivos e carregamento

- `preview.html`: estrutura da tela, com um único contêiner `.sdb-assistant-screen` por documento.
- `tela-assistente.css`: estilos limitados à tela e declarações de General Sans/Gambetta usadas por ela.
- `preview.js`: interações do exemplo; carregamento como `type="module"` ao fim do documento.
- `../AssistenteOrb/gold-orb.js` e `../AssistenteOrb/dark-orb.js`: renderizadores compartilhados, expostos por `initializeGoldOrb(canvas)` e `initializeDarkOrb(canvas)`.
- `../AssistenteOrb/assistant-orb.css`: base visual compartilhada das esferas.

O exemplo requer HTTP para carregar módulos JavaScript. Sirva a raiz da biblioteca com um servidor local e abra `exemplos/TelaAssistente.html`. `scripts/build.mjs` gera o exemplo e o catálogo; não edite esses arquivos derivados.

Carregue `tokens.css`, `components/bundle.css`, `assets/themes.css` e `components/refinement.css` antes de `components/AssistenteOrb/assistant-orb.css` e `components/TelaAssistente/tela-assistente.css`. Mantenha `components/bundle.js` para ícones e controles compartilhados e `components/TelaAssistente/preview.js` como módulo. O runtime global `refined.js` continua independente desta tela.

Use um único exemplar da tela em cada documento: a composição tem IDs de campos, regiões e diálogos para seus vínculos acessíveis. O catálogo a isola em um iframe. Os estilos e atributos locais não devem alterar o tema global da página.

## Comportamento e acessibilidade

- O modo atual possui descrição associada ao seletor; Sala e pergunta têm rótulos acessíveis.
- Envio vazio fica desativado. No desktop, Enter envia e Shift+Enter quebra a linha; dispositivos de toque preservam a quebra de linha. A composição de texto não deve disparar envio.
- Sugestões preenchem a pergunta e seu contexto, permitindo editar antes de enviar.
- Durante a demonstração, a ação permite interromper. Nova conversa limpa o diálogo local.
- Diálogos de fontes e conversas permitem fechamento por Escape e devolvem o foco ao controle de origem.
- Dourada/Escura usa `aria-pressed`. A esfera também permite focar o campo da pergunta.
- Pausa e movimento reduzido mantêm a experiência sem animação contínua; ausência de WebGL conserva uma representação visual da esfera.

## Integração no portal

Esta peça é uma demonstração de interface: não consulta IA, não recupera fontes reais e não persiste mensagens. As três conversas prontas e suas referências são exemplos identificados.

Ao integrar no portal, reutilize a estrutura, os estilos e os renderizadores compartilhados, conectando modo e Sala ao fluxo real do Assistente. Use as mensagens, as fontes, os estados de consulta e o histórico reais da aplicação. Não copie o temporizador, as respostas locais ou as conversas ilustrativas como implementação de produção.

## Integração no portal

A variante `.sdb-assistant-screen--portal` reutiliza a navegação e o rodapé da moldura. O cabeçalho aprovado substitui a barra superior somente em `/assistente`, preservando busca e conta. `.session-nav` contém Nova conversa; sem persistência, identifica apenas a conversa da sessão. `.study-messages` e `.study-turn` acomodam os turnos reais, com `.answer-context` registrando modo/Sala de cada pedido. O diálogo `.study-dialog` usa `showModal()`, título acessível, foco contido, Escape e devolução ao gatilho. Controles móveis têm área mínima de 44 px.

A integração não importa `preview.js` nem `demo-data.js`. Ausência de IA deve ser informada, mantendo o rascunho e sem fabricar etapas, respostas, fontes ou histórico. O tema escuro é local à moldura desta rota; o tema salvo da conta não é modificado.
