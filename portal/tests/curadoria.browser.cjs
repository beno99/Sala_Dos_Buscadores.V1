const fs = require("node:fs"),
  cp = require("node:child_process"),
  path = require("node:path");
const root = require("node:path").resolve(__dirname, "../..");
const { build } = require(`${root}/portal/node_modules/esbuild`);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const contents = `import {createRoot} from 'react-dom/client';import {useState} from 'react';import {CamposFonte} from './src/features/admin/ui/CamposFonte';import {EditorBlocos} from './src/components/ds/EditorBlocos';import {ToastProvider} from './src/components/ds/Toast';import {ChecklistPublicacao} from './src/components/ds/Curadoria';import {errosDoCorpo,rotuloDoErroDoCorpo} from './src/features/admin/regras/corpo';import {focarCampo} from './src/features/admin/ui/AvisoSaida';import {corpoParaForm} from './src/data/corpo';
function App(){const [form,setForm]=useState({titulo:'O Caibalion',autor:'Três Iniciados (autoria declarada)',tradicao:'Hermetismo moderno e Novo Pensamento',tipo:'Fonte primária',referencia:'Chicago: Yogi Publication Society, 1908',url:'',capa:'bege',inicial:'X'});const [blocos,setBlocos]=useState(()=>corpoParaForm([{id:'teste-abertura',tipo:'paragrafo',texto:'Segundo O Caibalion, os sete princípios organizam a interpretação apresentada nesta obra de 1908.'},{id:'teste-imagem',tipo:'imagem',src:'',alt:'',credito:''},{id:'teste-destaque',tipo:'destaque',texto:'O TODO é MENTE; o Universo é Mental.',atribuicao:''}]));const erros=errosDoCorpo(blocos);window.fixture={blocos,erros};return <ToastProvider><main><section id="fonte"><h1>Fonte — ensaio local</h1><CamposFonte form={form} erros={{}} mudar={p=>setForm(f=>({...f,...p}))}/></section><section id="editor"><h1>Artigo — ensaio local</h1><EditorBlocos idBase="campo-corpo" blocos={blocos} onChange={setBlocos} erros={erros}/><ChecklistPublicacao itens={Object.entries(erros).map(([campo,ajuda])=>({id:campo,campo,ajuda,rotulo:rotuloDoErroDoCorpo(blocos,campo),estado:'pendente'}))} aoIrParaCampo={focarCampo}/></section></main></ToastProvider>}createRoot(document.getElementById('root')).render(<App/>);`;
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  for (const phase of ["antes", "depois"]) {
    const historical = new Set([
      "src/features/admin/ui/CamposFonte.tsx",
      "src/components/ds/CardFonte.tsx",
      "src/components/ds/EditorBlocos.tsx",
      "src/components/ds/CorpoArtigo.tsx",
      "src/components/ds/CampoImagem.tsx",
      "src/components/ds/Curadoria.tsx",
      "src/data/corpo.ts",
      "src/features/admin/regras/corpo.ts",
    ]);
    const plugins =
      phase === "antes"
        ? [
            {
              name: "historico",
              setup(b) {
                b.onLoad({ filter: /\.(tsx|ts)$/ }, (a) => {
                  const rel = path.relative(`${root}/portal`, a.path);
                  if (historical.has(rel))
                    return {
                      contents: cp.execFileSync("git", ["show", `78355fb:portal/${rel}`], {
                        cwd: root,
                        encoding: "utf8",
                      }),
                      loader: rel.endsWith("tsx") ? "tsx" : "ts",
                      resolveDir: path.dirname(a.path),
                    };
                });
              },
            },
          ]
        : [];
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
    page.setDefaultTimeout(5000);
    page.on("pageerror", (_e) => {});
    await page.route("https://**", (r) => r.abort());
    const css =
      phase === "antes"
        ? require("node:child_process").execFileSync(
            "git",
            ["show", "78355fb:design-system/components/bundle.css"],
            { cwd: root, encoding: "utf8" },
          )
        : fs.readFileSync(`${root}/design-system/components/bundle.css`, "utf8");
    const tokens = fs.readFileSync(`${root}/design-system/tokens.css`, "utf8");
    await page.setContent(
      `<html lang="pt-BR" data-theme="solido-claro"><head><style>${tokens}${css.replace(/@import[^;]+;/g, "")}body{margin:0;padding:24px}main{max-width:1000px;margin:auto}#fonte{max-width:420px;margin-bottom:48px}#fonte>div{display:flex;flex-direction:column;gap:16px}#editor{max-width:920px}</style></head><body><div id="root"></div></body></html>`,
    );
    await page.addScriptTag({ content: `window.process={env:{}};${bundle.outputFiles[0].text}` });
    await page.locator("#campo-fonte-titulo").waitFor();
    const initial = await page.locator("#campo-fonte-inicial").inputValue();
    const readonly = await page.locator("#campo-fonte-inicial").evaluate((e) => e.readOnly);
    await page.locator("#campo-fonte-titulo").fill("Hermetica");
    const updated = await page.locator("#campo-fonte-inicial").inputValue();
    await page
      .locator("#fonte")
      .screenshot({ path: `${root}/docs/evidencias-2026-10-31/fonte-${phase}.png` });
    const before = await page.evaluate(() => ({
      ...window.fixture,
      ids: [...document.querySelectorAll("#editor input, #editor textarea")].map((e) => e.id),
    }));
    await page.getByRole("button", { name: "Subir bloco 3", exact: true }).click();
    await page.waitForTimeout(60);
    const moved = await page.evaluate(() => ({
      ...window.fixture,
      active: document.activeElement.id,
      ids: [...document.querySelectorAll("#editor input, #editor textarea")].map((e) => e.id),
    }));
    const targets = [];
    for (const a of await page.locator(".sdb-checklist__item").all()) {
      const href = await a.getAttribute("href");
      await a.click();
      targets.push({ href, active: await page.evaluate(() => document.activeElement.id) });
    }
    await page
      .locator("#editor")
      .screenshot({ path: `${root}/docs/evidencias-2026-10-31/editor-${phase}.png` });
    await page.getByRole("button", { name: "Subir bloco 3", exact: true }).click();
    await page.waitForTimeout(60);
    const imageMoveFocus = await page.evaluate(() => ({
      active: document.activeElement.id,
      tag: document.activeElement.tagName,
      label: document.activeElement.getAttribute("aria-label"),
    }));
    const viewportChecks = [];
    for (const width of [390, 768, 1280, 1440])
      for (const zoom of [1, 2]) {
        await page.setViewportSize({ width: Math.round(width / zoom), height: 1000 });
        const check = await page.evaluate(() => {
          const source = document.querySelector(".sdb-source"),
            tag = document.querySelector(".sdb-source__tags");
          const sty = document.createElement("style");
          sty.textContent = ".sdb-editor [data-tip]::after{display:none!important}";
          document.head.append(sty);
          const noTips = document.documentElement.scrollWidth;
          sty.remove();
          return {
            noTips,
            documentOverflow: document.documentElement.scrollWidth > innerWidth,
            scrollX,
            docWidth: document.documentElement.scrollWidth,
            offenders: [...document.querySelectorAll("body *")]
              .filter((e) => e.getBoundingClientRect().right + scrollX > innerWidth + 1)
              .slice(0, 6)
              .map((e) => ({ tag: e.tagName, cl: e.className, right: e.getBoundingClientRect().right })),
            sourceOverflow: source.scrollWidth > source.clientWidth,
            tagFull: tag.textContent.includes("Hermetismo moderno e Novo Pensamento"),
          };
        });
        await page.locator(".sdb-editor__insert button[aria-haspopup]").first().click();
        await page.waitForTimeout(30);
        const menu = await page.locator(".sdb-editor__insert .sdb-menu.is-open").evaluate((e) => ({
          left: e.getBoundingClientRect().left,
          right: e.getBoundingClientRect().right,
          viewport: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
        }));
        await page.keyboard.press("Escape");
        await page.locator(".sdb-fmt [data-tip]").last().hover();
        await page.waitForTimeout(500);
        const tooltipOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        await page.mouse.move(0, 0);
        viewportChecks.push({ width, zoom, ...check, menu, tooltipOverflow });
        if (width === 390 && zoom === 1) {
          await page
            .locator("#fonte")
            .screenshot({ path: `${root}/docs/evidencias-2026-10-31/fonte-${phase}-390.png` });
          await page
            .locator("#editor")
            .screenshot({ path: `${root}/docs/evidencias-2026-10-31/editor-${phase}-390.png` });
        }
      }
    results.push({
      phase,
      initial,
      readonly,
      updated,
      before,
      moved,
      targets,
      imageMoveFocus,
      viewportChecks,
    });
    await page.close();
  }
  fs.writeFileSync(
    `${root}/docs/evidencias-2026-10-31/curadoria-react-resultados.json`,
    JSON.stringify(results, null, 2),
  );
  await browser.close();
})();
