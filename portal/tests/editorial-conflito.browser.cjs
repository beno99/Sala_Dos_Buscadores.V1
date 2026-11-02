const assert = require("node:assert/strict");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const { build } = require(path.join(root, "node_modules/esbuild"));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client';import {useEdicao} from './src/features/admin/ui/useEdicao';
window.chamadas=[];let n=0;
const salvar=async(f)=>{window.chamadas.push({...f});if(!n++)return {ok:true,valor:{id:'a',salvoEm:'2026-11-02T12:00:01Z'},mensagem:'Salvo'};return {ok:false,conflito:true,mensagem:'Outra pessoa alterou este registro. Seu texto continua neste formulário.'};};
function App(){const e=useEdicao({inicial:{id:'a',titulo:'Original'},status:'rascunho',atualizadoEm:'2026-11-02T12:00:00Z',base:'/artigos',salvar,podeSalvar:f=>Boolean(f.titulo)});return <main><label>Título<input value={e.form.titulo} onChange={ev=>e.mudar({titulo:ev.target.value})}/></label><button onClick={()=>e.salvarAgora('manual')}>Salvar</button><output aria-label="Estado">{e.estado}</output><output aria-label="Conflito">{e.conflito}</output><output aria-label="Rascunho">{String(e.sujo)}</output></main>};createRoot(document.getElementById('root')).render(<App/>);`,
      loader: "tsx",
      resolveDir: root,
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: path.join(root, "tsconfig.json"),
    define: { "process.env.NODE_ENV": '"test"' },
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    const erros = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await page.setContent('<html lang="pt-BR"><body><div id="root"></div></body></html>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    await page.getByLabel("Título").fill("Primeira edição");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await page.waitForFunction(() => document.querySelector('[aria-label="Estado"]').textContent === "salvo");
    await page.getByLabel("Título").fill("Meu texto preservado");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await page.waitForFunction(() =>
      document.querySelector('[aria-label="Conflito"]').textContent.includes("Outra pessoa"),
    );
    assert.equal(await page.getByLabel("Título").inputValue(), "Meu texto preservado");
    assert.equal(await page.getByLabel("Estado", { exact: true }).textContent(), "erro");
    assert.equal(await page.getByLabel("Rascunho", { exact: true }).textContent(), "true");
    await page.getByLabel("Título").fill("Continuo com meu rascunho");
    await page.waitForTimeout(1600);
    const chamadas = await page.evaluate(() => window.chamadas);
    assert.equal(chamadas.length, 2);
    assert.equal(chamadas[0].versaoEsperada, "2026-11-02T12:00:00Z");
    assert.equal(chamadas[1].versaoEsperada, "2026-11-02T12:00:01Z");
    assert.equal(await page.getByLabel("Título").inputValue(), "Continuo com meu rascunho");
    assert.equal(erros.length, 0);
    process.stdout.write(
      `${JSON.stringify({
        passou: true,
        chamadas: chamadas.length,
        rascunhoPreservado: true,
        autosaveSuspenso: true,
        versaoAtualizadaAposSucesso: true,
      })}\n`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
