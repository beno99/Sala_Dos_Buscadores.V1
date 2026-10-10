/** Melhoria progressiva: botões de estante, sem dependências ou HTML injetado. */
export function initializeSalaCards(root = document, { onSaveChange = () => {} } = {}) {
  const key = 'sdb-card-sala-preview-estante';
  let saved = new Set();
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(parsed)) saved = new Set(parsed.filter((item) => typeof item === 'string'));
  } catch { /* A estante funciona nesta página mesmo sem armazenamento. */ }

  const buttons = [...root.querySelectorAll('[data-save-room]')];
  const update = () => buttons.forEach((button) => {
    button.setAttribute('aria-pressed', String(saved.has(button.dataset.saveRoom)));
  });
  update();

  const listeners = buttons.map((button) => {
    const onClick = () => {
      const id = button.dataset.saveRoom;
      const isSaved = !saved.has(id);
      if (isSaved) saved.add(id);
      else saved.delete(id);
      try { localStorage.setItem(key, JSON.stringify([...saved])); } catch { /* Memória local continua válida. */ }
      update();
      const detail = { id, name: button.dataset.roomName, saved: isSaved };
      button.dispatchEvent(new CustomEvent('sala:save-change', { bubbles: true, detail }));
      onSaveChange(detail);
    };
    button.addEventListener('click', onClick);
    return () => button.removeEventListener('click', onClick);
  });
  return () => listeners.forEach((remove) => remove());
}
