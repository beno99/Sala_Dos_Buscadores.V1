const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
const root = require("node:path").resolve(__dirname, "../..");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  await page.route("https://**", (r) => r.abort());
  const css = fs
    .readFileSync(`${root}/design-system/components/bundle.css`, "utf8")
    .replace(/@import[^;]+;/g, "");
  const tokens = fs.readFileSync(`${root}/design-system/tokens.css`, "utf8");
  const preview = fs
    .readFileSync(`${root}/design-system/components/CampoImagem/preview.html`, "utf8")
    .replace(/<script>[\s\S]*?<\/script>/g, "");
  await page.setContent(
    `<html lang="pt-BR"><head><style>${tokens}${css}</style></head><body>${preview}</body></html>`,
  );
  await page.addScriptTag({ content: fs.readFileSync(`${root}/design-system/components/bundle.js`, "utf8") });
  const data = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 720;
    c.height = 1080;
    const x = c.getContext("2d");
    x.fillStyle = "#F6E7CE";
    x.fillRect(0, 0, 720, 1080);
    x.fillStyle = "#390007";
    x.font = "36px serif";
    x.fillText("Imagem integral", 30, 60);
    x.fillText("Fim da imagem", 30, 1030);
    return c.toDataURL().split(",")[1];
  });
  const input = page.locator(".sdb-upload--corpo input");
  await input.setInputFiles({
    name: "teste-local.png",
    mimeType: "image/png",
    buffer: Buffer.from(data, "base64"),
  });
  await page.waitForFunction(() =>
    document.querySelector(".sdb-upload--corpo .sdb-upload__size").textContent.includes("720"),
  );
  const meta = await page.locator(".sdb-upload--corpo .sdb-upload__size").textContent();
  const warning = await page.locator("[data-upload-resolution]").isVisible();
  const ratio = await page.locator(".sdb-upload--corpo img").evaluate((i) => i.clientWidth / i.clientHeight);
  await page.screenshot({ path: `${root}/docs/evidencias-2026-10-31/upload-corpo-390.png`, fullPage: true });
  await input.setInputFiles({
    name: "grande.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(5 * 1024 * 1024 + 1),
  });
  const rejected = await page.locator("[data-upload-error-text]").first().textContent();
  await page.locator(".sdb-upload--corpo [data-upload-remove]").click();
  const cleared = !(await page.locator("[data-upload-resolution]").isVisible());
  const result = { meta, warning, ratio, rejected, cleared };
  fs.writeFileSync(
    `${root}/docs/evidencias-2026-10-31/upload-resultados.json`,
    JSON.stringify(result, null, 2),
  );
  if (!warning || !cleared || Math.abs(ratio - 2 / 3) > 0.01 || !rejected.includes("limite"))
    process.exitCode = 1;
  await browser.close();
})();
