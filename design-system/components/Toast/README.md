# Toast

Confirmação breve, em cápsula de vidro centralizada embaixo.

- `SalaBuscadores.toast("Mensagem", {title, variant: "erro", action, onAction, icon, duration})` ou `data-toast` em qualquer botão.
- Materializa de baixo (escala 0,92 + desfoque → nítido) com mola; sai pelo mesmo caminho em 240 ms. Máximo de 3; o tempo pausa no hover.
- Frase no passado e específica ("Citação copiada"). Ações destrutivas oferecem "Desfazer".
