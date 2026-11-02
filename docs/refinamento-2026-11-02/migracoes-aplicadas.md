# Aplicação das migrações — 02/11/2026

Após o usuário enviar captura do erro `column video_id does not exist`, foi confirmado que o banco configurado estava na migração 0007 e não tinha nenhuma das três novas colunas. Os hashes das oito migrações aplicadas foram comparados aos arquivos locais, sem divergência.

Antes da atualização foi criada cópia lógica de conteudos, publicacoes e auditoria, com metadados das colunas e histórico de migrações, fora do repositório em ~/.codex/backups/portal-2026-11-02-1793632781850/antes-0008-0009.json. Diretório protegido 0700 e arquivo 0600; o arquivo contém dados e não deve ser publicado. Não equivale a backup completo do banco/Storage.

Aplicadas pelo migrador oficial Drizzle: 0008_refinamento_portal e 0009_auditoria_ator. Confirmadas conteudos.lixeira JSONB, publicacoes.video_id texto e auditoria.ator_id texto, todas opcionais. Nenhum seed, atualização de conteúdo, exclusão ou mudança de papel foi executado.

Contagens antes/depois: 24/24 conteúdos, 1/1 publicação, 670/670 registros de auditoria. Endpoint /entrar retornava HTTP 500 e passou a HTTP 200 após aplicação. Banco e aplicação agora usam o mesmo contrato de colunas.

Reversão recomendada permanece manter as colunas aditivas e usar código compatível com a lixeira. Não remover colunas que já tenham recebido dados nem reexpor conteúdos excluídos por voltar a leitor antigo.
