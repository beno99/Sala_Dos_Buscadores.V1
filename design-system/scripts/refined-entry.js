(function(){
  const api = window.SDBRefined;
  const base = new URL('../',document.currentScript.src);
  window.SDBCatalog = {base:base.href};
  document.querySelectorAll('[role="tablist"]').forEach(list=>{
    const tabs=[...list.querySelectorAll('[role="tab"]')];
    const activate=(tab,focus=false)=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;const p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=!selected;});if(focus)tab.focus();};
    tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(e.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(e.key==='Home')next=tabs[0];if(e.key==='End')next=tabs.at(-1);if(next){e.preventDefault();activate(next,true);}});});
  });
  api.initializeSalaCards(document,{onSaveChange:({name,saved})=>window.SalaBuscadores.toast(`${name} ${saved?'salvo na estante.':'removido da estante.'}`)});
  api.initializeComparison(document.querySelector('[data-comparison]'));
  api.initializeAssistant(document);
  document.querySelectorAll('[data-preview-room]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const dialog=document.querySelector('dialog');if(!dialog)return;dialog.querySelector('#dialog-title').textContent=link.dataset.previewTitle||'Corpus Hermeticum';dialog.querySelector('[data-dialog-description]').textContent=link.dataset.previewDescription||'Hermetismo greco-egípcio · séculos I–III';dialog.showModal();}));
})();
