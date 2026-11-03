import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { conferirImagemPublicidade } from "../src/modules/publicidade/imagens";

test("upload valida bytes e decodificação real, não extensão ou MIME declarado", async () => {
  const png = await sharp({ create: { width: 70, height: 50, channels: 3, background: "#d3b36e" } })
    .png()
    .toBuffer();
  assert.equal((await conferirImagemPublicidade(png)).ok, true);
  for (const formato of ["jpeg", "webp"] as const)
    assert.equal((await conferirImagemPublicidade(await sharp(png)[formato]().toBuffer())).ok, true);
  assert.equal((await conferirImagemPublicidade(new Uint8Array())).ok, false);
  assert.equal((await conferirImagemPublicidade(new Uint8Array(5 * 1024 * 1024 + 1))).ok, false);
  assert.equal((await conferirImagemPublicidade(new TextEncoder().encode("<svg></svg>"))).ok, false);
  assert.equal((await conferirImagemPublicidade(png.subarray(0, 15))).ok, false);
});
