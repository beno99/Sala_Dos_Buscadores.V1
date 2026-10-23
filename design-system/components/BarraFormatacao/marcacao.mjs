/** Fonte única da gramática e das edições. Nenhuma string do autor vira HTML. */
export const MARCAS = {
  negrito: { abre: '**', fecha: '**', modelo: 'texto', tipo: 'strong' },
  sublinhado: { abre: '__', fecha: '__', modelo: 'texto', tipo: 'u' },
  italico: { abre: '_', fecha: '_', modelo: 'texto', tipo: 'em' },
  tachado: { abre: '~~', fecha: '~~', modelo: 'texto', tipo: 's' },
  termo: { abre: '*', fecha: '*', modelo: 'termo', tipo: 'dfn' },
  obra: { abre: '::', fecha: '::', modelo: 'obra', tipo: 'cite' },
  link: { abre: '[', fecha: '](endereço)', modelo: 'texto', tipo: 'a' },
};
export const ALTERNAVEIS = Object.keys(MARCAS);

export function enderecoSeguro(valor) {
  if (/[\s\\\u0000-\u001f\u007f]/.test(valor)) return null;
  if (/^\/(?!\/)/.test(valor)) return valor;
  if (!/^https:\/\//i.test(valor)) return null;
  try { return new URL(valor).protocol === 'https:' ? valor : null; } catch { return null; }
}

/** Nós sem HTML, com intervalos na string original para seleção e edição. */
export function renderizarTexto(texto) {
  const partes = [];
  const adicionar = (tipo, valor, inicio, fim, extra = {}) => {
    partes.push({ tipo, texto: valor, inicio, fim, ...extra });
  };
  let i = 0;
  while (i < texto.length) {
    const inicio = i;
    // Link antes de [n]; parênteses balanceados permitem URLs como /obra_(1908).
    if (texto[i] === '[') {
      const fecha = texto.indexOf('](', i + 1);
      if (fecha > i + 1 && !/[\[\]\n]/.test(texto.slice(i + 1, fecha))) {
        let fim = fecha + 2, profundidade = 1;
        while (fim < texto.length && profundidade) {
          if (texto[fim] === '(') profundidade++;
          if (texto[fim] === ')') profundidade--;
          fim++;
        }
        if (!profundidade) {
          const rotulo = texto.slice(i + 1, fecha), url = texto.slice(fecha + 2, fim - 1);
          const href = enderecoSeguro(url);
          const aninhado = /\*|_|~~|::/.test(rotulo);
          adicionar(aninhado || !href ? 'texto' : 'a', aninhado ? texto.slice(i, fim) : href ? rotulo : `${rotulo} (${url})`, i, fim,
            { href: href ?? undefined, marca: aninhado ? undefined : "link", rotulo, conteudoInicio: i + 1, conteudoFim: fecha });
          i = fim; continue;
        }
      }
      const ref = /^\[(\d+)\]/.exec(texto.slice(i));
      if (ref) {
        adicionar('ref', ref[1], i, i + ref[0].length, { n: Number(ref[1]) });
        i += ref[0].length; continue;
      }
    }
    // Delimitadores duplos têm precedência sobre os simples.
    const marca = Object.values(MARCAS).find(m => m.tipo !== 'a' && texto.startsWith(m.abre, i));
    if (marca) {
      const conteudoInicio = i + marca.abre.length;
      let fechamento = texto.indexOf(marca.fecha, conteudoInicio);
      // Um sinal simples não pode fechar na metade de um delimitador duplo interno.
      if (marca.fecha.length === 1) {
        while (fechamento >= 0 && (texto[fechamento - 1] === marca.fecha || texto[fechamento + 1] === marca.fecha))
          fechamento = texto.indexOf(marca.fecha, fechamento + 1);
      }
      if (fechamento > conteudoInicio) {
        const fim = fechamento + marca.fecha.length;
        const miolo = texto.slice(conteudoInicio, fechamento);
        const aninhado = /\*|_|~~|::|\[[^\]]+\]/.test(miolo);
        adicionar(aninhado ? 'texto' : marca.tipo, aninhado ? texto.slice(i, fim) : miolo, i, fim,
          { conteudoInicio, conteudoFim: fechamento });
        i = fim; continue;
      }
      // Um delimitador incompleto é literal, não o começo de outra marca menor.
      i += marca.abre.length;
    } else i++;
    adicionar('texto', texto.slice(inicio, i), inicio, i);
  }
  return partes;
}

