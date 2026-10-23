# Anfitriões: Salas e artigos enviados por terceiros, com revisão da curadoria

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `portal/README.md`;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `TabelaDados`, `Badge`, `SeloProveniencia`, `CardSala`, `CardConteudo`, `CampoTexto`, `AreaTexto`, `EditorTextoMarcado`, `Select`, `ChipTema`, `Checkbox`, `Modal`, `Drawer`, `Alerta`, `Toast`, `Tabs`, `Breadcrumbs`, `ChecklistPublicacao` e `IndicadorNumerico`;
- o código atual da curadoria: `portal/src/server/sessao.ts`, `portal/src/features/auth/contas.ts`, `portal/src/server/store.ts`, `portal/src/server/admin/*`, `portal/src/server/auditoria.ts`, `portal/src/data/types.ts`, `portal/src/data/repositorio.ts` e `portal/src/app/admin/**`.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- Se faltar uma peça ou variação, estenda o design system primeiro (`tokens.json`, `components/bundle.css`, guia e `preview.html` da peça). Depois rode `node design-system/scripts/build.mjs` e `node design-system/scripts/contraste.mjs`, e me avise que a versão publicada precisa ser atualizada.
- Toda Server Action e todo Route Handler conferem o papel **e a posse** do item no servidor. O que a interface esconde não vale como proteção.
- Use conteúdo real do universo do projeto nos dados de demonstração, nunca lorem ipsum.
- Antes de concluir cada fase: `npm run check`. Nas fases C e D, rode também `npm run test:e2e`.

Ordem de trabalho: quatro fases (A → D). **Pare ao fim de cada uma** para eu revisar, com um resumo do que mudou e de como conferir.

---

## 0. O que muda, em uma frase

Hoje há dois papéis (`membro` e `administrador`), as 5 Salas estão fixas no código (`SalaSlug`) e o status editorial é `rascunho | publicado | arquivado`, sem revisão. Passa a existir um terceiro papel, o **anfitrião**. Ele cria Salas próprias e escreve artigos nelas, mas nada vai ao ar sem a aprovação do **administrador geral**, que só julga: aprova ou reprova com motivo, sem editar o conteúdo.

## 1. Papéis

| Papel | O que faz |
|---|---|
| `membro` | Lê o portal, como hoje. Pode se candidatar a anfitrião. |
| `anfitriao` | Tudo do membro. Também cria e edita **as próprias** Salas e artigos e envia para revisão. Não publica nada direto, não toca em Salas oficiais nem no conteúdo de outro anfitrião e não acessa `/admin`. |
| `administrador` | Publica direto, sem fila, nas Salas oficiais. Pode criar Salas oficiais novas. Ganha a revisão dos anfitriões e a gestão de usuários. **Atualizado:** a curadoria também trabalha a partir da Sala (artigos e vídeos nascem dentro dela); ver `docs/prompts/admin-sala-primeiro.md`. |

- `Papel` em `contas.ts` passa a ser `"membro" | "anfitriao" | "administrador"`.
- Em `sessao.ts`, `Acesso` ganha `{ tipo: "anfitriao"; membro }`.
- Crie `exigirAnfitriao()` e um ajudante de posse, por exemplo `exigirDonoDaSala(salaId)` e `exigirDonoDoArtigo(artigoId)`, que lançam `AcessoNegado`.
- `exigirAdmin()` continua igual.
- O administrador **não** tem painel de anfitrião.

## 2. Como alguém vira anfitrião (as três formas valem)

1. **Promoção pelo admin.** Em `/admin/usuarios`, o admin muda o papel de um membro para anfitrião (e de volta, ver §9).
2. **Candidatura.**
   - Em `/ajustes`, o membro vê "Quero ser anfitrião" e envia: nome público, credencial (uma linha), apresentação (até ~600 caracteres) e um link opcional (site ou canal).
   - O admin aprova ou recusa em `/admin/usuarios`, na aba "Candidaturas".
   - **A recusa exige motivo.** O membro vê o motivo e pode se candidatar de novo.
   - Cada membro tem no máximo uma candidatura pendente.
3. **Convite.**
   - O admin gera um convite para um e-mail. O convite vale 7 dias e só pode ser usado uma vez.
   - O e-mail é registrado na caixa de saída simulada (§10), com o link `/cadastro?convite=<token>`.
   - O cadastro por esse link cria a conta já como anfitrião, com o e-mail travado no do convite.
   - O admin pode revogar um convite pendente.

