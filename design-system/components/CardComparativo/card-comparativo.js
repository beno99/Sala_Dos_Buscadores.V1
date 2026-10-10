/** Local comparison selection; removing a card never edits source data. */
export function initializeComparison(root) {
  if (!root) return;
  const track = root.querySelector('[data-comparison-track]');
  const cards = [...track.querySelectorAll('[data-comparison-card]')];
  const count = root.querySelector('[data-comparison-count]');
  const notice = root.querySelector('[data-comparison-notice]');
  const message = root.querySelector('[data-comparison-message]');
  const undo = root.querySelector('[data-comparison-undo]');
  const reset = root.querySelector('[data-comparison-reset]');
  const previous = root.querySelector('[data-comparison-previous]');
  const next = root.querySelector('[data-comparison-next]');
  const removed = [];
  const visible = () => cards.filter((card) => !card.hidden);

  function updateNavigation() {
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  }
  function update() {
    const active = visible();
    count.textContent = `${active.length} ${active.length === 1 ? 'sala' : 'salas'}`;
    for (const card of active) {
      const remove = card.querySelector('[data-comparison-remove]');
      if (remove) remove.hidden = active.length === 1;
    }
    reset.hidden = removed.length === 0;
    notice.hidden = removed.length === 0;
    if (removed.length) message.textContent = `${removed.at(-1).dataset.roomName} saiu da comparação.`;
    requestAnimationFrame(updateNavigation);
  }
  function handleClick(event) {
    const remove = event.target.closest('[data-comparison-remove]');
    if (!remove) return;
    const card = remove.closest('[data-comparison-card]');
    const active = visible();
    if (active.length <= 1) return;
    const index = active.indexOf(card);
    card.hidden = true;
    removed.push(card);
    update();
    const neighbor = active[index + 1] || active[index - 1];
    const control = neighbor.querySelector('[data-comparison-remove]:not([hidden])') || neighbor.querySelector('a');
    control.focus({ preventScroll: true });
  }
  function restoreLast() {
    const card = removed.pop();
    if (!card) return;
    card.hidden = false;
    update();
    const control = card.querySelector('[data-comparison-remove]') || card.querySelector('a');
    control.focus();
  }
  function restoreAll() {
    cards.forEach((card) => { card.hidden = false; });
    removed.length = 0;
    update();
    cards[0].querySelector('[data-comparison-remove]').focus();
  }
  function move(direction) {
    const active = visible();
    if (!active.length) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (active[0].getBoundingClientRect().width + gap), behavior: 'auto' });
  }
  const goPrevious = () => move(-1);
  const goNext = () => move(1);
  track.addEventListener('click', handleClick);
  track.addEventListener('scroll', updateNavigation, { passive: true });
  undo.addEventListener('click', restoreLast);
  reset.addEventListener('click', restoreAll);
  previous.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  const observer = new ResizeObserver(updateNavigation);
  observer.observe(track);
  update();
  return () => {
    observer.disconnect();
    track.removeEventListener('click', handleClick);
    track.removeEventListener('scroll', updateNavigation);
    undo.removeEventListener('click', restoreLast);
    reset.removeEventListener('click', restoreAll);
    previous.removeEventListener('click', goPrevious);
    next.removeEventListener('click', goNext);
  };
}
