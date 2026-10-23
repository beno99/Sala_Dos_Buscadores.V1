#!/usr/bin/env node
/**
 * Gera os arquivos derivados do design system:
 *   tokens.css          de tokens.json
 *   exemplos/<Nome>.html de components/<Nome>/preview.html
 *   catalogo.html       das prévias (cabeçalho @dsCard) na ordem das tabelas do README.md
 *
 *   node scripts/build.mjs          escreve
 *   node scripts/build.mjs --check  só confere; sai com 1 se algo estiver desatualizado
 */
import { youtubeVideoUrl } from "../components/CardVideo/youtube-link.mjs";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const ler = (p) => readFileSync(join(root, p), "utf8");

const tokens = JSON.parse(ler("tokens.json"));
const conteudo = JSON.parse(ler("conteudo.json"));
const temaPadrao = tokens.color.default ?? "vidro-claro";
const temaPadraoEscuro = tokens.color.defaultDark ?? "vidro-escuro";

const IDS_GRUPO = {
  Fundamentos: "fundamentos",
  "Componentes básicos": "basicos",
  "Componentes do acervo": "acervo",
  "Busca comparativa": "busca",
  "Assistente de IA": "ia",
  "Estrutura do portal": "estrutura",
  Curadoria: "curadoria",
  Comunidade: "comunidade",
};

