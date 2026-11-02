// Componentes reais, rede isolada: o endpoint de teste responde 503, nunca uma resposta inventada.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { build } = require(process.env.ESBUILD_MODULE || "esbuild");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = path.resolve(__dirname, "../..");
const out = path.join(root, "docs/refinamento-2026-11-02/evidencias");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';
        import {ConversaProvider} from './src/features/assistente/ConversaProvider';
        import {CabecalhoAssistente} from './src/components/ds/CabecalhoAssistente';
        import {TelaAssistente} from './src/features/assistente/TelaAssistente';
        createRoot(document.getElementById('root')).render(<ConversaProvider><div className="sdb-assistant-screen"><p>DEMONSTRAÇÃO LOCAL · serviço indisponível de teste</p><CabecalhoAssistente conta={null} onBuscar={()=>{}}/><TelaAssistente salas={[{slug:'corpus-hermeticum',nome:'Corpus Hermeticum'},{slug:'nag-hammadi',nome:'Biblioteca de Nag Hammadi'}]}/></div></ConversaProvider>);`,
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
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  fs.mkdirSync(out, { recursive: true });
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    const requests = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.addInitScript(() => {
      window.__gl = { draws: 0, deletes: 0 };
      for (const proto of [
        window.WebGLRenderingContext?.prototype,
        window.WebGL2RenderingContext?.prototype,
      ]) {
        if (!proto) continue;
        for (const name of ["drawArrays", "drawElements", "deleteProgram", "deleteBuffer", "deleteTexture"]) {
          const orig = proto[name];
          proto[name] = function (...args) {
            window.__gl[name.startsWith("draw") ? "draws" : "deletes"]++;
            return orig.apply(this, args);
          };
        }
      }
    });
    await page.route("http://localhost:4999/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.startsWith("/fonts/") && pathname.endsWith(".woff2")) {
        return route.fulfill({
          contentType: "font/woff2",
          body: fs.readFileSync(path.join(root, "design-system/fonts", path.basename(pathname))),
        });
      }
      if (route.request().url().endsWith("/api/assistente")) {
        requests.push(route.request().postDataJSON());
        return route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            ok: false,
            erro: "Erro: serviço indisponível neste teste. Sua pergunta foi preservada.",
          }),
        });
      }
      return route.fulfill({
        contentType: "text/html",
        body: `<html lang="pt-BR" data-theme="solido-claro"><style>${css}</style><body><div id="root"></div><script>window.process={env:{}};${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`,
      });
    });
    page.setDefaultTimeout(10000);
    await page.goto("http://localhost:4999");
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page.evaluate(
        () => document.fonts.check('16px "General Sans"') && document.fonts.check('16px "Gambetta"'),
      ),
      true,
    );
    const question = page.getByRole("textbox", { name: "Sua pergunta ao acervo" });
    await question.fill("Rascunho preservado");
    await page.getByRole("combobox", { name: "Modo de estudo" }).selectOption("comparar");
    await page.getByRole("combobox", { name: "Sala de estudo" }).selectOption("corpus-hermeticum");
    await page.getByRole("button", { name: "Pausar movimento", exact: true }).click();
    const renderers = [];
    for (const name of ["Dourada", "Escura"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await page.waitForTimeout(200);
      renderers.push(await page.locator("canvas").getAttribute("data-renderer"));
      assert.equal(await question.inputValue(), "Rascunho preservado");
      assert.equal(await page.getByRole("combobox", { name: "Modo de estudo" }).inputValue(), "comparar");
      assert.equal(
        await page.getByRole("combobox", { name: "Sala de estudo" }).inputValue(),
        "corpus-hermeticum",
      );
      const before = await page.evaluate(() => window.__gl.draws);
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => window.__gl.draws), before, "pausa deve suspender frames");
    }
    const hasWebgl = renderers.every((r) => r === "webgl");
    if (hasWebgl) {
      await page.getByRole("button", { name: "Retomar movimento", exact: true }).click();
      await page.locator("canvas").scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => window.__gl.draws);
      await page.waitForFunction((n) => window.__gl.draws > n, before);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(100);
      const reduced = await page.evaluate(() => window.__gl.draws);
      await page.waitForTimeout(200);
      assert.equal(await page.evaluate(() => window.__gl.draws), reduced);
      assert.ok(await page.evaluate(() => window.__gl.deletes > 0), "troca deve liberar recursos anteriores");
    }
    for (const modo of ["explorar", "comparar", "leitura"]) {
      await question.fill(`Pergunta de teste ${modo}`);
      await page.getByRole("combobox", { name: "Modo de estudo" }).selectOption(modo);
      await page.getByRole("button", { name: "Enviar pergunta", exact: true }).click();
      await page.getByRole("alert").last().waitFor();
      assert.equal(requests.at(-1).modo, modo);
      assert.equal(requests.at(-1).escopo, "corpus-hermeticum");
      assert.equal(await question.inputValue(), `Pergunta de teste ${modo}`);
    }
    const count = await page.locator(".study-turn").count();
    await page.getByRole("button", { name: "Dourada", exact: true }).click();
    assert.equal(await page.locator(".study-turn").count(), count);
    assert.equal(await question.inputValue(), "Pergunta de teste leitura");
    await page.getByRole("button", { name: "Tentar novamente", exact: true }).last().click();
    await page.getByRole("alert").last().waitFor();
    assert.equal(await page.locator(".study-turn").count(), count, "nova tentativa não duplica turno");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(out, `assistente-${width}-erro.png`), fullPage: true });
    await page.getByRole("button", { name: "Nova conversa", exact: true }).click();
    assert.equal(await page.locator(".study-turn").count(), 0);
    assert.equal(await page.getByRole("combobox", { name: "Modo de estudo" }).inputValue(), "leitura");
    assert.equal(
      await page.getByRole("combobox", { name: "Sala de estudo" }).inputValue(),
      "corpus-hermeticum",
    );
    await page.screenshot({ path: path.join(out, `assistente-${width}-inicio.png`), fullPage: true });
    assert.deepEqual(errors, []);
    results.push({
      width,
      renderers,
      pausa: true,
      reducedMotion: hasWebgl,
      recursosLiberados: hasWebgl,
      modos: requests.map((r) => r.modo),
      falhaPreservaRascunho: true,
      retrySemDuplicacao: true,
    });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, "assistente-resultados.json"), JSON.stringify(results, null, 2));
  process.stdout.write(JSON.stringify(results));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
