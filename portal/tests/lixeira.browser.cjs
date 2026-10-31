const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "../..");
const { build } = require(`${root}/portal/node_modules/esbuild`);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';import {ToastProvider} from './src/components/ds/Toast';import {ListaSalasAnfitriao} from './src/features/anfitriao/ui/ListaSalasAnfitriao';import {LixeiraSalas} from './src/features/admin/ui/salas/LixeiraSalas';
 const sala={id:'teste',nome:'Leituras do Poimandres — ensaio isolado',slug:'leituras-do-poimandres',origem:'anfitriao',status:'publicado',atualizadaEm:'2026-10-31',novidades:0,artigos:{total:2,publicados:1,emRevisao:0,reprovados:0}};
 window.render=modo=>createRoot(document.getElementById('root')).render(<ToastProvider>{modo==='host'?<main><h1>Minhas Salas</h1><ListaSalasAnfitriao salas={[sala]}/></main>:<LixeiraSalas salas={[{...sala,excluidaEm:'2026-10-31T12:00:00Z',artigos:2,videos:1,conversas:3}]}/>}</ToastProvider>);`,
      resolveDir: `${root}/portal`,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: `${root}/portal/tsconfig.json`,
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [
      {
        name: "isolado",
        setup(b) {
          b.onResolve({ filter: /^next\/(navigation|link)$/ }, (a) => ({ path: a.path, namespace: "stub" }));
          b.onLoad({ filter: /.*/, namespace: "stub" }, (a) => ({
            contents:
              a.path === "next/link"
                ? `export default function Link({children,...props}){return <a {...props}>{children}</a>}`
                : `export function useRouter(){return {push:(p)=>window.navegacoes.push(p),refresh:()=>window.refreshes++}}`,
            loader: "tsx",
            resolveDir: `${root}/portal`,
          }));
          b.onLoad({ filter: /server\/salas\/acoes\.ts$/ }, () => ({
            contents: `async function agir(acao,id){window.pedidos.push({acao,id});await new Promise(r=>setTimeout(r,300));return window.falhar?{ok:false,mensagem:'Erro: falha controlada; tente novamente.'}:{ok:true,mensagem:acao==='excluir'?'Sala movida para a lixeira.':'Sala restaurada.'}}export const excluirSalaAcao=id=>agir('excluir',id);export const restaurarSalaDaLixeiraAcao=id=>agir('restaurar',id);`,
            loader: "ts",
          }));
        },
      },
    ],
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const out = `${root}/docs/evidencias-lixeira`;
  fs.mkdirSync(out, { recursive: true });
  const resultados = [];
  for (const modo of ["host", "curador"])
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setContent(
        '<html lang="pt-BR" data-theme="solido-claro"><body><div id="root"></div></body></html>',
      );
      for (const f of ["tokens.css", "components/bundle.css"])
        await page.addStyleTag({
          content: fs.readFileSync(`${root}/design-system/${f}`, "utf8").replace(/@import[^;]+;/g, ""),
        });
      await page.addStyleTag({ content: "body{padding:16px;margin:0}main{max-width:1100px;margin:auto}" });
      await page.addScriptTag({
        content: `window.process={env:{}};window.pedidos=[];window.navegacoes=[];window.refreshes=0;${bundle.outputFiles[0].text};window.render('${modo}');`,
      });
      const trigger = page.getByRole("button", {
        name: modo === "host" ? /Excluir Sala Leituras/ : /Restaurar Sala Leituras/,
      });
      await trigger.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("alertdialog");
      await dialog.waitFor();
      const limites = await dialog.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return {
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          width: innerWidth,
          height: innerHeight,
        };
      });
      assert.ok(
        limites.left >= 0 &&
          limites.right <= limites.width &&
          limites.top >= 0 &&
          limites.bottom <= limites.height,
      );
      assert.equal(await dialog.evaluate((e) => e.scrollWidth <= e.clientWidth), true);
      await page.waitForTimeout(80);
      assert.equal(
        await page
          .getByRole("button", { name: "Cancelar", exact: true })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await dialog
          .getByRole("button", {
            name: modo === "host" ? "Mover para a lixeira" : "Restaurar Sala",
            exact: true,
          })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .getByRole("button", { name: "Cancelar", exact: true })
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(await trigger.evaluate((e) => e === document.activeElement), true);
      assert.equal(await page.evaluate(() => window.pedidos.length), 0);
      await trigger.click();
      await page.screenshot({ path: `${out}/${modo}-confirmacao-${width}.png`, fullPage: true });
      const confirmar = dialog.getByRole("button", {
        name: modo === "host" ? "Mover para a lixeira" : "Restaurar Sala",
        exact: true,
      });
      await page.evaluate(() => (window.falhar = true));
      await confirmar.evaluate((e) => {
        e.click();
        e.click();
      });
      await page.getByRole("alert").waitFor();
      assert.equal(await dialog.isVisible(), true);
      await page.evaluate(() => (window.falhar = false));
      await confirmar.click();
      await dialog.waitFor({ state: "hidden" });
      const resultado = await page.evaluate(() => ({
        pedidos: window.pedidos,
        refreshes: window.refreshes,
        navegacoes: window.navegacoes,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.equal(resultado.pedidos.length, 2);
      assert.equal(resultado.refreshes, 1);
      assert.deepEqual(resultado.navegacoes, []);
      assert.equal(resultado.overflow, false);
      assert.deepEqual(errors, []);
      resultados.push({ modo, width, ...resultado });
      await page.screenshot({ path: `${out}/${modo}-${width}.png`, fullPage: true });
      await page.close();
    }
  fs.writeFileSync(`${out}/resultados.json`, JSON.stringify(resultados, null, 2));
  await browser.close();
})().catch((e) => {
  process.stderr.write(String(e));
  process.exitCode = 1;
});