Na aprovação de candidatura e na aceitação de convite, a pessoa completa o **perfil de anfitrião**: nome público, slug, credencial, apresentação, avatar opcional e link opcional. O anfitrião edita esse perfil em `/anfitriao/perfil`. A edição do perfil **não** passa por revisão, mas fica na auditoria.

## 3. Modelo de dados

### 3.1 Salas deixam de ser fixas

- `SalaSlug` deixa de ser uma união fechada e vira `string`.
- As 5 Salas atuais viram dados com `origem: "oficial"` e continuam no seed.
- Toda referência que dependia da união precisa funcionar com Salas criadas em tempo de execução: rótulos, trilhas, citações, grade comparativa, busca, assistente, mocks e testes.
- Faça essa troca como um passo isolado, com `check` verde, antes de qualquer outra coisa da fase B.

Campos novos de `Sala`:
- `origem: "oficial" | "anfitriao"`;
- `donoId?`: o anfitrião, quando `origem` é `"anfitriao"`;
- `imagem?`: imagem da Sala, usada no `CardSala` e no topo da página da Sala; sem ela, a placa da marca com a inicial, como hoje;
- `link?`: link geral da Sala, por exemplo o site ou o canal do anfitrião; só `https`;
- `naComparacao: boolean`: a "segunda chave" do §7; nas oficiais, sempre `true`;
- os campos editoriais da Sala de anfitrião (§4).

Num formulário de anfitrião, `tradicao`, `tradicaoCurta`, `periodo` e `inicial` são calculados ou opcionais. Defina o mínimo necessário para o `CardSala` e a página da Sala renderizarem sem buracos.

### 3.2 Artigo de anfitrião

É um `ConteudoEditorial` com `tipo: "artigo"` e `proveniencia: "anfitriao"`, ligado a uma Sala do próprio anfitrião. Campos que o anfitrião preenche:

| Campo | Regra |
|---|---|
| Título | obrigatório |
| Texto | obrigatório; parágrafos com marcação mínima, editados com o `EditorTextoMarcado` |
| Imagem do card | opcional (usada no `CardConteudo`); sem ela, a placa da marca |
| Thumb do artigo | opcional (topo da página do artigo); sem ela, a imagem do card ou a placa |
| Fontes | pelo menos 1; escolhidas no catálogo de fontes ou cadastradas como nova fonte (§3.3) |
| Link | opcional e **um só**: vídeo do YouTube (vira player embutido; reaproveite `extrairIdYoutube`) **ou** site externo (vira o botão "Ler no site", `target="_blank" rel="noopener noreferrer"`) |
| Temas | pelo menos 1, da lista de Temas da curadoria (`ChipTema`). São a "trilha de conhecimento" do anfitrião e alimentam a busca por tema |
| Nível | opcional, padrão Iniciante |

Campos calculados:
- o `resumo` sai do primeiro parágrafo (cerca de 180 caracteres, cortado em palavra);
- `duracaoMin` sai da contagem de palavras;
- `formato` é `"video"` quando há link do YouTube;
- `autoria` são o nome público e a credencial do anfitrião.

### 3.3 Fonte proposta

- A fonte que o anfitrião cadastra nasce como `pendente`, com título, autor, tipo (`TipoFonte`) e localização, e só ele a vê.
- Quando o artigo que a usa é aprovado, a fonte entra no catálogo público.
- Quando o artigo é reprovado, a fonte continua pendente com ele.
- O admin julga a fonte como parte do artigo: se ela for o problema, isso vai no motivo da reprovação.

### 3.4 Imagens (upload livre)

- Upload de arquivo, sem declaração de origem.
- Aceite só JPEG, PNG e WebP, até 5 MB. Confira os *magic bytes* do arquivo, não só a extensão.
- Guarde na memória do servidor, como o resto do acervo, e sirva por um Route Handler (por exemplo `/midia/[id]`).
- Antes do envio para revisão, um `Checkbox` obrigatório: "Declaro que tenho direito de usar as imagens e os textos enviados." O aceite (quem e quando) fica registrado no envio.
- A regra "imagens só em domínio público, sem IA" continua valendo para a curadoria. Não a aplique ao anfitrião.

## 4. Ciclo de vida

### 4.1 Status

Para Salas e artigos de anfitrião:

