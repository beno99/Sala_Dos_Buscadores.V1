import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { BannerRotativo, type SlideBanner } from "./BannerRotativo";

afterEach(() => vi.useRealTimers());

it("continua a rotação automática depois do primeiro intervalo", () => {
  vi.useFakeTimers();
  const slides: SlideBanner[] = [
    { id: "marca", tipo: "marca", acoes: null, midia: { placa: "bordo" } },
    {
      id: "episodio",
      tipo: "episodio",
      rotulo: "Episódio",
      titulo: ["Poimandres", "Texto e contexto"],
      sub: "Estudo",
      acoes: null,
      midia: { placa: "bege" },
    },
    {
      id: "outro",
      tipo: "episodio",
      rotulo: "Episódio",
      titulo: ["Gnose", "Textos antigos"],
      sub: "Estudo",
      acoes: null,
      midia: { placa: "grafite" },
    },
  ];
  render(<BannerRotativo slides={slides} onPorQue={() => {}} />);
  act(() => vi.advanceTimersByTime(7000));
  expect(screen.getByRole("group", { name: "2 de 3" })).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(7000));
  expect(screen.getByRole("group", { name: "3 de 3" })).toBeInTheDocument();
});
