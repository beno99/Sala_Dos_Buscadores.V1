// Componentes reais com dados locais demonstrativos; sem sessão, rede externa ou banco.
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
 import {createRoot} from 'react-dom/client';import {PortalCliente} from './src/features/portal/PortalCliente';
 import {instalarRegistroSalas,instalarRegistroTemas} from './src/data/catalogo';
 const host={nome:'Anfitrião demonstrativo',credencial:'Perfil de teste, sem conta real',slug:'demonstracao'};
 const nomes=['Biblioteca de Nag Hammadi','O Livro de Urântia','Estudos de tradições e documentos com um título extenso para conferir a leitura em telas estreitas','Corpus Hermeticum','O Caibalion','Apócrifos do Cristianismo Primitivo','Filosofia e história'];
 const salas=nomes.slice(0,Number(new URLSearchParams(location.search).get('n'))).map((nome,i)=>({slug:'sala-demo-'+i,nome,tradicao:'Documentos, contextos e perspectivas de estudo',tradicaoCurta:'Demonstração',descricao:'Fixture local',periodo:'Antiguidade',placa:'bordo',atualizadaEm:'2026-11-02',inicial:nome[0],origem:i===0?'anfitriao':'oficial',naComparacao:true,...(i===0?{anfitriao:host}:{})}));
 instalarRegistroSalas(()=>salas);instalarRegistroTemas(()=>[{slug:'alma',nome:'Alma',eixo:'a'}]);
 const conteudos=Array.from({length:salas.length === 0 ? 0 : salas.length === 1 ? 2 : 4},(_,i)=>({sala:salas[0]?.slug??'sala-demo',slug:'artigo-'+i,titulo:i===1?'Uma leitura comparada com título extenso sobre a alma e os contextos da interpretação':'Texto de estudo '+i,resumo:'Exemplo demonstrativo: segundo o acervo, cada texto requer contexto e referências para que suas diferenças possam ser compreendidas.',tipo:'artigo',temas:['alma'],nivel:1,proveniencia:'anfitriao',duracaoMin:7,autoria:{nome:'Autoria original demonstrativa',credencial:'Preservada na revisão'},publicadoEm:'2026-11-02',corpo:[],fontes:[],anfitriao:host}));
 const modelo={slidesAnuncio:[],episodios:[],salas:salas.map(s=>({sala:{...s,totalConteudos:3,nivelPredominante:1},temas:['alma'],motivo:'interesse',progresso:{pct:1/3,legenda:'1 de 3 conteúdos lidos'}})),temas:[{slug:'alma',nome:'Alma',contagem:salas.length}],indicadores:[{rotulo:'Salas visitadas',valor:salas.length?1:0,complemento:'de '+salas.length},{rotulo:'Conteúdos lidos',valor:1}],emAndamento:[],comecePorAqui:conteudos.map(conteudo=>({conteudo})),recentes:[],mostrarNiveis:false};
 const comunidade=salas.length === 0 ? [] : [{id:'demo',texto:'Publicação demonstrativa: uma pergunta com fontes pode abrir diferentes caminhos de leitura.',criadaEm:'2026-11-02',autorNome:'Perfil demonstrativo',autorHref:'/perfil/demo'}];
 createRoot(document.getElementById('root')).render(<><p className="fixture-label">DEMONSTRAÇÃO LOCAL · dados fictícios · sem conta ou banco</p><PortalCliente modelo={modelo} comunidade={comunidade}/></>);
 `,
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
        name: "estante-sem-servidor",
        setup(b) {
          b.onLoad({ filter: /EstanteProvider\.tsx$/ }, () => ({
            contents: "export const useEstante=()=>({salvo:()=>false,alternar:async()=>{}});",
            loader: "tsx",
          }));
        },
      },
    ],
  });
  let css = [
    "tokens.css",
    "components/bundle.css",
    "assets/themes.css",
    "components/CardSala/card-sala.css",
    "components/CardConteudo/card-conteudo.css",
    "components/refinement.css",
    "components/EstadosInterface/estados-interface.css",
  ]
    .map((f) => fs.readFileSync(`${root}/design-system/${f}`, "utf8"))
    .join("\n")
    .replace(/@import[^;]+;/g, "");
  // Patch pendente de integração pode ser passado pelo executor; normal usa somente o DS atual.
  if (process.env.HOME_CSS_PATCH) css += `\n${fs.readFileSync(process.env.HOME_CSS_PATCH, "utf8")}`;
  const out = `${root}/docs/refinamento-2026-11-02/evidencias`;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  try {
    for (const width of [390, 768, 1440])
      for (const n of [0, 1, 3, 7]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: "reduce" });
        page.setDefaultTimeout(6000);
        await page.route("**/*", async (route) => {
          const url = new URL(route.request().url());
          let file;
          if (url.pathname.startsWith("/imagens/")) file = `${root}/portal/public${url.pathname}`;
          else if (url.pathname.startsWith("/fonts/")) file = `${root}/design-system${url.pathname}`;
          if (file && fs.existsSync(file)) return route.fulfill({ path: file });
          if (url.pathname !== "/") return route.fulfill({ status: 404, body: "" });
          return route.fulfill({
            contentType: "text/html",
            body: `<html lang="pt-BR" data-theme="solido-claro"><style>${css}\nbody{margin:0;background:var(--bg-canvas);color:var(--label);font-family:var(--font-ui)}#root{max-width:1136px;margin:auto;padding:16px}.fixture-label{font-size:12px}.sdb-home__assistant h2{font-size:24px}</style><body><div id="root"></div><script>window.process={env:{}};${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script></body></html>`,
          });
        });
        await page.goto(`http://fixture.local/?n=${n}`);
        await page.locator(".sdb-home__salas").waitFor();
        await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete));
        const data = await page.evaluate(() => {
          const box = (e) => {
            const r = e.getBoundingClientRect();
            return {
              top: r.top,
              bottom: r.bottom,
              left: r.left,
              right: r.right,
              width: r.width,
              height: r.height,
            };
          };
          const active = document.querySelector(".sdb-banner__slide.is-current");
          const media = box(active.querySelector(".sdb-banner__media"));
          const actions = box(active.querySelector(".sdb-banner__actions"));
          const controls = box(document.querySelector(".sdb-banner__controls"));
          const rooms = document.querySelector(".sdb-home__salas");
          return {
            docwidth: document.documentElement.scrollWidth,
            bodywidth: document.body.scrollWidth,
            offenders: [...document.querySelectorAll("body *")]
              .filter(
                (e) => e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > innerWidth + 1,
              )
              .slice(0, 60)
              .map((e) => ({ cls: e.className, tag: e.tagName, w: box(e).width, right: box(e).right })),
            overflow: document.documentElement.scrollWidth > innerWidth,
            media,
            actions,
            controls,
            imageFit: getComputedStyle(active.querySelector("img")).objectFit,
            roomsTop: box(rooms).top,
            statsTop: box(document.querySelector(".sdb-stats")).top,
            cards: [...rooms.querySelectorAll("article.sala")].map(box),
            roomSlugs: [...rooms.querySelectorAll(".sala__action")].map((e) => e.getAttribute("href")),
            hostName: rooms.querySelector(".sala__signature")?.textContent,
            readingHeights: [...document.querySelectorAll(".sdb-home__leituras .sdb-card")].map(
              (e) => box(e).height,
            ),
          };
        });
        assert.equal(data.overflow, false, JSON.stringify({ width, n, data }));
        assert.equal(data.imageFit, "contain");
        assert.ok(data.actions.top >= data.media.bottom - 1);
        assert.ok(data.controls.top >= data.actions.bottom - 1);
        assert.ok(data.roomsTop < data.statsTop);
        assert.equal(data.cards.length, n);
        assert.equal(new Set(data.roomSlugs).size, n);
        if (n === 1) assert.ok(data.cards[0].width > width * 0.7);
        assert.equal(await page.locator(".sdb-home__assistant a").getAttribute("href"), "/assistente");
        assert.equal(await page.locator(".sdb-home__community article").count(), n === 0 ? 0 : 1);
        if (n > 0) {
          assert.ok(data.hostName.includes("Anfitrião demonstrativo"));
          assert.equal(
            await page.locator(".sala__signature a").getAttribute("href"),
            "/anfitrioes/demonstracao",
          );
        }
        await page.screenshot({ path: `${out}/home-fixture-${width}-${n}-salas.png`, fullPage: true });
        if (n === 3) {
          const link = page.locator(".sdb-home__leituras .sdb-host-signature a").first();
          // A assinatura está abaixo da dobra: rolar antes de conferir a camada clicável.
          await link.scrollIntoViewIfNeeded();
          const alvo = await link.evaluate((a) => {
            const r = a.getBoundingClientRect();
            return document
              .elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
              ?.closest("a")
              ?.getAttribute("href");
          });
          assert.equal(alvo, "/anfitrioes/demonstracao");
          for (let slide = 0; slide < 4; slide++) {
            await page.getByRole("button", { name: "Próximo destaque", exact: true }).focus();
            await page.keyboard.press("Enter");
            const separacao = await page.locator(".sdb-banner__slide.is-current").evaluate((el) => {
              const media = el.querySelector(".sdb-banner__media").getBoundingClientRect();
              const acoes = el.querySelector(".sdb-banner__actions").getBoundingClientRect();
              return acoes.top >= media.bottom - 1;
            });
            assert.equal(separacao, true);
          }
          assert.equal(
            await page
              .getByRole("button", { name: "Retomar rotação", exact: true })
              .getAttribute("aria-pressed"),
            "true",
          );
        }
        if (n === 3 && width !== 768) {
          for (const tema of ["solido-escuro", "vidro-claro", "vidro-escuro"]) {
            await page.locator("html").evaluate((el, t) => (el.dataset.theme = t), tema);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
            await page.screenshot({ path: `${out}/home-fixture-${width}-${tema}.png`, fullPage: true });
          }
        }
        results.push({ width, n, ...data });
        await page.close();
      }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(`${out}/home-fixture-resultados.json`, JSON.stringify(results, null, 2));
  process.stdout.write(`Passaram ${results.length} combinações de largura/quantidade.\n`);
})().catch((e) => {
  process.stderr.write(`${e.stack}\n`);
  process.exitCode = 1;
});
