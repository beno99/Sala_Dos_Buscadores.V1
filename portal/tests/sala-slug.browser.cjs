const fs = require("node:fs");
const cp = require("node:child_process");
const path = require("node:path");
const root = require("node:path").resolve(__dirname, "../..");
const { build } = require(`${root}/portal/node_modules/esbuild`);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const out = `${root}/docs/evidencias-2026-10-31`;
fs.mkdirSync(out, { recursive: true });
const contents = `import {createRoot} from 'react-dom/client';import {EditorSalaOficial} from './src/features/admin/ui/salas/EditorSalaOficial';import {ToastProvider} from './src/components/ds/Toast';
const inicial={id:null,nome:'Tradição Hermética',slug:'',tradicao:'Textos herméticos',tradicaoCurta:'Hermetismo',descricao:'Leituras de textos herméticos com fontes e contexto histórico.',periodo:'Antiguidade tardia',placa:'bordo',inicial:'H',imagem:null,link:''};
createRoot(document.getElementById('root')).render(<ToastProvider><main><p className="sdb-meta">Ensaio local — dados de teste, ações em memória</p><EditorSalaOficial inicial={inicial} imagem={null} status="rascunho" atualizadoEm={null} slugTravado={false}/></main></ToastProvider>);`;
const serverStub = `let slug='';export async function salvarSalaOficialAcao(f){window.formulariosTeste??=[];window.formulariosTeste.push(f);slug ||= f.nome.normalize('NFD').replace(/\\p{Diacritic}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');return {ok:true,valor:{id:'s-teste-ui',slug,salvoEm:new Date().toISOString(),status:'rascunho'},mensagem:'Rascunho salvo.'}}export async function mudarStatusSalaAcao(){throw new Error('Publicação bloqueada no ensaio')}`;
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  for (const phase of ["antes", "depois"]) {
    const plugins = [
      {
        name: "isolamento",
        setup(b) {
          b.onResolve({ filter: /^next\/navigation$/ }, () => ({ path: "navigation", namespace: "fixture" }));
          b.onResolve({ filter: /^next\/link$/ }, () => ({ path: "link", namespace: "fixture" }));
          b.onResolve({ filter: /server\/admin\/acoes$/ }, () => ({ path: "acoes", namespace: "fixture" }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, (a) => ({
            contents:
              a.path === "navigation"
                ? `export const useRouter=()=>({push(){},refresh(){}});export const usePathname=()=>'/admin/salas/nova';`
                : a.path === "link"
                  ? `import React from 'react';export default function Link({href,children,...props}){return <a href={href} {...props}>{children}</a>}`
                  : serverStub,
            loader: "tsx",
            resolveDir: `${root}/portal`,
          }));
          if (phase === "antes")
            b.onLoad({ filter: /EditorSalaOficial\.tsx$/ }, (a) => ({
              contents: cp.execFileSync(
                "git",
                ["show", "78355fb:portal/src/features/admin/ui/salas/EditorSalaOficial.tsx"],
                { cwd: root, encoding: "utf8" },
              ),
              loader: "tsx",
              resolveDir: path.dirname(a.path),
            }));
        },
      },
    ];
    const bundle = await build({
      stdin: { contents, resolveDir: `${root}/portal`, loader: "tsx" },
      bundle: true,
      write: false,
      jsx: "automatic",
      tsconfig: `${root}/portal/tsconfig.json`,
      define: { "process.env.NODE_ENV": '"test"' },
      plugins,
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    page.setDefaultTimeout(6000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const css =
      fs.readFileSync(`${root}/design-system/tokens.css`, "utf8") +
      fs.readFileSync(`${root}/design-system/components/bundle.css`, "utf8").replace(/@import[^;]+;/g, "");
    await page.route("**/*", (r) =>
      r.request().url() === "http://ensaio.local/admin/salas/nova"
        ? r.fulfill({
            contentType: "text/html",
            body: `<html lang="pt-BR" data-theme="solido-claro"><head><style>${css}body{margin:0;padding:24px}main{max-width:1000px;margin:auto}.flex{display:flex}.flex-col{flex-direction:column}.gap-6{gap:24px}.gap-3{gap:12px}.gap-2{gap:8px}.contents{display:contents}.grid{display:grid}.sdb-panel input{min-width:0}</style></head><body><div id="root"></div></body></html>`,
          })
        : r.abort(),
    );
    await page.goto("http://ensaio.local/admin/salas/nova");
    await page.addScriptTag({ content: `window.process={env:{}};${bundle.outputFiles[0].text}` });
    await page.locator("#campo-sala-slug").waitFor();
    const initial = await page
      .locator("#campo-sala-slug")
      .evaluate((e) => ({ value: e.value, readOnly: e.readOnly, disabled: e.disabled }));
    await page
      .locator('section[aria-labelledby="sec-sala-identidade"]')
      .screenshot({ path: `${out}/sala-slug-${phase}.png` });
    await page.locator("#campo-sala-nome").fill("Corpus Hermeticum");
    await page.waitForFunction(() => window.formulariosTeste?.length >= 1);
    const saved = await page
      .locator("#campo-sala-slug")
      .evaluate((e) => ({ value: e.value, readOnly: e.readOnly }));
    await page.locator("#campo-sala-nome").fill("Textos Herméticos");
    await page.waitForFunction(() => window.formulariosTeste?.length >= 2);
    const renamed = await page
      .locator("#campo-sala-slug")
      .evaluate((e) => ({ value: e.value, readOnly: e.readOnly }));
    await page
      .locator('section[aria-labelledby="sec-sala-identidade"]')
      .screenshot({ path: `${out}/sala-slug-${phase}-salvo.png` });
    await page.setViewportSize({ width: 390, height: 1000 });
    await page
      .locator('section[aria-labelledby="sec-sala-identidade"]')
      .screenshot({ path: `${out}/sala-slug-${phase}-390.png` });
    results.push({
      phase,
      initial,
      saved,
      renamed,
      errors,
      forms: await page.evaluate(() => window.formulariosTeste),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(`${out}/sala-slug-react-resultados.json`, JSON.stringify(results, null, 2));
})();