```
rascunho ──enviar──▶ em_revisao ──aprovar──▶ publicado
    ▲                    │
    │                 reprovar (motivo obrigatório)
    │                    ▼
    └────editar──── reprovado

publicado ──anfitrião edita──▶ rascunho (sai do ar na hora)
publicado ──anfitrião retira──▶ arquivado
```

- Escreva a máquina de estados como funções puras, testadas, num módulo próprio (por exemplo `portal/src/features/anfitriao/regras/ciclo.ts`). As Server Actions só a chamam.
- `reprovado` guarda o **último motivo** e o histórico de decisões (quem, quando, decisão, motivo).
- **Editar um item publicado tira o item do ar na hora.** Ele volta para `rascunho` e precisa ser reenviado. Isso vale para artigo e para Sala (nome, imagem, link). Antes de salvar, o anfitrião vê um `Modal` de confirmação: "Este artigo sai do ar até a curadoria aprovar a nova versão."
- O anfitrião pode **retirar do ar** (arquivar) o que é dele e **excluir** apenas o que nunca foi publicado.

### 4.2 Regras entre Sala e artigos

- **Visibilidade pública:** uma Sala aparece se, e somente se, está `publicado` **e** tem ≥ 1 artigo `publicado`. Calcule isso no repositório, sem duplicar status. Se o último artigo sai do ar, a Sala some junto, sem perder o próprio status.
- **Primeiro envio:** a Sala precisa ir com pelo menos 1 artigo. Ao enviar a Sala, o anfitrião escolhe quais rascunhos dela vão junto.
- **Sala já publicada:** artigos novos ou editados são enviados e revisados um a um.

### 4.3 Decisões do admin

- **Aprovar a Sala:** publica a Sala e todos os artigos dela em revisão que não foram reprovados nesta mesma revisão. Fica bloqueado se não sobrar nenhum artigo aprovado.
- **Reprovar um artigo:** motivo obrigatório. O artigo volta ao anfitrião e os demais seguem na fila.
- **Reprovar a Sala:** motivo obrigatório. A Sala e todos os artigos dela em revisão voltam ao anfitrião, com o motivo da Sala.
- **Aprovar ou reprovar um artigo avulso** numa Sala já publicada.
- O admin **não edita** conteúdo de anfitrião: nenhum campo editável na tela de revisão, só a prévia e as ações. As Server Actions de edição recusam o admin nos itens de anfitrião.

## 5. Área do anfitrião (`app/(app)/anfitriao`)

Fica dentro da moldura do app. Na navegação lateral, aparece o item "Minhas Salas", só para o papel anfitrião.

- **`/anfitriao`: painel.**
  - Indicadores (`IndicadorNumerico`): Salas, artigos publicados, em revisão e reprovados.
  - Bloco "Novidades": decisões ainda não vistas, com contador na lateral.
  - Lista das Salas do anfitrião, cada uma com `Badge` de status.
- **`/anfitriao/salas/nova` e `/anfitriao/salas/[id]`: a Sala.**
  - Formulário: nome, descrição, imagem e link.
  - Lista dos artigos da Sala com status.
  - Botão "Enviar para revisão".
  - Quando há reprovação, um `Alerta` com o motivo.
- **`/anfitriao/salas/[id]/artigos/novo` e `/anfitriao/artigos/[id]`: o artigo.**
  - Formulário do §3.2, com prévia ao vivo tal como o público verá (selo, assinatura, player ou botão de link).
  - Use o `ChecklistPublicacao` para o que falta antes de poder enviar: título, texto, ≥ 1 tema, ≥ 1 fonte e aceite.
- **`/anfitriao/perfil`:** o perfil público.

Salve o rascunho automaticamente com o `IndicadorSalvamento`, como na curadoria.

## 6. Revisão no admin (`/admin/anfitrioes`)

Três níveis encadeados, com `Breadcrumbs` e `TabelaDados`:

1. **Usuários anfitriões.**
   - Colunas: nome, e-mail, Salas, artigos publicados, **pendentes** e envio pendente mais antigo.
   - Ordem padrão: quem espera há mais tempo primeiro.
   - Filtro "Só com pendências".
2. **Salas desse anfitrião.**
   - Colunas: nome, status, artigos (publicados, em revisão, reprovados), na comparação (sim ou não) e atualizada em.
