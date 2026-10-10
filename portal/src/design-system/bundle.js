/* A Sala dos Buscadores — runtime de componentes (sem dependências). */
(function () {
  "use strict";

  var P = {
    busca: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    filtro: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    copiar: '<rect x="8.5" y="8.5" width="11.5" height="11.5"/><path d="M15.5 8.5V4H4v11.5h4.5"/>',
    enviar: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    parar: '<rect x="7" y="7" width="10" height="10" fill="currentColor" stroke="none"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    chevronBaixo: '<path d="M6 9l6 6 6-6"/>',
    chevronDireita: '<path d="M9 6l6 6-6 6"/>',
    chevronEsquerda: '<path d="M15 6l-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.4v.6"/>',
    aviso: '<path d="M12 3.8l9 16.2H3z"/><path d="M12 10v4.5M12 17.2v.6"/>',
    erro: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    play: '<path d="M8.5 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
    artigo: '<path d="M5 3.5h10l4 4V20.5H5z"/><path d="M14.5 3.5v4.5H19M8.5 12h7M8.5 15.5h7M8.5 8.5h3"/>',
    video: '<rect x="3" y="6" width="13" height="12"/><path d="M16 10.5l5-3v9l-5-3"/>',
    glossario: '<path d="M5 4.5h12.5a1.5 1.5 0 011.5 1.5v14H6.5A1.5 1.5 0 015 18.5z"/><path d="M5 17h14M9 9h6"/>',
    fontePrimaria: '<path d="M7 3.5h12v13.5a3 3 0 01-3 3H6a3 3 0 01-3-3v-2h11v2a3 3 0 006 0"/><path d="M10 8h6M10 11.5h6"/>',
    curado: '<path d="M6 3.5h12v17l-6-4-6 4z"/><path d="M9 9.5l2 2 4-4"/>',
    especialista: '<path d="M4 20L14 10"/><path d="M8 16h5.5L20 9.5V4h-5.5L8 10.5z"/>',
    comunidade: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6M16 4.6a3.5 3.5 0 010 6.8M18 14.3c1.8.8 3 2.9 3 5.7"/>',
    ia: '<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8.5l3.5 3.5-3.5 3.5L8.5 12z"/>',
    regenerar: '<path d="M19.5 12a7.5 7.5 0 11-2.2-5.3M19.5 4.5v4.5H15"/>',
    util: '<path d="M7.5 11v9h-3.5v-9zM7.5 11l3.8-7c1.5 0 2.7 1.1 2.7 2.6V9.5h5a1.5 1.5 0 011.5 1.8l-1.5 7.3a1.8 1.8 0 01-1.8 1.4H7.5"/>',
    naoUtil: '<g transform="rotate(180 12 12)"><path d="M7.5 11v9h-3.5v-9zM7.5 11l3.8-7c1.5 0 2.7 1.1 2.7 2.6V9.5h5a1.5 1.5 0 011.5 1.8l-1.5 7.3a1.8 1.8 0 01-1.8 1.4H7.5"/></g>',
    olho: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    olhoFechado: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 4l16 16"/>',
    cadeado: '<rect x="5" y="11" width="14" height="9.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    mais: '<path d="M12 5v14M5 12h14"/>',
    lixeira: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13.5h10L18 7M10 11v6M14 11v6"/>',
    comando: '<path d="M9 6.5a2.5 2.5 0 10-2.5 2.5h11A2.5 2.5 0 1015 6.5v11a2.5 2.5 0 102.5-2.5h-11A2.5 2.5 0 109 17.5z"/>',
    tema: '<rect x="4" y="4" width="16" height="16"/><path d="M12 4v16h8V4z" fill="currentColor"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    estante: '<path d="M6 3.5h12v17l-6-4-6 4z"/>',
    compartilhar: '<path d="M12 15V3.5M7 8l5-5 5 5M5 13v7.5h14V13"/>',
    comparar: '<rect x="3" y="4" width="18" height="16"/><path d="M9 4v16M15 4v16"/>',
    inicio: '<path d="M4 20.5V10l8-6 8 6v10.5z"/>',
    pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    reticencias: '<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>',
    linhaTempo: '<path d="M4 12h16M8 8v8M16 8v8"/>',
    trilha: '<path d="M3 20h5v-4h4v-4h4V8h5"/>',
    audio: '<path d="M4 9.5h4l5-4.5v14l-5-4.5H4z"/><path d="M16.5 9a4 4 0 010 6"/>',
    editar: '<path d="M4 20h4L19.5 8.5l-4-4L4 16z"/>',
    chevronDuplo: '<path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4"/>',
    grade: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    salas: '<path d="M5 20V10a7 7 0 0114 0v10z"/><path d="M9 20v-3h3v-3h3"/>',
    assistente: '<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/>',
    pausar: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
    sair: '<path d="M14 4h5.5v16H14M10 8l-4 4 4 4M6 12h10"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    destaques: '<path d="M4 20h16M7 16v-5M12 16V6M17 16v-8"/>',
    biblioteca: '<path d="M4.5 4.5h4v15h-4zM10.5 4.5h4v15h-4zM16.3 5.2l3.6-1 3 14.6-3.6 1z"/>',
    menuLateral: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/>'
  };

  function icon(name, cls) {
    var body = P[name] || P.info;
    return '<svg class="sdb-icon ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  function arc(opts) {
    opts = opts || {};
    var cls = "sdb-arc" + (opts.on ? " sdb-arc--on-" + opts.on : "") + (opts.cls ? " " + opts.cls : "");
    var steps = "";
    var i;
    if (opts.line) {
      for (i = 0; i < 5; i++) steps += '<rect x="5.5" y="' + (31 + i * 3.2) + '" width="' + (8 + i * 4.4) + '" height="3.2"/>';
      return '<svg class="' + cls + '" viewBox="0 0 36 48" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false"><path d="M2 47.5V18a16 16 0 0132 0v29.5z"/><path d="M4.5 47.5V18.5a13.5 13.5 0 0127 0v29"/>' + steps + "</svg>";
    }
    for (i = 0; i < 5; i++) steps += '<rect x="5" y="' + (31 + i * 3.2) + '" width="' + (8 + i * 4.6) + '" height="3.2"/>';
    return '<svg class="' + cls + '" viewBox="0 0 36 48" aria-hidden="true" focusable="false"><path d="M2 48V18a16 16 0 0132 0v30z" fill="currentColor"/><g fill="none" style="stroke:var(--sdb-arc-cut)" stroke-width="1.1">' + steps + "</g></svg>";
  }

  function hydrate(root) {
    root = root || document;
    Array.prototype.forEach.call(root.querySelectorAll("[data-icon]"), function (el) {
      var t = document.createElement("template");
      t.innerHTML = icon(el.getAttribute("data-icon"), el.className);
      el.replaceWith(t.content.firstChild);
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-arc]"), function (el) {
      var t = document.createElement("template");
      t.innerHTML = arc({ line: el.getAttribute("data-arc") === "line", on: el.getAttribute("data-on"), cls: el.className });
      el.replaceWith(t.content.firstChild);
    });
    Array.prototype.forEach.call(root.querySelectorAll(".sdb-slider"), syncSlider);
    Array.prototype.forEach.call(root.querySelectorAll(".sdb-segmented"), function (sg) { syncSeg(sg, true); });
    Array.prototype.forEach.call(root.querySelectorAll("textarea[data-autogrow]"), grow);
    Array.prototype.forEach.call(root.querySelectorAll("[data-count-for]"), function (c) {
      var f = document.getElementById(c.getAttribute("data-count-for"));
      if (f) count(f);
    });
    Array.prototype.forEach.call(root.querySelectorAll("[data-sidenav-store]"), restoreSidenav);
    Array.prototype.forEach.call(root.querySelectorAll("[data-sdb-carousel]"), syncCarousel);
    Array.prototype.forEach.call(root.querySelectorAll("[data-sdb-banner]"), initBanner);
    Array.prototype.forEach.call(root.querySelectorAll("[data-sdb-steps]"), function (st) { showStep(st, 0, false); });
    syncTopbars();
  }

  function reducedMotion() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  /* ---------- navegação lateral recolhível ---------- */
  function setSidenav(nav, collapsed) {
    nav.classList.toggle("is-collapsed", collapsed);
    Array.prototype.forEach.call(nav.querySelectorAll(".sdb-sidenav__item, .sdb-sidenav__profile, .sdb-sidenav__resume"), function (it) {
      var lab = it.querySelector(".sdb-sidenav__label, .sdb-sidenav__who b, .sdb-sidenav__resume-text b");
      if (collapsed && lab && !it.hasAttribute("data-tip")) { it.setAttribute("data-tip", lab.textContent.trim()); it.setAttribute("data-tip-side", "right"); it.setAttribute("data-tip-auto", ""); }
      if (!collapsed && it.hasAttribute("data-tip-auto")) { it.removeAttribute("data-tip"); it.removeAttribute("data-tip-side"); it.removeAttribute("data-tip-auto"); }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sidenav-toggle="' + nav.id + '"]'), function (b) {
      b.setAttribute("aria-expanded", collapsed ? "false" : "true");
      b.setAttribute("aria-label", collapsed ? "Expandir navegação" : "Recolher navegação");
      if (b.hasAttribute("data-tip")) b.setAttribute("data-tip", collapsed ? "Expandir" : "Recolher");
    });
    var key = nav.getAttribute("data-sidenav-store");
    if (key) { try { localStorage.setItem(key, collapsed ? "recolhida" : "aberta"); } catch (e) {} }
  }
  function restoreSidenav(nav) {
    var v = null;
    try { v = localStorage.getItem(nav.getAttribute("data-sidenav-store")); } catch (e) {}
    if (v === "recolhida" || v === "aberta") setSidenav(nav, v === "recolhida");
  }

  /* ---------- carrossel ---------- */
  function syncCarousel(c) {
    var track = c.querySelector(".sdb-carousel__track");
    if (!track) return;
    var prev = c.querySelector("[data-carousel-prev]"), next = c.querySelector("[data-carousel-next]");
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  function moveCarousel(c, dir) {
    var track = c.querySelector(".sdb-carousel__track");
    if (!track) return;
    track.scrollBy({ left: dir * Math.max(track.clientWidth * 0.85, 200), behavior: reducedMotion() ? "auto" : "smooth" });
  }

  /* ---------- banner rotativo ---------- */
  function initBanner(b) {
    if (b._sdb) return;
    var st = b._sdb = { i: 0, timer: null, user: reducedMotion(), hover: false, focus: false };
    b.addEventListener("mouseenter", function () { st.hover = true; planBanner(b); });
    b.addEventListener("mouseleave", function () { st.hover = false; planBanner(b); });
    b.addEventListener("focusin", function () { st.focus = true; planBanner(b); });
    b.addEventListener("focusout", function (e) { if (!b.contains(e.relatedTarget)) { st.focus = false; planBanner(b); } });
    showSlide(b, 0);
    planBanner(b);
  }
  function showSlide(b, i) {
    var slides = b.querySelectorAll(".sdb-banner__slide");
    if (!slides.length) return;
    var n = slides.length;
    i = ((i % n) + n) % n;
    b._sdb.i = i;
    Array.prototype.forEach.call(slides, function (s, k) {
      var on = k === i;
      s.classList.toggle("is-current", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) s.removeAttribute("inert"); else s.setAttribute("inert", "");
    });
    Array.prototype.forEach.call(b.querySelectorAll("[data-banner-go]"), function (d) {
      d.setAttribute("aria-current", +d.getAttribute("data-banner-go") === i ? "true" : "false");
    });
  }
  function planBanner(b) {
    var st = b._sdb;
    clearTimeout(st.timer);
    var running = !st.user && !st.hover && !st.focus && !document.hidden;
    var live = b.querySelector(".sdb-banner__slides");
    if (live) live.setAttribute("aria-live", running ? "off" : "polite");
    var t = b.querySelector("[data-banner-toggle]");
    if (t) {
      t.setAttribute("aria-label", st.user ? "Retomar rotação" : "Pausar rotação");
      if (t.hasAttribute("data-tip")) t.setAttribute("data-tip", st.user ? "Retomar" : "Pausar");
      t.innerHTML = icon(st.user ? "play" : "pausar", "sdb-icon--sm");
    }
    b.classList.toggle("is-paused", !running);
    if (running) st.timer = setTimeout(function () { showSlide(b, st.i + 1); planBanner(b); }, +b.getAttribute("data-interval") || 7000);
  }
  document.addEventListener("visibilitychange", function () {
    Array.prototype.forEach.call(document.querySelectorAll("[data-sdb-banner]"), function (b) { if (b._sdb) planBanner(b); });
  });

  /* ---------- etapas (onboarding) ---------- */
  function showStep(root, i, focus) {
    var steps = root.querySelectorAll(".sdb-onboarding__step");
    if (!steps.length) return;
    i = Math.max(0, Math.min(i, steps.length - 1));
    root._step = i;
    Array.prototype.forEach.call(steps, function (s, k) { s.hidden = k !== i; });
    Array.prototype.forEach.call(root.querySelectorAll(".sdb-dots [data-step-dot]"), function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
    var status = root.querySelector(".sdb-onboarding__status");
    if (status) status.textContent = "Etapa " + (i + 1) + " de " + steps.length;
    syncConsent(steps[i]);
    if (focus) { var h = steps[i].querySelector("[data-step-title]"); if (h) { h.setAttribute("tabindex", "-1"); h.focus(); } }
  }
  function syncConsent(step) {
    var box = step.querySelector(".sdb-consent");
    if (!box) return;
    var informed = Array.prototype.some.call(step.querySelectorAll("[data-sensitive]"), function (x) { return x.checked; });
    box.hidden = !informed;
    var ok = !informed || (box.querySelector("input[type=checkbox]") || {}).checked;
    Array.prototype.forEach.call(step.querySelectorAll("[data-step-next]"), function (n) { n.setAttribute("aria-disabled", ok ? "false" : "true"); });
  }

  /* ---------- barra superior ---------- */
  function syncTopbars() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    Array.prototype.forEach.call(document.querySelectorAll("[data-sdb-topbar]"), function (t) { t.classList.toggle("is-scrolled", y > 4); });
  }

  /* ---------- toasts ---------- */
  function toaster() {
    var t = document.querySelector(".sdb-toaster");
    if (!t) {
      t = document.createElement("section");
      t.className = "sdb-toaster";
      t.setAttribute("aria-live", "polite");
      t.setAttribute("aria-label", "Notificações");
      document.body.appendChild(t);
    }
    return t;
  }
  function dismiss(el) {
    if (!el || el.dataset.state === "exit") return;
    el.dataset.state = "exit";
    setTimeout(function () { el.remove(); }, 220);
  }
  function toast(message, opts) {
    opts = opts || {};
    var host = toaster();
    var el = document.createElement("div");
    var err = opts.variant === "erro";
    el.className = "sdb-toast" + (err ? " sdb-toast--error" : "");
    el.setAttribute("role", err ? "alert" : "status");
    el.dataset.state = "enter";
    el.innerHTML = '<span class="sdb-toast__icon">' + icon(opts.icon || (err ? "erro" : "check")) + "</span>" +
      '<div class="sdb-toast__msg">' + (opts.title ? "<strong></strong>" : "") + "<span></span></div>" +
      (opts.action ? '<button class="sdb-btn sdb-btn--tinted sdb-btn--sm sdb-toast__action" type="button"></button>' : "") +
      '<button class="sdb-toast__close" type="button" aria-label="Fechar notificação">' + icon("fechar", "sdb-icon--sm") + "</button>";
    if (opts.title) el.querySelector("strong").textContent = opts.title;
    el.querySelector(".sdb-toast__msg span").textContent = message;
    if (opts.action) {
      var a = el.querySelector(".sdb-toast__action");
      a.textContent = opts.action;
      a.addEventListener("click", function () { if (opts.onAction) opts.onAction(); dismiss(el); });
    }
    el.querySelector(".sdb-toast__close").addEventListener("click", function () { dismiss(el); });
    host.appendChild(el);
    var live = host.querySelectorAll('.sdb-toast:not([data-state="exit"])');
    if (live.length > 3) dismiss(live[0]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.removeAttribute("data-state"); }); });
    var left = opts.duration || 4200, started = Date.now(), timer;
    function arm() { started = Date.now(); timer = setTimeout(function () { dismiss(el); }, left); }
    el.addEventListener("mouseenter", function () { clearTimeout(timer); left -= Date.now() - started; });
    el.addEventListener("mouseleave", arm);
    arm();
    return el;
  }

  /* ---------- overlays ---------- */
  var lastFocus = [];
  function openOverlay(id) {
    var o = document.getElementById(id);
    if (!o) return;
    lastFocus.push(document.activeElement);
    o.classList.add("is-open");
    o.setAttribute("aria-hidden", "false");
    setTimeout(function () {
      var f = o.querySelector("[autofocus], input, textarea, select, button:not([data-close])") || o.querySelector("button");
      if (f) f.focus();
    }, 30);
  }
  function closeOverlay(o) {
    if (typeof o === "string") o = document.getElementById(o);
    if (!o || !o.classList.contains("is-open")) return;
    o.classList.remove("is-open");
    o.setAttribute("aria-hidden", "true");
    var f = lastFocus.pop();
    if (f && f.focus) f.focus();
  }

  /* ---------- segmented thumb & tabs ---------- */
  function syncSeg(seg, instant) {
    if (!seg) return;
    var thumb = seg.querySelector(":scope > .sdb-segmented__thumb");
    if (!thumb) { thumb = document.createElement("span"); thumb.className = "sdb-segmented__thumb"; thumb.setAttribute("aria-hidden", "true"); seg.insertBefore(thumb, seg.firstChild); instant = true; }
    var sel = seg.querySelector(':scope > [aria-selected="true"], :scope > [aria-pressed="true"]');
    if (!sel) { thumb.style.opacity = "0"; return; }
    if (instant) seg.classList.add("is-instant");
    thumb.style.opacity = "1";
    thumb.style.width = sel.offsetWidth + "px";
    thumb.style.transform = "translateX(" + sel.offsetLeft + "px)";
    if (instant) { void thumb.offsetWidth; requestAnimationFrame(function () { seg.classList.remove("is-instant"); }); }
  }
  function syncAll(instant) { Array.prototype.forEach.call(document.querySelectorAll(".sdb-segmented"), function (s) { syncSeg(s, instant); }); }
  function placeIndicator(tabs) { syncSeg(tabs.querySelector(".sdb-segmented")); }
  function selectTab(tab) {
    var tabs = tab.closest("[data-sdb-tabs]");
    if (!tabs || tab.disabled) return;
    Array.prototype.forEach.call(tabs.querySelectorAll('[role="tab"]'), function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    placeIndicator(tabs);
  }

  /* ---------- fields ---------- */
  function syncSlider(s) {
    var min = +s.min || 0, max = +s.max || 100;
    s.style.setProperty("--val", ((s.value - min) / (max - min)) * 100 + "%");
    var out = document.querySelector('[data-slider-out="' + s.id + '"]');
    if (out) out.textContent = s.getAttribute("data-format") ? s.getAttribute("data-format").replace("{v}", s.value) : s.value;
  }
  function grow(t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 220) + "px"; }
  function count(f) {
    var c = document.querySelector('[data-count-for="' + f.id + '"]');
    if (c) c.textContent = f.value.length.toLocaleString("pt-BR") + " / " + (+f.maxLength > 0 ? (+f.maxLength).toLocaleString("pt-BR") : "∞");
  }

  function copyText(text, msg) {
    function ok() { toast(msg || "Copiado para a área de transferência."); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var done = false;
      try { done = document.execCommand("copy"); } catch (e) { done = false; }
      ta.remove();
      if (done) ok(); else toast("Selecione o texto e copie manualmente.", { variant: "erro", title: "Não foi possível copiar" });
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }

  /* ---------- delegated events ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target;
    var el;

    if ((el = t.closest("[data-open]"))) { e.preventDefault(); openOverlay(el.getAttribute("data-open")); }
    if ((el = t.closest("[data-close]"))) { closeOverlay(el.closest(".sdb-overlay")); }
    if (t.classList && t.classList.contains("sdb-overlay")) closeOverlay(t);

    var trig = t.closest("[data-menu-trigger]");
    Array.prototype.forEach.call(document.querySelectorAll(".sdb-menu.is-open"), function (m) {
      if (!trig || m.parentNode !== trig.parentNode) {
        if (!m.contains(t) || t.closest(".sdb-menu__item")) {
          m.classList.remove("is-open");
          var tr = m.parentNode.querySelector("[data-menu-trigger]");
          if (tr) tr.setAttribute("aria-expanded", "false");
        }
      }
    });
    if (trig) {
      var menu = trig.parentNode.querySelector(".sdb-menu");
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      trig.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) { var first = menu.querySelector(".sdb-menu__item:not(:disabled)"); if (first) setTimeout(function () { first.focus(); }, 10); }
    }
    if ((el = t.closest('.sdb-menu__item[role="menuitemcheckbox"]'))) el.setAttribute("aria-checked", el.getAttribute("aria-checked") === "true" ? "false" : "true");

    if ((el = t.closest("[data-acc-trigger]")) && !el.disabled) {
      var exp = el.getAttribute("aria-expanded") !== "true";
      var group = el.closest("[data-single]");
      if (group && exp) {
        Array.prototype.forEach.call(group.querySelectorAll('[data-acc-trigger][aria-expanded="true"]'), function (o) {
          o.setAttribute("aria-expanded", "false");
          var op = document.getElementById(o.getAttribute("aria-controls"));
          if (op) op.classList.remove("is-open");
        });
      }
      el.setAttribute("aria-expanded", exp ? "true" : "false");
      var panel = document.getElementById(el.getAttribute("aria-controls"));
      if (panel) panel.classList.toggle("is-open", exp);
    }

    if ((el = t.closest('[data-sdb-tabs] [role="tab"]'))) selectTab(el);

    if ((el = t.closest("[data-sidenav-toggle]"))) {
      var nav = document.getElementById(el.getAttribute("data-sidenav-toggle"));
      if (nav) setSidenav(nav, !nav.classList.contains("is-collapsed"));
    }
    if ((el = t.closest("[data-carousel-prev], [data-carousel-next]")) && !el.disabled) {
      moveCarousel(el.closest("[data-sdb-carousel]"), el.hasAttribute("data-carousel-next") ? 1 : -1);
    }
    var ban = t.closest("[data-sdb-banner]");
    if (ban && ban._sdb) {
      if ((el = t.closest("[data-banner-prev]"))) showSlide(ban, ban._sdb.i - 1);
      if ((el = t.closest("[data-banner-next]"))) showSlide(ban, ban._sdb.i + 1);
      if ((el = t.closest("[data-banner-go]"))) showSlide(ban, +el.getAttribute("data-banner-go"));
      if ((el = t.closest("[data-banner-toggle]"))) ban._sdb.user = !ban._sdb.user;
      planBanner(ban);
    }
    var steps = t.closest("[data-sdb-steps]");
    if (steps) {
      if ((el = t.closest("[data-step-next]")) && el.getAttribute("aria-disabled") !== "true") showStep(steps, steps._step + 1, true);
      if ((el = t.closest("[data-step-prev]"))) showStep(steps, steps._step - 1, true);
      if ((el = t.closest("[data-step-skip]"))) showStep(steps, steps._step + 1, true);
      if ((el = t.closest("[data-step-dot]")) && +el.getAttribute("data-step-dot") < steps._step) showStep(steps, +el.getAttribute("data-step-dot"), true);
    }

    if ((el = t.closest("[data-toggle-password]"))) {
      var input = el.closest(".sdb-control").querySelector("input");
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      el.setAttribute("aria-pressed", show ? "true" : "false");
      el.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
      el.innerHTML = icon(show ? "olhoFechado" : "olho");
    }
    if ((el = t.closest("[data-clear]"))) {
      var ci = el.closest(".sdb-control").querySelector("input");
      ci.value = ""; ci.focus();
    }

    if ((el = t.closest("[data-toggle]")) && !el.disabled) {
      var pressed = el.getAttribute("aria-pressed") !== "true";
      var g = el.getAttribute("data-toggle-group");
      if (g && pressed) {
        Array.prototype.forEach.call(document.querySelectorAll('[data-toggle-group="' + g + '"]'), function (o) { o.setAttribute("aria-pressed", "false"); });
      }
      el.setAttribute("aria-pressed", pressed ? "true" : "false");
      if (el.parentNode && el.parentNode.classList && el.parentNode.classList.contains("sdb-segmented")) syncSeg(el.parentNode);
    }

    if ((el = t.closest("[data-copy]"))) {
      var src = el.getAttribute("data-copy");
      var text = src.charAt(0) === "#" && document.querySelector(src) ? document.querySelector(src).innerText.trim() : src;
      copyText(text, el.getAttribute("data-copy-toast"));
    }
    if ((el = t.closest("[data-toast]"))) {
      toast(el.getAttribute("data-toast"), {
        variant: el.getAttribute("data-toast-variant"),
        title: el.getAttribute("data-toast-title"),
        action: el.getAttribute("data-toast-action"),
        icon: el.getAttribute("data-toast-icon")
      });
    }
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      var sc = document.querySelector("[data-shortcut-k]");
      if (sc) { e.preventDefault(); sc.click(); return; }
    }
    if (e.key === "Escape") {
      var menus = document.querySelectorAll(".sdb-menu.is-open");
      if (menus.length) {
        Array.prototype.forEach.call(menus, function (m) {
          m.classList.remove("is-open");
          var tr = m.parentNode.querySelector("[data-menu-trigger]");
          if (tr) { tr.setAttribute("aria-expanded", "false"); tr.focus(); }
        });
        return;
      }
      var open = document.querySelectorAll(".sdb-overlay.is-open");
      if (open.length) closeOverlay(open[open.length - 1]);
    }
    var tab = e.target.closest && e.target.closest('[data-sdb-tabs] [role="tab"]');
    if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      var all = Array.prototype.filter.call(tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'), function (x) { return !x.disabled; });
      var i = all.indexOf(tab) + (e.key === "ArrowRight" ? 1 : -1);
      var next = all[(i + all.length) % all.length];
      next.focus(); selectTab(next);
    }
    var item = e.target.closest && e.target.closest(".sdb-menu .sdb-menu__item");
    if (item && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      var items = Array.prototype.slice.call(item.closest(".sdb-menu").querySelectorAll(".sdb-menu__item:not(:disabled)"));
      var j = items.indexOf(item) + (e.key === "ArrowDown" ? 1 : -1);
      items[(j + items.length) % items.length].focus();
    }
  });

  document.addEventListener("change", function (e) {
    var step = e.target.closest && e.target.closest(".sdb-onboarding__step");
    if (step) syncConsent(step);
  });
  document.addEventListener("scroll", function (e) {
    if (e.target === document || e.target === document.documentElement) { syncTopbars(); return; }
    var c = e.target.closest && e.target.closest("[data-sdb-carousel]");
    if (c) syncCarousel(c);
  }, true);

  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.classList.contains("sdb-slider")) syncSlider(t);
    if (t.matches("textarea[data-autogrow]")) grow(t);
    if (t.id && document.querySelector('[data-count-for="' + t.id + '"]')) count(t);
  });

  /* Lista de destaques: o item apontado ou com foco cresce; só com ponteiro fino e hover. */
  function toplistAtiva(list, item) {
    var temHover = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!temHover) item = null;
    Array.prototype.forEach.call(list.querySelectorAll(".sdb-toplist__item"), function (i) { i.classList.toggle("is-active", i === item); });
    list.classList.toggle("has-active", !!item);
  }
  function toplistDe(e) {
    var list = e.target.closest && e.target.closest("[data-sdb-toplist]");
    return list ? { list: list, item: e.target.closest(".sdb-toplist__item") } : null;
  }
  document.addEventListener("pointerover", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    var t = toplistDe(e);
    if (t && t.item) toplistAtiva(t.list, t.item);
  });
  document.addEventListener("pointerout", function (e) {
    var t = toplistDe(e);
    if (!t || (e.relatedTarget && t.list.contains(e.relatedTarget))) return;
    var focado = t.list.querySelector(".sdb-toplist__link:focus-visible");
    toplistAtiva(t.list, focado ? focado.closest(".sdb-toplist__item") : null);
  });
  document.addEventListener("focusin", function (e) {
    var t = toplistDe(e);
    if (t && t.item) toplistAtiva(t.list, t.item);
  });
  document.addEventListener("focusout", function (e) {
    var t = toplistDe(e);
    if (t && !(e.relatedTarget && t.list.contains(e.relatedTarget))) toplistAtiva(t.list, null);
  });

  var warmTimer = null, showTimer = null;
  document.addEventListener("mouseover", function (e) {
    if (!e.target.closest || !e.target.closest("[data-tip]")) return;
    clearTimeout(warmTimer);
    if (!document.documentElement.hasAttribute("data-tip-warm")) {
      clearTimeout(showTimer);
      showTimer = setTimeout(function () { document.documentElement.setAttribute("data-tip-warm", ""); }, 450);
    }
  });
  document.addEventListener("mouseout", function (e) {
    if (!e.target.closest || !e.target.closest("[data-tip]")) return;
    clearTimeout(showTimer);
    warmTimer = setTimeout(function () { document.documentElement.removeAttribute("data-tip-warm"); }, 500);
  });

  window.addEventListener("resize", function () {
    syncAll(true);
    Array.prototype.forEach.call(document.querySelectorAll("[data-sdb-carousel]"), syncCarousel);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { syncAll(true); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { hydrate(); });
  else setTimeout(function () { hydrate(); }, 0);

  window.SalaBuscadores = {
    icon: icon,
    icons: Object.keys(P),
    arc: arc,
    hydrate: hydrate,
    toast: toast,
    copy: copyText,
    openOverlay: openOverlay,
    closeOverlay: closeOverlay,
    selectTab: selectTab,
    syncSeg: syncSeg,
    setSidenav: setSidenav,
    showSlide: showSlide,
    showStep: showStep
  };
})();
