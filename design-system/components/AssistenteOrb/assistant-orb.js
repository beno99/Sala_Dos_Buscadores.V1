import { initializeGoldOrb } from './gold-orb.js';
import { assistantSuggestions, getDemoResponse } from './demo-responses.js';

export function initializeAssistant(root = document) {
  const panel = root.querySelector('#assistant-chat');
  if (!panel) return;
  const triggers = [...root.querySelectorAll('[data-assistant-open]')];
  const motionButtons = [...root.querySelectorAll('[data-orb-pause]')];
  const hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
  const orbBindings = [...root.querySelectorAll('[data-gold-orb]')].map((canvas) => {
    const renderer = initializeGoldOrb(canvas);
    const trigger = canvas.closest('[data-assistant-open]');
    const visual = canvas.closest('.orb-visual');
    const enter = (event) => {
      if (!hoverMedia.matches || event.pointerType === 'touch') return;
      renderer.setHovered(true);
      visual.dataset.hovered = 'true';
    };
    const leave = () => {
      renderer.setHovered(false);
      visual.dataset.hovered = 'false';
    };
    trigger.addEventListener('pointerenter', enter);
    trigger.addEventListener('pointerleave', leave);
    trigger.addEventListener('pointercancel', leave);
    hoverMedia.addEventListener('change', leave);
    const onVisibility = () => { if (document.hidden) leave(); };
    document.addEventListener('visibilitychange', onVisibility);
    return { renderer, visual, cleanup() {
      trigger.removeEventListener('pointerenter', enter);
      trigger.removeEventListener('pointerleave', leave);
      trigger.removeEventListener('pointercancel', leave);
      hoverMedia.removeEventListener('change', leave);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.destroy();
    } };
  });
  const renderers = orbBindings.map(({ renderer }) => renderer);
  const field = panel.querySelector('textarea');
  const form = panel.querySelector('form');
  const send = panel.querySelector('[data-assistant-send]');
  const welcome = panel.querySelector('[data-assistant-welcome]');
  const log = panel.querySelector('[data-assistant-log]');
  const scroller = panel.querySelector('[data-assistant-scroll]');
  const clear = panel.querySelector('[data-assistant-clear]');
  const close = panel.querySelector('[data-assistant-close]');
  const suggestions = panel.querySelector('[data-assistant-suggestions]');
  const supportsPopover = typeof panel.showPopover === 'function';
  let opener = triggers[0];
  let paused = false;

  const isOpen = () => supportsPopover ? panel.matches(':popover-open') : panel.dataset.fallbackOpen === 'true';
  function reflectOpen(open) {
    triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(open)));
    renderers.forEach((renderer) => renderer.setActive(open));
    if (open) field.focus({ preventScroll: true });
  }
  function hide() {
    if (supportsPopover) panel.hidePopover();
    else { panel.hidden = true; delete panel.dataset.fallbackOpen; reflectOpen(false); }
  }
  if (!supportsPopover) panel.hidden = true;
  panel.addEventListener('toggle', (event) => reflectOpen(event.newState === 'open'));
  triggers.forEach((trigger) => trigger.addEventListener('click', (event) => {
    opener = trigger;
    panel.dataset.instant = String(event.detail === 0);
    if (supportsPopover) return; // Native popovertarget handles toggling and Escape.
    if (isOpen()) hide();
    else { panel.hidden = false; panel.dataset.fallbackOpen = 'true'; reflectOpen(true); }
  }));
  close.addEventListener('click', (event) => {
    panel.dataset.instant = String(event.detail === 0);
    hide();
    opener.focus({ preventScroll: true });
  });
  if (!supportsPopover) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) { hide(); opener.focus({ preventScroll: true }); }
    });
    document.addEventListener('pointerdown', (event) => {
      if (isOpen() && !panel.contains(event.target) && !triggers.some((t) => t.contains(event.target))) hide();
    });
  }
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') panel.dataset.instant = 'true';
  });
  motionButtons.forEach((button) => button.addEventListener('click', () => {
    paused = !paused;
    renderers.forEach((renderer) => renderer.setPaused(paused));
    orbBindings.forEach(({ visual }) => {
      visual.dataset.orbPaused = String(paused);
      // Freeze the CSS fallback at its current pose as well as the WebGL scene.
      visual.querySelectorAll('.orb-fallback-rings i').forEach((ring) => {
        if (paused) {
          const currentPose = getComputedStyle(ring).transform;
          ring.style.transition = 'none';
          ring.style.transform = currentPose;
        } else {
          ring.style.removeProperty('transition');
          ring.style.removeProperty('transform');
        }
      });
    });
    motionButtons.forEach((control) => {
      control.setAttribute('aria-pressed', String(paused));
      control.querySelector('span').textContent = paused ? 'Retomar movimento' : 'Pausar movimento';
    });
  }));

  function updateSend() { send.disabled = !field.value.trim(); }
  field.addEventListener('input', updateSend);
  field.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      if (field.value.trim()) form.requestSubmit();
    }
  });
  assistantSuggestions.forEach((text) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.addEventListener('click', () => {
      field.value = text;
      updateSend();
      field.focus();
    });
    suggestions.append(button);
  });
  function appendMessage(text, type) {
    const article = document.createElement('div');
    article.className = `assistant-chat__message assistant-chat__message--${type}`;
    article.setAttribute('aria-label', type === 'user' ? 'Você' : 'Assistente, resposta de exemplo');
    if (type === 'assistant') {
      const label = document.createElement('span');
      label.className = 'assistant-chat__message-label';
      label.textContent = 'ASSISTENTE · EXEMPLO DO ACERVO';
      article.append(label);
    }
    const p = document.createElement('p');
    p.textContent = text;
    article.append(p);
    log.append(article);
    return article;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = field.value.trim().slice(0, 2000);
    if (!question) return;
    welcome.hidden = true;
    clear.hidden = false;
    appendMessage(question, 'user');
    const response = getDemoResponse(question);
    const message = appendMessage(response.text, 'assistant');
    const source = document.createElement('p');
    source.className = 'assistant-chat__source';
    source.textContent = response.source;
    message.append(source);
    if (response.tab) {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'assistant-chat__link';
      link.textContent = response.tab === 'comparativos' ? 'Ver comparativo no catálogo ↗' : 'Explorar cards de sala ↗';
      link.addEventListener('click', () => {
        hide();
        const tab = document.getElementById(`tab-${response.tab}`);
        if (tab) { tab.click(); tab.focus(); }
        else {
          const name = response.tab === 'comparativos' ? 'GradeComparativa' : 'CardSala';
          if (window.parent !== window) window.parent.postMessage({sdbNavigate:name}, '*');
          else location.href = window.SDBCatalog.base + 'catalogo.html#' + name;
        }
      });
      message.append(link);
    }
    field.value = '';
    updateSend();
    field.focus({ preventScroll: true });
    scroller.scrollTop = scroller.scrollHeight;
  });
  clear.addEventListener('click', () => {
    log.replaceChildren();
    welcome.hidden = false;
    clear.hidden = true;
    field.value = '';
    updateSend();
    field.focus();
    scroller.scrollTop = 0;
  });
  updateSend();
  return { destroy: () => orbBindings.forEach((binding) => binding.cleanup()) };
}