3. **A Sala em revisão.**
   - Cabeçalho da Sala: imagem, nome, descrição e link.
   - Lista dos artigos. Cada um abre uma prévia completa (reaproveite o padrão de `/admin/artigos/[id]/previa`) com as fontes, inclusive as propostas, marcadas como "nova".
   - Ações:
     - "Aprovar Sala";
     - "Reprovar Sala";
     - "Reprovar este artigo" e "Aprovar este artigo" (artigo avulso).
   - Toda reprovação abre um `Modal` com o motivo obrigatório (mínimo de ~20 caracteres).
   - Na mesma tela, o `Switch` "Incluir na comparação e no assistente" (§7).

Na entrada do `/admin`, o card "Revisão de anfitriões" mostra o total pendente.

### `/admin/usuarios`

Abas (`Tabs`):
- **Usuários:** todos, com papel e ações de promover ou rebaixar;
- **Candidaturas:** pendentes e decididas;
- **Convites:** pendentes, usados, expirados e revogados, com o botão "Convidar".

## 7. Onde o conteúdo de anfitrião aparece

| Lugar | Salas oficiais | Salas de anfitrião |
|---|---|---|
| `/salas` | seção "Salas da curadoria" | seção "Salas de anfitriões" (só as visíveis, §4.2) |
| Página da Sala e do artigo | como hoje | sim, com selo e assinatura de anfitrião |
| Busca simples e por tema | sim | sim |
| Grade comparativa | sim | **só se `naComparacao`** |
| Acervo do assistente de IA | sim | **só se `naComparacao`** |
| Destaques | admin escolhe | admin pode escolher, se publicada |

- `naComparacao` nasce `false` e só o admin liga ou desliga.
- Desligar não despublica nada.

### Selo "Anfitrião" (estender o design system, fase A)

- Novo nível de proveniência `anfitriao` no `SeloProveniencia`, com o rótulo "Anfitrião" e o complemento "Revisado pela curadoria".
- Cor só nos pares de texto permitidos pela marca, com AA conferido.
- Se o assistente citar um artigo de anfitrião, a citação traz o mesmo selo.

### Página pública do anfitrião (`/anfitrioes/[slug]`)

- Nome, credencial, apresentação, avatar, link e as Salas visíveis dele (`CardSala`).
- A assinatura dos artigos e das Salas dele leva até essa página.
- Um anfitrião sem nada visível tem a página com o aviso "Ainda sem Salas publicadas."

## 8. Voz e neutralidade

O conteúdo é do anfitrião, mas a casa é do portal:
- toda página de anfitrião mostra o selo;
- quando o artigo trata de um tema com leituras divergentes, mostra também o Aviso de neutralidade, como os artigos da curadoria;
- no formulário, uma nota curta (`Alerta` informativo) lembra as diretrizes: atribuir afirmações a fontes, datas incertas ficam incertas, sem tom dogmático;
- o cumprimento das diretrizes é critério da revisão, não validação automática.

## 9. Rebaixar um anfitrião ou excluir a conta

Ao tirar o papel, o admin escolhe num `Modal`:

1. **Manter publicado e congelado.**
   - Nada sai do ar. O ex-anfitrião não edita mais.
   - O admin só pode despublicar ou transferir, nunca editar o conteúdo.
   - A assinatura continua com o nome do autor.
2. **Despublicar tudo.** Tudo vai para `arquivado`, nada é apagado.
3. **Transferir para outro anfitrião.** As Salas e os artigos mudam de dono. A assinatura dos artigos já publicados continua com o autor original, e o novo dono passa a responder por eles.

Itens em revisão voltam para `rascunho` nos três casos. O ex-anfitrião vira `membro`.

## 10. Avisos

- **No painel do anfitrião:** status em cada item, mais um contador de novidades não vistas na lateral e no painel. A novidade é marcada como vista ao abrir o item.
- **Caixa de saída simulada:**
  - crie um módulo em memória (por exemplo `portal/src/server/caixa-saida.ts`) que registra cada e-mail "enviado": para, assunto, corpo em texto e quando;
  - deixe uma interface única (`enviarEmail()`) pronta para trocar por um serviço real;
  - o admin vê os e-mails em `/admin/caixa-saida`.
- **Eventos que geram e-mail:**
  - candidatura recebida (para o admin) e decidida (para o membro);
  - convite;
  - Sala ou artigo aprovado ou reprovado (com o motivo);
  - rebaixamento ou transferência.