const saidas = new Map();
const marcacao = ler("components/BarraFormatacao/marcacao.mjs").replace(/^export /gm, "");
const formatacao = "  /* FORMATACAO:INICIO Gerado de BarraFormatacao/marcacao.mjs e runtime.js. */\n" + marcacao + "\n" + ler("components/BarraFormatacao/runtime.js") + "\n  /* FORMATACAO:FIM */";
saidas.set("components/bundle.js", ler("components/bundle.js").replace(/  \/\* FORMATACAO:INICIO[\s\S]*?\/\* FORMATACAO:FIM \*\//, () => formatacao));
saidas.set("tokens.css", gerarTokens());
saidas.set("components/EstadosInterface/estados-interface.js",
  ler("components/EstadosInterface/runtime.modelo.js").replace("/* ICONES */ {}", ler("components/EstadosInterface/icones.json").trim()));
saidas.set("components/refined.js", gerarRuntime());
const pecas = lerPecas();
for (const p of pecas) saidas.set(`exemplos/${p.nome}.html`, gerarExemplo(p));
saidas.set("catalogo.html", gerarCatalogo(pecas));

const divergentes = [];
for (const [arquivo, conteudo] of saidas) {
  const caminho = join(root, arquivo);
  const atual = existsSync(caminho) ? readFileSync(caminho, "utf8") : null;
  if (atual === conteudo) continue;
  if (check) divergentes.push(arquivo);
  else {
    writeFileSync(caminho, conteudo);
    console.log(`gerado   ${arquivo}`);
  }
}
if (divergentes.length) {
  console.error("Arquivos gerados desatualizados (rode node scripts/build.mjs):");
  for (const d of divergentes) console.error(`  - ${d}`);
  process.exit(1);
}
console.log(check ? "Design system em dia." : "Design system gerado.");

// ---------- tokens.css ----------

function valorCss(v) {
  return String(v).replace(/\{([a-z0-9-]+)\}/g, "var(--$1)");
}

function valorDoTema(token, tema) {
  return typeof token.value === "object" ? token.value[tema] : token.value;
}

function blocoTema(tema, indent) {
  const linhas = [];
  for (const t of tokens.color.tokens) linhas.push(`--${t.name}: ${valorCss(valorDoTema(t, tema))};`);
  for (const t of tokens.shadow.tokens) linhas.push(`--${t.name}: ${valorCss(valorDoTema(t, tema))};`);
  for (const t of tokens.float?.tokens ?? []) linhas.push(`--${t.name}: ${valorCss(valorDoTema(t, tema))};`);
  linhas.push(`color-scheme: ${tema.endsWith("escuro") ? "dark" : "light"};`);
  return linhas.map((l) => `${indent}${l}`).join("\n");
}

function gerarTokens() {
  const temas = tokens.color.themes.map((t) => t.id);
  const partes = [];
  partes.push("/* A Sala dos Buscadores · tokens (gerado de tokens.json; não edite à mão) */");
  partes.push(
    `/* Tema: <html data-theme="${temas.join(" | ")}">. Sem data-theme: ${temaPadrao}, ou ${temaPadraoEscuro} se o sistema estiver em modo escuro. */`,
  );
  partes.push("");
  for (const f of tokens.type.fonts) {
    partes.push(
      `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style}; font-display: swap; }`,
    );
  }
  partes.push("");
  const ordem = [temaPadrao, ...temas.filter((t) => t !== temaPadrao)];
  for (const tema of ordem) {
    const seletor = tema === temaPadrao ? `:root, [data-theme="${tema}"]` : `[data-theme="${tema}"]`;
    partes.push(`${seletor} {\n${blocoTema(tema, "  ")}\n}`);
    partes.push("");
  }
  partes.push(`@media (prefers-color-scheme: dark) {\n  :root:not([data-theme]) {\n${blocoTema(temaPadraoEscuro, "    ")}\n  }\n}`);
  partes.push("");
  const fixos = [
    ...tokens.spacing.tokens,
    ...tokens.radius.tokens,
    ...tokens.blur.tokens,
    ...tokens.duration.tokens,
    ...tokens.easing.tokens,
    ...tokens.formatacao.tokens,
    ...(tokens.community?.tokens ?? []),
  ].map((t) => `  --${t.name}: ${valorCss(t.value)};`);
  for (const [familia, pilha] of Object.entries(tokens.type.families)) fixos.push(`  --font-${familia}: ${pilha};`);
  partes.push(`:root {\n${fixos.join("\n")}\n}`);
  return `${partes.join("\n")}\n`;
}

// ---------- peças, exemplos e catálogo ----------

function lerPecas() {
  const readme = ler("README.md");
  const inicio = readme.indexOf("## Peças");
  const pecas = [];
  let grupo = null;
  for (const linha of readme.slice(inicio).split("\n")) {
    const g = /^### (.+)$/.exec(linha);
    if (g) grupo = g[1].trim();
    const p = /^\| \[([A-Za-z]+)\]\(components\//.exec(linha);
    if (p && grupo) {
      const nome = p[1];
      const preview = ler(`components/${nome}/preview.html`).replaceAll("{{LIMITE_RESUMO_LEAD}}", String(conteudo.limiteResumoLead));
      const [cab, ...resto] = preview.split("\n");
      const m = /@dsCard group="([^"]+)" height=(\d+) subtitle="([^"]+)"/.exec(cab);
      if (!m) throw new Error(`components/${nome}/preview.html sem cabeçalho @dsCard`);
      if (m[1] !== grupo) throw new Error(`${nome}: grupo "${m[1]}" na prévia, "${grupo}" no README`);
      pecas.push({ nome, grupo, altura: Number(m[2]), subtitulo: m[3], corpo: resto.join("\n") });
    }
  }
  return pecas;
}

function gerarExemplo(p) {
  let corpo=p.corpo;
  if(p.nome==='CardVideo') {
    const video=JSON.parse(ler('data/video.json'));
    if(youtubeVideoUrl(video.youtubeUrl)) {
      corpo=corpo.replace(/<a ([^>]*data-youtube-link[^>]*)>/g,(_,attributes)=>{
        const start=Number(/data-start-at="(\d+)"/.exec(attributes)?.[1]||0);
        return '<a '+attributes.replace(/ aria-disabled="true"| aria-describedby="video-link-note"/g,'')+' href="'+youtubeVideoUrl(video.youtubeUrl,start).replaceAll('&','&amp;')+'">';
      }).replace('Prévia visual · falta informar o link do vídeo para ativar o botão.','O vídeo abre no YouTube, em uma nova aba.');
    }
  }
  return `<!doctype html>
<html lang="pt-BR" data-theme="${temaPadrao}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.nome} · A Sala dos Buscadores</title>
<link rel="stylesheet" href="../${asset('tokens.css')}">
<link rel="stylesheet" href="../${asset('components/bundle.css')}">
<link rel="stylesheet" href="../${asset('assets/themes.css')}">
${['CardSala','CardVideo','GradeComparativa','BotaoFlutuante'].includes(p.nome) ? ['components/refined-layout.css','components/CardSala/card-sala.css','components/CardVideo/card-video.css','components/CardComparativo/card-comparativo.css','components/AssistenteOrb/assistant-orb.css'].map(path=>`<link rel="stylesheet" href="../${asset(path)}">`).join('\n') : ''}
${['BannerSala','CorpoArtigo'].includes(p.nome) ? `<link rel="stylesheet" href="../${asset('components/CardVideo/card-video.css')}">` : ''}
${['CardConteudo','CorpoArtigo'].includes(p.nome) ? ['components/CardSala/card-sala.css','components/CardConteudo/card-conteudo.css'].map(path=>`<link rel="stylesheet" href="../${asset(path)}">`).join('\n') : ''}
<link rel="stylesheet" href="../${asset('components/refinement.css')}">
${["IconeVolume","EstadoSecao","CarregamentoSala","ProgressoReal","AvisoContextual","DialogoContextual","Comunidade","CompositorComunidade","PainelComentarios"].includes(p.nome) ? `<link rel="stylesheet" href="../${asset('components/EstadosInterface/estados-interface.css')}">
<script src="../${asset('components/EstadosInterface/estados-interface.js')}"></script>` : ""}
<script>try { var t = new URLSearchParams(location.search).get("tema"); if (t) document.documentElement.setAttribute("data-theme", t); } catch (e) {}</script>
<script src="../${asset('components/bundle.js')}"></script>
</head>
<body>
${corpo.replace(/\n$/, "")}
<script src="../${asset('components/refined.js')}" defer></script>
<script>
window.addEventListener('message',function(e){if(e.source!==parent)return;if(['solido-claro','solido-escuro','vidro-claro','vidro-escuro'].includes(e.data?.sdbTheme))document.documentElement.dataset.theme=e.data.sdbTheme;});
try {new ResizeObserver(function(){parent.postMessage({sdbAltura:Math.ceil(document.body.getBoundingClientRect().height)},'*');}).observe(document.body);}catch{}
</script>
</body>
</html>
`;
}

function asset(path) {
  const content = saidas.get(path) ?? ler(path);
  return `${path}?v=${createHash('sha256').update(content).digest('hex').slice(0,12)}`;
}
function gerarRuntime() {
  const files=['CardSala/card-sala.js','CardComparativo/card-comparativo.js','AssistenteOrb/gold-orb.js','AssistenteOrb/demo-responses.js','AssistenteOrb/assistant-orb.js'];
  let code='/* Gerado: runtime clássico, compatível com file:// e HTTP. */\nwindow.SDBRefined = {};\n';
  for (const file of files) {
    let source=ler('components/'+file);
    const names=[...source.matchAll(/export (?:function|const) (\w+)/g)].map(m=>m[1]);
    source=source.replace(/import \{([^}]+)\} from '[^']+';/g,'const {$1} = window.SDBRefined;').replace(/export (?=function|const)/g,'');
    code+='(()=>{\n'+source+'\nObject.assign(window.SDBRefined,{'+names.join(',')+'});\n})();\n';
  }
  return code+ler('scripts/refined-entry.js');
}
function gerarCatalogo(pecas) {
  const grupos=[];
  for(const p of pecas){let g=grupos.find(g=>g.nome===p.grupo);if(!g){g={nome:p.grupo,id:IDS_GRUPO[p.grupo],pecas:[]};grupos.push(g);}g.pecas.push(p);}
  const updated=['CardSala','CardVideo','GradeComparativa','BotaoFlutuante','IconeVolume','EstadoSecao','CarregamentoSala','ProgressoReal','AvisoContextual','DialogoContextual'];
  const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
  const navigation=grupos.map(g=>`<a href="#${g.id}">${g.nome}<span>${g.pecas.length}</span></a>`).join('');
  const sections=grupos.map(g=>`<section class="cat-group" id="${g.id}"><div class="cat-group__head"><h2>${g.nome}</h2><span>${g.pecas.length} componentes</span></div>${g.pecas.map(p=>`<details class="cat-item" id="${p.nome}" data-search="${esc(p.nome+' '+p.subtitulo+' '+p.grupo)}"><summary><span class="cat-item__number">${String(pecas.indexOf(p)+1).padStart(2,'0')}</span><div><h3>${p.nome.replace(/([a-z])([A-Z])/g,'$1 $2')}</h3><p>${p.subtitulo}</p></div>${updated.includes(p.nome)?'<span class="cat-item__tag">NOVO DESIGN</span>':''}</summary><div class="cat-item__actions"><a href="components/${p.nome}/README.md" target="_blank" rel="noopener">Guia ↗</a><a href="exemplos/${p.nome}.html" data-example-link="exemplos/${p.nome}.html" target="_blank" rel="noopener">Abrir exemplo ↗</a></div><iframe class="cat-frame" title="${p.nome}" data-src="exemplos/${p.nome}.html" style="height:${p.altura}px"></iframe></details>`).join('')}</section>`).join('');
  let html=ler('scripts/catalogo.modelo.html');
  const values={TEMA_PADRAO:temaPadrao,TOTAL:pecas.length,NAVEGACAO:navigation,SECOES:sections,OPCOES_TEMA:tokens.color.themes.map(t=>`<option value="${t.id}">${t.name.replace(' · ',' ').replace('Vidro','Translúcido')}</option>`).join(''),ASSISTANT_WIDGET:ler('scripts/assistant-widget.html')};
  for(const [key,path] of Object.entries({TOKENS:'tokens.css',BUNDLE_CSS:'components/bundle.css',THEMES:'assets/themes.css',REFINEMENT:'components/refinement.css',ORB_CSS:'components/AssistenteOrb/assistant-orb.css',CAT_CSS:'catalogo.css',BUNDLE_JS:'components/bundle.js',REFINED_JS:'components/refined.js',CAT_JS:'catalogo.js'}))values[key]=asset(path);
  for(const [key,value] of Object.entries(values))html=html.replaceAll('{{'+key+'}}',value);
  return html;
}
