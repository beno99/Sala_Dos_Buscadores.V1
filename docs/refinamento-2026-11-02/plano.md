# Refinamento do Portal — 02/11/2026

Base: `b7a83ce`. Especificação: pasta `Downloads/PORTAL`, versão final consolidada de 02/11/2026. Branch local `refinamento/portal-2026-11-02`.

## Restrições
Preservar dados/URLs/regras não substituídas; não gravar fixtures no banco conectado, não publicar conteúdo e não fazer push. DS alterado apenas na origem e sincronizado ao final. Testes com memória/PGlite e navegador com dados controlados. Nenhum teste pendente equivale a aprovação.

## Decisões
- A especificação fornecida já autoriza as correções descritas; o trabalho segue por lotes com revisão integrada, sem exigir nova aprovação do mesmo escopo.
- Agentes em paralelo têm arquivos atribuídos; schema/store/DS compartilhado são integrados pelo coordenador. Branch local no checkout solicitado conserva configuração e dependências existentes.
- Inbox P03, agenda P16 e critérios da Jornada permanecem pendentes conforme o próprio documento; não ativar comportamentos inventados. Landing P05 fora do lote.
- P13 não autoriza excluir fontes; relatório de candidatos deve preservar todas até decisão da curadoria.
- Comentários/reações de Buscador preservam o comportamento existente até definição; novos posts limitados a Curadoria/Anfitrião. Limites existentes preservados. Vídeo: priorizar vínculo ao acervo elegível, sem inventar upload binário.
- Restauração exclusiva do curador já autorizada anteriormente permanece. Exclusão definitiva deve recusar dependências não resolvidas; não fazer cascata silenciosa.
- P02 hierarquia de curadores e P20 contatos solicitados ao responsável; nenhuma conta/URL oficial será inventada.

## Lotes
1. Acesso/ativação/listagem/login: agente auditoria_acesso.
2. Relações editoriais/multitemas/seletores: agente auditoria_editorial.
3. Assistente/navegação/diretório/progresso/textos: agente auditoria_experiencia.
4. Coordenador: imagens/cards/home/Comunidade/catálogo vídeos, lixeira/integridade e integração.
5. Revisão independente, checks, banco isolado, navegador desktop/tablet/mobile, relatório por ID.

## Matriz de acompanhamento
| ID | Solicitação | Estado |
| --- | --- | --- |
| P01 | Regras e níveis de acesso à Curadoria | Implementado e testado em casos de uso; homologação HTTP por conta pendente |
| P02 | Contas individuais de Curadoria e acesso principal do curador | Proteção de concorrência e auditoria por conta implementadas; hierarquia/promoção de curadores pendente |
| P03 | Fluxo de mensagens privadas — inbox | Pendente de definição: participantes, retenção e operações do inbox |
| P04 | Perfis funcionais: Buscador, Curadoria e Anfitrião | Matriz aplicada; interações legadas de Buscadores preservadas |
| P06 | Padronização e responsividade dos cards de artigos em Destaques | Corrigido: duração nas variantes; cartões e autoria preservados |
| P07 | Thumbnails originais do YouTube nos cards de vídeos das Salas | Corrigido: miniatura YouTube com cadeia de fallback no card da Sala |
| P08 | Rolagem interna na lista de tags e temas do cadastro de artigos | Preservado e testado: multitemas, seleção e rolagem interna |
| P09 | Rolagem interna na lista de fontes durante a criação e edição de artigos | Corrigido: lista de fontes com altura limitada e rolagem, sem perda de seleção |
| P10 | Centralizar o título principal dos artigos | Corrigido: H1 centralizado somente na coluna de leitura |
| P11 | Seleção múltipla de temas no cadastro de vídeos | Preservado e testado: multitemas de vídeos após salvar/reabrir |
| P12 | Vinculação bidirecional e múltipla entre artigos e vídeos | Implementado: relação única entre Salas pelos dois editores; CAS e transação |
| P13 | Revisar fontes cadastradas e definir remoção dos registros indevidos | Inventário realizado; nenhuma exclusão sem decisão por ID |
| P14 | Corrigir correspondência entre imagens de banner, card e capa | Corrigido: banner, card e topo independentes; sem reupload/mutação de arquivos |
| P15 | Feed na Comunidade, prévia no Portal e publicação por Curadoria e Anfitriões | Implementado: prévia do feed, criação restrita e vídeo do acervo opcional |
| P16 | Exibir agenda dos anfitriões dentro de suas Salas | Pendente de definição: modelo e origem da agenda |
| P17 | Melhorar o assistente e a gema 3D preservando tema e personalização | Corrigido e testado: tema e aparência independentes; WebGL, pausa e fallback |
| P18 | Confirmar e-mail antes de ativar cadastro de Buscador | Implementado e testado em SQL isolado: confirmação, correção, reenvio e expiração |
| P19 | Garantir navegação completa e intuitiva em telas estreitas e navegador integrado | Corrigido: foco/rolagem do Drawer; destinos compartilhados |
| P20 | Disponibilizar redes sociais e e-mail oficiais e corrigir link do YouTube | Retirado link genérico incorreto; contatos oficiais aguardam endereços confirmados |
| P21 | Corrigir destino e posicionamento dos links da seção Sobre | Corrigido: margem de âncoras e foco nas seções; navegação autenticada real pendente |
| P22 | Corrigir identificação e contagem de Salas pendentes de revisão | Inventário atual: zero itens de anfitrião em revisão; contagem/lista testadas com fixtures |
| P23 | Diferenciar conteúdos de Anfitriões dos produzidos pela Curadoria | Implementado: assinatura pública e detalhe dourado, sem trocar autoria original |
| P24 | Criar aba Anfitriões para localizar perfis e suas Salas | Implementado: diretório de Anfitriões com Salas públicas, busca e paginação |
| P25 | Lixeira para Salas e artigos de anfitriões, com exclusão definitiva pela Curadoria | Implementado: lixeira artigo → Sala, restauração e harddelete seguro pelo curador |
| P26 | Disponibilizar à Curadoria listagem de Buscadores e Anfitriões inscritos | Implementado: busca e filtros de contas por papel/situação |
| P27 | Definir destino após login conforme o perfil | Implementado e testado: destino por papel e retorno interno seguro |
| P28 | Reorganizar Portal para destacar Salas, artigos e prévia da Comunidade | Implementado: descoberta de Salas, banner íntegro e prévia de Comunidade |
| P29 | Criar aba Vídeos com catálogo organizado por Salas e artigos | Implementado e testado em navegador: catálogo /videos com filtros e relações públicas |
| P30 | Executar revisão prática de usabilidade e funcionalidades em celular, tablet e desktop | Parcial: Chrome em viewports desktop/tablet/mobile; dispositivos físicos e percurso real pendentes |
| P31 | Contagem de Salas visitadas excede o total | Corrigido: interseção de visitas únicas com universo público elegível |
| P32 | Aviso do Painel contradiz resposta do assistente | Corrigido: texto distingue consulta do assistente de grade comparativa editorial |
| P33 | Campos de busca administrativa com identificadores duplicados | Corrigido: IDs de buscas administrativas gerados por instância |
| P34 | Texto de privacidade inconsistente com a experiência de perfis | Corrigido: privacidade descreve dados e preferências reais |

## Baseline
`npm run check`: passou. Testes editoriais: 31 passaram; teste SQL falhou por dependência PGlite de /tmp ausente. Ferramentas instaladas isoladamente em /tmp/portal-refino-tools; testes SQL passaram depois, sem alterar dependências de produção. Resultados finais no relatório.
