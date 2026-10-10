#!/usr/bin/env node
/**
 * Sincroniza a biblioteca de componentes (fonte da verdade: ../design-system)
 * com a cópia usada pelo portal (src/design-system) e gera os ícones em
 * TypeScript a partir do runtime `bundle.js`.
 *
 *   node scripts/sync-design-system.mjs          copia e gera
 *   node scripts/sync-design-system.mjs --check  só confere; sai com 1 se houver diferença
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const portal = resolve(here, "..");
const source = resolve(portal, "../design-system");
const target = resolve(portal, "src/design-system");
const check = process.argv.includes("--check");

const FILES = [
  ["tokens.css", "tokens.css"],
  ["tokens.json", "tokens.json"],
  ["components/bundle.css", "bundle.css"],
  ["components/bundle.js", "bundle.js"],
  // Versão 1.0: materiais dos temas, ajustes da família original e as peças refeitas,
  // cada uma com seu CSS. O layout do catálogo (refined-layout.css) não entra no portal.
  ["assets/themes.css", "themes.css"],
  ["components/refinement.css", "refinement.css"],
  ["components/CardSala/card-sala.css", "card-sala.css"],
  ["components/CardConteudo/card-conteudo.css", "card-conteudo.css"],
  ["components/CardVideo/card-video.css", "card-video.css"],
  ["components/CardComparativo/card-comparativo.css", "card-comparativo.css"],
  ["components/AssistenteOrb/assistant-orb.css", "assistant-orb.css"],
  // Renderizador WebGL do orbe do assistente: é desenho, não comportamento, então vem como está.
  ["components/AssistenteOrb/gold-orb.js", "gold-orb.js"],
  ["fonts/Gambetta-Variable.woff2", "fonts/Gambetta-Variable.woff2"],
  ["fonts/Gambetta-VariableItalic.woff2", "fonts/Gambetta-VariableItalic.woff2"],
  ["fonts/Gambetta-LICENCA-FFL.txt", "fonts/Gambetta-LICENCA-FFL.txt"],
];

if (!existsSync(source)) {
  console.error(`Design system não encontrado em ${source}.`);
  process.exit(1);
}

const problems = [];

for (const [from, to] of FILES) {
  const src = join(source, from);
  const dest = join(target, to);
  const same = existsSync(dest) && readFileSync(src).equals(readFileSync(dest));
  if (same) continue;
  if (check) {
    problems.push(`${relative(portal, dest)} difere de ${relative(portal, src)}`);
  } else {
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log(`copiado  ${relative(portal, dest)}`);
  }
}

const iconsFile = join(target, "icons.generated.ts");
const icons = generateIcons(readFileSync(join(source, "components/bundle.js"), "utf8"));
const current = existsSync(iconsFile) ? readFileSync(iconsFile, "utf8") : "";
if (current !== icons) {
  if (check) problems.push(`${relative(portal, iconsFile)} está desatualizado`);
  else {
    writeFileSync(iconsFile, icons);
    console.log(`gerado   ${relative(portal, iconsFile)}`);
  }
}

// O bundle.css importa as fontes do Google na primeira linha. No build, esse
// @import deixa de ficar no topo do CSS concatenado e é descartado; por isso a
// URL vai para o layout como <link>, gerada daqui para não divergir.
const fontesFile = join(target, "fontes.generated.ts");
const bundleCss = readFileSync(join(source, "components/bundle.css"), "utf8");
const urlFontes = /@import url\("([^"]+)"\)/.exec(bundleCss)?.[1];
if (!urlFontes) problems.push("URL das fontes não encontrada em components/bundle.css");
else {
  const fontes = `/* Gerado por scripts/sync-design-system.mjs a partir de design-system/components/bundle.css. Não edite à mão. */\n\nexport const GOOGLE_FONTS_URL =\n  ${JSON.stringify(urlFontes)};\n`;
  const atual = existsSync(fontesFile) ? readFileSync(fontesFile, "utf8") : "";
  if (atual !== fontes) {
    if (check) problems.push(`${relative(portal, fontesFile)} está desatualizado`);
    else {
      writeFileSync(fontesFile, fontes);
      console.log(`gerado   ${relative(portal, fontesFile)}`);
    }
  }
}

if (problems.length) {
  console.error("A cópia do design system no portal não bate com ../design-system:");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("Rode `npm run ds:sync` (e nunca edite src/design-system à mão).");
  process.exit(1);
}
console.log(check ? "Design system em dia." : "Design system sincronizado.");

/**
 * Executa o bundle.js num contexto isolado com um DOM mínimo, lê
 * `SalaBuscadores.icons` / `SalaBuscadores.icon(nome)` e converte cada SVG
 * numa árvore de nós que o React renderiza sem innerHTML.
 */
function generateIcons(bundle) {
  const noop = () => {};
  const document = {
    readyState: "complete",
    addEventListener: noop,
    querySelectorAll: () => [],
    querySelector: () => null,
    documentElement: { hasAttribute: () => false, setAttribute: noop, removeAttribute: noop },
  };
  const window = { addEventListener: noop };
  const sandbox = { window, document, setTimeout: noop, requestAnimationFrame: noop, navigator: {} };
  vm.createContext(sandbox);
  vm.runInContext(bundle, sandbox);
  const api = sandbox.window.SalaBuscadores;

  const entries = api.icons.map((name) => {
    const svg = api.icon(name);
    const body = svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
    return `  ${name}: ${JSON.stringify(parseSvg(body))},`;
  });

  return `/* Gerado por scripts/sync-design-system.mjs a partir de design-system/components/bundle.js. Não edite à mão. */

export type SvgNode = { t: string; a: Record<string, string>; c?: SvgNode[] };

export const ICONS = {
${entries.join("\n")}
} as const satisfies Record<string, SvgNode[]>;

export type IconName = keyof typeof ICONS;
`;
}

function parseSvg(markup) {
  const root = { c: [] };
  const stack = [root];
  const tag = /<(\/?)([a-z]+)([^>]*?)(\/?)>/g;
  let m = tag.exec(markup);
  while (m) {
    const [, closing, name, rawAttrs, selfClosing] = m;
    if (closing) stack.pop();
    else {
      const node = { t: name, a: parseAttrs(rawAttrs) };
      const parent = stack[stack.length - 1];
      parent.c = parent.c ?? [];
      parent.c.push(node);
      if (!selfClosing) stack.push(node);
    }
    m = tag.exec(markup);
  }
  return root.c;
}

function parseAttrs(raw) {
  const attrs = {};
  for (const [, key, value] of raw.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    attrs[key.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = value;
  }
  return attrs;
}
