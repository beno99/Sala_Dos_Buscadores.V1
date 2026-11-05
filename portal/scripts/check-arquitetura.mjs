import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const portal = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(portal, "src");
const baselinePath = join(portal, "scripts", "arquitetura-baseline.json");
const gerar = process.argv.includes("--gerar");

const ignorados = (rel) =>
  rel.startsWith("src/design-system/") || rel.endsWith(".generated.ts") || /\.test\.tsx?$/.test(rel);

function arquivos(dir, saida = []) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) arquivos(caminho, saida);
    else if (/\.(ts|tsx|mjs)$/.test(nome)) saida.push(caminho);
  }
  return saida;
}

const todos = arquivos(src)
  .map((abs) => ({ abs, rel: relative(portal, abs).split("\\").join("/") }))
  .filter(({ rel }) => !ignorados(rel.replace(/^src\//, "src/")));

const conteudo = new Map(todos.map((f) => [f.rel, readFileSync(f.abs, "utf8")]));

function resolverServidor(spec) {
  const base = join(src, spec.replace(/^@\/|^src\//, ""));
  for (const candidato of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts")]) {
    if (existsSync(candidato)) return candidato;
  }
  return null;
}

const regras = {
  comentarios_de_codigo: {
    descricao: "linhas de comentário no código (// ou /*); exceto biome-ignore",
    contar: ({ texto }) =>
      texto.split("\n").filter((l) => /^\s*(\/\/|\/\*|\*)/.test(l) && !l.includes("biome-ignore")).length,
  },
  alert_nativo: {
    descricao: "alert() do navegador (usar toast)",
    contar: ({ texto }) => (texto.match(/\balert\(/g) ?? []).length,
  },
  http_direto_em_tela: {
    descricao: "arquivos de tela/componente que chamam fetch ou ky direto (usar gateway)",
    contar: ({ rel, texto }) => {
      const e_tela = rel.startsWith("src/app/")
        ? !rel.includes("/api/")
        : rel.startsWith("src/features/") || rel.startsWith("src/components/");
      return e_tela && /\bfetch\(|from "ky"/.test(texto) ? 1 : 0;
    },
  },
  cliente_importa_servidor: {
    descricao: 'client component importa módulo de servidor que não é "use server"',
    contar: ({ texto }) => {
      if (!/^\s*"use client"/m.test(texto)) return 0;
      let n = 0;
      for (const m of texto.matchAll(/^import (?!type )[^;]*?from "(@\/server\/[^"]+)"/gm)) {
        const alvo = resolverServidor(m[1]);
        if (alvo && !/^\s*["']use server["']/m.test(readFileSync(alvo, "utf8").slice(0, 200))) n++;
      }
      return n;
    },
  },
};

const contagens = Object.fromEntries(Object.keys(regras).map((nome) => [nome, 0]));
for (const { rel } of todos) {
  const texto = conteudo.get(rel);
  for (const [nome, regra] of Object.entries(regras)) {
    contagens[nome] += regra.contar({ rel, texto });
  }
}

if (gerar) {
  writeFileSync(baselinePath, `${JSON.stringify(contagens, null, 2)}\n`);
  console.log("baseline gravado:", contagens);
  process.exit(0);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
let falhou = false;
for (const [nome, regra] of Object.entries(regras)) {
  const atual = contagens[nome];
  const teto = baseline[nome] ?? 0;
  if (atual > teto) {
    falhou = true;
    console.error(`✖ ${nome}: ${atual} > teto ${teto}. ${regra.descricao}`);
  } else if (atual < teto) {
    console.log(`↓ ${nome}: ${atual} (teto ${teto}). Reduza o teto com --gerar.`);
  } else {
    console.log(`✔ ${nome}: ${atual} (teto ${teto})`);
  }
}
process.exit(falhou ? 1 : 0);
