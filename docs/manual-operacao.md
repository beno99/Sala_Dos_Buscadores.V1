# Manual de operação editorial

A Sala dos Buscadores · revisão de 31/10/2026 · C01–C08

Este manual descreve o código atual. Exemplos abaixo são ilustrativos: não são dados inseridos nem autorização para publicar. A área **Curadoria** é restrita a administradores; anfitriões trabalham nas próprias Salas e enviam para revisão. Leitores não acessam os cadastros editoriais.

## Como trabalhar com segurança

Abra **Curadoria → Salas** e entre na Sala antes de criar artigos ou vídeos. Os endereços antigos da curadoria continuam redirecionando para o destino existente. Fontes têm catálogo próprio em **Curadoria → Fontes**.

**Salvar rascunho não é publicar.** Sala, artigo e vídeo salvam rascunhos incompletos depois do mínimo descrito abaixo. O indicador informa se salvou, está salvando ou falhou. Não saia enquanto houver alterações não salvas. Itens publicados dependem de **Salvar alterações**; não são publicados automaticamente pelo checklist. Publicar/despublicar/arquivar exige a ação e a confirmação existentes.

O painel **Para publicar** mantém a lista de pendências. “Faltam N itens obrigatórios para publicar” conta regras pendentes, não necessariamente campos individuais: identificação pode agrupar vários campos. Clique em uma pendência para ir ao controle. Os blocos mantêm identidade ao subir/descer, de modo que a pendência continua ligada à mesma imagem ou citação. Recomendações de voz e extensão não entram na contagem bloqueante.

“O que este cadastro precisa ter?” apresenta as regras do próprio formulário. Não preencha conteúdo inventado para eliminar pendências; corrija, retire um bloco opcional que não será usado ou mantenha o rascunho.

## Sala oficial

**Finalidade:** organizar o acervo por tradição ou conjunto de textos. Aparece em Salas e nos contextos de artigos, vídeos e comparação. Uma Sala publicada só fica visível no portal quando também tem artigo publicado.

| Etapa | Regras reais |
| --- | --- |
| Salvar rascunho | Nome não vazio, até 80 caracteres. Se preenchidos: descrição até 600, tradição curta até 40, inicial com uma letra e link HTTPS válido. |
| Publicar | Nome, tradição, tradição curta, descrição e inicial preenchidos; passar validações de salvamento. |
| Opcionais | Período, link, banner e imagem do card. Placa/cor tem valor inicial do formulário. |
| Automático | ID, endereço (slug), datas e responsáveis. |

**Endereço:** criado do nome no primeiro salvamento, sem digitação manual. Acentos e pontuação são normalizados; colisões recebem `-2`, `-3` etc.; nomes reservados são pulados. Se não houver letras latinas ou números para o endereço, usa `sala` com sufixo quando necessário. Renomear não altera a URL, mesmo em rascunho. A inicial de **Sala** continua sendo uma escolha desse cadastro; a automatização de inicial solicitada nesta revisão aplica-se a **artigos e fontes**.

**Exemplo ilustrativo:** nome “Leituras do Corpus Hermeticum”; tradição “Hermetismo antigo”; tradição curta “Hermetismo”; descrição “Estudos sobre os tratados, suas traduções e contextos”; inicial “H”; período “Datação a conferir na edição utilizada”. Não presume datação, autoria ou autorização de imagem.

