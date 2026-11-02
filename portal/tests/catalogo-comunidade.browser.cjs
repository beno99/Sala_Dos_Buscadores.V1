const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { build } = require(process.env.ESBUILD_MODULE || "esbuild");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const root = path.resolve(__dirname, "../..");
(async () => {
  const bundle = await build({
    entryPoints: [`${root}/portal/tests/fixtures/catalogo-comunidade.tsx`],
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: `${root}/portal/tsconfig.json`,
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [
      {
        name: "fixture-isolada",
        setup(b) {
          b.onResolve({ filter: /server\/comunidade\/acoes$/ }, () => ({
            path: "acoes",
            namespace: "fixture",
          }));
          b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
            contents: `const acao=async(...args)=>{window.chamadas=(window.chamadas??[]).concat([args]);return {ok:true,mensagem:'Operação demonstrativa.'}};export {acao as moderarAcao,acao as publicarAcao,acao as editarPublicacaoAcao,acao as excluirPublicacaoAcao,acao as comentarAcao,acao as excluirComentarioAcao,acao as reagirAcao,acao as salvarAcao,acao as seguirAcao,acao as marcarRespostaAcao,acao as denunciarAcao,acao as ocultarComentarioAcao};`,
            loader: "js",
          }));
          b.onLoad({ filter: /EstanteProvider\.tsx$/ }, () => ({
            contents: "export const useEstante=()=>({salvo:()=>false,alternar:async()=>{}});",
            loader: "tsx",
          }));
          b.onLoad({ filter: /components\/ds\/Toast\.tsx$/ }, () => ({
            contents: "export const useToast=()=>()=>{};export const useCopiar=()=>()=>{};",
            loader: "tsx",
          }));
        },
      },
    ],
  });
  const css = [
    "tokens.css",
    "components/bundle.css",
    "assets/themes.css",
    "components/refinement.css",
    "components/Comunidade/comunidade.css",
    "components/CardVideo/card-video.css",
    "components/CardConteudo/card-conteudo.css",
    "components/EstadosInterface/estados-interface.css",
  ]
    .map((f) => fs.readFileSync(`${root}/design-system/${f}`, "utf8"))
    .join("\n")
    .replace(/@import[^;]+;/g, "");
  const out = `${root}/docs/refinamento-2026-11-02/evidencias`;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const resultados = [];
  try {
    for (const width of [390, 768, 1440])
      for (const modo of ["videos", "comunidade"])
        for (const papel of modo === "videos" ? ["membro"] : ["membro", "anfitriao", "administrador"]) {
          const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
          page.setDefaultTimeout(6000);
          const erros = [];
          page.on("pageerror", (e) => erros.push(e.message));
          await page.route("**/*", async (r) => {
            const url = new URL(r.request().url());
            if (url.origin !== "http://fixture.local") return r.abort("blockedbyclient");
            if (url.pathname.endsWith(".woff2")) {
              const fonte = path.join(root, "design-system/fonts", path.basename(url.pathname));
              if (fs.existsSync(fonte)) return r.fulfill({ path: fonte, contentType: "font/woff2" });
              return r.fulfill({ status: 404, body: "Fonte da fixture ausente" });
            }
            if (r.request().resourceType() !== "document") return r.abort("blockedbyclient");
            return r.fulfill({
              contentType: "text/html",
              body: `<html lang="pt-BR" data-theme="solido-claro"><style>${css}\nbody{margin:0;background:var(--bg-canvas);color:var(--label);font-family:var(--font-ui)}#root{max-width:1136px;margin:auto;padding:16px}</style><body><div id="root"></div><script>window.process={env:{}};${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`,
            });
          });
          await page.goto(`http://fixture.local/?modo=${modo}&papel=${papel}`);
          await page
            .getByRole("heading", { name: modo === "videos" ? "Vídeos" : "Comunidade", exact: true })
            .waitFor();
          const fontes = await page.evaluate(async () => {
            await Promise.all([
              document.fonts.load('400 16px "General Sans"'),
              document.fonts.load('400 24px "Gambetta"'),
            ]);
            await document.fonts.ready;
            return ["General Sans", "Gambetta"].map((familia) => ({
              familia,
              carregada: document.fonts.check(`400 16px "${familia}"`),
              faces: [...document.fonts]
                .filter((f) => f.family.replaceAll('"', "") === familia)
                .map((f) => f.status),
            }));
          });
          assert.ok(
            fontes.every((f) => f.carregada && f.faces.includes("loaded")),
            "fontes oficiais DS carregadas",
          );
          if (modo === "videos") {
            await page.getByText("2 vídeos encontrados", { exact: true }).waitFor();
            await page.getByRole("combobox", { name: "Sala", exact: true }).selectOption("host-demo");
            await page.getByText("2 vídeos encontrados", { exact: true }).waitFor();
            await page
              .getByRole("combobox", { name: "Artigo relacionado", exact: true })
              .selectOption("a-demo");
            await page.getByText("1 vídeo encontrado", { exact: true }).waitFor();
            await page.getByRole("combobox", { name: "Origem editorial" }).selectOption("anfitriao");
            await page.getByRole("heading", { name: "Nenhum vídeo encontrado" }).waitFor();
            await page.getByRole("button", { name: "Limpar filtros" }).click();
            await page.getByText("2 vídeos encontrados", { exact: true }).waitFor();
            await page
              .getByRole("searchbox", { name: "Buscar vídeos ou artigos relacionados" })
              .fill("sem artigo");
            await page.getByText("1 vídeo encontrado", { exact: true }).waitFor();
            await page.getByRole("searchbox", { name: "Buscar vídeos ou artigos relacionados" }).fill("");
          } else {
            assert.equal(await page.locator(".sdb-composer--launcher").count(), papel === "membro" ? 0 : 1);
            await page.getByRole("tab", { name: "Seguindo", exact: true }).click();
            await page.waitForFunction(
              () => document.querySelectorAll("section:not([hidden]) .sdb-post").length === 1,
            );
            await page.getByRole("tab", { name: "Para você", exact: true }).click();
            const busca = page.getByRole("searchbox", { name: "Buscar publicações", exact: true });
            if (width === 390) await page.getByRole("button", { name: "Buscar na comunidade" }).click();
            await busca.filter({ visible: true }).fill("inexistente");
            await page.getByRole("heading", { name: "Nenhuma publicação encontrada" }).waitFor();
            await busca.filter({ visible: true }).fill("");
            if (papel !== "membro") {
              for (const [tipo, nome] of [
                ["reflexao", "Reflexão"],
                ["citacao", "Citação com fonte"],
                ["pergunta", "Pergunta"],
                ["achado", "Achado do acervo"],
              ]) {
                await page.getByRole("button", { name: "O que você está estudando?", exact: true }).click();
                await page.getByRole("radio", { name: nome, exact: true }).check();
                assert.equal(
                  await page.getByRole("button", { name: "Publicar", exact: true }).isDisabled(),
                  true,
                );
                await page
                  .getByRole("textbox", { name: "O que você está estudando?" })
                  .fill("Publicação demonstrativa com vídeo.");
                if (tipo === "citacao") {
                  for (const campo of ["Trecho", "Obra", "Passagem"])
                    await page
                      .getByRole("textbox", { name: campo, exact: true })
                      .fill("Referência demonstrativa");
                }
                if (tipo === "pergunta")
                  await page.getByRole("combobox", { name: "Sala", exact: true }).selectOption("nag-demo");
                if (tipo === "achado")
                  await page
                    .getByRole("combobox", { name: "Conteúdo encontrado", exact: true })
                    .selectOption("a-demo");
                await page
                  .getByRole("combobox", { name: "Vídeo do acervo (opcional)" })
                  .selectOption("v-demo");
                await page.screenshot({
                  path: `${out}/comunidade-compositor-${tipo}-${papel}-${width}.png`,
                  fullPage: false,
                  animations: "disabled",
                });
                await page.getByRole("button", { name: "Publicar", exact: true }).click();
                await page.waitForFunction(() => !document.querySelector(".sdb-overlay.is-open"));
                assert.equal(await page.evaluate(() => window.chamadas.at(-1)[0].videoId), "v-demo");
                assert.equal(await page.evaluate(() => window.chamadas.at(-1)[0].tipo), tipo);
              }
            }
          }
          await page.screenshot({
            path: `${out}/${modo}-${papel}-${width}.png`,
            fullPage: true,
            animations: "disabled",
          });
          assert.ok(
            (await page.evaluate(() => document.documentElement.scrollWidth)) <= width,
            "sem overflow horizontal",
          );
          resultados.push({
            modo,
            papel,
            width,
            scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
            erros,
            fontes,
            checks:
              modo === "videos"
                ? [
                    "busca",
                    "Sala própria e de artigo",
                    "origem",
                    "artigos",
                    "vídeo sem artigo",
                    "limpar filtros",
                  ]
                : [
                    "criação por papel",
                    "abas",
                    "busca",
                    ...(papel === "membro" ? [] : ["4 tipos obrigatórios e payload", "videoId no envio"]),
                  ],
          });
          assert.deepEqual(erros, []);
          await page.close();
        }
    fs.writeFileSync(`${out}/catalogo-comunidade-resultados.json`, JSON.stringify(resultados, null, 2));
    process.stdout.write(JSON.stringify(resultados));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  process.stderr.write(e.stack ?? String(e));
  process.exitCode = 1;
});
