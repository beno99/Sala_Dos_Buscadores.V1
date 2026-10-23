/* Somente catálogo: estados locais de demonstração, sem rede, conta ou persistência.
   React recebe estado/callbacks do consumidor. Permissões pertencem ao servidor. */
(() => {
  'use strict';
  const all = (s, root = document) => Array.from(root.querySelectorAll(s));
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function updateComposer(form) {
    const type = form.querySelector('[name="tipo"]:checked').value;
    all('[data-community-type]', form).forEach(section => {
      section.hidden = section.dataset.communityType !== type;
      if (section.tagName === 'FIELDSET') section.disabled = section.hidden;
    });
    form.elements.sala.required = type === 'pergunta';
    form.querySelector('[data-community-room-optional]').hidden = type === 'pergunta';
    const themes = all('[name="temas"]', form);
    const full = themes.filter(t => t.checked).length >= 3;
    themes.forEach(t => { t.disabled = full && !t.checked; });
    form.querySelector('[data-community-submit]').disabled = !all('input[required],textarea[required],select[required]', form)
      .filter(f => !f.matches(':disabled')).every(f => f.value.trim());
  }
  function updateComment(form) {
    const field = form.elements.comentario;
    form.querySelector('[data-community-submit]').disabled = !field.value.trim();
    const count = form.querySelector('[data-community-counter]');
    count.hidden = field.value.length < 480;
    count.textContent = `${field.value.length}/600 caracteres`;
  }
  function init() {
    window.SalaBuscadores.hydrate();
    window.SalaInterface?.hydrate();
    all('[data-community-composer]').forEach(updateComposer);
    all('[data-community-comment]').forEach(updateComment);
    all('.sdb-community-overlay').forEach(o => {
      // O runtime compartilhado abre/fecha; inert acompanha seu estado.
      new MutationObserver(() => { o.inert = !o.classList.contains('is-open'); }).observe(o, {attributes:true,attributeFilter:['class']});
    });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('button,a');
    if (!b) return;
    if (b.hasAttribute('data-community-like')) {
      const pressed = b.getAttribute('aria-pressed') !== 'true';
      const count = b.querySelector('[data-community-count]');
      count.textContent = String(Number(count.textContent) + (pressed ? 1 : -1));
      b.setAttribute('aria-pressed', String(pressed));
      const comment = !!b.closest('.sdb-comment');
      b.setAttribute('aria-label', `${pressed ? 'Desfazer curtida' : 'Curtir'}${comment ? ' no comentário' : ''}, ${count.textContent} curtidas`);
    }
    if (b.hasAttribute('data-community-save')) {
      const selected = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(selected));
      b.setAttribute('aria-label', selected ? 'Remover publicação dos salvos' : 'Salvar publicação');
    }
    if (b.hasAttribute('data-community-follow')) {
      const selected = b.getAttribute('aria-pressed') !== 'true';
      const name = b.closest('.sdb-person').querySelector('.sdb-person__link').textContent;
      b.setAttribute('aria-pressed', String(selected));
      b.textContent = selected ? 'Seguindo' : 'Seguir';
      b.setAttribute('aria-label', `${selected ? 'Deixar de seguir' : 'Seguir'} ${name}`);
    }
    if (b.hasAttribute('data-community-expand') || b.hasAttribute('data-community-reveal')) {
      const target = document.getElementById(b.getAttribute('aria-controls'));
      const expanded = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', String(expanded));
      if (b.hasAttribute('data-community-expand')) {
        target.dataset.collapsed = String(!expanded); b.textContent = expanded ? 'Ver menos' : 'Ver mais';
      } else target.hidden = !expanded;
    }
    if (b.hasAttribute('data-community-dismiss')) b.closest('.sdb-neutral').hidden = true;
    if (b.hasAttribute('data-community-pick')) {
      const form = document.querySelector('#compositor-demo form');
      form.querySelector(`[name="tipo"][value="${b.dataset.communityPick}"]`).checked = true;
      updateComposer(form);
    }
    if (b.hasAttribute('data-community-reply')) {
      const form = b.closest('.sdb-community-dialog')?.querySelector('[data-community-comment]');
      if (form) {
        form.querySelector('[data-community-feedback]').textContent = `Respondendo a ${b.closest('.sdb-comment').querySelector('.sdb-comment__name').textContent}.`;
        form.elements.comentario.focus();
      } else window.SalaBuscadores.toast('Prévia de resposta. Abra o Painel de comentários para escrever.');
    }
    if (b.hasAttribute('data-community-rules')) {
      e.preventDefault();
      window.SalaBuscadores.toast('Respeite as tradições. Atribua fontes. Não publique proselitismo, promessas de cura ou dados pessoais de terceiros.', {duration:9000});
    }
  });
  function input(e) {
    const composer = e.target.closest('[data-community-composer]');
    if (composer) updateComposer(composer);
    const comment = e.target.closest('[data-community-comment]');
    if (comment) updateComment(comment);
    if (e.target.matches('[data-community-people]')) {
      const side = e.target.closest('.sdb-community-side');
      const items = all('[data-community-people-list] > li', side);
      items.forEach(item => { item.hidden = !normalize(item.textContent).includes(normalize(e.target.value)); });
      side.querySelector('[data-community-people-status]').textContent = `${items.filter(i => !i.hidden).length} pessoas encontradas.`;
    }
    if (e.target.matches('[data-community-post-search]')) {
      const posts = all('#para-voce > .sdb-post');
      posts.forEach(post => { post.hidden = !normalize(post.textContent).includes(normalize(e.target.value)); });
      document.querySelector('[data-community-post-status]').textContent = `${posts.filter(p => !p.hidden).length} publicações encontradas.`;
    }
    if (e.target.matches('[data-community-content-search]')) {
      const select = composer.elements.conteudo;
      all('option[value]:not([value=""])', select).forEach(o => { o.hidden = !normalize(o.textContent).includes(normalize(e.target.value)); });
    }
  }
  document.addEventListener('input', input);
  document.addEventListener('change', input);
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-community-composer],[data-community-comment]')) return;
    e.preventDefault();
    if (!e.target.checkValidity()) return;
    e.target.querySelector('[data-community-feedback]').textContent = 'Prévia conferida. Nada foi publicado; a gravação entra na Fase C.';
    window.SalaBuscadores.toast('Prévia conferida. Nenhum dado foi enviado.');
  });
  // Prende o foco apenas nos painéis novos; o runtime do DS trata Escape e devolução.
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const panel = all('.sdb-community-overlay.is-open').at(-1);
    if (!panel) return;
    const controls = all('a[href],button,input,textarea,select,[tabindex="0"]', panel)
      .filter(n => !n.matches(':disabled') && !n.closest('[hidden]') && n.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
