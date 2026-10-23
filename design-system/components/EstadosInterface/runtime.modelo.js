/* Estados e orientação 1.1. SVGs do Phosphor (licença MIT em components/Iconografia/LICENCA-PHOSPHOR.txt). */
(() => {
  const icons = /* ICONES */ {};
  const volumeNames = new Set(["pasta", "historico", "busca", "livro", "alerta", "sucesso", "escudo"]);
  function icon(name) { return icons[name] || icons.busca; }
  function volume(name, small = false) {
    const symbol = volumeNames.has(name) ? name : "pasta";
    return '<span class="sdb-ui-volume' + (small ? ' sdb-ui-volume-small' : '') + '" data-symbol="' + symbol + '" aria-hidden="true">' +
      '<span class="sdb-ui-volume-back"></span><span class="sdb-ui-volume-sheet"><i></i><i></i></span>' +
      '<span class="sdb-ui-volume-front">' + icon(symbol) + '</span><span class="sdb-ui-volume-seal"><span></span></span></span>';
  }
  function hydrate(root = document) {
    root.querySelectorAll("[data-ui-icon]").forEach(el => {
      el.innerHTML = icon(el.dataset.uiIcon);
      el.classList.add("sdb-ui-interface-icon");
      el.setAttribute("aria-hidden", "true");
    });
    root.querySelectorAll("[data-ui-volume]").forEach(el => {
      el.innerHTML = volume(el.dataset.uiVolume, el.dataset.uiSize === "small");
      el.setAttribute("aria-hidden", "true");
    });
  }
  function atualizarProgresso(root, concluidos, total) {
    const valid = Number.isFinite(total) && total > 0 && Number.isFinite(concluidos);
    const value = valid ? Math.max(0, Math.min(concluidos, total)) : 0;
    const bar = root.querySelector("progress");
    const pct = root.querySelector("[data-ui-percent]");
    const legenda = root.querySelector("[data-ui-progress-label]");
    bar.hidden = !valid;
    if (valid) { bar.max = total; bar.value = value; }
    pct.textContent = valid ? Math.round(value / total * 100) + "%" : "—";
    legenda.textContent = valid ? value + " de " + total + " etapas concluídas" : "O progresso aparecerá quando houver etapas definidas.";
  }
  document.addEventListener("click", event => {
    const open = event.target.closest("[data-ui-open]");
    if (open) document.getElementById(open.dataset.uiOpen)?.showModal();
    if (event.target.closest("[data-ui-close]")) event.target.closest("dialog")?.close();
  });
  window.SalaInterface = { icon, volume, hydrate, atualizarProgresso };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => hydrate());
  else hydrate();
})();
