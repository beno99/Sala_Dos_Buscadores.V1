# Campo de pergunta ao assistente

Onde a pessoa escreve para o assistente: cresce com o texto, oferece temas em chips e alterna entre enviar e interromper.

- Compositor em material espesso, raio `radius-xl`; texto em `reading` 18 px. Cresce de 1 a ~8 linhas (`data-autogrow`), depois rola. Contador até 2.000.
- Chips de sugestão preenchem o campo sem enviar. O escopo ("Todo o acervo", uma Sala) é um Menu que abre para cima.
- Botão circular primário: desabilitado com campo vazio; durante a geração vira **Interromper** (quadrado), no mesmo lugar e tamanho, e o campo fica somente leitura.
- Estados: vazio, preenchido, foco, gerando, interrompido, erro ("Não foi possível consultar o acervo. Sua pergunta foi mantida.").
