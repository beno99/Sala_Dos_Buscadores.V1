/* Runtime da peça. Incluído pelo gerador dentro do bundle, após as funções puras. */
function initFormatacao(bar) {
  if (bar._formatacao) return;
  const campo = document.getElementById(bar.dataset.fmtFor) || bar.parentNode.querySelector('textarea');
  if (!campo) return;
  bar._formatacao = true;
  const alvo = bar.dataset.fmtAlvo || bar.getAttribute('aria-label')?.replace(/^Formatação d[oa] /, '') || 'bloco';
  const fontes = Array.from(bar.querySelectorAll('[data-fmt-ref]')).map(b => ({n:b.dataset.fmtRef, titulo:b.textContent}));
  const inicial = bar.dataset.fmtBloco ? JSON.parse(bar.dataset.fmtBloco) : {tipo:'paragrafo',texto:campo.value};
  bar._bloco = inicial;
  campo.value = textoDoBloco(inicial);
  bar.replaceChildren();
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', `Formatação do ${alvo}`);
  const criar = (tag, classe, texto) => {
    const el = document.createElement(tag); el.className = classe;
    if (texto) el.textContent = texto;
    return el;
  };
  const botao = (rotulo, icone, acao, grupo = bar) => {
    const b = criar('button', `sdb-fmt__btn${icone ? ' sdb-fmt__btn--icone' : ''}`);
    b.type = 'button'; b.tabIndex = -1;
    b.setAttribute('aria-label', `${rotulo} no ${alvo}`);
    b.dataset.tip = `${rotulo} no ${alvo}`;
    if (icone) b.innerHTML = icon(icone, 'sdb-icon--sm'); // SVG da biblioteca, nunca conteúdo do autor.
    else b.textContent = rotulo;
    b.addEventListener('click', () => { if (b.getAttribute('aria-disabled') !== 'true') acao(); });
    grupo.appendChild(b); return b;
  };
  const sep = () => { const s = criar('span','sdb-fmt__sep'); s.setAttribute('aria-hidden','true'); bar.appendChild(s); };
  const estilo = criar('select','sdb-fmt__estilo');
  estilo.setAttribute('aria-label', `Estilo do ${alvo}`);
  for (const [valor, nome] of [['paragrafo','Parágrafo'],['titulo-2','Título'],['titulo-3','Subtítulo'],['destaque','Citação'],['lista','Lista com marcadores'],['numerada','Lista numerada']]) {
    const o = criar('option','',nome); o.value = valor; estilo.appendChild(o);
  }
  estilo.disabled = bar.hasAttribute('data-fmt-inline');
  estilo.title = estilo.disabled ? 'Este campo aceita apenas parágrafos.' : '';
  bar.appendChild(estilo); sep();
  const marcas = {};
  const mod = /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘' : 'Ctrl+';
  for (const [nome, rotulo, tecla] of [['negrito','Negrito','B'],['italico','Itálico','I'],['sublinhado','Sublinhado','U'],['tachado','Tachado','']]) {
    marcas[nome] = botao(rotulo,nome,() => marcar(nome));
    if (tecla) marcas[nome].dataset.tip += ` (${mod}${tecla})`;
  }
  sep();
  const listas = {};
  for (const [tipo,rotulo,icone] of [['lista','Lista com marcadores','listaMarcadores'],['numerada','Lista numerada','listaNumerada']])
    listas[tipo] = botao(rotulo,icone,() => converter(bar._bloco.tipo === 'lista' && bar._bloco.ordenada === (tipo === 'numerada') ? 'paragrafo' : tipo));
  sep();
  const grupo = criar('div','sdb-fmt__grupo'); grupo.setAttribute('role','group'); grupo.setAttribute('aria-label',`Alinhamento do ${alvo}`); bar.appendChild(grupo);
  const alinhar = {};
  for (const [valor,rotulo,icone] of [['esquerda','Alinhar à esquerda','alinharEsquerda'],['centro','Centralizar','alinharCentro'],['direita','Alinhar à direita','alinharDireita']])
    alinhar[valor] = botao(rotulo,icone,() => { bar._bloco = {...bar._bloco, alinhamento:valor}; atualizar(); campo.focus(); },grupo);
  sep();
  marcas.link = botao('Link','link',() => marcar('link')); marcas.link.dataset.tip += ` (${mod}K)`;
  marcas.termo = botao('Termo',null,() => marcar('termo'));
  marcas.obra = botao('Obra',null,() => marcar('obra'));
  const wrap = criar('div','sdb-menu-wrap'); bar.appendChild(wrap);
  const fonte = botao('Citar fonte',null,() => {},wrap);
  fonte.dataset.menuTrigger = ''; fonte.setAttribute('aria-haspopup','menu'); fonte.setAttribute('aria-expanded','false');
  const menu = criar('div','sdb-menu'); menu.setAttribute('role','menu'); wrap.appendChild(menu);
  for (const f of fontes) {
    const b = criar('button','sdb-menu__item',f.titulo); b.type='button'; b.setAttribute('role','menuitem'); b.tabIndex=-1;
    b.addEventListener('click', () => { escrever(citarFonte(campo.value,campo.selectionEnd,Number(f.n))); requestAnimationFrame(() => campo.focus()); }); menu.appendChild(b);
  }
  if (!fontes.length) { fonte.removeAttribute('data-menu-trigger'); fonte.setAttribute('aria-disabled','true'); fonte.dataset.tip='Escolha uma obra em Fontes'; }
  botao('Limpar formatação','limparFormato',() => {
    if ('alinhamento' in bar._bloco) bar._bloco.alinhamento='esquerda';
    escrever(limparMarcacoes(campo.value,campo.selectionStart,campo.selectionEnd));
  });
  if (bar.hasAttribute('data-fmt-inline')) {
    const seps = bar.querySelectorAll(':scope > .sdb-fmt__sep');
    for (const el of [estilo, ...Object.values(listas), grupo, seps[0], seps[1], seps[2]]) el.hidden = true;
  }
  function escrever(edicao) {
    campo.focus(); campo.setSelectionRange(edicao.inicio,edicao.fim);
    let entrada = false;
    const ouvir = () => { entrada = true; };
    campo.addEventListener('input',ouvir);
    try { document.execCommand('insertText',false,edicao.trecho); } catch {}
    campo.removeEventListener('input',ouvir);
    if (campo.value !== edicao.texto) { campo.value=edicao.texto; entrada=false; }
    if (!entrada) campo.dispatchEvent(new Event('input',{bubbles:true}));
    campo.setSelectionRange(edicao.cursorInicio,edicao.cursorFim); atualizar();
  }
  function marcar(marca) { if (!campo.readOnly && !campo.disabled) escrever(aplicarMarcacao(campo.value,campo.selectionStart,campo.selectionEnd,marca)); }
  function converter(tipo) {
    const resultado=converterBloco(bar._bloco,tipo); bar._bloco=resultado.bloco;
    campo.value=textoDoBloco(bar._bloco); atualizar(); campo.focus();
    if (resultado.aviso) toast(resultado.aviso);
  }
  function atualizar() {
    const b=bar._bloco;
    estilo.value=b.tipo === 'intertitulo' ? `titulo-${b.nivel || 2}` : b.tipo === 'lista' ? (b.ordenada ? 'numerada' : 'lista') : b.tipo;
    for (const [nome,botao] of Object.entries(marcas)) botao.setAttribute('aria-pressed',String(jaMarcado(campo.value,campo.selectionStart,campo.selectionEnd,nome)));
    for (const [tipo,botao] of Object.entries(listas)) {
      botao.setAttribute('aria-pressed',String(b.tipo === 'lista' && b.ordenada === (tipo === 'numerada')));
      botao.setAttribute('aria-disabled',String(b.tipo === 'intertitulo' || bar.hasAttribute('data-fmt-inline')));
      botao.dataset.tip=b.tipo === 'intertitulo' ? 'Títulos não têm lista. Escolha Parágrafo primeiro.' : botao.getAttribute('aria-label');
    }
    for (const [valor,botao] of Object.entries(alinhar)) {
      const habilitado=!bar.hasAttribute('data-fmt-inline') && (b.tipo === 'paragrafo' || b.tipo === 'intertitulo');
      botao.setAttribute('aria-pressed',String(habilitado && (b.alinhamento || 'esquerda') === valor));
      botao.setAttribute('aria-disabled',String(!habilitado));
      botao.dataset.tip=habilitado ? botao.getAttribute('aria-label') : 'Alinhamento disponível em parágrafos e títulos.';
    }
    const preview = document.querySelector(`[data-fmt-preview-for="${campo.id}"]`);
    if (preview) {
      preview.replaceChildren();
      const no = criar(b.tipo === 'lista' ? (b.ordenada ? 'ol' : 'ul') : b.tipo === 'intertitulo' ? (b.nivel === 3 ? 'h3' : 'h2') : b.tipo === 'destaque' ? 'blockquote' : 'p',`sdb-body sdb-texto--${b.alinhamento || 'esquerda'}`);
      function textoEm(el,texto) {
        for (const p of renderizarTexto(texto)) {
          if (p.tipo === 'texto') { el.appendChild(document.createTextNode(p.texto)); continue; }
          const filho=criar(p.tipo === 'ref' ? 'span' : p.tipo,p.tipo === 'ref' ? 'sdb-ref' : p.tipo === 'a' ? 'sdb-link' : '',p.texto);
          if (p.tipo === 'ref') { const sr=criar('span','sdb-sr','Fonte '); filho.prepend(sr); }
          if (p.tipo === 'a') { filho.setAttribute('href',p.href); if (!p.href.startsWith('/')) {filho.target='_blank';filho.rel='noopener noreferrer';} }
          el.appendChild(filho);
        }
      }
      if (b.tipo === 'lista') for (const item of b.itens) {const li=criar('li','');textoEm(li,item);no.appendChild(li);}
      else textoEm(no,b.texto);
      preview.appendChild(no);
      if (b.tipo === 'destaque') {const atrib=criar('p','sdb-footnote');textoEm(atrib,b.atribuicao);preview.appendChild(atrib);}
    }
    const contador=document.querySelector(`[data-fmt-count-for="${campo.id}"]`);
    if(contador) contador.textContent=`${textoSemMarcas(campo.value).length.toLocaleString('pt-BR')} caracteres`;
    bar.dispatchEvent(new CustomEvent('sdb:bloco',{bubbles:true,detail:b}));
  }
  estilo.addEventListener('change',() => converter(estilo.value));
  campo.addEventListener('input',() => {
    bar._bloco=bar._bloco.tipo === 'lista' ? {...bar._bloco,itens:campo.value.split('\n')} : {...bar._bloco,texto:campo.value}; atualizar();
  });
  campo.addEventListener('select',atualizar);
  campo.addEventListener('keyup',atualizar);
  campo.addEventListener('click',atualizar);
  document.addEventListener('selectionchange',() => {if(document.activeElement === campo) atualizar();});
  campo.addEventListener('keydown',e => {
    const marca={b:'negrito',i:'italico',u:'sublinhado',k:'link'}[e.key.toLowerCase()];
    if (marca && (e.metaKey || e.ctrlKey) && !e.altKey) {e.preventDefault();e.stopPropagation();marcar(marca);}
  });
  estilo.tabIndex = -1;
  const controles=Array.from(bar.querySelectorAll('select,button')).filter(b => !b.closest('[role=menu]') && !b.closest('[hidden]') && !b.disabled);
  controles.forEach((b,i) => {b.tabIndex=i ? -1 : 0;});
  bar.addEventListener('focusin',e => {if(controles.includes(e.target)) controles.forEach(b => {b.tabIndex=b === e.target ? 0 : -1;});});
  bar.addEventListener('keydown',e => {
    if (e.target.closest('[role=menu]')) return;
    const i=controles.indexOf(e.target); if(i<0) return;
    if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
    e.preventDefault();
    controles[e.key === 'Home' ? 0 : e.key === 'End' ? controles.length-1 : (i+(e.key === 'ArrowRight' ? 1 : -1)+controles.length)%controles.length].focus();
  });
  if (campo.readOnly || campo.disabled) controles.forEach(b => {b.disabled=true;});
  atualizar();
}
