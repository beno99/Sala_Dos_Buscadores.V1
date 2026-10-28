# Conquista

## Cards com esferas · revisão de 27/10/2026

A prévia começa pela coleção de oito gemas do estudo de Conquistas. **Esses cards existem apenas na aparência escura, inclusive sobre páginas claras ou areia.** Cada card mantém fundo grafite, textos claros, bordas, foco e iluminação da esfera do tema sólido escuro. O topo recebe um degradê suave, por toda a largura, na cor da esfera. O degradê termina dentro de `.sdb-badge-card__visual`, antes do título; a área de texto mantém a superfície grafite neutra.

- Carregue `card-conquista.css` depois dos tokens, temas e estilos de refinamento. Cada `.sdb-badge-card` deve ter `data-theme="solido-escuro"`: o tema fica restrito ao próprio card e usa os tokens escuros existentes. A superfície `--badge-surface` é definida no card a partir de `--ds-solid` (`#202424`), sem herdar a superfície do entorno.
- Cada `.sdb-badge-card` recebe `--badge-color`; `--badge-color-end` permite a segunda cor da Turmalina bicolor. As cores vêm das paletas existentes das esferas.
- `.is-locked` substitui as duas cores por cinza. Ao desbloquear, remova essa classe e atualize a esfera e o rótulo juntos. O estado continua explícito por texto e ícone.
- As esferas usam `solid-orb.js`: WebGL 1, sem bibliotecas ou texturas externas. A casca de vidro tem transparência real, reflexos largos e uma borda de luz discreta. Três camadas de textura mineral e pontos de luz internos criam profundidade, mantendo as paletas das oito gemas. As camadas têm contraste reforçado, veios mais luminosos e maior densidade nas regiões coloridas, com regiões transparentes entre elas. O volume gira em torno de um eixo inclinado em aproximadamente 36 segundos.
- `badge-motion.js` controla a interação e o ciclo de vida. Hover com ponteiro fino deforma suavemente a esfera (cerca de 3%). Clique, toque e teclado geram uma expansão discreta com retorno por mola, limitada a 4% mesmo com cliques repetidos. Bloqueadas ficam cinza e paradas.
- Um relógio compartilhado limita o desenho a 30 fps e DPR 1,5. Esferas fora da tela, aba oculta e a opção **Pausar movimento** suspendem a animação. `prefers-reduced-motion` mantém uma representação estática, inclusive no hover e no clique.
- Sem WebGL ou durante perda de contexto, uma esfera CSS translúcida preserva a forma e a cor, sem o volume procedural. A restauração de contexto recria os recursos; `dispose()` remove eventos, observadores e recursos do renderizador.
- **Fundo da prévia** compara o entorno branco, areia, escuro ou o tema do catálogo. Os cards permanecem escuros em todas as opções. **Simular todas obtidas** é apenas um controle de revisão local: não salva progresso nem concede conquistas no portal.
- As variações anteriores continuam disponíveis na seção recolhível da prévia.

### Referências visuais

Direção aprovada: card sempre escuro, vidro transparente, texturas minerais reforçadas e brilhos de galáxia internos, com movimentos suaves, inspirado nas referências fornecidas pelo usuário: [esfera perolada](https://br.pinterest.com/pin/656610820701375893/), [deformação orgânica](https://br.pinterest.com/pin/861102391265796998/) e [superfície fluida](https://br.pinterest.com/pin/832391943656762916/). O renderizador interpreta esse material com as cores próprias da coleção.

### Integração

Carregue `solid-orb.js`, `badge-motion.js` e depois `preview.js` (scripts clássicos com `defer`). O gerador inclui assinaturas de conteúdo para evitar shaders antigos em cache. Preserve `data-theme="solido-escuro"` em cada card ao integrá-lo: ele mantém tanto os tokens de leitura quanto a iluminação WebGL escuros quando o tema da página muda. Cada card fornece sua paleta, seed e estilo em `data-orb-config`; o botão `.sdb-badge-card__orb` recebe o canvas sem alterar a região neutra do título. A simulação atualiza o estado, o degradê e a esfera juntos.

## Variações anteriores

Marco de estudo no acervo, privado: um emblema de ouro com glifo preto quando obtido; cinza, com cadeado e o critério, quando bloqueado.

## Anatomia
- `.sdb-achv` (cartão pequeno) > `.sdb-achv__emblem` (ícone do marco), `.sdb-achv__name` e, se bloqueada, `.sdb-achv__crit`.
- `.is-locked`: emblema em `fill-strong`, ícone `cadeado` e o critério visível.
- `.sdb-achv--row`: linha de lista (emblema, nome, critério ou o que fez, data em `.sdb-achv__when`); progresso parcial em texto ("6 de 10").
- `.sdb-achv--mini` dentro de `.sdb-achvs`: só o emblema, com `data-tip` e um `aria-label` no grupo listando as obtidas.

## Conquistas do portal
Porta aberta (primeira Sala visitada) · Cinco Salas (visitou as cinco) · Lado a lado (primeira comparação de tema) · Na fonte (leu 3 fontes primárias) · Vocabulário (abriu 10 verbetes) · Com as fontes (conferiu as fontes de uma resposta do assistente) · Degrau III (chegou ao Avançado em um assunto).

## Regras
- Ouro só no emblema, nunca em texto. Glifo em `on-gold` (preto).
- Ao ganhar, Toast no passado e sem "parabéns": "Conquista: Lado a lado."
- Tudo privado: sem perfil público, placar ou comparação entre pessoas. Os nomes falam de estudo, nunca de evolução espiritual.
- O membro pode desligar níveis e conquistas em Ajustes ("Mostrar níveis e conquistas").
