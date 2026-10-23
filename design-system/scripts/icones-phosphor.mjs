#!/usr/bin/env node
/**
 * Gera os ícones da biblioteca a partir do Phosphor (https://phosphoricons.com).
 *
 * O mapa `components/Iconografia/phosphor.json` liga cada nome da biblioteca a um
 * ícone do Phosphor ("nome" usa o peso regular; "nome:fill" força o preenchido).
 * Os SVGs ficam embutidos no runtime: nada é carregado da rede.
 *
 *   npm pack @phosphor-icons/core@2.1.1 && tar xzf phosphor-icons-core-2.1.1.tgz
 *   node design-system/scripts/icones-phosphor.mjs <pasta>/package
 *
 * Depois rode `node design-system/scripts/build.mjs` e, no portal, `npm run ds:sync`.
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ds = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pacote = process.argv[2];
if (!pacote || !existsSync(join(pacote, "assets/regular"))) {
  console.error("Informe a pasta do pacote @phosphor-icons/core (a que contém assets/).");
  process.exit(1);
}

const mapa = JSON.parse(readFileSync(join(ds, "components/Iconografia/phosphor.json"), "utf8"));

function corpo(nome, peso) {
  const arquivo = join(pacote, "assets", peso, peso === "regular" ? `${nome}.svg` : `${nome}-${peso}.svg`);
  if (!existsSync(arquivo)) throw new Error(`Ícone ${nome} (${peso}) não existe no Phosphor.`);
  const svg = readFileSync(arquivo, "utf8").trim();
  return svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));
}

function ler(valor) {
  const [nome, peso = "regular"] = valor.split(":");
  return { regular: corpo(nome, peso), fill: corpo(nome, "fill") };
}

const lista = (pares) => pares.map(([k, v]) => `    ${k}: '${v}'`).join(",\n");
const biblioteca = Object.entries(mapa.biblioteca).map(([k, v]) => [k, ler(v)]);
const bloco = `  /* ICONES:INICIO Gerado por scripts/icones-phosphor.mjs (${mapa.versao}, licença MIT em components/Iconografia/LICENCA-PHOSPHOR.txt). Não edite à mão. */
  var P = {
${lista(biblioteca.map(([k, v]) => [k, v.regular]))}
  };

  var PF = {
${lista(biblioteca.map(([k, v]) => [k, v.fill]))}
  };
  /* ICONES:FIM */`;

const bundlePath = join(ds, "components/bundle.js");
const bundle = readFileSync(bundlePath, "utf8");
const marcado = /  \/\* ICONES:INICIO[\s\S]*?\/\* ICONES:FIM \*\//;
const original = /  var P = \{[\s\S]*?\n  \};/;
if (!marcado.test(bundle) && !original.test(bundle)) throw new Error("Bloco de ícones não encontrado em bundle.js.");
writeFileSync(bundlePath, bundle.replace(marcado.test(bundle) ? marcado : original, () => bloco));

const interfaceIcones = Object.fromEntries(
  Object.entries(mapa.interface).map(([k, v]) => [
    k,
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">${ler(v).regular}</svg>`,
  ]),
);
writeFileSync(join(ds, "components/EstadosInterface/icones.json"), `${JSON.stringify(interfaceIcones, null, 2)}\n`);

copyFileSync(join(pacote, "LICENSE"), join(ds, "components/Iconografia/LICENCA-PHOSPHOR.txt"));
console.log(`${biblioteca.length} ícones da biblioteca e ${Object.keys(interfaceIcones).length} de interface gerados do Phosphor.`);
