import { describe, expect, it } from "vitest";
import { extrairIdYoutube, validarDuracao } from "./youtube";

describe("URL do YouTube (RF-16)", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("aceita %s", (url, id) => {
    const r = extrairIdYoutube(url);
    expect(r).toEqual({ ok: true, id, canonica: `https://www.youtube.com/watch?v=${id}` });
  });

  it.each([
    ["https://vimeo.com/123456", /só aceitamos/],
    ["https://www.youtube.com.evil.example/watch?v=dQw4w9WgXcQ", /só aceitamos/],
    ["https://www.youtube.com/results?search_query=nag+hammadi", /código do vídeo/],
    ["https://www.youtube.com/watch?v=curto", /código do vídeo/],
    ["", /cole o endereço/],
  ])("recusa %s", (url, erro) => {
    const r = extrairIdYoutube(url);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toMatch(erro);
  });
});

describe("duração mm:ss (RF-16)", () => {
  it("aceita minutos e segundos válidos", () => {
    for (const d of ["18:42", "0:59", "124:05"]) expect(validarDuracao(d)).toBeNull();
  });

  it("recusa formatos inválidos com a forma correta no texto", () => {
    expect(validarDuracao("18:60")).toMatch(/00 a 59/);
    expect(validarDuracao("18m42")).toMatch(/mm:ss/);
    expect(validarDuracao("1:02:03")).toMatch(/mm:ss/);
    expect(validarDuracao("00:00")).toMatch(/não pode ser 00:00/);
    expect(validarDuracao("")).toMatch(/informe/);
  });
});
