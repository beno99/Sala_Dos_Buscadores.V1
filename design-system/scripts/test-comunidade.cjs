const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { JSDOM } = require('../../portal/node_modules/jsdom');
const root = resolve(__dirname, '..');
function demo() {
  const dom = new JSDOM(readFileSync(resolve(root,'components/Comunidade/preview.html'),'utf8'),{runScripts:'outside-only'});
  dom.window.SalaBuscadores={hydrate(){},toast(){}};
  dom.window.eval(readFileSync(resolve(root,'components/Comunidade/demo.js'),'utf8'));
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return dom;
}
function change(dom, field, value) {
  if (field.type === 'radio' || field.type === 'checkbox') field.checked = value;
  else field.value = value;
  field.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
}
test('todos os controles e rótulos referenciam ids existentes e únicos',()=>{
  const dom=demo(), d=dom.window.document;
  const ids=[...d.querySelectorAll('[id]')].map(n=>n.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const n of d.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby],label[for]')) {
    for(const attr of ['aria-controls','aria-labelledby','aria-describedby','for']) {
      for(const id of (n.getAttribute(attr)||'').split(' ').filter(Boolean)) assert.ok(d.getElementById(id),id);
    }
  }
  assert.equal(d.querySelector('select[name=sala] option[value="corpus-hermeticum"]').textContent,'Corpus Hermeticum');
  dom.window.close();
});
test('citação exige os três campos e troca de tipo desativa campos anteriores',()=>{
  const dom=demo(), f=dom.window.document.querySelector('[data-community-composer]'), b=f.querySelector('[data-community-submit]');
  change(dom,f.elements.texto,'Minha nota de estudo.');
  change(dom,f.querySelector('[value=citacao]'),true);
  assert.equal(b.disabled,true);
  for(const name of ['trecho','obra','passagem']) change(dom,f.elements[name],name);
  assert.equal(b.disabled,false);
  change(dom,f.querySelector('[value=pergunta]'),true);
  assert.equal(f.elements.trecho.matches(':disabled'),true);
  assert.equal(f.elements.sala.required,true);
  assert.equal(b.disabled,true);
  change(dom,f.elements.sala,'corpus-hermeticum');
  assert.equal(b.disabled,false);
  dom.window.close();
});
test('até três temas e comentários vazios ficam bloqueados; contador só perto do limite',()=>{
  const dom=demo(), d=dom.window.document, themes=[...d.querySelectorAll('[name=temas]')];
  themes.slice(0,3).forEach(t=>change(dom,t,true));
  assert.equal(themes[3].disabled,true);
  change(dom,themes[0],false); assert.equal(themes[3].disabled,false);
  const f=d.querySelector('[data-community-comment]'), b=f.querySelector('[data-community-submit]'), counter=f.querySelector('[data-community-counter]');
  change(dom,f.elements.comentario,'   '); assert.equal(b.disabled,true);
  change(dom,f.elements.comentario,'Minha leitura.'); assert.equal(b.disabled,false);assert.equal(counter.hidden,true);
  change(dom,f.elements.comentario,'a'.repeat(480)); assert.equal(counter.hidden,false);
  dom.window.close();
});
test('curtir mantém estado acessível, contagem e reversão consistentes',()=>{
  const dom=demo(), b=dom.window.document.querySelector('[data-community-like]');
  b.click(); assert.equal(b.getAttribute('aria-pressed'),'true');assert.match(b.getAttribute('aria-label'),/6 curtidas/);
  b.click(); assert.equal(b.getAttribute('aria-pressed'),'false');assert.match(b.getAttribute('aria-label'),/5 curtidas/);
  dom.window.close();
});
