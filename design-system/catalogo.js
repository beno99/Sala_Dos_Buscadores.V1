(() => {
  const allowed = ['solido-claro','solido-escuro','vidro-claro','vidro-escuro'];
  const theme = document.getElementById('cat-theme');
  const input = document.getElementById('cat-search');
  const groups = [...document.querySelectorAll('.cat-group')];
  const items = [...document.querySelectorAll('.cat-item')];
  const frames = [...document.querySelectorAll('.cat-frame')];
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f\s]/g,'').toLowerCase();
  let section = 'visao-geral';
  function sendTheme(frame) { if (frame.dataset.loaded) frame.contentWindow.postMessage({sdbTheme:theme.value},'*'); }
  function load(item) {
    const frame = item.querySelector('iframe');
    if (!frame.dataset.loaded) {
      frame.dataset.loaded = 'true';
      frame.src = frame.dataset.src + '?tema=' + encodeURIComponent(theme.value);
    }
  }
  function applyTheme(value) {
    if (!allowed.includes(value)) return;
    document.documentElement.dataset.theme = value;theme.value = value;
    try {localStorage.setItem('sdb-tema',value);} catch {}
    frames.forEach(sendTheme);
    document.querySelectorAll('[data-example-link]').forEach(link=>{link.href=link.dataset.exampleLink+'?tema='+value;});
  }
  theme.addEventListener('change',()=>applyTheme(theme.value));
  frames.forEach(frame=>frame.addEventListener('load',()=>sendTheme(frame)));
  items.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)load(item);}));
  function filter() {
    const query = normalize(input.value.trim());let count = 0;
    for (const group of groups) {
      let visible = 0;
      group.querySelectorAll('.cat-item').forEach(item=>{
        const matches = (query || section==='visao-geral' || group.id===section) && normalize(item.dataset.search).includes(query);
        item.hidden=!matches;if(matches)visible++;
      });
      group.hidden=!visible;count+=visible;
    }
    document.getElementById('cat-count').textContent=`${count} ${count===1?'componente':'componentes'}${query?(count===1?' encontrado':' encontrados'):''} · 4 temas`;
    document.getElementById('cat-empty').hidden=count>0;
    document.querySelector('.cat-intro').hidden=Boolean(query)||section!=='visao-geral';
    document.querySelector('.cat-feature-grid').hidden=Boolean(query)||section!=='visao-geral';
  }
  function route() {
    const requested=decodeURIComponent(location.hash.slice(1)||'visao-geral');
    const item=items.find(x=>x.id===requested);
    section=item?item.closest('.cat-group').id:groups.some(x=>x.id===requested)?requested:'visao-geral';
    input.value='';filter();
    document.querySelectorAll('.cat-navigation a').forEach(a=>{if(a.hash==='#'+section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const title=section==='visao-geral'?'Visão geral':document.querySelector('#'+section+' .cat-group__head h2').textContent;
    document.getElementById('cat-location').textContent=title;
    document.getElementById('cat-heading').textContent=section==='visao-geral'?'Explore a biblioteca':title;
    if(item){item.open=true;load(item);item.scrollIntoView({block:'start'});} else if(section!=='visao-geral')document.querySelector('.cat-library').scrollIntoView({block:'start'});
  }
  input.addEventListener('input',filter);
  window.addEventListener('hashchange',route);
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)&&!event.target.isContentEditable){event.preventDefault();input.focus();}if(event.key==='Escape'&&event.target===input){input.value='';filter();}});
  window.addEventListener('message',event=>{
    const frame=frames.find(f=>f.contentWindow===event.source);
    if(!frame)return;
    const h=event.data?.sdbAltura;
    if(Number.isFinite(h)&&h>0&&h<30000)frame.style.height=Math.ceil(h)+'px';
    if(event.data?.sdbNavigate && items.some(x=>x.id===event.data.sdbNavigate))location.hash=event.data.sdbNavigate;
  });
  applyTheme(document.documentElement.dataset.theme);route();
})();
