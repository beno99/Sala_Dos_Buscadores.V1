# Comunidade: buscadores publicam estudos e conversam com os anfitriões

Antes de começar, leia:
- `CLAUDE.md` na raiz;
- `portal/README.md`;
- `design-system/README.md` e `design-system/DIRETRIZES.md`;
- o guia e o exemplo de cada peça que for usar (`design-system/components/<Nome>/README.md` e `design-system/exemplos/<Nome>.html`), principalmente `Avatar`, `SeloNivel`, `Badge`, `Tabs`, `BarraBusca`, `AreaTexto`, `CampoImagem`, `CardConteudo`, `BlocoCitacao`, `SeloProveniencia`, `AutoriaConteudo`, `AvisoNeutralidade`, `AvisoContextual`, `Menu`, `Modal`, `Drawer`, `Toast`, `Tooltip`, `EstadoSecao`, `EstadosInterface`, `PerfilPublico`, `CabecalhoPerfil`, `IndicadorNumerico`, `ListaConteudos`, `NavegacaoLateral` e `Botao`;
- o código que a seção vai tocar: `portal/src/server/sessao.ts`, `portal/src/features/auth/contas.ts`, `portal/src/server/store.ts`, `portal/src/data/types.ts`, `portal/src/data/repositorio.ts`, `portal/src/features/perfil/**`, `portal/src/features/anfitriao/**`, `portal/src/app/(app)/anfitrioes/**`, `portal/src/app/(app)/perfil/**` e a navegação lateral.

Regras:
- Use só classes e tokens do design system: nada de cor, raio, sombra, curva ou espaço solto.
- Nunca edite `portal/src/design-system/`, que é cópia gerada por `npm run ds:sync`.
- Se faltar uma peça ou variação (e vai faltar: cartão de publicação, compositor, painel de comentários, linha de pessoa), estenda o design system primeiro (`tokens.json`, `components/bundle.css`, guia, `preview.html` da peça e exemplo). Depois rode `node design-system/scripts/build.mjs` e `node design-system/scripts/contraste.mjs`, rode `npm run ds:sync` no portal e me avise que a versão publicada precisa ser atualizada.
- Os componentes React vão em `portal/src/components/ds/` e emitem as mesmas classes e atributos dos exemplos.
- Toda Server Action e todo Route Handler conferem sessão, papel **e posse** no servidor (autor da publicação ou do comentário, anfitrião da Sala). O que a interface esconde não vale como proteção.
- Telas novas entram em `app/(app)`, dentro da moldura.
- Dados de demonstração com conteúdo real do universo do projeto (estudos sobre o Poimandres, o Caibalion, o Evangelho de Tomé, Urântia…), nunca lorem ipsum.
- Antes de concluir cada fase: `npm run check`. Nas fases C e D, rode também `npm run test:e2e`.

Ordem de trabalho: quatro fases (A → D). **Pare ao fim de cada uma** para eu revisar, com um resumo do que mudou e de como conferir.

---

## 0. O que é e o que não é

A Comunidade é o lugar onde os buscadores **compartilham o que estão estudando** e conversam entre si e com os anfitriões. Não é uma rede social de entretenimento: é um **caderno de estudos em voz alta**. O portal continua sendo curador de museu, não pregador. O feed existe para dar contexto ao acervo, nunca para competir com ele.

Referência visual: quatro telas de um feed de rede social comunitária, com tema escuro (coluna central com abas, compositor, cartão de publicação com mídia, curtir/comentar/salvar, legenda com "ver mais", prévia de link, dois comentários e "Ver todos os comentários"; coluna lateral com "Sua conta", "Encontrar pessoas", "Em alta agora", "Contas que você segue"; painel de comentários com respostas, curtidas e campo de envio). **Aproveite a estrutura e a hierarquia, não o visual**: tudo é reconstruído com o design system do portal (Sólido claro, paleta areia por padrão, os quatro temas funcionando, cantos contínuos, cápsulas, mola). Nada de azul de rede social, emoji colorido solto, selo verde neon de nível ou gradiente.

## 1. Adaptações obrigatórias ao universo do portal

