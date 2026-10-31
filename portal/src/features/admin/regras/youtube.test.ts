import assert from "node:assert/strict";
import { test } from "node:test";
import { extrairIdYoutube } from "./youtube";

const id = "dQw4w9WgXcQ";
test("aceita watch, short link, shorts e embed com ID estável", () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${id}&t=12`,
    `https://youtu.be/${id}?si=abc`,
    `https://m.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])
    assert.deepEqual(extrairIdYoutube(url), {
      ok: true,
      id,
      canonica: `https://www.youtube.com/watch?v=${id}`,
    });
});
test("recusa domínios falsos, credenciais, porta e caminhos arbitrários", () => {
  for (const url of [
    `https://youtube.com.evil.test/watch?v=${id}`,
    `https://youtube.com@evil.test/watch?v=${id}`,
    `https://user@youtube.com/watch?v=${id}`,
    `https://youtube.com:8443/watch?v=${id}`,
    `javascript:alert(1)`,
    `ftp://youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}/extra`,
    `https://youtube.com/shorts/${id}/extra`,
    `https://youtube.com/watch?v=invalid`,
  ])
    assert.equal(extrairIdYoutube(url).ok, false, url);
});