- **Tom dos e-mails:** a voz da marca, sereno e direto. Exemplo: "Sua Sala 'Leituras do Evangelho de Tomé' foi publicada."

## 11. Auditoria

Estenda `TipoItemAuditado` com `sala`, `usuario`, `candidatura` e `convite`, e `AcaoAuditada` com `enviou-para-revisao`, `aprovou`, `reprovou`, `promoveu`, `rebaixou`, `convidou`, `revogou-convite`, `transferiu`, `incluiu-na-comparacao`, `removeu-da-comparacao` e `editou-perfil`. Tudo aparece em `/admin/historico`, com os filtros novos.

## 12. Dados de demonstração

- Uma conta `CONTA_ANFITRIAO_DEMONSTRACAO` em `contas.ts`. Siga o mesmo cuidado da conta de admin: a senha fica só no arquivo e não aparece na interface.
- Esse anfitrião tem:
  - uma Sala **publicada** com 2 artigos publicados, por exemplo "Leituras do Evangelho de Tomé", com Temas, fontes reais do catálogo e um link de YouTube;
  - uma Sala **em revisão** com 2 artigos, um deles com uma fonte nova proposta.
- Uma candidatura pendente de outro membro e um convite pendente.
- Os nomes das pessoas são fictícios e marcados como demonstração.
- O botão "Restaurar acervo" do admin recompõe tudo isso.

## 13. Testes

**Unitários (Vitest):**
- todas as transições da máquina de estados, inclusive as proibidas;
- a regra "Sala visível ⇔ publicada e com ≥ 1 artigo publicado";
- "Aprovar Sala" bloqueado sem artigo aprovado;
- reprovar sem motivo falha;
- editar um publicado tira o item do ar;
- convite expirado ou já usado é recusado;
- validação de upload: tipo, tamanho e *magic bytes*;
- permissões (cada uma é um teste):
  - o anfitrião A não lê nem edita Sala, artigo ou fonte pendente do B;
  - o anfitrião não chama ações do admin;
  - o admin não edita conteúdo de anfitrião;
  - membro não acessa `/anfitriao`.

**E2E (Playwright), um fluxo completo:**
1. o admin convida;
2. a pessoa se cadastra pelo link e completa o perfil;
3. cria uma Sala com 2 artigos (um com vídeo, um com site e fonte nova) e envia;
4. o admin reprova um artigo com motivo e aprova a Sala;
5. o público vê a Sala com 1 artigo e o selo "Anfitrião", e a Sala não está na grade comparativa;
6. o anfitrião vê o motivo, corrige e reenvia; o admin aprova;
7. o admin liga "Incluir na comparação" e a Sala aparece na grade;
8. o anfitrião edita um artigo publicado e ele some do portal;
9. a caixa de saída tem os e-mails esperados.

Um segundo fluxo E2E cobre a candidatura (enviar → recusar com motivo → reenviar → aprovar) e o rebaixamento com "Despublicar tudo".

---

## Fases

**A. Design system.**
- Selo "Anfitrião".
- `Badge` de status editorial (rascunho, em revisão, publicado, reprovado, arquivado), se ainda não existir com esses estados.
- Campo de upload de imagem com prévia e erro, se não houver peça para isso.
- Qualquer variação de `TabelaDados` que a navegação em três níveis pedir.
- Guia, `preview.html`, build e contraste AA.
- **Pare** para eu revisar no `design-system/catalogo.html`.

**B. Modelo e servidor.**
- Primeiro, Salas dinâmicas (§3.1) com `check` verde.
- Depois:
  - papéis e ajudantes de acesso;
  - máquina de estados;
  - imagens;
  - fontes propostas;
  - candidatura e convite;
  - caixa de saída;
  - auditoria;
  - seed;
  - testes unitários.
- Sem telas novas.
- **Pare.**

**C. Lado do anfitrião.**
- Candidatura em `/ajustes`.
- Cadastro por convite.
- Área `/anfitriao` completa.
- Perfil.
- Item na lateral.
- **Pare.**

**D. Lado do admin e lado público.**
- `/admin/anfitrioes`, `/admin/usuarios` e `/admin/caixa-saida`.
- Rebaixamento.
- `/salas` em duas seções.
- Selo e assinatura nas páginas.
- Página pública do anfitrião.
- `naComparacao` na grade e no assistente.
- E2E.
- Ao terminar, atualize `CLAUDE.md` (papéis e acesso) e `portal/README.md`.
- **Pare.**