| Na referência | Na Sala dos Buscadores |
|---|---|
| "O que você aprendeu hoje?" | "O que você está estudando?" |
| Botões "Foto ou vídeo" e "Insights" | Tipos de publicação (§3): **Reflexão**, **Citação com fonte**, **Pergunta**, **Achado do acervo** |
| Prévia de link externo (instagram.com etc.) | Cartão de **conteúdo do acervo** (`CardConteudo` compacto: Sala, título, Selo de proveniência). Link externo só como texto, sem prévia |
| Selo de nível verde "Lv 13" | `SeloNivel` existente, nas cores dos tokens |
| Aba "Seguindo" | Seguir **pessoas** e **Salas**: "Para você" mostra o que vem das Salas e anfitriões que a pessoa segue e das suas trilhas; "Seguindo" só quem ela segue |
| "Em alta agora" | **"Em debate nesta semana"**: temas com mais conversa (ligados a `ChipTema`), não ranking de pessoas por curtidas |
| "Contas que você segue" | "Quem você acompanha" |
| Emojis de reação (coração, fogo, palmas…) | Reações **sem emoji**, em texto com ícone do `Iconografia`: **Útil**, **Me fez pensar**, **Quero aprofundar**. Curtida simples continua existindo como "Curtir" |
| Anfitrião não existe | Anfitrião tem `Badge` "Anfitrião" ao lado do nome, resposta destacada em perguntas e perfil próprio (`/anfitrioes/<slug>`) |

Voz e tom: sem gamificação agressiva, sem contador de "viral", sem "bombando". Linguagem serena e didática, como no resto do portal.

## 2. Estrutura de telas

Rota principal: `app/(app)/comunidade` (entra na `NavegacaoLateral` como "Comunidade", com `IndicadorNumerico` de novidades quando houver).

1. **Feed** (`/comunidade`): layout de duas colunas em desktop (coluna central do feed + coluna lateral), uma coluna no celular. A coluna lateral tem quatro cartões na mesma grade e no mesmo ritmo do resto do portal:
   - **Sua conta**: avatar (foto enviada ou iniciais), nome, `SeloNivel`, "Ver perfil", três números (Publicações, Seguidores, Seguindo) e atalho "Salvos".
   - **Encontrar pessoas**: `BarraBusca` por nome, com resultado em lista.
   - **Em debate nesta semana**: três a cinco itens (tema, número de conversas, Sala de origem).
   - **Quem você acompanha**: lista curta com "Ver tudo".
2. **Abas do feed** (`Tabs`): "Para você" e "Seguindo", com ações de busca e mensagens à direita, como na referência. Mensagens diretas **ficam fora do MVP**: deixe o ícone fora e registre como pendência no final.
3. **Compositor**: avatar, campo ("O que você está estudando?") e os quatro tipos. Ao escolher o tipo, o compositor abre os campos certos (§3). No celular vira barra fixa na base (camada flutuante, vidro), abrindo `Drawer` em tela cheia.
4. **Cartão de publicação** (§4).
5. **Painel de comentários**: `Modal` no desktop e `Drawer` de baixo no celular (§5).
6. **Página da publicação** (`/comunidade/p/<id>`): a mesma publicação com todos os comentários, para link direto e para quando o painel não couber.
7. **Salvos** (`/comunidade/salvos`) e **perfil público** com a aba "Publicações" (reaproveite `PerfilPublico` e `CabecalhoPerfil`).
8. **Comunidade dentro da Sala**: aba "Conversas" na página de cada Sala, mostrando só as publicações marcadas com aquela Sala. Esta é a ponte entre acervo e comunidade; **não mexa na estrutura da página da Sala além de adicionar a aba** (há uma sessão cuidando dela, ver memória do projeto). Se a aba conflitar, entregue-a como componente isolado e me avise.

## 3. Tipos de publicação

Toda publicação tem texto (até ~1.500 caracteres, com "ver mais" depois de três linhas), **uma Sala associada opcional**, **temas** opcionais (`ChipTema`, até 3) e **uma imagem opcional** (`CampoImagem`; a pessoa só envia imagem que tem direito de usar, com aviso curto no campo).

| Tipo | Campos extras | Regra |
|---|---|---|
| **Reflexão** | nenhum | Texto livre. Sem afirmação factual sem fonte: o compositor exibe um `AvisoContextual` leve lembrando "atribua a uma fonte" |
| **Citação com fonte** | trecho (obrigatório), obra e passagem (obrigatórios) | Renderiza com `BlocoCitacao` e `SeloProveniencia`. Sem fonte, não publica |
| **Pergunta** | Sala (obrigatória), opcionalmente dirigida a um anfitrião | Notifica o anfitrião da Sala. A melhor resposta pode ser marcada pelo autor como "Resposta que ajudou" |
| **Achado do acervo** | conteúdo do acervo escolhido por busca | Mostra o `CardConteudo` compacto dentro da publicação |

