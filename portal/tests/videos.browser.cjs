const fs = require("node:fs");
const root = require("node:path").resolve(__dirname, "../..");
const { build } = require(`${root}/portal/node_modules/esbuild`);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `import {createRoot} from 'react-dom/client'; import {useState} from 'react'; import {MiniaturaVideo} from './src/components/ds/MiniaturaVideo'; import {SeletorArtigosVideo} from './src/features/admin/ui/SeletorArtigosVideo'; import {extrairIdYoutube} from './src/features/admin/regras/youtube';
 const artigos=Array.from({length:25},(_,i)=>({id:'a'+String(i+1).padStart(2,'0'),titulo:'Artigo '+String(i+1).padStart(2,'0'),sala:'sala',status:i%2?'publicado':'rascunho',criadoEm:'2026-10-'+String(i+1).padStart(2,'0')+'T12:00:00Z'}));let tentativas=0;
 function App(){ const [url,sUrl]=useState('');const [ids,sIds]=useState([]);const youtube=extrairIdYoutube(url);return <main><h1>Vídeo e artigos — ensaio isolado</h1><label>Endereço YouTube<input aria-label="Endereço YouTube" value={url} onChange={e=>sUrl(e.target.value)}/></label><article className="video"><div className="video__media"><MiniaturaVideo key={youtube.ok?youtube.id:'vazio'} id={youtube.ok?youtube.id:undefined} placa="grafite" mostrarEstado={youtube.ok} titulo="Vídeo de teste"/><div className="video__top"/><div className="video__content"><h2>Vídeo de teste</h2></div></div></article><SeletorArtigosVideo artigos={artigos} sala={{slug:'sala',nome:'Sala de teste'}} selecionados={ids} onMudar={sIds} atualizar={async()=>{await new Promise(r=>setTimeout(r,200));if(!tentativas++)throw new Error('offline');return {ok:true,valor:[...artigos,{...artigos[0],id:'novo',titulo:'Artigo recém-criado',criadoEm:'2026-10-31T12:00:00Z'}],mensagem:'Atualizados'};}}/><output aria-label="IDs selecionados">{JSON.stringify(ids)}</output></main>};createRoot(document.getElementById('root')).render(<App/>);`,
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
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setContent(
    '<html lang="pt-BR" data-theme="solido-claro"><body><div id="root"></div></body></html>',
  );
  for (const file of ["tokens.css", "components/bundle.css", "components/CardVideo/card-video.css"])
    await page.addStyleTag({ content: fs.readFileSync(`${root}/design-system/${file}`, "utf8") });
  await page.addStyleTag({ content: "main{max-width:720px;margin:24px auto} input{max-width:100%}" });
  await page.addScriptTag({ content: `window.process={env:{}};${bundle.outputFiles[0].text}` });
  const out = `${root}/docs/evidencias-2026-10-31`;
  fs.mkdirSync(out, { recursive: true });
  await page.screenshot({ path: `${out}/video-antes-link.png`, fullPage: true });
  await page.getByLabel("Endereço YouTube").fill("https://youtu.be/dQw4w9WgXcQ");
  let live;
  try {
    await page.waitForFunction(
      () => document.querySelector(".video__image")?.naturalWidth > 120,
      {},
      { timeout: 35000 },
    );
    live = await page
      .locator(".video__image")
      .evaluate((i) => ({ src: i.src, width: i.naturalWidth, alt: i.alt }));
  } catch {
    live = {
      erro: `Miniatura live indisponível: ${await page.locator(".video__thumbnail-status").textContent()}`,
    };
  }
  await page.screenshot({ path: `${out}/video-depois-link.png`, fullPage: true });
  const inicial = await page.getByRole("checkbox").count();
  await page.getByRole("checkbox").first().check();
  await page.getByLabel("Buscar artigos da Sala").fill("Artigo 01");
  const buscaTotal = await page.getByRole("checkbox").count();
  await page.getByRole("checkbox").check();
  await page.getByLabel("Buscar artigos da Sala").fill("");
  await page.getByRole("button", { name: "Carregar mais artigos" }).click();
  const mais = await page.getByRole("checkbox").count();
  await page.getByRole("button", { name: "Atualizar artigos" }).click();
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).last().waitFor();
  const idsErro = await page.getByLabel("IDs selecionados").textContent();
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).last().click();
  await page.getByRole("checkbox", { name: /Artigo recém-criado/ }).waitFor();
  const idsFinal = await page.getByLabel("IDs selecionados").textContent();
  await page.screenshot({ path: `${out}/video-seletor-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: `${out}/video-seletor-mobile.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const imagemTeste = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 360;
    const x = c.getContext("2d");
    x.fillStyle = "#345";
    x.fillRect(0, 0, 640, 360);
    return c.toDataURL().split(",")[1];
  });
  const requisicoes = [];
  let retry = false;
  await page.route("https://i.ytimg.com/vi/**", async (route) => {
    const url = route.request().url();
    requisicoes.push(url);
    if (url.includes("aaaaaaaaaaa")) await new Promise((r) => setTimeout(r, 700));
    if (url.includes("ccccccccccc") && !retry) return route.fulfill({ status: 404, body: "" });
    if (url.includes("bbbbbbbbbbb") && !url.includes("mqdefault"))
      return route.fulfill({ status: 404, body: "" });
    await route
      .fulfill({ status: 200, contentType: "image/png", body: Buffer.from(imagemTeste, "base64") })
      .catch(() => {});
  });
  await page.getByLabel("Endereço YouTube").fill("https://youtu.be/aaaaaaaaaaa");
  await page.waitForTimeout(100);
  await page.getByLabel("Endereço YouTube").fill("https://youtu.be/bbbbbbbbbbb");
  await page.waitForFunction(() =>
    document.querySelector(".video__image")?.src.includes("bbbbbbbbbbb/mqdefault"),
  );
  await page.waitForTimeout(900);
  const descartaAntigo = await page
    .locator(".video__image")
    .evaluate((i) => i.src.includes("bbbbbbbbbbb/mqdefault"));
  await page.getByLabel("Endereço YouTube").fill("https://youtu.be/ccccccccccc");
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).waitFor();
  retry = true;
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await page.waitForFunction(() => document.querySelector(".video__image")?.src.includes("ccccccccccc"));
  const retryOk = (await page.locator(".video__image").count()) === 1;
  const result = {
    descartaAntigo,
    retryOk,
    requisicoes,
    live,
    inicial,
    buscaTotal,
    mais,
    idsErro,
    idsFinal,
    overflow,
    errors,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  fs.writeFileSync(`${out}/videos-browser-resultados.json`, JSON.stringify(result, null, 2));
  if (
    !descartaAntigo ||
    !retryOk ||
    inicial !== 10 ||
    buscaTotal !== 1 ||
    mais !== 20 ||
    idsFinal !== idsErro ||
    overflow ||
    errors.length
  )
    process.exitCode = 1;
  await browser.close();
})();
