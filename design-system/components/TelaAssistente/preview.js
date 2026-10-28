import { initializeGoldOrb } from '../AssistenteOrb/gold-orb.js';
import { initializeDarkOrb } from '../AssistenteOrb/dark-orb.js';
import { descriptions, examples } from './demo-data.js';

// Comportamento de demonstração: uma instância da tela por documento.
(function initializePreview(root) {
if (!root || root.dataset.assistantInitialized) return;
root.dataset.assistantInitialized = "true";
const $ = selector => root.querySelector(selector);
SalaBuscadores.hydrate(root);
const question = $('#question');
const mode = $('#study-mode');
const room = $('#room');
const send = $('#send');
const status = $('#status');
const controllers = { gold: initializeGoldOrb($('#gold-canvas')), dark: initializeDarkOrb($('#dark-canvas')) };
let appearance = 'gold';
let paused = false;
let timer = null;
let lastFocus = null;
let pendingQuestion = null;


function setAppearance(value) {
  appearance = value === 'dark' ? 'dark' : 'gold';
  root.dataset.orb = appearance;
  $('#gold-visual').hidden = appearance !== 'gold';
  $('#dark-visual').hidden = appearance !== 'dark';
  root.querySelectorAll('[data-appearance]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.appearance === appearance)));
  for (const [key, orb] of Object.entries(controllers)) {
    orb.setHovered(false);
    orb.setPaused(paused || key !== appearance);
  }
  const url = new URL(location.href); url.searchParams.set('orb', appearance); history.replaceState(null, '', url);
}
root.querySelectorAll('[data-appearance]').forEach(b => b.addEventListener('click', () => setAppearance(b.dataset.appearance)));
setAppearance(new URL(location.href).searchParams.get('orb'));

$('#motion').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
$('#motion').addEventListener('click', () => {
  paused = !paused;
  const label = paused ? 'Retomar movimento' : 'Pausar movimento';
  $('#motion').setAttribute('aria-label', label); $('#motion').title = label;
  $('#motion').setAttribute('aria-pressed', String(paused));
  $('#motion').innerHTML = paused ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
  setAppearance(appearance);
});
$('#orb-focus').addEventListener('pointerenter', () => { controllers[appearance].setHovered(true); $('#gold-visual').dataset.hovered = 'true'; });
$('#orb-focus').addEventListener('pointerleave', () => { controllers[appearance].setHovered(false); $('#gold-visual').dataset.hovered = 'false'; });
$('#orb-focus').addEventListener('click', () => question.focus());

function announce(text) { status.textContent = text; status.hidden = !text; }
function updateContext() { $('#mode-description').textContent = descriptions[mode.value]; }
mode.addEventListener('change', updateContext);
question.addEventListener('input', () => { send.disabled = !timer && !question.value.trim(); });
question.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !window.matchMedia('(pointer: coarse)').matches) {
    event.preventDefault(); if (!send.disabled) $('#question-form').requestSubmit();
  }
});

function chooseExample(key) {
  const example = examples[key];
  if (!example || timer) return;
  lastFocus = question;
  root.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  question.value = example.question; mode.value = example.mode; room.value = example.room;
  updateContext(); send.disabled = false; announce('Sugestão preparada. Você pode editar antes de enviar.'); question.focus();
}
root.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => chooseExample(button.dataset.example)));

function stopGeneration(message) {
  if (timer) clearTimeout(timer);
  timer = null; question.readOnly = false; mode.disabled = false; room.disabled = false;
  send.innerHTML = SalaBuscadores.icon('enviar'); send.setAttribute('aria-label', 'Enviar pergunta');
  send.disabled = !question.value.trim(); controllers[appearance].setActive(false); announce(message);
}
function newConversation() {
  stopGeneration(''); question.value = ''; send.disabled = true;
  pendingQuestion = null;
  $('#messages').replaceChildren(); $('#conversation').hidden = true; $('.welcome').hidden = false; $('.suggestions').hidden = false;
  $('#workspace').classList.remove('is-chat'); question.focus(); window.scrollTo({ top: 0, behavior: 'instant' });
}
root.querySelectorAll('[data-new]').forEach(button => button.addEventListener('click', newConversation));

