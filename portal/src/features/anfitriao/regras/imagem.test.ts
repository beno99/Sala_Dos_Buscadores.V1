import { describe, expect, it } from "vitest";
import { LIMITE_IMAGEM_BYTES, tipoPelosBytes, validarImagem } from "./imagem";

/* Upload de imagem (§3.4): tipo pelos magic bytes, até 5 MB. */
const comCabecalho = (cabecalho: number[], total = 64) => {
  const b = new Uint8Array(total);
  b.set(cabecalho);
  return b;
};
const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];

describe("validação de upload", () => {
  it.each([
    ["JPEG", JPEG, "image/jpeg"],
    ["PNG", PNG, "image/png"],
    ["WebP", WEBP, "image/webp"],
  ])("aceita %s pelos primeiros bytes", (_n, cabecalho, tipo) => {
    expect(validarImagem(comCabecalho(cabecalho))).toEqual({ ok: true, tipo });
  });

  it("recusa GIF, PDF e texto, mesmo que o nome diga .jpg", () => {
    expect(validarImagem(comCabecalho([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toMatchObject({ ok: false });
    expect(validarImagem(comCabecalho([0x25, 0x50, 0x44, 0x46]))).toMatchObject({ ok: false });
    expect(validarImagem(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toEqual({
      ok: false,
      erro: "o arquivo precisa ser JPEG, PNG ou WebP.",
    });
  });

  it("RIFF que não é WebP (por exemplo WAV) é recusado", () => {
    const wav = [0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x41, 0x56, 0x45];
    expect(tipoPelosBytes(comCabecalho(wav))).toBeNull();
  });

  it("aceita exatamente 5 MB e recusa acima disso", () => {
    expect(validarImagem(comCabecalho(PNG, LIMITE_IMAGEM_BYTES)).ok).toBe(true);
    const grande = validarImagem(comCabecalho(PNG, LIMITE_IMAGEM_BYTES + 1));
    expect(grande).toMatchObject({ ok: false, erro: expect.stringMatching(/o limite é 5 MB/) });
  });

  it("recusa arquivo vazio", () => {
    expect(validarImagem(new Uint8Array())).toMatchObject({
      ok: false,
      erro: expect.stringMatching(/vazio/),
    });
  });
});
