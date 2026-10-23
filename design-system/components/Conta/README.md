# Conta

Composição de Entrar, Redefinir senha e Criar conta, conforme a seção Conta e onboarding do Figma (19537:4958).

- `.sdb-conta--entrada`: imagem lateral e coluna de marca/formulário. No celular, a imagem vira uma faixa acima do formulário.
- `.sdb-conta--cadastro`: imagem ao fundo e painel de 480 px. A página cresce com o conteúdo, inclusive mensagens de erro e cadastro por convite.
- `.sdb-conta__form`, `__cabecalho`, `__titulo`, `__lead`, `__alternativa`: ritmo e hierarquia dos formulários. Campos, botões, consentimento e alertas usam os componentes existentes.
- Superfícies `nav-fill` e `card-warm`, títulos `label-brand`, texto `label`/`label-secondary`. Os quatro temas continuam disponíveis.
- Carregue `conta.css` depois de `refinement.css`. Imagens decorativas com `alt=""`; campos mantêm rótulos, autocomplete, mostrar senha e erros associados.
- Imagens: gravuras de domínio público do acervo com o duotone da marca (astrônomo de Alexandria na entrada, colunata no cadastro). As imagens do Figma não são usadas porque parecem geradas por IA; o projeto só aceita imagens de domínio público ou licença aberta.

No portal, `CenarioConta` monta a composição sem alterar sessão, validação ou redirecionamento. O token de acesso ao Figma não faz parte do código ou dos assets.
