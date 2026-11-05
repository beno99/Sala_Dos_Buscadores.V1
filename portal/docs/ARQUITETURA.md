# Arquitetura do portal

Padrões adaptados dos projetos OxyRH e OxyDocs para este app (Next.js 16, App Router, Server Actions, PostgreSQL via Drizzle). Visão de produto e comandos estão em [`../README.md`](../README.md) e [`../../CLAUDE.md`](../../CLAUDE.md).

## Camadas

Uma direção só: `app` → `features` → `server` / `data` → banco e armazenamento.

| Camada | Pasta | Papel | Regra |
| --- | --- | --- | --- |
| Rotas | `src/app/` | página busca dados e compõe componentes; API e rotas reexportam handlers | sem regra de negócio |
| Telas | `src/features/<área>/` | componentes e `ui/` da área | nada de banco; regras puras em `regras/` |
| Regras | `src/features/<área>/regras/` | funções puras, sem React, sem HTTP | testáveis sem mock |
| Servidor | `src/server/<área>/` | Server Actions (`"use server"`), sessão e permissão | toda ação confere papel e posse |
| Dados | `src/data/`, `src/modules/` | repositório, contratos, schema Drizzle | telas leem só o publicado |
| Biblioteca | `src/components/ds/`, `src/design-system/` | design system | `design-system/` é a origem |

Feature não importa `app/`. Cliente não importa código de servidor fora de Server Action: o guarda `check:arquitetura` barra isso.

## Dados e erros

- Leitura de tela no servidor, em `page.tsx` ou `server/`, com chamadas independentes em `Promise.all`.
- Escrita por Server Action com retorno de resultado explícito. Erro de regra vira mensagem em português; nunca lança para a tela sem tratamento.
- Ação do usuário com falha: `toast` (sonner). Não use `alert()` (guardado).
- Acervo em snapshot: escrita só por `set`/`delete` (ver `CLAUDE.md`).

## Formulários

Padrão alvo: `react-hook-form` + `zod`, schema ao lado do formulário (`<form>-schema.ts`), `z.infer` como tipo dos valores, mensagens de validação em português no schema. Estado local só para o que não é dado do formulário.

Estado atual: a maioria dos formulários usa `useState`. Migram quando forem alterados, não em refatoração em massa.

## Estilo

- Comentários no código: não. Exceção pontual só com motivo, em `biome-ignore` (`// biome-ignore lint/<grupo>/<regra>: <motivo>`).
- Nomes em inglês no código (funções, tipos, variáveis); termos do negócio sem tradução boa ficam em português (`salvarSalaAcao`, `coligada`).
- Textos da interface e mensagens em português.
- Biome é a fonte da verdade (`biome.jsonc`).
- Visual só pelo design system: classes `sdb-*` e tokens, sem cor fixa nem CSS solto (ver `design-system/DIRETRIZES.md`).

## Testes

- Não criar arquivos de teste para ajustes pequenos (decisão do time, ver `CLAUDE.md`). Validar com `bun run check` e no navegador.
- Regras puras (`regras/`) são o alvo natural de teste quando houver teste novo.

## Guarda de arquitetura (ratchet)

`scripts/check-arquitetura.mjs` roda no `bun run check`. Conta violações por regra e compara com o teto gravado em `scripts/arquitetura-baseline.json`:

| Regra | Teto atual | Meta |
| --- | --- | --- |
| `comentarios_de_codigo` | 2320 | 0 |
| `alert_nativo` | 0 | 0 |
| `http_direto_em_tela` | 3 | 0 |
| `cliente_importa_servidor` | 0 | 0 |

- Violação nova falha o `check`.
- Quando uma violação some, o script avisa para reduzir o teto: `bun run node scripts/check-arquitetura.mjs --gerar`.
- O teto só desce. Subir o teto é decisão explícita, com justificativa no MR.

## Dívida conhecida

1. Comentários: 2320 linhas, a maioria de seção (`// ---------- ... ----------`). Remover ao tocar no arquivo.
2. Formulários sem `react-hook-form`/`zod` na maioria das telas.
3. Três telas com `fetch` ou `ky` direto.
