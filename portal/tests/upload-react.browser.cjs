const fs = require("node:fs");
const root = require("node:path").resolve(__dirname, "../..");
const { build } = require(`${root}/portal/node_modules/esbuild`);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';import {useState} from 'react';import {CampoImagem} from './src/components/ds/CampoImagem';function App(){const [v,s]=useState(null);return <CampoImagem label="Imagem" corpoArtigo valor={v} onMudar={s}/>;}createRoot(document.getElementById('root')).render(<App/>);`,
      resolveDir: `${root}/portal`,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: `${root}/portal/tsconfig.json`,
    define: { "process.env.NODE_ENV": '"test"' },
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  page.setDefaultTimeout(8000);
  page.on("pageerror", (_e) => {});
  await page.setContent('<html lang="pt-BR"><body><div id="root"></div></body></html>');
  await page.addScriptTag({ content: `window.process={env:{}};${bundle.outputFiles[0].text}` });
  const data = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 720;
    c.height = 1080;
    return c.toDataURL().split(",")[1];
  });
  const original = Buffer.concat([Buffer.from(data, "base64"), Buffer.alloc(700 * 1024, 83)]);
  await page.evaluate(() => {
    window.fetch = async (_url, options) => {
      const f = options.body.get("arquivo");
      window.upload = {
        name: f.name,
        size: f.size,
        type: f.type,
        last: new Uint8Array(await f.arrayBuffer()).at(-1),
      };
      return { json: async () => ({ ok: true, id: "teste", url: URL.createObjectURL(f) }) };
    };
  });
  await page
    .locator("input")
    .setInputFiles({ name: "original.png", mimeType: "image/png", buffer: original });
  await page.waitForFunction(() => document.querySelector("img")?.naturalWidth === 720);
  const upload = await page.evaluate(() => window.upload);
  const warning = await page.getByRole("status").textContent();
  const helpBefore = await page.evaluate(() => {
    const h = document.querySelector(".sdb-help");
    const u = document.querySelector(".sdb-upload");
    return !!(h.compareDocumentPosition(u) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  const result = { originalBytes: original.length, upload, warning, helpBefore };
  fs.writeFileSync(
    `${root}/docs/evidencias-2026-10-31/upload-react-resultados.json`,
    JSON.stringify(result, null, 2),
  );
  if (upload.size !== original.length || upload.last !== 83 || upload.name !== "original.png" || !helpBefore)
    process.exitCode = 1;
  await browser.close();
})();
