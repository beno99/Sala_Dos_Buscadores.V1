#!/usr/bin/env node
/**
 * Confere o contraste WCAG dos pares de texto do tokens.json nos quatro temas.
 * Cores translúcidas são compostas sobre o fundo (materiais sobre o canvas;
 * nos temas de vidro, o brilho ambiente é ignorado: a conta usa o canvas liso).
 *
 *   node scripts/contraste.mjs   sai com 1 se algum texto ficar abaixo de 4,5:1
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = JSON.parse(readFileSync(join(root, "tokens.json"), "utf8"));
const todos = [...tokens.color.tokens, ...(tokens.float?.tokens ?? [])];

function bruto(nome, tema) {
  const t = todos.find((x) => x.name === nome);
  if (!t) throw new Error(`token desconhecido: ${nome}`);
  const v = typeof t.value === "object" ? t.value[tema] : t.value;
  const ref = /^\{([a-z0-9-]+)\}$/.exec(v);
  return ref ? bruto(ref[1], tema) : v;
}

function rgba(cor) {
  const hex = /^#([0-9a-f]{6})$/i.exec(cor);
  if (hex) {
    const n = Number.parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(cor);
  if (!m) throw new Error(`cor não suportada: ${cor}`);
  const parts = m[1].trim().split(/[\s,/]+/);
  const [r, g, b] = parts.slice(0, 3).map(Number);
  const a = parts[3] === undefined ? 1 : parseFloat(parts[3]) / (parts[3].endsWith('%') ? 100 : 1);
  if (![r,g,b,a].every(Number.isFinite)) throw new Error(`cor inválida: ${cor}`);
  return [r, g, b, a];
}

const sobre = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];

function luminancia([r, g, b]) {
  const c = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b);
}

function razao(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const FUNDOS = ["bg-canvas", "material-thin", "material-regular", "material-thick", "float-fill", "nav-fill", "card-warm", "nav-card", "overlay-from", "overlay-to"];
const TEXTOS = ["label", "label-secondary", "accent", "critical"];
const PARES = [
  ...["community-canvas", "community-surface", "community-inset", "community-notice"].flatMap(f => ["label", "label-secondary", "community-link"].map(t => [t,f])),
  ["community-question-ink", "community-question"],
  ["community-action-ink", "community-action"],
  ["level-beginner-ink", "level-beginner-fill"],
  ["level-intermediate-ink", "level-intermediate-fill"],
  ["level-advanced-ink", "level-advanced-fill"],
  ["tag-blue-ink", "tag-blue-fill"],
  ["tag-green-ink", "tag-green-fill"],
  ["tag-amber-ink", "tag-amber-fill"],
  ["tag-purple-ink", "tag-purple-fill"],
  ["tag-neutral-ink", "tag-neutral-fill"],
  ["on-accent", "accent-fill"],
  ["on-prominent", "prominent-fill"],
  ["on-depth", "depth-fill"],
  ["on-critical", "critical-fill"],
];
// Rótulos em cápsula translúcida (Badge, Selo de proveniência) dentro de um card: compostos sobre material-regular.
const PARES_EM_CARD = [
  ["accent", "accent-soft"],
  ["critical", "critical-soft"],
  ["label", "fill"],
  ["label-secondary", "fill"],
];
const VEUS = ["veil-media", "veil-media-deep"];
// Pares da paleta areia (Figma 2026-10-20): [texto, camada, base sobre o canvas].
const PARES_AREIA = [
  ["nav-active-label", "nav-active-fill", "nav-fill"],
  ["positive", "positive-soft", "nav-fill"],
  ["danger", "nav-fill", "bg-canvas"],
  ["on-chip-warm", "chip-warm", "bg-canvas"],
  ["label-brand", "bg-canvas", "bg-canvas"],
  ["label-brand", "nav-card", "nav-fill"],
  ["label-secondary", "kbd-warm", "card-warm"],
  ["on-action-warm", "action-warm", "card-warm"],
  ["on-gold-action", "gold-action-to", "overlay-to"],
  ["on-gold-action", "gold-action-from", "overlay-from"],
  ["label-secondary", "overlay-to", "overlay-to"],
  ["label", "overlay-panel", "overlay-to"],
  ["label-secondary", "overlay-panel", "overlay-to"],
  // Trecho selecionado no campo em foco (barra de formatação), sobre o material espesso.
  ["label", "text-selection", "material-thick"],
  ["label", "text-selection", "material-regular"],
  ["label", "fill", "material-regular"],
  ["accent", "thumb", "material-regular"],
  ["accent", "text-selection", "material-thick"],
];

let falhas = 0;
for (const { id } of tokens.color.themes) {
  const canvas = rgba(bruto("bg-canvas", id));
  const linhas = [];
  for (const fundo of FUNDOS) {
    const f = sobre(rgba(bruto(fundo, id)), canvas);
    for (const texto of [...TEXTOS, "label-tertiary"]) {
      const r = razao(sobre(rgba(bruto(texto, id)), f), f);
      const informativo = texto === "label-tertiary";
      const ok = informativo || r >= 4.5;
      if (!ok) falhas++;
      linhas.push(`${ok ? "  " : "✗ "}${texto.padEnd(16)} sobre ${fundo.padEnd(16)} ${r.toFixed(2)}${informativo ? " (só ícones e placeholders)" : ""}`);
    }
  }
  for (const [texto, fundo] of PARES) {
    const f = sobre(rgba(bruto(fundo, id)), canvas);
    const r = razao(sobre(rgba(bruto(texto, id)), f), f);
    if (r < 4.5) falhas++;
    linhas.push(`${r >= 4.5 ? "  " : "✗ "}${texto.padEnd(16)} sobre ${fundo.padEnd(16)} ${r.toFixed(2)}`);
  }
  const card = sobre(rgba(bruto("material-regular", id)), canvas);
  for (const [texto, fundo] of PARES_EM_CARD) {
    const f = sobre(rgba(bruto(fundo, id)), card);
    const r = razao(sobre(rgba(bruto(texto, id)), f), f);
    if (r < 4.5) falhas++;
    linhas.push(`${r >= 4.5 ? "  " : "✗ "}${texto.padEnd(16)} sobre ${fundo} (em card) ${r.toFixed(2)}`);
  }
  // Véu sobre imagem: composto sobre a luz mais clara do duotone (bege), o pior caso.
  for (const veu of VEUS) {
    if (!todos.some((t) => t.name === veu)) continue;
    const f = sobre(rgba(bruto(veu, id)), rgba(bruto("bege-damasco", id)));
    const r = razao(sobre(rgba(bruto("on-media", id)), f), f);
    if (r < 4.5) falhas++;
    linhas.push(`${r >= 4.5 ? "  " : "✗ "}${"on-media".padEnd(16)} sobre ${veu} (sobre bege) ${r.toFixed(2)}`);
  }
  for (const [texto, camada, base] of PARES_AREIA) {
    const b = sobre(rgba(bruto(base, id)), canvas);
    const f = sobre(rgba(bruto(camada, id)), b);
    const r = razao(sobre(rgba(bruto(texto, id)), f), f);
    if (r < 4.5) falhas++;
    linhas.push(`${r >= 4.5 ? "  " : "✗ "}${texto.padEnd(16)} sobre ${camada} (em ${base}) ${r.toFixed(2)}`);
  }
  console.log(`\n${id}\n${linhas.join("\n")}`);
}
if (falhas) {
  console.error(`\n${falhas} par(es) abaixo de 4,5:1.`);
  process.exit(1);
}
console.log("\nTodos os pares de texto passam AA (4,5:1).");
