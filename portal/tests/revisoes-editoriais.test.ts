import assert from "node:assert/strict";
import { test } from "node:test";
import type { FonteEditorial } from "../src/data/types";
import { fonteParaForm } from "../src/features/admin/formularios";
import { errosDoCorpo } from "../src/features/admin/regras/corpo";

test("C05 reabrir fonte ignora inicial manual antiga e usa seu próprio título Unicode", () => {
  for (const [titulo, inicial] of [
    ["  “The Kybalion’s New Clothes”", "T"],
    ["... Épocas", "É"],
    ["«3 leituras»", "3"],
    ["💬 𐐨texto", "𐐀"],
    ["—", ""],
  ]) {
    const fonte = { id: "f", titulo, inicial: "X" } as FonteEditorial;
    assert.equal(fonteParaForm(fonte).inicial, inicial);
  }
});
test("C06 corpo vazio não satisfaz abertura obrigatória para publicar", () => {
  assert.ok(Object.keys(errosDoCorpo(["  "])).length);
});
test("C06 pendências explicam abertura e imagens sem jargão", () => {
  const erros = errosDoCorpo([
    { tipo: "intertitulo", texto: "Contexto" },
    { tipo: "imagem", src: "/imagem.png", alt: "", credito: "" },
  ]);
  assert.match(Object.values(erros).join(" "), /parágrafo de abertura/);
  assert.doesNotMatch(Object.values(erros).join(" "), /\blead\b/);
});

import { corpoParaForm, limparCorpo } from "../src/data/corpo";
import { inicialDoTitulo } from "../src/lib/texto";

test("C02 inicial segue título sem excluir artigo gramatical, preserva acento e número", () => {
  for (const [titulo, esperado] of [
    ["O princípio do ritmo", "O"],
    [" — a alma", "A"],
    ["«Ética»", "É"],
    [" 3 percursos", "3"],
    ["💬", ""],
    ["A\u0301rvore", "Á"],
  ] as const)
    assert.equal(inicialDoTitulo(titulo), esperado);
});
test("C06 erro acompanha imagem após reordenação e salvar/reabrir, sem usar posição", () => {
  const blocos = corpoParaForm([
    "Abertura",
    { tipo: "imagem", src: "/local.png", alt: "", credito: "" },
    { tipo: "destaque", texto: "Trecho", atribuicao: "" },
  ]);
  const antes = Object.keys(errosDoCorpo(blocos));
  const [abertura, imagem, destaque] = blocos;
  assert.ok(abertura && imagem && destaque);
  const depois = [abertura, destaque, imagem];
  assert.deepEqual(Object.keys(errosDoCorpo(corpoParaForm(limparCorpo(depois)))).sort(), antes.sort());
});
test("C06 parágrafo de abertura válido não exige conteúdo inventado", () => {
  assert.deepEqual(errosDoCorpo(["Uma leitura sobre a fonte identificada."]), {});
});
