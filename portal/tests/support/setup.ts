import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import { navigationMock } from "./next-navigation";

vi.mock("next/navigation", () => navigationMock);

// APIs de layout que o jsdom não implementa.
if (typeof Element !== "undefined") Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
  navigationMock.reset();
});
