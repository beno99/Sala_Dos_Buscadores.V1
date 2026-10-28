import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EsferaAssistente } from "./EsferaAssistente";

const { gold, dark } = vi.hoisted(() => ({
  gold: { destroy: vi.fn(), setPaused: vi.fn(), setHovered: vi.fn() },
  dark: { destroy: vi.fn(), setPaused: vi.fn(), setHovered: vi.fn() },
}));
vi.mock("@/design-system/gold-orb.js", () => ({ initializeGoldOrb: () => gold }));
vi.mock("@/design-system/dark-orb.js", () => ({ initializeDarkOrb: () => dark }));
describe("EsferaAssistente", () => {
  it("destrói o renderer anterior e aplica a pausa ao novo canvas antes de animar", () => {
    const { rerender, unmount } = render(
      <EsferaAssistente aparencia="dark" pausado onPerguntar={() => {}} />,
    );
    expect(dark.setPaused).toHaveBeenCalledWith(true);
    rerender(<EsferaAssistente aparencia="gold" pausado onPerguntar={() => {}} />);
    expect(dark.destroy).toHaveBeenCalledTimes(1);
    expect(gold.setPaused).toHaveBeenCalledWith(true);
    unmount();
    expect(gold.destroy).toHaveBeenCalledTimes(1);
  });
});
