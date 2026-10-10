import { describe, expect, it } from "vitest";
import { deveRodar, intercalarSlides, proximoSlide } from "./banner";

describe("banner", () => {
  it("intercala marca, episódios e anúncios, começando pela marca", () => {
    expect(intercalarSlides("M", ["E1", "E2"], ["A1"])).toEqual(["M", "E1", "A1", "E2"]);
  });

  it("gira em volta nas duas direções", () => {
    expect(proximoSlide(2, 3)).toBe(0);
    expect(proximoSlide(0, 3, -1)).toBe(2);
  });

  it("para com pausa, hover, foco, movimento reduzido ou aba oculta", () => {
    const livre = {
      pausadoPeloUsuario: false,
      hover: false,
      foco: false,
      movimentoReduzido: false,
      abaOculta: false,
    };
    expect(deveRodar(livre)).toBe(true);
    for (const k of Object.keys(livre)) expect(deveRodar({ ...livre, [k]: true })).toBe(false);
  });
});
