import { describe, expect, it } from "vitest";
import type { TemaSlug } from "@/data/types";
import { escolherRelacionados } from "./relacionados";

const c = (sala: string, slug: string, temas: TemaSlug[], publicadoEm = "2026-08-01") => ({
  sala: sala as "caibalion",
  slug,
  temas,
  publicadoEm,
});

describe("Continuar a busca: escolha e ordem", () => {
  const alvo = c("caibalion", "sete-principios", ["conhecimento-interior", "origem-do-universo"]);

  it("só quem tem tema em comum, sem o próprio", () => {
    const r = escolherRelacionados(alvo, [
      alvo,
      c("corpus-hermeticum", "poimandres", ["origem-do-universo"]),
      c("urantia", "mansoes", ["morte"]),
    ]);
    expect(r.map((x) => x.slug)).toEqual(["poimandres"]);
  });

  it("outras Salas primeiro; em cada grupo, mais temas em comum e, no empate, o mais recente", () => {
    const r = escolherRelacionados(alvo, [
      c("caibalion", "tres-iniciados", ["conhecimento-interior", "origem-do-universo"], "2026-09-01"),
      c("nag-hammadi", "tome", ["conhecimento-interior"], "2026-07-01"),
      c("urantia", "ajustador", ["conhecimento-interior"], "2026-08-20"),
      c("corpus-hermeticum", "poimandres", ["origem-do-universo", "conhecimento-interior"], "2026-01-01"),
      c("caibalion", "mentalismo", ["origem-do-universo"], "2026-09-10"),
    ]);
    expect(r.map((x) => x.slug)).toEqual(["poimandres", "ajustador", "tome", "tres-iniciados", "mentalismo"]);
  });

  it("até 8", () => {
    const muitos = Array.from({ length: 12 }, (_, i) => c("urantia", `item-${i}`, ["conhecimento-interior"]));
    expect(escolherRelacionados(alvo, muitos)).toHaveLength(8);
  });
});