function element(tag, className, text) {
  const node = document.createElement(tag); node.className = className; if (text) node.textContent = text; return node;
}
function renderAnswer(text, selectedMode, selectedRoom) {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const key = /pleroma/.test(normalized) ? 'pleroma' : /alma/.test(normalized) ? 'alma' : /poimandres|criacao/.test(normalized) ? 'poimandres' : null;
  const candidate = examples[key];
  const example = candidate && (selectedRoom === 'todo' || selectedRoom === candidate.room) ? candidate : null;
  const answer = element('article', 'answer');
  const head = element('div', 'answer-head');
  head.append(element('b', '', 'Assistente do acervo'));
  const seal = element('span', 'sdb-seal sdb-seal--ia', 'Exemplo de resposta'); head.append(seal); answer.append(head);
  const body = element('p', 'answer-body', example ? example.text : 'Esta prévia demonstra a interface, sem consultar uma IA. Seu modo de estudo e a Sala escolhida seriam usados para orientar a consulta ao acervo. Experimente um dos três exemplos para visualizar uma resposta com referências.');
  answer.append(body);
  if (example) {
    const source = element('div', 'answer-source');
    source.append(element('small', '', 'LEITURA DO ACERVO · PARÁFRASE DE EXEMPLO'), element('p', '', example.excerpt)); answer.append(source);
    const actions = element('div', 'answer-actions');
    const sources = element('button', 'sdb-btn sdb-btn--secondary sdb-btn--sm', 'Conferir fontes'); sources.type = 'button';
    sources.addEventListener('click', () => {
      $('#source-content').replaceChildren(element('p', '', example.source), element('p', '', example.editorial));
      lastFocus = sources; $('#source-dialog').showModal();
    });
    const copy = element('button', 'sdb-btn sdb-btn--plain sdb-btn--sm', 'Copiar com fontes'); copy.type = 'button';
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(`${example.text}\n\n${example.source}\n${example.editorial}`); announce('Exemplo copiado com as referências.'); }
      catch { announce('Não foi possível copiar. Você pode selecionar o texto da resposta.'); }
    });
    actions.append(sources, copy); answer.append(actions);
  }
  const scopeName = $('#room').selectedOptions[0].textContent;
  answer.append(element('small', 'answer-context', `${selectedMode === 'comparar' ? 'Comparar' : selectedMode === 'leitura' ? 'Leitura guiada' : 'Explorar'} · ${scopeName} · Demonstração local`));
  $('#messages').append(answer);
}

$('#question-form').addEventListener('submit', event => {
  event.preventDefault();
  if (timer) { stopGeneration('Demonstração interrompida. Sua pergunta foi mantida.'); return; }
  const text = question.value.trim(); if (!text) return;
  const selectedMode = mode.value; const selectedRoom = room.value;
  $('.welcome').hidden = true; $('.suggestions').hidden = true; $('#conversation').hidden = false; $('#workspace').classList.add('is-chat');
  if (!pendingQuestion || pendingQuestion.textContent !== text) {
    pendingQuestion = element('p', 'question-bubble', text);
    $('#messages').append(pendingQuestion);
  }
  question.readOnly = true; mode.disabled = true; room.disabled = true; send.disabled = false;
  send.setAttribute('aria-label', 'Interromper demonstração'); send.innerHTML = SalaBuscadores.icon('parar');
  announce('Preparando resposta de demonstração…');
  timer = window.setTimeout(() => {
    renderAnswer(text, selectedMode, selectedRoom); pendingQuestion = null; question.value = ''; stopGeneration('Exemplo pronto. Confira as referências.');
    question.focus();
  }, 1000);
});
root.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
root.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => lastFocus?.focus()));
$('#recent-open').addEventListener('click', event => { lastFocus = event.currentTarget; $('#recent-dialog').showModal(); });
window.addEventListener('pagehide', event => { if (event.persisted) return; if (timer) clearTimeout(timer); Object.values(controllers).forEach(controller => controller.destroy()); });


})(document.querySelector("[data-assistant-screen]"));