**Publicações da comunidade nunca ganham Selo de proveniência editorial.** Elas levam, no lugar, a identificação "Publicado por um buscador" (ou "Publicado por um anfitrião"), para ficar claro que não é conteúdo da curadoria. O `AvisoNeutralidade` aparece uma vez no topo do feed, dispensável, e no compositor.

## 4. Cartão de publicação

De cima para baixo, com as peças do DS:

1. Cabeçalho: `Avatar`, nome, `SeloNivel`, `Badge` "Anfitrião" quando for o caso, tempo relativo ("há cerca de 17 horas"), Sala associada como chip e menu `…` (`Menu`: Salvar, Copiar link, Silenciar autor, Denunciar; o autor vê também Editar e Excluir).
2. Imagem, quando houver, em proporção fixa (`Proporcao`), cantos contínuos.
3. Barra de ações: **Curtir** com número, **Comentar** com número, **Reagir** (as três reações do §1) e **Salvar** à direita. Resposta ao toque imediata, com mola; interrompível.
4. Texto com nome do autor em destaque, "ver mais".
5. Bloco do tipo (citação, achado do acervo ou pergunta).
6. Duas prévias de comentário (nome em destaque, texto em uma ou duas linhas) e "Ver todos os comentários (N)".

Estados: carregando (`CarregamentoSala`/esqueleto do DS), feed vazio, feed vazio em "Seguindo" (convite para seguir Salas e anfitriões), erro com tentar de novo (`EstadoSecao`).

## 5. Comentários

- Abre no painel descrito em §2.5, com título "Comentários" e botão de fechar.
- Lista com avatar, nome, texto, tempo, "Responder" e curtida com número, como na referência.
- **Um nível de resposta** (resposta a comentário, sem árvore profunda).
- Comentário de anfitrião ganha o `Badge` "Anfitrião"; em publicação do tipo Pergunta, as respostas de anfitrião sobem para o topo com destaque discreto.
- Campo "Adicione um comentário…" fixo na base, com anexar imagem (opcional) e "Publicar" desabilitado até haver texto. Reações rápidas **só com as três reações do §1**, não com fileira de emoji.
- Limite de 600 caracteres por comentário, com contador só perto do limite.

## 6. Papéis e regras de convivência

- **Membro**: publica, comenta, reage, segue, salva, denuncia.
- **Anfitrião**: tudo do membro, mais: responde com destaque nas Salas dele, pode **fixar uma publicação** na aba "Conversas" da própria Sala e **ocultar comentário** na publicação feita nas próprias Salas (com motivo registrado). Não apaga publicação de terceiros.
- **Administrador**: modera tudo em `/admin/comunidade` (fila de denúncias, ocultar, restaurar, suspender publicação por 7 dias ou indefinidamente, com motivo e auditoria). Não edita o texto de ninguém.
- **Regras da comunidade** (uma página curta em `/comunidade/regras`, linkada no compositor): respeito entre tradições, **sem proselitismo nem desqualificação de crenças**, sem conteúdo médico ou de cura, sem dados pessoais de terceiros, atribuir fonte quando afirmar algo sobre um texto. Linguagem firme e serena.
- **Privacidade**: a religião ou convicção informada no onboarding **nunca** aparece em publicações, perfil público ou sugestões de pessoas. Só o que a própria pessoa escrever.
- Denúncia exige escolher motivo (lista curta) e aceita comentário opcional; quem denuncia vê confirmação (`Toast`).
- Limites simples contra abuso: no máximo 10 publicações e 60 comentários por pessoa por dia (valores nas regras puras, fáceis de mudar).

## 7. Modelo de dados e servidor

Seguindo o padrão do projeto (store em memória, repositório que lê só o publicado, regras puras separadas):

