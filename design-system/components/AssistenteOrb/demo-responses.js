export const assistantSuggestions = [
  'O que é o Pleroma?',
  'Como o Poimandres descreve a criação?',
  'O que acontece com a alma após a morte?',
];

// Exemplos locais do catálogo original. Este módulo não consulta uma IA.
const examples = {
  pleroma: {
    text: 'Nos textos gnósticos de Nag Hammadi, o Pleroma é a totalidade da esfera divina, habitada pelos éons. Segundo o Apócrifo de João, a queda de Sofia ocorre fora dele.',
    source: 'Interpretação editorial · Glossário · Pleroma · Sala Nag Hammadi',
    tab: 'salas',
  },
  creation: {
    text: 'Segundo o Tratado I, Hermes vê primeiro uma luz sem limites, que o texto identifica com a Mente, e depois uma escuridão úmida. Da luz sai o Logos, que separa os elementos, e uma segunda Mente, artífice, forma os sete governadores.',
    source: 'Síntese de exemplo · Corpus Hermeticum, Tratado I, §4–11 · Copenhaver, 1992',
    tab: 'salas',
  },
  death: {
    text: 'No Poimandres (Tratado I, 24–26), o corpo se dissolve e a alma sobe pelas sete esferas, devolvendo a cada uma a paixão que dela recebeu, até chegar à Ogdóade e entrar em Deus.',
    source: 'Comparativo · Corpus Hermeticum · CH I, 24–26 · trad. Copenhaver, 1992',
    tab: 'comparativos',
  },
};

/**
 * @param {string} question
 * @returns {{text: string, source: string, tab?: 'salas' | 'comparativos'}}
 */
export function getDemoResponse(question) {
  const normalized = String(question ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  // O tema da morte tem prioridade quando a pergunta também cita Poimandres.
  if (/\b(morte|morrer|morremos|falecimento|pos[- ]morte)\b/.test(normalized)) {
    return { ...examples.death };
  }

  if (/\b(pleroma|gnose|gnosticismo|gnosticos?|sofia|eons?|demiurgo|arcontes?)\b/.test(normalized)) {
    return { ...examples.pleroma };
  }

  if (/\b(poimandres|criacao|cosmogonia)\b|\borigem (do universo|do mundo)\b/.test(normalized)) {
    return { ...examples.creation };
  }

  return {
    text: 'Esta prévia usa respostas de exemplo e não está conectada a uma IA. Experimente perguntar “O que é o Pleroma?”, “Como o Poimandres descreve a criação?” ou “O que acontece com a alma após a morte?”.',
    source: 'Prévia local · respostas de exemplo',
  };
}
