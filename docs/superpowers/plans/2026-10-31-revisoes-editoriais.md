# Revisões editoriais C01–C08 — plano de implementação

**Objetivo:** executar a especificação v2 de 31/10/2026 fornecida nesta conversa, preservando dados, URLs, permissões e rascunhos.
**Arquitetura:** regras puras compartilhadas por formulário/servidor, criação de slug resolvida atomicamente no PostgreSQL, componentes de leitura e Design System como fonte única. Sem publicação automática nem alteração do banco conectado para testes.
**Stack:** Next.js 16, React 19, TypeScript, Drizzle/PostgreSQL, node:test/tsx e Chrome para validação.

- [x] C01: reproduzir troca de slug/colisão, testar criação concorrente, gerar endereço no servidor e preservar existente no banco; retirar campo editável. Arquivos: regras/sala, server/admin/salas, server/anfitriao/editorial, repositório acervo e EditorSalaOficial.
- [x] C02/C05: testar Unicode e legado manual; implementar inicialDoTitulo em lib/texto, usá-la em fonteParaForm/salvarFonte/CamposFonte/CardFonte e capas de artigo, sem novos campos persistidos nem regravação em massa.
- [x] C03/C04/C07: reproduzir recorte no editor e selo longo, corrigir CSS canônico, upload preservando original, dimensões recomendadas da coluna real e metadados do arquivo; medir 390/768/1280/1440 e zoom200.
- [x] C06: testes de abertura vazia, mensagens claras e foco após reordenação; identidade estável dos blocos, checklist dinâmico e orientação por entidade derivada das regras; manual completo com matriz salvar/publicar e exemplos explicitamente demonstrativos.
- [x] C08: rastrear vínculo por ID, testar salvar/reabrir/remover e projeção pública, lista recente com busca/paginação e seleção persistente; parser YouTube e thumbnail com fallback, erro, retry e descarte de resposta antiga.
- [x] Integração: regenerar DS, contraste, sync; check, testes de regressão, build; capturas sem dados pessoais, relatório C01–C08 e reversão.

Restrições: não editar derivados manualmente, não enviar segredos aos artefatos, não publicar fixtures, não remover exclusões locais preexistentes em docs/figma/conta-onboarding. Fotos WhatsApp referidas não encontradas no checkout inicial.

Entrega e limites da verificação: [relatório final](../../revisoes-2026-10-31.md). Zoom foi verificado por reflow equivalente; homologação autenticada e concorrência entre sessões reais permanecem documentadas como limites.