- Tipos em `portal/src/data/types.ts`: `Publicacao` (id, autorId, tipo, texto, salaSlug opcional, temas, imagem opcional, citação opcional, conteudoId opcional, perguntaDirigidaA opcional, respostaQueAjudouId opcional, fixada, estado `"visivel" | "oculta" | "removida"`, criadaEm, editadaEm), `ComentarioComunidade` (id, publicacaoId, autorId, paiId opcional, texto, imagem opcional, estado, criadaEm), `ReacaoComunidade` (alvo, pessoa, tipo), `SeguirComunidade` (seguidor, alvo pessoa ou Sala), `SalvoComunidade` e `DenunciaComunidade` (alvo, motivo, nota, estado, decididaPor, motivoDecisao).
- Regras puras em `portal/src/features/comunidade/regras/` (tamanho de texto, tipos obrigatórios, limite diário, quem pode fixar e ocultar, transições de estado, ordenação do feed, "Em debate"), todas com teste Vitest.
- Ordenação do feed "Para você": mais recente primeiro, com leve prioridade para Salas e anfitriões que a pessoa segue e para as Salas das suas trilhas. **Sem algoritmo de engajamento opaco**; documente a regra em um comentário curto no arquivo.
- Server Actions em `portal/src/server/comunidade/*` (publicar, editar, excluir, comentar, reagir, salvar, seguir, denunciar, fixar, ocultar). Cada uma confere sessão, papel e posse, e escreve na auditoria existente (`portal/src/server/auditoria.ts`) quando for ação de moderação.
- Tudo que o usuário envia é validado e sanitizado no servidor (texto puro, sem HTML; links exibidos como texto com `rel="noopener noreferrer"`).
- Seeds de demonstração: 12 a 15 publicações em português, de pelo menos 6 autores (incluindo 2 anfitriões e o admin sem publicar), cobrindo os quatro tipos e as cinco Salas oficiais, com 2 a 6 comentários em várias delas e algumas denúncias na fila.

## 8. Acessibilidade e movimento

- Tudo operável por teclado; foco visível; ordem de foco lógica no painel de comentários (foco preso no `Modal`, devolvido ao botão ao fechar).
- Botões de ação com rótulo acessível e contagem anunciada ("Curtir, 5 curtidas").
- Reações e curtidas com resposta no pressionar e animação de mola curta; respeite `prefers-reduced-motion`.
- Contraste AA nos quatro temas (rode `contraste.mjs`).
- No celular, alvos de toque de pelo menos 44 px e o compositor sem cobrir o conteúdo ao rolar.

---

## Fases

**Fase A: design system.** Crie e documente as peças que faltam (cartão de publicação, compositor, linha de comentário, linha de pessoa, cartão lateral de comunidade, barra de ações), com `preview.html`, guia, exemplo e os quatro temas. Rode `build.mjs`, `contraste.mjs` e `ds:sync`. Atualize `catalogo`. **Pare** e mostre o catálogo.

**Fase B: feed somente leitura.** Tipos, store, repositório, seeds, regras puras com testes, rota `/comunidade` com abas, cartões, coluna lateral, estados vazios e de erro, página da publicação, perfil com "Publicações" e a aba "Conversas" na Sala. Sem escrita ainda. **Pare.**

**Fase C: escrita e interação.** Compositor com os quatro tipos, comentários e respostas, reações, curtir, salvar, seguir, editar e excluir as próprias publicações, "Resposta que ajudou", fixar e ocultar pelo anfitrião, notificação simples ao anfitrião nas Perguntas. Posse conferida no servidor, E2E do fluxo publicar → comentar → reagir → salvar. **Pare.**

**Fase D: moderação e acabamento.** Denúncias, `/admin/comunidade` com a fila e as decisões, suspensão, auditoria, regras da comunidade, limites diários, responsivo e celular, passe de acessibilidade, E2E de moderação e de permissões (membro não oculta, anfitrião só nas próprias Salas, administrador não edita texto). Atualize `CLAUDE.md` com um parágrafo sobre a Comunidade (rotas, papéis, onde ficam as regras) e o `portal/README.md`. **Pare.**

## Fora do MVP (registre, não implemente)

Mensagens diretas, vídeo enviado pela pessoa, enquetes, menções com notificação em tempo real, push, grupos privados, monetização, algoritmo de recomendação, moderação automática por IA.

## Ao terminar cada fase, me entregue

- o que mudou, em poucas linhas;
- como conferir (rotas, usuários de demonstração e papéis para testar);
- o que ficou pendente ou decidido por você, com o motivo.
