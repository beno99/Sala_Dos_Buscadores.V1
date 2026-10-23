import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as m from './marcacao.mjs';

test('cada sinal produz apenas o elemento permitido, na ordem correta', () => {
  const partes = m.renderizarTexto('**forte** _ênfase_ __linha__ ~~fora~~ *gnose* ::Hermetica:: [obra](https://example.org)[1]');
  assert.deepEqual(partes.filter(p => p.tipo !== 'texto').map(p => [p.tipo, p.texto]), [
    ['strong','forte'], ['em','ênfase'], ['u','linha'], ['s','fora'], ['dfn','gnose'], ['cite','Hermetica'], ['a','obra'], ['ref','1'],
  ]);
});
test('texto simples e HTML do autor permanecem texto', () => {
  for (const texto of ['Sem sinais.', '<img src=x onerror=alert(1)>'])
    assert.equal(m.renderizarTexto(texto).map(p => p.texto).join(''), texto);
  assert.equal(m.renderizarTexto('<b>x</b>')[0].tipo, 'texto');
});
test('marcas aninhadas ficam integralmente visíveis', () => {
  for (const texto of ['**_texto_**', '__**texto**__', '*_texto_*', '**texto *termo* fim**', '*a **b** c*', '_a __b__ c_']) {
    assert.equal(m.renderizarTexto(texto).map(p => p.texto).join(''), texto);
    assert.ok(m.renderizarTexto(texto).every(p => p.tipo === 'texto'));
  }
});
test('links aceitam apenas https e caminhos realmente internos', () => {
  for (const url of ['javascript:alert(1)', 'http://example.org', '//evil.org', '/\\evil.org', 'data:text/html,x']) {
    const p = m.renderizarTexto(`[obra](${url})`);
    assert.ok(p.every(p => p.tipo !== 'a'));
    assert.equal(p.map(p => p.texto).join(''), `obra (${url})`);
  }
  assert.equal(m.renderizarTexto('[1](/salas)')[0].tipo, 'a');
  assert.equal(m.renderizarTexto('[obra](https://example.org/a_(b))')[0].href, 'https://example.org/a_(b)');
});
test('referência sem fontes continua representada e numerada', () => {
  assert.deepEqual(m.renderizarTexto('[2]').map(p => [p.tipo, p.texto, p.n]), [['ref','2',2]]);
});
test('cursor dentro e seleção parcial detectam e removem a marca inteira', () => {
  assert.equal(m.jaMarcado('a **gnose**.', 5, 5, 'negrito'), true);
  assert.equal(m.aplicarMarcacao('a **gnose**.', 5, 7, 'negrito').texto, 'a gnose.');
  assert.equal(m.jaMarcado('**x**', 2, 3, 'termo'), false);
});
test('marca, modelo, endereço e limpeza devolvem seleções úteis', () => {
  for (const [marca, sinal] of [['negrito','**'],['italico','_'],['sublinhado','__'],['tachado','~~'],['obra','::']]) {
    const e = m.aplicarMarcacao('',0,0,marca);
    assert.equal(e.texto, `${sinal}${marca === 'obra' ? 'obra' : 'texto'}${sinal}`);
    assert.equal(e.texto.slice(e.cursorInicio,e.cursorFim), marca === 'obra' ? 'obra' : 'texto');
  }
  const link = m.aplicarMarcacao('endereço da obra', 0, 16, 'link');
  assert.equal(link.texto.slice(link.cursorInicio,link.cursorFim), 'endereço');
  assert.equal(link.cursorInicio, '[endereço da obra]('.length);
  assert.equal(m.limparMarcacoes('**a** _b_ __c__ ~~d~~ *e* ::f:: [g](/s)[1]',0,0).texto,'a b c d e f g[1]');
});
test('conversão em lista e retorno preservam todas as linhas', () => {
  const p = {tipo:'paragrafo',texto:'Primeiro\n\nTerceiro',alinhamento:'centro'};
  const l = m.converterBloco(p,'lista');
  assert.deepEqual(l.bloco, {tipo:'lista',itens:['Primeiro','','Terceiro'],ordenada:false});
  assert.ok(l.aviso);
  assert.equal(m.converterBloco(l.bloco,'paragrafo').bloco.texto,p.texto);
  assert.ok(m.converterBloco({tipo:'destaque',texto:'Frase',atribuicao:'Obra'},'paragrafo').aviso);
});

test('migração da gramática antiga preserva links e transforma somente obras', () => {
  assert.equal(m.migrarTextoLegado('Leia _O Caibalion_ e *gnose* em [obra](https://x.org/a_b_c).'), 'Leia ::O Caibalion:: e *gnose* em [obra](https://x.org/a_b_c).');
});

test('um link existente pode ser desmarcado com cursor no endereço', () => {
  const texto='[obra](https://example.org)';
  assert.equal(m.jaMarcado(texto,9,9,'link'),true);
  assert.equal(m.aplicarMarcacao(texto,9,9,'link').texto,'obra');
  const modelo=m.aplicarMarcacao('',0,0,'link');
  assert.equal(m.aplicarMarcacao(modelo.texto,modelo.cursorInicio,modelo.cursorFim,'link').texto,'texto');
});
