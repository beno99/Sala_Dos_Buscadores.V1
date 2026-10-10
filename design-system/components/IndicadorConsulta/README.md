# Indicador de consulta ao acervo

Mostra que o assistente está consultando o acervo, há quanto tempo e em que etapa.

- Card em material: cabeçalho com a escada de cinco degraus (acende em sequência, 1,25 s, linear) e o status com ponto pulsante; trilho de progresso por etapa; caixa interna com a pergunta e a lista de etapas; rodapé com tempo decorrido e "Interromper".
- Etapas reais: buscar, ler trechos, conferir fontes, escrever. Pendente: círculo vazado; atual: indicador girando; concluída: check preenchido.
- Tempo com uma casa decimal e vírgula ("3,2 s"), algarismos tabulares.
- Estados: consultando, concluído, interrompido, erro (ponto `critical` e instrução). Com movimento reduzido a escada fica parada; o tempo continua.
