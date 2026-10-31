const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
const root = require("node:path").resolve(__dirname, "../..");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  const tokens = fs.readFileSync(`${root}/design-system/tokens.css`, "utf8");
  const image =
    "data:image/svg+xml;base64," +
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080"><rect width="720" height="1080" fill="#F6E7CE"/><path d="M0 0L720 1080M720 0L0 1080" stroke="#390007" stroke-width="20"/><text x="40" y="80" font-size="40">Topo preservado</text><text x="40" y="1020" font-size="40">Base preservada</text></svg>',
    ).toString("base64");
  for (const phase of ["antes", "depois"]) {
    const css = (
      phase === "antes"
        ? require("node:child_process").execFileSync(
            "git",
            ["show", "78355fb:design-system/components/bundle.css"],
            { cwd: root, encoding: "utf8" },
          )
        : fs.readFileSync(`${root}/design-system/components/bundle.css`, "utf8")
    ).replace(/@import[^;]+;/g, "");
    for (const width of [390, 768, 1280, 1440])
      for (const zoom of [1, 2]) {
        const page = await browser.newPage({ viewport: { width: Math.round(width / zoom), height: 1000 } });
        await page.setContent(
          `<html lang="pt-BR" data-theme="solido-claro"><head><style>${tokens}\n${css}\nbody{margin:0;padding:16px}main{max-width:736px;margin:auto}.sdb-source{max-width:320px}</style></head><body><main><div class="sdb-articlebody"><p class="sdb-body sdb-articlebody__paragraph">Segundo O Caibalion, os sete princípios organizam uma interpretação moderna da tradição hermética. A contextualização histórica permite comparar essa leitura com documentos antigos, distinguindo a interpretação editorial das palavras atribuídas às fontes. O estudo preserva as diferenças entre tradições e convida à leitura cuidadosa das referências.</p><figure class="sdb-articlebody__figure"><img src="${image}" alt="Diagrama local para verificar extremos da imagem"><figcaption>Fixture local sem dados de usuários.</figcaption></figure></div><a class="sdb-card sdb-source"><span class="sdb-cover">H</span><div class="sdb-source__info"><h3 class="sdb-source__title">Hermetica: interpretação e contextualização histórica</h3><p class="sdb-source__author">Brian P. Copenhaver (tradutor e organizador)</p><div class="sdb-source__tags"><span class="sdb-badge">Hermetismo moderno e Novo Pensamento</span></div><p class="sdb-source__ref">https://exemplo.invalid/referencia/DocumentoComNomeMuitoLongoSemEspacosParaVerificarQuebraIntegral</p></div><span>↗</span></a></main></body></html>`,
        );
        await page.locator("img").evaluate((img) => img.decode());
        const check = await page.evaluate(() => {
          const p = document.querySelector("p");
          const img = document.querySelector("img");
          const source = document.querySelector(".sdb-source");
          const badge = document.querySelector(".sdb-badge");
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            align: getComputedStyle(p).textAlign,
            last: getComputedStyle(p).textAlignLast,
            hyphens: getComputedStyle(p).hyphens,
            imageRatio: img.getBoundingClientRect().width / img.getBoundingClientRect().height,
            alinhada:
              Math.abs(img.getBoundingClientRect().left - p.getBoundingClientRect().left) < 1 &&
              Math.abs(img.getBoundingClientRect().right - p.getBoundingClientRect().right) < 1,
            badgeFits: badge.getBoundingClientRect().right <= source.getBoundingClientRect().right,
            tag: badge.textContent,
          };
        });
        const formatos = [];
        if (phase === "depois") {
          for (const [largura, altura] of [
            [1200, 600],
            [720, 720],
          ]) {
            const src = `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}"><rect width="100%" height="100%" fill="gray"/></svg>`).toString("base64")}`;
            await page.locator("img").evaluate(async (img, url) => {
              img.src = url;
              await img.decode();
            }, src);
            const medidas = await page.evaluate(() => {
              const img = document.querySelector("img").getBoundingClientRect();
              const p = document.querySelector("p").getBoundingClientRect();
              return {
                ratio: img.width / img.height,
                alinhada: Math.abs(img.left - p.left) < 1 && Math.abs(img.right - p.right) < 1,
              };
            });
            formatos.push({ largura, altura, ...medidas });
          }
          await page.locator("img").evaluate(async (img, url) => {
            img.src = url;
            await img.decode();
          }, image);
        }
        results.push({ phase, width, zoom, ...check, formatos });
        if ((width === 390 || width === 1440) && zoom === 1)
          await page.screenshot({
            path: `${root}/docs/evidencias-2026-10-31/leitura-${phase}-${width}.png`,
            fullPage: true,
          });
        await page.close();
      }
  }
  fs.writeFileSync(
    `${root}/docs/evidencias-2026-10-31/leitura-matriz.json`,
    JSON.stringify(results, null, 2),
  );
  await browser.close();
  if (
    results.some(
      (r) =>
        r.phase === "depois" &&
        (r.formatos.some((f) => !f.alinhada || Math.abs(f.ratio - f.largura / f.altura) > 0.001) ||
          r.overflow ||
          !r.alinhada ||
          !r.badgeFits ||
          r.align !== "justify" ||
          r.last !== "left" ||
          Math.abs(r.imageRatio - 2 / 3) > 0.001),
    )
  )
    process.exitCode = 1;
})();
