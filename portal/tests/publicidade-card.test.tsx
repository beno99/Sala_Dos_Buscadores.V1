import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formularioVazio } from "../src/features/publicidade/tipos";

// O SSR testa a marcação real. CSS é verificado separadamente pelo build e pela revisão visual.
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith("/publicidade.css")) return { format: "module", source: "", shortCircuit: true };
    return nextLoad(url, context);
  },
});

async function renderizar(previa = false, alteracoes = {}) {
  const { CardPublicidade } = await import("../src/features/publicidade/CardPublicidade");
  const anuncio = { ...formularioVazio(), ...alteracoes };
  return { html: renderToStaticMarkup(createElement(CardPublicidade, { anuncio, previa })), anuncio };
}

test("card identifica publicidade, anunciante e saída para nova aba", async () => {
  const { html } = await renderizar(false, {
    imagemId: "imagem-segura",
    alt: "Capa azul de um livro",
    categoria: "Livros",
    titulo: "Uma leitura para começar",
    descricao: "Conheça esta edição.",
    anunciante: "Editora Horizonte",
    href: "https://example.com/produto",
  });
  assert.match(html, /PUBLICIDADE/);
  assert.match(html, /alt="Capa azul de um livro"/);
  assert.match(html, /href="https:\/\/example.com\/produto"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="sponsored noopener noreferrer"/);
  assert.match(html, /abre em nova aba/);
  assert.match(html, /Conhecer o produto/);
  assert.match(html, /Anunciante: Editora Horizonte/);
  assert.match(html, /<h2[^>]*>Uma leitura para começar<\/h2>/);
});

test("prévia usa exemplos sem alterar os dados do formulário", async () => {
  const { html, anuncio } = await renderizar(true);
  assert.match(html, /O título do seu anúncio/);
  assert.match(html, /A imagem do seu produto aparecerá aqui/);
  assert.equal(anuncio.titulo, "");
  assert.equal(anuncio.descricao, "");
  assert.equal(anuncio.imagemId, null);
  assert.doesNotMatch(html, /<a\b/);
  assert.doesNotMatch(html, /sdb-publicidade__categoria/);
});

test("card público não inventa conteúdo e não abre protocolos inseguros", async () => {
  const { html } = await renderizar(false, { href: "javascript:alert(1)" });
  assert.doesNotMatch(html, /<a\b|href=|O título do seu anúncio|A imagem do seu produto/);
});

test("card preserva enquadramento e trata texto como conteúdo", async () => {
  const { html } = await renderizar(false, {
    imagemId: "imagem-a",
    alt: "Produto",
    titulo: "<script>ruim</script>",
    enquadramento: { x: 22, y: 73, zoom: 1.5 },
  });
  assert.match(html, /object-position:22% 73%/);
  assert.match(html, /transform:scale\(1.5\)/);
  assert.match(html, /transform-origin:22% 73%/);
  assert.match(html, /&lt;script&gt;ruim&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
