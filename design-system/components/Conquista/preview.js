/* Controles locais de revisão visual. Não concedem conquistas no portal. */
(() => {
  const preview = document.querySelector('.sdb-badge-preview');
  if (!preview) return;
  const cards = [...preview.querySelectorAll('.sdb-badge-card')];
  const stage = preview.closest('.sdb-badge-stage');
  const simulate = preview.querySelector('[data-simulate-earned]');
  const motion = window.SDBBadgeMotion.mount(preview);
  preview.querySelector('[data-preview-surface]').addEventListener('change', event => {
    const value = event.target.value;
    stage.dataset.surface = value;
    if (value === 'catalogo') stage.removeAttribute('data-theme');
    else stage.dataset.theme = value === 'escuro' ? 'solido-escuro' : 'solido-claro';
  });
  simulate.addEventListener('change', () => {
    cards.forEach(card => {
      const earned = simulate.checked || card.dataset.earned === 'true';
      card.classList.toggle('is-locked', !earned);
      card.classList.toggle('is-earned', earned);
      card.querySelector('[data-state-text]').textContent = earned ? 'Obtida' : card.dataset.state;
      card.querySelector('[data-state-icon]').innerHTML = SalaBuscadores.icon(earned ? 'check' : 'cadeado');
      card.querySelector('.sdb-badge-card__foot').textContent = earned ? 'Conquista obtida' : card.dataset.criterion;
    });
    motion.refresh();
    preview.querySelector('[role="status"]').textContent = simulate.checked
      ? 'Demonstração: todas as esferas e seus degradês estão desbloqueados.'
      : 'Demonstração restaurada: duas conquistas obtidas; as demais em cinza.';
  });
})();
