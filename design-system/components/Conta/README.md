# Conta

Composição de Entrar, Redefinir senha e Criar conta, conforme a seção Conta e onboarding do Figma (19537:4958).

- `.sdb-conta--entrada`: imagem lateral e coluna de marca/formulário. No celular, a imagem vira uma faixa acima do formulário.
- `.sdb-conta--cadastro`: imagem ao fundo e painel de 480 px. A página cresce com o conteúdo, inclusive mensagens de erro e cadastro por convite.
- `.sdb-conta__form`, `__cabecalho`, `__titulo`, `__lead`, `__alternativa`: ritmo e hierarquia dos formulários. Campos, botões, consentimento e alertas usam os componentes existentes.
- Superfícies `nav-fill` e `card-warm`, títulos `label-brand`, texto `label`/`label-secondary`. Os quatro temas continuam disponíveis.
- Carregue `conta.css` depois de `refinement.css`. Imagens decorativas com `alt=""`; campos mantêm rótulos, autocomplete, mostrar senha e erros associados.
- Imagens do cadastro: gravura de domínio público do acervo com o duotone da marca (colunata). As imagens do Figma não são usadas porque parecem geradas por IA; fora da entrada, o projeto só aceita imagens de domínio público ou licença aberta.
- Imagens da entrada: carrossel de seis cenas (`.sdb-conta__imagem` com várias `<img>`, a atual com `.is-current`), direção Crush aprovada pelo cliente — cinema dramático, sombras densas, luz dourada, sem texto embutido. Giro a cada 8 s com esmaecido cruzado de 900 ms (`transition: opacity`), parado com o ponteiro em cima, o foco dentro, a aba oculta, `prefers-reduced-motion` e o botão de pausa — tratado no React, como o Banner rotativo do Portal. `.sdb-conta__imagem-controls` reaproveita `.sdb-dots` e o acabamento escuro de `.sdb-banner--cheio` (seta anterior, indicadores, seta seguinte, pausa).
- `.sdb-conta__imagem` tem altura mínima de 440 px e máxima de `100dvh` menos o respiro vertical da página, para não forçar rolagem em janelas de desktop mais baixas.

No portal, `CenarioConta` monta a composição sem alterar sessão, validação ou redirecionamento. O token de acesso ao Figma não faz parte do código ou dos assets.
