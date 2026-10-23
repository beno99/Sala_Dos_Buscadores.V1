const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const {JSDOM} = require(path.join(root, 'portal/node_modules/jsdom'));
const names = ['IconeVolume','EstadoSecao','CarregamentoSala','ProgressoReal','AvisoContextual','DialogoContextual'];
const runtime = fs.readFileSync(path.join(root, 'design-system/components/EstadosInterface/estados-interface.js'),'utf8');
for (const name of names) {
 const html=fs.readFileSync(path.join(root, `design-system/exemplos/${name}.html`),'utf8');
 assert.match(html,/EstadosInterface\/estados-interface.css/);
 assert.match(html,/EstadosInterface\/estados-interface.js/);
 const dom=new JSDOM(html,{runScripts:'outside-only'});
 dom.window.eval(runtime);
 dom.window.SalaInterface.hydrate();
 for(const el of dom.window.document.querySelectorAll('[data-ui-volume]')) assert.ok(el.querySelector('svg'));
 if(name==='EstadoSecao') {
  for(const script of dom.window.document.querySelectorAll('script:not([src])')) dom.window.eval(script.textContent);
  dom.window.document.querySelector('[data-state="erro"]').click();
  assert.match(dom.window.document.getElementById('empty-title').textContent,/Erro:/);
 }
 if(name==='ProgressoReal') {
  const root=dom.window.document.querySelector('.sdb-ui-progress');
  for(const [done,total,pct,hidden] of [[2,3,'67%',false],[-1,3,'0%',false],[9,3,'100%',false],[1,0,'—',true],[NaN,3,'—',true]]) {
   dom.window.SalaInterface.atualizarProgresso(root,done,total);
   assert.equal(root.querySelector('[data-ui-percent]').textContent,pct);
   assert.equal(root.querySelector('progress').hidden,hidden);
  }
 }
 dom.window.close();
}
console.log('6 exemplos e estados de progresso verificados.');
