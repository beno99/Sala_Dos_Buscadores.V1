import { describe, expect, it, vi } from "vitest";
import { emitirEstudo, ouvirEstudo } from "./eventos";

describe("eventos de estudo", () => {
  it("guarda o que chega antes do ouvinte e entrega na ordem", () => {
    emitirEstudo({ tipo: "sala", sala: "caibalion" });
    emitirEstudo({ tipo: "fontes" });
    const fn = vi.fn();
    const parar = ouvirEstudo(fn);
    expect(fn.mock.calls.map(([e]) => e.tipo)).toEqual(["sala", "fontes"]);
    emitirEstudo({ tipo: "comparacao", tema: "morte" });
    expect(fn).toHaveBeenCalledTimes(3);
    parar();
  });
});