function marcaNoIntervalo(texto, inicio, fim, marca) {
  return renderizarTexto(texto).find(p => (p.tipo === MARCAS[marca]?.tipo || (marca === "link" && p.marca === "link")) &&
    ((marca === "link" && inicio >= p.inicio && fim <= p.fim) || (inicio >= p.conteudoInicio && fim <= p.conteudoFim) || (inicio === p.inicio && fim === p.fim)));
}
export function jaMarcado(texto, inicio, fim, marca) { return !!marcaNoIntervalo(texto, inicio, fim, marca); }
function trocar(texto, inicio, fim, trecho, cursorInicio, cursorFim) {
  return { texto: texto.slice(0, inicio) + trecho + texto.slice(fim), trecho, inicio, fim, cursorInicio, cursorFim };
}
export function aplicarMarcacao(texto, inicio, fim, nome) {
  const marca = MARCAS[nome];
  const existente = marcaNoIntervalo(texto, inicio, fim, nome);
  if (existente) {
    const miolo = nome === 'link' ? existente.rotulo : existente.texto;
    return trocar(texto, existente.inicio, existente.fim, miolo, existente.inicio, existente.inicio + miolo.length);
  }
  const miolo = texto.slice(inicio, fim) || marca.modelo;
  const trecho = marca.abre + miolo + marca.fecha;
  const cursorInicio = nome === 'link' ? inicio + marca.abre.length + miolo.length + 2 : inicio + marca.abre.length;
  return trocar(texto, inicio, fim, trecho, cursorInicio, cursorInicio + (nome === 'link' ? 'endereço'.length : miolo.length));
}
export function textoSemMarcas(texto) {
  return renderizarTexto(texto).map(p => p.tipo === 'ref' ? `[${p.n}]` : p.texto).join('');
}
export function limparMarcacoes(texto, inicio, fim) {
  if (inicio === fim) { inicio = 0; fim = texto.length; }
  // Inclui os delimitadores de marcas que contêm a seleção para não deixá-los órfãos.
  const partes = renderizarTexto(texto).filter(p => p.tipo !== 'texto' && p.tipo !== 'ref' && p.inicio < fim && p.fim > inicio);
  for (const p of partes) { inicio = Math.min(inicio, p.inicio); fim = Math.max(fim, p.fim); }
  const trecho = textoSemMarcas(texto.slice(inicio, fim));
  return trocar(texto, inicio, fim, trecho, inicio, inicio + trecho.length);
}
export function citarFonte(texto, posicao, n) {
  const trecho = `[${n}]`;
  return trocar(texto, posicao, posicao, trecho, posicao + trecho.length, posicao + trecho.length);
}
export function textoDoBloco(bloco) {
  return typeof bloco === 'string' ? bloco : bloco.tipo === 'lista' ? bloco.itens.join('\n') : bloco.texto ?? '';
}
export function converterBloco(original, estilo) {
  const anterior = typeof original === 'string' ? {tipo:'paragrafo', texto:original} : original;
  const texto = textoDoBloco(anterior);
  let bloco;
  if (estilo === 'lista' || estilo === 'numerada') bloco = {tipo:'lista', itens:texto.split('\n'), ordenada:estilo === 'numerada'};
  else if (estilo === 'destaque') bloco = {tipo:'destaque', texto, atribuicao:anterior.atribuicao ?? ''};
  else if (estilo === 'titulo-2' || estilo === 'titulo-3') bloco = {tipo:'intertitulo', texto, nivel:estilo === 'titulo-2' ? 2 : 3};
  else bloco = {tipo:'paragrafo', texto};
  if (bloco.tipo === 'paragrafo' || bloco.tipo === 'intertitulo') {
    if (anterior.alinhamento) bloco.alinhamento = anterior.alinhamento;
  }
  const perdas = [];
  if (anterior.atribuicao && bloco.tipo !== 'destaque') perdas.push('a atribuição da citação');
  if (anterior.alinhamento && anterior.alinhamento !== 'esquerda' && !bloco.alinhamento) perdas.push('o alinhamento');
  if (anterior.recuo) perdas.push('o recuo');
  return {bloco, aviso:perdas.length ? `Conversão removeu ${perdas.join(' e ')}. O texto foi preservado.` : ''};
}

/** Executar somente na migração de conteúdo v1, nunca a cada renderização. */
export function migrarTextoLegado(texto) {
  return texto.replace(/\[[^\][]+\]\([^\s]*\)|_([^_]+)_/g, (inteiro, obra) => obra === undefined ? inteiro : `::${obra}::`);
}
