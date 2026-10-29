# Diagrama do banco

PostgreSQL no Supabase. Schema em Drizzle, um arquivo por módulo
(`portal/src/modules/<módulo>/<módulo>.schema.ts`), migrações em `portal/drizzle/`.
Ids em `text` (`u-…`, `c-…`, `m-…`, slugs das Salas oficiais). Datas editoriais em texto ISO,
como o domínio (`portal/src/data/types.ts`) as usa. Os bytes das imagens ficam no Supabase Storage (S3);
o banco guarda só a chave.

Todas as tabelas têm RLS ligado e nenhuma policy: a API pública do Supabase não lê nada, e o portal
conecta como dono das tabelas.

Estruturas aninhadas que são sempre lidas e gravadas junto com o item ficam em `jsonb`
(corpo do artigo, revisão do anfitrião, situação jurídica, progresso de estudo). Listas curtas de
referências ficam em `text[]` (temas e fontes do conteúdo, artigos do vídeo).

## Conta (`modules/conta`)

```mermaid
erDiagram
  usuarios ||--o{ sessoes : abre
  usuarios ||--o{ redefinicoes_senha : pede
  usuarios ||--o| progresso_estudo : tem
  usuarios ||--o| perfis_buscador : tem
  usuarios ||--o| perfis_anfitriao : tem
  usuarios ||--o{ candidaturas : envia

  usuarios {
    text id PK
    text email UK "minúsculo"
    text senha_hash "bcrypt custo 12"
    text pseudonimo
    papel papel "membro | anfitriao | administrador"
    timestamptz membro_desde
    jsonb preferencias "onboarding; convicção só com consentimento"
  }
  sessoes {
    text token_hash PK "sha256 do token do cookie"
    text usuario_id FK
    timestamptz criada_em
    timestamptz expira_em "30 dias"
  }
  redefinicoes_senha {
    text token_hash PK "sha256 do token do link"
    text usuario_id FK
    timestamptz expira_em "30 minutos, uso único"
  }
```

## Acervo (`modules/acervo`)

```mermaid
erDiagram
  salas ||--o{ conteudos : "sala (slug, on update cascade)"
  salas ||--o{ citacoes : ""
  salas ||--o{ videos : ""

  salas {
    text id PK "slug nas oficiais"
    text slug UK
    text nome
    text tradicao
    text tradicao_curta
    text descricao
    text periodo
    placa placa
    text atualizada_em
    text inicial
    origem_sala origem "oficial | anfitriao"
    boolean na_comparacao
    text imagem
    text link
    jsonb anfitriao "assinatura pública"
    status_editorial status
    text dono_id "anfitrião dono (indexado)"
    jsonb revisao "dono, envio, aceite, decisões"
    text publicada_em
    status_editorial status_antes_de_arquivar
    text midia
    text criado_em
    text atualizado_em
    text criado_por
    text atualizado_por
  }
  conteudos {
    text id PK
    text slug "UK (sala, slug)"
    text sala FK
    tipo_conteudo tipo
    text titulo
    text resumo
    text_arr temas
    text periodo
    integer nivel "1..3"
    formato formato
    proveniencia proveniencia
    integer duracao_min
    jsonb autoria
    text publicado_em
    jsonb corpo "blocos"
    text citacao
    text_arr fontes "ids, em ordem"
    jsonb link "youtube | site"
    text imagem
    text thumb
    jsonb anfitriao
    status_editorial status
    jsonb situacao_juridica
    boolean tema_divergente
    text nota_divergencia
    boolean producao_ia
    text dono_id
    jsonb revisao
    jsonb midias
    text criado_em
    text atualizado_em
    text criado_por
    text atualizado_por
  }
  citacoes {
    text id PK
    text sala FK
    text obra
    text localizacao
    proveniencia proveniencia
    text rotulo_selo
    jsonb original
    text traducao
    text rotulo_traducao
    text referencia
    placa capa
    text inicial
  }
  videos {
    text id PK
    text sala FK
    text titulo
    text duracao
    text tema
    integer nivel
    text episodio
    text publicado_em
    text url
    text youtube_id
    placa placa
    text imagem
    text_arr artigos "ids de conteúdos"
    status_editorial status
    text criado_em
    text atualizado_em
    text criado_por
    text atualizado_por
  }
  fontes {
    text id PK
    text titulo
    text autor
    text tradicao
    text tipo
    text referencia
    text url
    placa capa
    text inicial
    jsonb proposta "anfitrião que propôs, pendente"
    text criado_em
    text atualizado_em
    text criado_por
    text atualizado_por
  }
  destaques {
    integer id PK "linha única"
    jsonb escolha "vagas da curadoria"
  }
  temas {
    text slug PK
    text nome
    text_arr sinonimos "termos da busca, sem acento"
    text criado_em
    text criado_por
  }
```