**Imagens:** duas, opcionais, JPEG/PNG/WebP até 5 MB: o **banner** (topo da página da Sala, recomendado 2.400 × 800 px, 3:1) e a **imagem do card** (card vertical, recomendado 1.200 × 1.800 px, 2:3). Sem imagem do card, o card usa o banner, inteiro. As dimensões de cada uso estão em [Imagens: dimensões e exibição](#imagens-dimensoes-e-exibicao). Só envie material cujo uso seja autorizado. Campos de descrição/crédito do corpo do artigo não são campos da capa da Sala; registre origem e autorização no processo editorial aplicável, sem inventar metadados.

**Resolver pendências:** Nome → informe o nome canônico; Tradição → indique o contexto em uma linha; Tradição curta → versão curta para a comparação; Descrição → apresente o recorte; Inicial → uma letra da capa. O endereço não gera tarefa manual.

**Operar:** salve, confira identificação e imagem, publique pelo painel. A Sala vazia publicada ainda não aparece ao leitor: publique um artigo autorizado nela. Para corrigir Sala oficial publicada, use Salvar alterações. Arquivar retira a Sala e seus conteúdos da visualização sem apagá-los; restaurar devolve o estado anterior. Não renomeie slugs para corrigir título.

### Sala de anfitrião

O rascunho exige nome (até 80); descrição até 600 e link HTTPS são validados se presentes. Para enviar à revisão: nome e descrição; no primeiro envio, ao menos um artigo elegível junto e declaração de direitos. A conta precisa de perfil de anfitrião válido. Período, banner e imagem do card são opcionais (mesmas dimensões da Sala oficial). Tradição, placa e inicial são calculados a partir do nome/perfil; endereço é automático e estável.

A curadoria aprova ou devolve com motivo, sem escrever pelo anfitrião. Sala em revisão/congelada não pode ser editada. Editar uma Sala de anfitrião publicada pode retirá-la e aos seus artigos do ar até nova aprovação, conforme o aviso de confirmação. Retirar do ar arquiva; excluir só quando permitido pelo ciclo existente.

## Artigo da curadoria

**Finalidade:** leitura publicada em `/salas/{sala}/{slug}`, cards, busca e comparação. Criado dentro de Sala oficial ativa. Não pode ser movido arbitrariamente por payload: a mudança de Sala usa a ação própria.

| Etapa | Regras reais |
| --- | --- |
| Salvar rascunho | Sala oficial existente e não arquivada; título; slug de artigo válido/único se informado antes da primeira publicação; coerência entre uso de IA e proveniência; imagens do corpo autorizadas para a conta ou já pertencentes ao registro. |
| Publicar | Sala, título, resumo, ao menos um tema e nível; proveniência; autoria ou indicação explícita de autoria não identificada; parágrafo de abertura; blocos completos; ao menos uma fonte (exceção abaixo); situação jurídica; nota de divergência com pelo menos 20 caracteres quando marcada. |
| Opcionais/condicionais | Período, imagens de card/topo/corpo, destaques, listas, citação em artigo comum, nota de divergência quando não marcada. Tempo de leitura é metadado do formulário, com padrão mínimo existente. |
| Automático | Inicial de capa a partir do título, identificadores e datas. Não há coluna nova de inicial do artigo: a regra lê o título ao renderizar. |

**Inicial:** primeiro caractere alfanumérico Unicode, ignorando espaços e pontuação inicial, em maiúscula. “O princípio do ritmo…” produz “O”; “«Ética»” produz “É”. Não se removem “O”, “A”, “Um” ou “The”. Sem caractere utilizável, a prévia usa ícone neutro. Imagens continuam tendo precedência sobre a inicial. O slug do **artigo** conserva o fluxo existente: gerado do título quando vazio, editável antes da primeira publicação, travado depois; a proibição de edição C01 é do slug da **Sala**.

**Estrutura mínima:** um parágrafo de abertura que apresente o assunto, antes do primeiro subtítulo. Pode seguir com parágrafos, intertítulos, listas, destaques e imagens. Os parágrafos são justificados com última linha natural à esquerda; a prévia usa o mesmo renderizador da página. Não insira quebras manuais para ajustar margem. Quebras de destaques/citações são conservadas.

**Exemplo ilustrativo:** título “O vocabulário do Poimandres”; abertura “Esta leitura examina o vocabulário da passagem indicada e distingue tradução e comentário”; subtítulo “A edição utilizada”; desenvolvimento e fontes preenchidos pelo responsável com a edição realmente consultada. Essa frase é só exemplo de estrutura, não estudo publicado automaticamente.

**Direitos do texto:** domínio público; trecho permitido com referência; licença identificada; ou cessão com registro. “Trecho permitido” acima de 1.500 caracteres reproduzidos gera recomendação para rever o recorte, não licença automática. Auxílio de IA exige a proveniência “Síntese por IA”. Autoria não identificada deve ser marcada pelo responsável, nunca presumida.

### Imagens no corpo: C04

A coluna de leitura tem largura máxima de **46rem, equivalente a 736 px com fonte-base de 16 px**. A recomendação para densidade 2× é **1.472 px de largura**, derivada do token `article-reading-width`. Isso é recomendação de nitidez, não dimensão obrigatória de tela ou upload. A altura acompanha a proporção original; horizontal, vertical e quadrada são aceitas integralmente, sem corte ou deformação. Não existe proporção obrigatória para o corpo.

Formatos: **JPEG, PNG e WebP**, até **5 MB por arquivo**. O servidor verifica tamanho e assinatura real do arquivo. Antes de escolher, veja as orientações; depois do envio, veja dimensões detectadas, tamanho e prévia. Largura menor que a recomendada gera aviso, sem impedir salvamento. Em arquivo já existente, se o tamanho não foi enviado ao formulário, a interface informa essa ausência; as dimensões são detectadas pelo navegador.

Os bytes enviados são preservados, sem redução/substituição silenciosa do original. Para reduzir arquivo acima do limite, produza uma cópia local menor mantendo proporção e guarde seu original. Não basta trocar a extensão. A prévia permanece disponível para substituir/remover antes de salvar o artigo; o upload por si só não publica.

Cada imagem de corpo exige **descrição para quem não pode vê-la** e **origem/autorização** para publicação. Descreva o conteúdo relevante; no crédito, informe autor quando conhecido, obra, data quando conhecida e licença/domínio público/autorização real. Se própria, declare autoria própria e autorização; se licenciada, identifique a licença; se domínio público, registre a origem e o fundamento disponível. Atribuição incerta deve continuar incerta. Legenda é opcional. Não invente crédito nem licença.

Imagens opcionais de **card** (recomendado 1.600 × 1.000 px, 16:10) e de **topo** (recomendado 2.400 × 800 px, 3:1) também aparecem inteiras desde a revisão de imagens de 31/10/2026; ver [Imagens: dimensões e exibição](#imagens-dimensoes-e-exibicao). Nenhuma dessas medidas é validação técnica: só formato e limite bloqueiam.

### Pendências e operação

- **Adicione um parágrafo de abertura:** insira Parágrafo antes do primeiro subtítulo, destaque ou imagem e apresente o assunto.
- **Frase/origem do destaque:** complete a frase e atribuição; não use destaque vazio para espaçar a página.
- **Imagem/descrição/origem:** envie arquivo autorizado, descreva e registre a permissão; ou remova o bloco não utilizado.
- **Identificação/classificação:** use o link do painel para o primeiro campo faltante; prossiga até terminar.
- **Fonte/proveniência/direitos:** informe a origem real do material e as condições de uso.
- **Divergência:** apresente as leituras sem determinar qual crença é verdadeira.

Use a prévia “como buscador” para conferir texto, imagens, fontes e vídeos. Salve o rascunho, revise e só então acione Publicar e confirme. Para conteúdo publicado, Salvar alterações exige checklist completo. Despublicar retorna a rascunho; arquivar retira do portal sem exclusão; restaurar segue o estado indicado pela confirmação. URLs publicadas permanecem estáveis. Administrador não usa o editor de artigo de outro anfitrião para substituir seu texto.

### Fonte primária e citação

É um tipo de artigo com requisito próprio: **citação completa obrigatória**. Preencha obra, localização (capítulo/dito/verso), tradução e referência. Se houver texto original, preencha idioma e código de idioma. O original e o rótulo de tradução são opcionais. Uma fonte primária com citação completa dispensa o vínculo adicional a fonte bibliográfica; as demais regras editoriais continuam valendo. Citações no artigo comum também precisam estar completas quando ativadas. Não publique tradução protegida sem situação jurídica adequada.

### Artigo de anfitrião

Rascunho exige título até 120 e Sala própria editável; se preenchido, link válido (YouTube ou site HTTPS). Para enviar: título, texto com abertura, pelo menos um tema e fonte, blocos completos e declaração de direitos. Resumo e duração são calculados do texto; nível é opcional com padrão Iniciante. Imagens e link são opcionais. A curadoria revisa antes de publicar. Edição de item aprovado segue confirmação de retirada/revisão. Fontes podem ser escolhidas do catálogo ou propostas com título, responsável, tipo e referência; propostas pendentes não aparecem no catálogo público.

## Fonte bibliográfica

**Finalidade:** registrar a obra consultada, reutilizável em diferentes artigos, apresentada em card e lista de referências. O cadastro administrativo não tem rascunho/publicação separados.

**Obrigatórios para salvar:** título, autor/editor/tradutor (com papel), tradição, tipo e referência. Tipos: Fonte primária, Tradução comentada, Estudo acadêmico e Edição crítica. **Opcionais:** link completo HTTP/HTTPS e escolha de cor da capa. **Automático:** inicial do título da própria fonte, nunca do artigo ao qual é vinculada.

A capa é tipográfica, sem upload de imagem de editora. Exemplo ilustrativo: título “The Kybalion’s New Clothes…” → inicial “T”; tradição “Hermetismo moderno e Novo Pensamento”; autor e referência devem ser os dados verificados da publicação consultada, não os deste exemplo. A classificação longa quebra dentro do card sem abreviar.

Preencha os campos, veja a prévia e clique Cadastrar fonte/Salvar fonte. A mesma tela de campos é usada no modal do artigo. Vincular a outro artigo não altera a inicial. Fontes antigas são exibidas pela nova regra sem regravação em massa; ao salvar, o servidor ignora inicial manual antiga/manipulada.

**Corrigir pendências:** título → obra; autor → responsável e papel; tradição → contexto; tipo → classificação; referência → edição/ano ou documento; link inválido → corrigir ou remover o opcional. Não há botão Publicar: a fonte aparece com o artigo publicado que a utiliza. “Onde é usada” ajuda a conferir impacto. Fonte citada por publicado não pode ser excluída; revise os vínculos primeiro. Não há comando de despublicação independente de fonte.

## Vídeo do YouTube

**Finalidade:** vídeo da Sala e “Vídeos relacionados” nos artigos escolhidos. Crie dentro da Sala oficial ativa.

| Etapa | Regras reais |
| --- | --- |
| Salvar rascunho | Sala e título. Link/duração podem estar vazios; quando preenchidos, são validados. Vínculos precisam ser elegíveis ou já existentes preservados. |
| Publicar | Sala, título, tema, nível, URL YouTube válida e duração `mm:ss` (minutos 1–3 dígitos, segundos 00–59, diferente de 00:00). |
| Opcionais | Artigos vinculados, episódio, data informada e cor da placa. |
| Automático | ID YouTube e URL canônica a partir do link, thumbnail por resolução disponível. |

**Links aceitos:** `https://www.youtube.com/watch?v={ID}`, `https://youtu.be/{ID}`, `https://www.youtube.com/shorts/{ID}`, `https://www.youtube.com/embed/{ID}` e `https://www.youtube-nocookie.com/embed/{ID}`. O ID tem 11 caracteres válidos. Não são aceitos domínios parecidos, credenciais na URL, portas ou URLs arbitrárias. O título conhecido é o preenchido pelo responsável; não se inventam metadados.

**Thumbnail:** carregada no navegador de endereços fixos `i.ytimg.com`, primeiro `maxresdefault`, depois `hqdefault`, depois `mqdefault`. Falha, timeout e placeholder de resolução ausente acionam alternativa. Sem nenhuma imagem válida, mostra “Miniatura indisponível” e Tentar novamente na prévia. A imagem é inteira, com fundo quando necessário; sem upload ou chave de API adicional. Ao trocar URL, a tentativa antiga é cancelada/ignorada. Uma thumbnail disponível **não comprova permissão de incorporação**: confira o player/link autorizado, especialmente vídeos privados/removidos. Falha não apaga o formulário.

**Artigos recentes:** lista inicial ordenada por **criação**, mais novo primeiro, com desempate por ID. Mostra Sala, status e data. O contexto é a Sala do vídeo: conteúdos de outra Sala, de anfitrião ou arquivados não entram como novas opções. O tema não é usado para proibir associação. A busca consulta todo o conjunto elegível, inclusive fora da primeira página; Carregar mais amplia dez por vez. Marque o checkbox e confira o contador. Se o artigo foi salvo em outra aba, use Atualizar artigos; as escolhas permanecem ao buscar, paginar e atualizar.

Seleções antigas indisponíveis são identificadas e podem ser desmarcadas. Remover uma seleção retira somente a associação, nunca o artigo ou o vídeo. O servidor evita IDs duplicados e rejeita novas ligações inválidas. Vídeo publicado e artigo publicado na Sala visível são requisitos para a exibição pública; a prévia de curadoria pode incluir rascunhos autorizados e não se torna pública.

**Exemplo ilustrativo de fluxo:** preencha um vídeo autorizado, informe título e duração reais, selecione tema/nível, escolha o artigo recém-criado da mesma Sala, salve, reabra e confira o checkbox. Publique apenas quando houver autorização e checklist completo. Abra a prévia administrativa para conferir a relação; para leitores, confira “Vídeos relacionados” quando ambos estiverem publicados. Para desassociar, desmarque e salve. Despublicar/arquivar retira o vídeo da visualização pública sem apagar os artigos.

## Outros cadastros e decisões editoriais

**Temas:** criados no seletor editorial com nome; slug e normalização são automáticos. Não têm corpo, imagem ou ciclo de publicação independente. Use tema real e evite sinônimos duplicados; os temas conectam busca e artigos.

**Destaques:** escolha itens publicados nas vagas existentes; não duplica/publica artigos ou vídeos. Vaga vazia ou item retirado do ar usa seleção automática existente. Não confunda escolher destaque com publicar um rascunho.

**Perfil de anfitrião:** nome, pseudônimo/slug de perfil e dados conforme o formulário próprio; não faz parte da mudança de slug de Sala. Atualizações de perfil/permissões não foram redesenhadas nesta revisão.

**Comunidade:** possui regras próprias em `/comunidade/regras`; publicações de buscador não recebem selo editorial. Esta revisão não altera seus tipos, limites, moderação ou autoria.

## Imagens: dimensões e exibição

Revisão de 31/10/2026. Todo campo de imagem mostra, **antes de escolher o arquivo**, a largura × altura recomendadas em pixels, a proporção, os formatos, o limite e como a imagem vai aparecer. Os números abaixo vêm da mesma configuração usada pelo formulário (`portal/src/features/midia/finalidades.ts`); se mudarem lá, atualize esta tabela.

| Campo | Uso | Recomendado (largura × altura) | Proporção | Formatos | Limite | Exibição | Também aparece em |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sala › Banner da Sala | topo da página da Sala | 2.400 × 800 px | 3:1, altura acompanha o arquivo | JPEG, PNG, WebP | 5 MB | inteira, na largura da página | card da Sala sem imagem do card; card de artigo da Sala sem imagem própria |
| Sala › Imagem do card | card vertical da Sala | 1.200 × 1.800 px | 2:3 | JPEG, PNG, WebP | 5 MB | inteira dentro do card; sobra fundo | Portal, Salas, Biblioteca, Estante, Perfil |
| Artigo › Imagem do card | cards do artigo | 1.600 × 1.000 px | 16:10 | JPEG, PNG, WebP | 5 MB | inteira dentro do card; sobra fundo | topo do artigo sem imagem de topo; retomada do Portal |
| Artigo › Imagem de topo | topo da página do artigo | 2.400 × 800 px | 3:1, altura acompanha o arquivo | JPEG, PNG, WebP | 5 MB | inteira, na largura da página | — |
| Artigo › Imagem (bloco do corpo) | corpo do artigo | 1.472 × 981 px | 3:2, altura acompanha o arquivo | JPEG, PNG, WebP | 5 MB | inteira, na coluna de texto (até 736 px) | — |
| Perfil › Foto / Anfitrião › Avatar | avatar | 512 × 512 px | 1:1 | JPEG, PNG, WebP | 5 MB | círculo | lateral, Perfil, Comunidade |
| Perfil › Capa | topo do Perfil | 2.400 × 480 px | 5:1 | JPEG, PNG, WebP | 5 MB | inteira; sobra fundo | — |
| Comunidade › Imagem | publicação | 1.440 × 1.080 px | 4:3, altura acompanha o arquivo | JPEG, PNG, WebP | 5 MB | inteira, na largura da publicação | — |

Fontes bibliográficas usam capa tipográfica e vídeos usam a miniatura do YouTube: não há upload de imagem nesses cadastros.

**Como as medidas foram definidas:** pela largura real de cada lugar em telas de 390, 768, 1280, 1440 e 1920 px, dobrada para telas de alta densidade (2×). Exemplo: o banner da Sala ocupa até 1.088 px em 1440 e 1.568 px em 1920; 2.400 px cobre os dois com nitidez.

**Proporção e resolução:** a proporção é a forma (3:1 é três vezes mais larga que alta); a resolução é a quantidade de pixels. Uma imagem de outra proporção **nunca é cortada nem esticada**: onde a altura acompanha o arquivo, ela só fica mais alta ou mais baixa; nas molduras fixas (cards, capa do perfil) sobra fundo em cima e embaixo ou nas laterais. Para não sobrar fundo, envie na proporção recomendada.

**Depois de escolher:** o campo mostra a prévia com a mesma regra da página, as dimensões reais (largura × altura), a proporção e o tamanho. Avisos não bloqueiam: “Esta imagem pode perder nitidez nesta área…” quando a largura é menor que a recomendada; “A imagem tem outra proporção e será exibida inteira…” quando a forma difere. Bloqueiam só formato não aceito (“Use um arquivo nos formatos JPEG, PNG ou WebP.”), arquivo inválido e o limite (“O arquivo ultrapassa 5 MB…”). Em erro, o formulário e a imagem anterior ficam como estavam.

**Nitidez:** ampliar artificialmente um arquivo pequeno (aumentar os pixels num editor) não recupera detalhes; procure um original maior.

**Imagens já publicadas:** nenhum arquivo foi recortado, regravado ou substituído. O portal guarda o original enviado, e a correção foi só de exibição: as imagens antigas passaram a aparecer inteiras sem novo envio. Para Salas que hoje usam o banner horizontal no card vertical, enviar uma imagem do card (2:3) evita as faixas de fundo.

## Implantação e reversão

Esta revisão não exige migração de schema, regravação em massa nem nova variável de ambiente. A coluna única `salas.slug` existente arbitra a reserva concorrente; a aplicação usa transação com `ON CONFLICT DO NOTHING` e tenta o próximo sufixo.

Blocos recebem `id` opcional no JSON ao serem editados/salvos; strings legadas continuam legíveis. Fontes já existentes conservam dados no banco até edição; a inicial visual é derivada do título. Arquivos de imagem existentes não são substituídos nem recortados.

Antes de implantar, use o backup/snapshot PostgreSQL e a política de backup Storage do ambiente. Versione código e artefatos DS juntos. Reversão: restaure a versão anterior do código e DS, sem apagar registros nem restaurar banco sobre gravações novas. Os IDs opcionais são compatíveis com os leitores anteriores; slugs já criados permanecem válidos. Reverter também reintroduz as regras antigas de edição de slug/inicial e recorte: registre o risco operacional. Não execute seed ou migração para reproduzir exemplos deste manual.
