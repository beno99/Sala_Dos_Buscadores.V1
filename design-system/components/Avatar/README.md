# Avatar

Identifica quem assina: iniciais em círculo; nunca foto de perfil.

- Tamanhos `--sm` 28, padrão 40, `--lg` 56, `--xl` 80. Cores: bordô (padrão), `--ink`, `--soft`; `--ai` usa vidro com o arco.
- Grupo: `.sdb-avatars` sobrepõe 28% com anel na cor do fundo (`--sdb-ring`).
- A autoria no portal é texto (`.sdb-byline`: nome + credencial); não há página de perfil.

## Anfitriões (1.0.2)

Exceção única à regra das iniciais: na página pública do anfitrião (`/anfitrioes/[slug]`) e no perfil que ele edita, o Avatar pode mostrar a imagem que o próprio anfitrião enviou: `span.sdb-avatar.sdb-avatar--xl.sdb-avatar--foto > img[alt=""]`. Sem imagem, iniciais. Na assinatura de Salas e artigos, continua só texto com iniciais. A página do anfitrião é a única página de perfil do portal.

## Foto do buscador (out 2026)

Desde o layout do Figma "Jornada do buscador", o Avatar mostra a foto que a própria pessoa enviou também no topo da lateral (`.sdb-sidenav__profile--foto`, 78 px) e na página de Perfil: `span.sdb-avatar.sdb-avatar--foto > img[alt=""]`. Sem foto, iniciais. Nunca foto de terceiros nem gerada por IA. Na assinatura de artigos e no menu da conta, continua com iniciais.

## Comunidade · Fase A

Na Comunidade, use a foto que a própria pessoa enviou ou suas iniciais, também nas publicações e comentários. A autoria pública pode levar ao perfil. Esta variação não altera as assinaturas editoriais do acervo.
