# Pendências de decisão

Itens que dependem de decisão da curadoria ou de confirmação externa. Nenhum deles deve ser implementado por suposição. Origem: relatório de 02/11/2026 (`historico/refinamento-2026-11-02/relatorio.md`).

1. **Curador principal.** Definir quem pode atribuir e revogar contas de curadoria. Hierarquia e promoção de curadores estão pendentes; a matriz do curador principal não foi alterada.
2. **Inbox e agenda.** Definir participantes, operações, retenção e o modelo de agenda antes de ativar. Os contatos oficiais aguardam URLs e e-mail confirmados.
3. **Jornada do Buscador.** A estrutura está aprovada. Critérios numéricos, elegibilidade, privacidade e eventos versionados precisam de decisão da curadoria antes da ativação. Conquistas existentes não foram convertidas nem removidas.
4. **P13 (fontes).** Decidir quais IDs de fontes realmente devem sair. Nenhuma exclusão sem decisão por ID.
5. **P22 (Salas relatadas).** Identificar as quatro Salas relatadas e se pertencem a outro ambiente ou status.
6. **Homologação real.** Falta homologar com sessões HTTP de Buscador, dois anfitriões e dois curadores; SMTP, Storage, provedor de IA e YouTube; múltiplos processos PostgreSQL; teclado virtual, dispositivos físicos, zoom de 200% e acessibilidade integrada.
7. **Concorrência.** Os locks do acervo atual são amplos e podem aumentar a espera sob carga; preserve o protocolo ao otimizar. Bytes no S3 e envio externo de e-mail não fazem parte da transação PostgreSQL. A auditoria de criação de Sala é posterior à reserva atômica do slug.
