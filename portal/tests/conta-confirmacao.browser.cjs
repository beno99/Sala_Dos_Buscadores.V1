const assert = require("node:assert/strict");
const path = require("node:path");
const { build } = require("esbuild");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

(async () => {
  const root = path.resolve(__dirname, "..");
  const bundle = await build({
    stdin: {
      contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ConfirmarEmail} from './src/features/auth/ConfirmarEmail'; window.renderFixture=()=>{window.raiz?.unmount();window.raiz=createRoot(document.getElementById('root'));window.raiz.render(<ConfirmarEmail token={window.fixture.token}/>);};`,
      resolveDir: root,
      loader: "tsx",
    },
    bundle: true,
    write: false,
    jsx: "automatic",
    tsconfig: path.join(root, "tsconfig.json"),
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [
      {
        name: "fixture-conta",
        setup(b) {
          b.onResolve({ filter: /^(next\/navigation|next\/link|\.\/acoes|\.\/SessaoProvider)$/ }, (args) => {
            if (args.path.startsWith("next/") || args.importer.endsWith("ConfirmarEmail.tsx"))
              return { path: args.path, namespace: "conta-fixture" };
          });
          b.onLoad({ filter: /.*/, namespace: "conta-fixture" }, ({ path: p }) => ({
            loader: "jsx",
            resolveDir: root,
            contents:
              p === "next/navigation"
                ? `export const useRouter=()=>({push:p=>window.fixture.push=p,refresh:()=>{}});`
                : p === "next/link"
                  ? `import React from 'react';export default ({children,...props})=><a {...props}>{children}</a>;`
                  : p === "./SessaoProvider"
                    ? `export const useSessao=()=>({membro:window.fixture.membro,atualizar:m=>window.fixture.atualizado=m,sair:()=>window.fixture.saiu=true});`
                    : `export const confirmarEmailAcao=async()=>window.fixture.confirmacao;export const reenviarVerificacaoAcao=async()=>window.fixture.reenvio;export const corrigirEmailPendenteAcao=async()=>window.fixture.correcao;`,
          }));
        },
      },
    ],
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<html><body><div id="root"></div></body></html>');
    await page.addScriptTag({ content: bundle.outputFiles[0].text });
    const membro = { id: "a", email: "a@example.com", papel: "membro", emailVerificadoEm: null };
    for (const sessao of [null, membro]) {
      await page.evaluate(
        ({ sessao }) => {
          window.fixture = {
            token: "valido",
            membro: sessao,
            confirmacao: {
              ok: true,
              valor: {
                membro: { id: "b", email: "b@example.com", emailVerificadoEm: "hoje" },
                mesmaSessao: false,
              },
            },
          };
          window.renderFixture();
        },
        { sessao },
      );
      await page.getByRole("button", { name: "Confirmar e-mail", exact: true }).click();
      await page.getByText("E-mail confirmado", { exact: true }).waitFor();
      assert.equal(await page.evaluate(() => window.fixture.atualizado), undefined);
      assert.equal(await page.evaluate(() => window.fixture.push), undefined);
      if (sessao)
        await page
          .getByRole("button", { name: "Sair da sessão atual e entrar na conta confirmada" })
          .waitFor();
      else await page.getByRole("link", { name: "Entrar na conta confirmada" }).waitFor();
    }
    await page.evaluate((m) => {
      window.fixture = {
        token: "velho",
        membro: m,
        confirmacao: { ok: false, erro: "link expirado" },
        reenvio: { ok: true, valor: true },
      };
      window.renderFixture();
    }, membro);
    await page.getByRole("button", { name: "Confirmar e-mail", exact: true }).click();
    await page.getByRole("button", { name: "Pedir um novo link" }).click();
    await page.getByText("Novo link solicitado", { exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Confirmar e-mail", exact: true }).count(), 0);
    await page.evaluate((m) => {
      window.fixture = {
        membro: m,
        correcao: {
          ok: true,
          valor: {
            membro: { ...m, email: "novo@example.com" },
            enviado: false,
            erroEnvio: "endereço corrigido; use Reenviar e-mail",
          },
        },
      };
      window.renderFixture();
    }, membro);
    await page.getByRole("textbox", { name: "Corrigir endereço de e-mail" }).fill("novo@example.com");
    await page.getByRole("button", { name: "Corrigir e enviar novo link" }).click();
    await page.getByText("Erro: endereço corrigido; use Reenviar e-mail", { exact: true }).waitFor();
    assert.equal((await page.evaluate(() => window.fixture.atualizado)).email, "novo@example.com");
    assert.equal(await page.getByText("Link reenviado", { exact: true }).count(), 0);
    await page.getByRole("button", { name: "Reenviar e-mail", exact: true }).waitFor();
    process.stdout.write(
      "Confirmação: sessão ausente/outra preservada; token antigo substituído; falha de envio honesta.\n",
    );
  } finally {
    await browser.close();
  }
})().catch((erro) => {
  process.stderr.write(String(erro));
  process.exitCode = 1;
});
