import assert from "node:assert/strict";
import { test } from "node:test";
import { carregarMiniatura, type ImagemCarregavel } from "./miniatura-video";

function obter(imagens: ImagemCarregavel[], indice: number) {
  const imagem = imagens[indice];
  assert.ok(imagem);
  return imagem;
}
function fabrica() {
  const imagens: ImagemCarregavel[] = [];
  return {
    imagens,
    criar: () => {
      const img = { src: "", naturalWidth: 640, onload: null, onerror: null } as ImagemCarregavel;
      imagens.push(img);
      return img;
    },
  };
}
test("tenta maxres, hq e mq; placeholder de 120 px não vira sucesso", () => {
  const f = fabrica();
  const resultados: (string | undefined)[] = [];
  carregarMiniatura(["max", "hq", "mq"], (url) => resultados.push(url), f.criar);
  obter(f.imagens, 0).naturalWidth = 120;
  obter(f.imagens, 0).onload?.(new Event("load"));
  assert.equal(obter(f.imagens, 1).src, "hq");
  obter(f.imagens, 1).onerror?.(new Event("error"));
  assert.equal(obter(f.imagens, 2).src, "mq");
  obter(f.imagens, 2).onload?.(new Event("load"));
  assert.deepEqual([...resultados], ["mq"]);
});
test("erro total permite nova tentativa e cancelamento descarta resposta antiga", () => {
  const f = fabrica();
  const resultados: (string | undefined)[] = [];
  const cancelar = carregarMiniatura(["a", "b"], (url) => resultados.push(url), f.criar);
  const respostaAntiga = obter(f.imagens, 0).onload;
  cancelar();
  respostaAntiga?.(new Event("load"));
  assert.equal(resultados.length, 0);
  carregarMiniatura(["a"], (url) => resultados.push(url), f.criar);
  obter(f.imagens, 1).onerror?.(new Event("error"));
  assert.deepEqual([...resultados], [undefined]);
  carregarMiniatura(["a"], (url) => resultados.push(url), f.criar);
  obter(f.imagens, 2).onload?.(new Event("load"));
  assert.deepEqual([...resultados], [undefined, "a"]);
});
