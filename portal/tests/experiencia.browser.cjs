// Fixture de componentes reais; não abre sessão nem banco do Portal.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../..");
const { build } = require(process.env.ESBUILD_MODULE || "esbuild");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `
    import {createRoot} from 'react-dom/client'; import {useState} from 'react';
    import {Drawer} from './src/components/ds/Drawer';
    import {ConversaProvider,useConversa} from './src/features/assistente/ConversaProvider';
    import {CabecalhoAssistente} from './src/components/ds/CabecalhoAssistente';
    import {EsferaAssistente} from './src/components/ds/EsferaAssistente';
    function App(){const [open,setOpen]=useState(false);const c=useConversa();return <>
      <button onClick={()=>setOpen(true)}>Mais</button>
      <Drawer open={open} onClose={()=>setOpen(false)} title="Mais"><a href="#portal">Portal</a><a href="#salas">Salas</a><div style={{height:900}}/><button>Sair</button></Drawer>
      <div className="sdb-assistant-screen"><CabecalhoAssistente conta={null} onBuscar={()=>{}}/><EsferaAssistente aparencia={c.aparencia} pausado={c.pausado} onPerguntar={()=>{}}/><output>{c.aparencia}:{String(c.pausado)}</output></div>
    </>};createRoot(document.getElementById('root')).render(<ConversaProvider><App/></ConversaProvider>);`,
      resolveDir: `${root}/portal`,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: `${root}/portal/tsconfig.json`,
    define: { "process.env.NODE_ENV": '"test"' },
  });
  const css = [
    "tokens.css",
    "components/bundle.css",
    "assets/themes.css",
    "components/AssistenteOrb/assistant-orb.css",
    "components/TelaAssistente/tela-assistente.css",
  ]
    .map((f) => fs.readFileSync(`${root}/design-system/${f}`, "utf8"))
    .join("\n")
    .replace(/@import[^;]+;/g, "");
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--disable-webgl"] });
  const results = [];
  fs.mkdirSync("/tmp/portal-evidencias-experiencia", { recursive: true });
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    await page.route("http://fixture.local/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<html data-theme="solido-claro"><style>${css}</style><body><div id="root"></div><script>window.process={env:{}};${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`,
      }),
    );
    page.setDefaultTimeout(5000);
    page.on("pageerror", (e) => process.stderr.write(`${String(e)}\n`));
    await page.goto("http://fixture.local");
    await page.getByRole("button", { name: "Mais", exact: true }).click();
    await page.waitForTimeout(70);
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Portal");
    assert.equal(await page.locator(".sdb-drawer__body").evaluate((e) => e.scrollTop), 0);
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.activeElement.textContent), "Mais");
    await page.getByRole("button", { name: "Dourada", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("output").textContent === "gold:false");
    assert.equal(await page.evaluate(() => localStorage.getItem("sdb-esfera-aparencia")), "gold");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "solido-claro");
    await page.reload();
    await page.waitForFunction(() => document.querySelector("output")?.textContent === "gold:false");
    await page.getByRole("button", { name: "Escura", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("output").textContent === "dark:false");
    assert.equal(await page.locator(".dark-visual canvas").getAttribute("data-renderer"), "fallback");
    await page.getByRole("button", { name: "Pausar movimento", exact: true }).click();
    await page.waitForFunction(() => document.querySelector("output").textContent === "dark:true");
    assert.equal(
      await page.locator('button[aria-label="Retomar movimento"]').getAttribute("aria-pressed"),
      "true",
    );
    for (const theme of ["solido-claro", "solido-escuro"]) {
      await page.locator("html").evaluate((el, t) => (el.dataset.theme = t), theme);
      await page.screenshot({ path: `/tmp/portal-evidencias-experiencia/componentes-${width}-${theme}.png` });
      results.push({
        width,
        theme,
        focus: "Portal",
        storage: "persistiu após recarga",
        fallback: "dark",
        pausa: true,
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      });
    }
    await page.close();
  }
  fs.writeFileSync("/tmp/portal-evidencias-experiencia/resultados.json", JSON.stringify(results, null, 2));
  process.stdout.write(JSON.stringify(results));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
