/* Shared 30 fps clock. Offscreen, paused and reduced-motion spheres stay still. */
(() => {
  function mount(root) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const pause = root.querySelector('[data-pause-orbs]');
    const listeners = [];
    let frame = 0;
    let previous = 0;
    let suspended = false;
    let destroyed = false;
    const on = (target, type, fn) => {
      target.addEventListener(type, fn);
      listeners.push(() => target.removeEventListener(type, fn));
    };
    const items = [...root.querySelectorAll('.sdb-badge-card__orb')].map(button => {
      const card = button.closest('.sdb-badge-card');
      const canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      button.append(canvas);
      return { button, card, canvas, renderer: null, tried: false, visible: false,
        dirty: true, time: 0, hover: 0, target: 0, pulse: 0, velocity: 0,
        pointer: [0, 0], aim: [0, 0], earned: false, dark: false,
        config: JSON.parse(card.dataset.orbConfig) };
    });
    const byButton = new Map(items.map(item => [item.button, item]));
    const still = () => reduced.matches || pause.checked;
    function schedule() {
      if (frame || destroyed || suspended || document.hidden) return;
      previous = performance.now() - 1000 / 30;
      frame = requestAnimationFrame(tick);
    }
    function size(item) {
      const side = Math.min(192, item.button.clientWidth);
      const pixels = Math.round(side * Math.min(devicePixelRatio || 1, 1.5));
      item.renderer?.resize(pixels, pixels);
      item.dirty = true;
    }
    function initialize(item) {
      if (item.tried) return;
      item.tried = true;
      item.renderer = window.SDBSolidOrb?.create(item.canvas, item.config) ?? null;
      item.button.dataset.rendered = String(Boolean(item.renderer));
      size(item);
    }
    function resetInput(item) {
      item.target = item.hover = item.pulse = item.velocity = 0;
      item.pointer = [0, 0];
      item.aim = [0, 0];
    }
    function tick(now) {
      frame = 0;
      if (destroyed || suspended || document.hidden) return;
      if (now - previous < 1000 / 30) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      let running = false;
      for (const item of items) {
        if (!item.visible) continue;
        initialize(item);
        if (!item.renderer) continue;
        const animate = item.earned && !still();
        if (animate) {
          item.time += dt;
          // Fast response uses the existing 160 ms token; spring: mass 1, k 100, damping 10.
          const response = 1 - Math.exp(-dt / 0.16);
          item.hover += (item.target - item.hover) * response;
          item.pointer = item.pointer.map((value, i) => value + (item.aim[i] - value) * response);
          item.velocity += (-100 * item.pulse - 10 * item.velocity) * dt;
          item.pulse += item.velocity * dt;
          if (Math.abs(item.pulse) < 0.001 && Math.abs(item.velocity) < 0.01) item.pulse = item.velocity = 0;
        }
        if (item.dirty || animate) {
          item.renderer.render({ time: item.time, pointer: item.pointer, hover: item.hover,
            pulse: Math.max(0, Math.min(1, item.pulse)), dark: item.dark,
            reduced: reduced.matches, reveal: item.earned ? 1 : 0 });
          item.dirty = false;
        }
        running ||= animate;
      }
      if (running) frame = requestAnimationFrame(tick);
    }
    function refresh() {
      for (const item of items) {
        item.earned = item.card.classList.contains('is-earned');
        item.dark = item.card.closest('[data-theme]')?.dataset.theme.endsWith('escuro') ?? false;
        item.button.disabled = !item.earned;
        if (!item.earned || still()) resetInput(item);
        item.dirty = true;
      }
      schedule();
    }
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const item = byButton.get(entry.target);
        item.visible = entry.isIntersecting && entry.intersectionRatio > 0;
        if (!item.visible) resetInput(item);
        item.dirty = true;
      }
      schedule();
    });
    const sizes = new ResizeObserver(entries => {
      for (const entry of entries) size(byButton.get(entry.target));
      schedule();
    });
    for (const item of items) {
      const canHover = event => item.earned && fine.matches && event.pointerType !== 'touch' && !still();
      on(item.button, 'pointerenter', event => { if (canHover(event)) { item.target = 1; schedule(); } });
      on(item.button, 'pointermove', event => {
        if (!canHover(event)) return;
        const rect = item.button.getBoundingClientRect();
        item.aim = [(event.clientX - rect.left) / rect.width * 2 - 1, (event.clientY - rect.top) / rect.height * 2 - 1];
        item.target = 1;
      });
      const leave = () => { item.target = 0; item.aim = [0, 0]; };
      on(item.button, 'pointerleave', leave);
      on(item.button, 'pointercancel', leave);
      on(item.button, 'blur', leave);
      on(item.button, 'click', () => {
        if (!item.earned || still()) return;
        // Repeated clicks add a bounded impulse from the current spring position.
        item.velocity = Math.min(12, item.velocity + 8);
        schedule();
      });
      on(item.canvas, 'webglcontextlost', event => {
        event.preventDefault();
        item.renderer?.dispose();
        item.renderer = null;
        item.button.dataset.rendered = 'false';
      });
      on(item.canvas, 'webglcontextrestored', () => {
        item.tried = false;
        item.dirty = true;
        schedule();
      });
      visibility.observe(item.button);
      sizes.observe(item.button);
    }
    on(pause, 'change', refresh);
    on(reduced, 'change', refresh);
    on(fine, 'change', () => { items.forEach(resetInput); refresh(); });
    on(document, 'visibilitychange', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      items.forEach(resetInput);
      if (!document.hidden) refresh();
    });
    on(window, 'pagehide', () => { suspended = true; cancelAnimationFrame(frame); frame = 0; });
    on(window, 'pageshow', () => { suspended = false; refresh(); });
    const themes = new MutationObserver(refresh);
    themes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    themes.observe(root.querySelector('.sdb-badge-grid'), { attributes: true, attributeFilter: ['data-theme'] });
    refresh();
    return { refresh, dispose() {
      destroyed = true;
      cancelAnimationFrame(frame);
      visibility.disconnect(); sizes.disconnect(); themes.disconnect();
      listeners.forEach(remove => remove());
      items.forEach(item => {
        item.renderer?.dispose();
        item.canvas.remove();
        delete item.button.dataset.rendered;
      });
    } };
  }
  window.SDBBadgeMotion = { mount };
})();
