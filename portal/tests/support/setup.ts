import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";
import { prepararDemonstracao } from "./demonstracao";
import { navigationMock } from "./next-navigation";

vi.mock("next/navigation", () => navigationMock);

// Cada arquivo começa com um Postgres em memória (PGlite) com a semente e o cenário de demonstração.
beforeAll(() => prepararDemonstracao());

// APIs de layout que o jsdom não implementa.
if (typeof Element !== "undefined") Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  cleanup();
  navigationMock.reset();
});
