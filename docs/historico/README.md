# Histórico de entregas

Relatórios das revisões já concluídas, mantidos como registro. Não são instruções de operação; para operar o sistema, use [`../manual-operacao.md`](../manual-operacao.md).

| Arquivo | Conteúdo |
| --- | --- |
| `revisoes-2026-10-31.md` | Relatório final da revisão editorial de 31/10 (C01–C08) |
| `revisoes-2026-10-31-c01.md` · `-leitura.md` · `-videos.md` | Detalhes de cada frente da revisão de 31/10 |
| `lixeira-salas-2026-10-31.md` | Lixeira de Salas: implementação, reversão e operação |
| `refinamento-2026-11-02/relatorio.md` | Status por ID (P01–P34) do refinamento de 02/11 |
| `refinamento-2026-11-02/migracoes-aplicadas.md` | Registro das migrações 0008 e 0009 no banco configurado |
| `refinamento-2026-11-02/fontes-revisao.md` | Inventário de fontes gerado por `portal/scripts/inventariar-fontes.mjs` |
| `refinamento-2026-11-02/salas-revisao.md` | Revisão das Salas relatadas |

**Evidências removidas.** As capturas de tela e os JSON de resultados das revisões foram retirados da árvore de trabalho para deixar o repositório enxuto. Os relatórios ainda citam esses arquivos. Para recuperá-los, use o histórico do git anterior à limpeza de 05/11/2026, por exemplo `git show <commit>:docs/refinamento-2026-11-02/evidencias/<arquivo>`.

Os testes de navegador geram novas capturas em pastas `evidencias/`, que estão no `.gitignore`.
