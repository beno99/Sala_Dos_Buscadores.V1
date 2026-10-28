import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

test("perfil e coleção compartilham os oito cards de Conquista; filtros e esferas funcionam", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await entrarComoMembro(page, "/perfil");
  const colecao = page.getByRole("list", { name: "Coleção de conquistas" });
  await expect(colecao.getByRole("listitem")).toHaveCount(8);
  await expect(colecao.getByRole("heading", { name: "Primeiro passo" })).toBeVisible();
  await expect(colecao.getByRole("heading", { name: /Degrau III|Porta aberta/ })).toHaveCount(0);
  await page.getByRole("link", { name: "Ver todas as conquistas" }).click();
  await expect(page).toHaveURL(/\/conquistas$/);
  await expect(page.getByRole("heading", { name: "Conquistas", exact: true, level: 1 })).toBeVisible();
  await expect(colecao.getByRole("listitem")).toHaveCount(8);
  await page.getByRole("button", { name: /^Obtidas/ }).click();
  await expect(colecao.locator(".sdb-badge-card.is-locked")).toHaveCount(0);
  await page.getByRole("button", { name: /^Bloqueadas/ }).click();
  await expect(colecao.locator(".sdb-badge-card.is-earned")).toHaveCount(0);
  const breve = colecao.getByRole("listitem").filter({ hasText: "Leitura atenta" });
  await expect(breve.getByText("Atividade em breve")).toBeVisible();
  // Bloqueada: esfera cinza e parada, sem interação.
  await expect(breve.getByRole("button", { name: "Animar esfera de Leitura atenta" })).toBeDisabled();
  await page.getByRole("button", { name: /^Todas/ }).click();
  const esfera = colecao.getByRole("button", { name: "Animar esfera de Primeiro passo" });
  await expect(esfera).toBeEnabled();
  // Com ou sem WebGL, a esfera declara o resultado; sem ele, fica a esfera CSS.
  await expect(esfera).toHaveAttribute("data-rendered", /true|false/);
  await esfera.click();
  expect(erros).toEqual([]);
});

test("cards de Conquista ficam escuros em qualquer tema e não transbordam", async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await entrarComoMembro(page, "/conquistas");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "solido-claro");
  const cards = page.getByRole("list", { name: "Coleção de conquistas" }).locator(".sdb-badge-card");
  await expect(cards).toHaveCount(8);
  for (const card of await cards.all()) await expect(card).toHaveAttribute("data-theme", "solido-escuro");
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(cards).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await context.addCookies([{ name: "sdb_tema", value: "escuro", url: "http://localhost:3000" }]);
  await page.reload();
  await expect(cards.first()).toHaveAttribute("data-theme", "solido-escuro");
});