## Anfitriões (`modules/anfitriao`)

```mermaid
erDiagram
  perfis_anfitriao {
    text conta_id PK, FK
    text nome
    text slug UK
    text credencial
    text apresentacao
    text avatar
    text link
    text atualizado_em
  }
  candidaturas {
    text id PK
    text conta_id FK
    text email
    text nome
    text credencial
    text apresentacao
    text link
    status_candidatura status
    text enviada_em
    text decidida_em
    text decidida_por
    text motivo
  }
  convites {
    text id PK
    text token UK "sha256 do token do link"
    text email
    text criado_em
    text expira_em "7 dias"
    text criado_por
    status_convite status
    text usado_em
    text revogado_em
  }
```

## Estudo, mídia e operação

```mermaid
erDiagram
  progresso_estudo {
    text usuario_id PK, FK
    jsonb dados "Salas, leituras, estante, conquistas"
  }
  perfis_buscador {
    text usuario_id PK, FK
    text foto_id
    text capa_id
    text sobre
  }
  midias {
    text id PK
    text chave "objeto no bucket S3"
    text tipo "image/png | image/jpeg | image/webp"
    integer tamanho
    text dono_id
    text criado_em
  }
  auditoria {
    text id PK
    text quando
    text quem
    text acao
    text tipo_item
    text item_id "indexado"
    text item_titulo
    jsonb mudancas
  }
  emails_enviados {
    text id PK
    text para
    text assunto
    text corpo
    text quando
  }
  versao_dados {
    integer id PK "linha única"
    bigint versao "soma 1 a cada gravação"
  }
```

## Comunidade (`modules/comunidade`)

```mermaid
erDiagram
  publicacoes ||--o{ comentarios : tem

  publicacoes {
    text id PK
    text autor_id
    text tipo "reflexao | citacao | pergunta | achado"
    text texto
    text sala_slug
    text_arr temas
    jsonb imagem
    jsonb citacao
    text conteudo_id
    text pergunta_dirigida_a
    text resposta_que_ajudou_id
    boolean fixada
    text estado "visivel | oculta | removida"
    text criada_em
    text editada_em
  }
  comentarios {
    text id PK
    text publicacao_id FK
    text autor_id
    text pai_id
    text texto
    jsonb imagem
    text estado
    text criada_em
  }
  reacoes {
    text alvo_tipo PK
    text alvo_id PK
    text pessoa PK
    text tipo "curtir | util | pensar | aprofundar"
  }
  seguindo {
    text seguidor PK
    text alvo_tipo PK "pessoa | sala"
    text alvo_id PK
  }
  salvos {
    text pessoa PK
    text publicacao_id PK
    text criado_em
  }
  denuncias {
    text id PK
    text denunciante_id
    text alvo_tipo
    text alvo_id
    text motivo
    text nota
    text estado "pendente | procedente | improcedente"
    text criada_em
    text decidida_por
    text motivo_decisao
  }
```

A comunidade ainda não tem escrita no portal: as tabelas existem e são lidas, e nascem vazias.
