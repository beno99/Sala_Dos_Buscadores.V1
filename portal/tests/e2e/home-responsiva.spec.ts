import { expect, test } from "@playwright/test";
import { entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

test.beforeEach(async ({ browser }) => {
  const admin = await browser.newPage();
  await entrarComoAdmin(admin);
  await restaurarAcervo(admin);
  await admin.close();
});

test("ações da home preservam Estante, assistente, busca e destinos", async ({ page, isMobile }) => {
  await entrarComoMembro(page);
  await page.getByRole("button", { name: "Pausar rotação" }).click();
  const sugestoes = page.getByRole("region", { name: "Para sua próxima leitura" });
  const salvar = sugestoes.getByRole("button", { name: /^Salvar na Estante:/ });
  await expect(salvar).toHaveAttribute("aria-pressed", "false");
  await salvar.click();
  await expect(salvar).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL("/");
  await page.reload();
  await expect(salvar).toHaveAttribute("aria-pressed", "true");
  await salvar.click();
  await expect(salvar).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Destaque 1", exact: true }).click();
  await page.getByRole("button", { name: "Perguntar ao assistente", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Sua pergunta ao acervo" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar assistente" }).click();
  await expect(page.getByRole("dialog", { name: "Assistente de IA" })).toBeHidden();
  await page.keyboard.press("ControlOrMeta+k");
  const busca = page.getByRole("dialog", { name: "Buscar no acervo" });
  await expect(busca.getByRole("combobox")).toBeFocused();
  await busca.getByRole("combobox").press("Escape");
  await expect(busca).toBeHidden();
  for (const [pergunta, tema] of [
    ["Como as tradições compreendem a alma? Comparar perspectivas", "alma"],
    ["O que acontece após a morte? Comparar perspectivas", "morte"],
  ]) {
    await page.getByRole("link", { name: pergunta }).click();
    await expect(page).toHaveURL(`/comparar?tema=${tema}`);
    await page.goto("/");
  }
  const salas = page.getByRole("region", { name: "Conheça outras Salas" });
  await salas.getByRole("button", { name: "Ver mais Salas" }).click();
  await expect
    .poll(() => page.locator("#salas-recomendadas-trilho").evaluate((e) => e.scrollLeft))
    .toBeGreaterThan(0);
  await salas.getByRole("link", { name: "Entrar na Sala O Caibalion", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/salas/caibalion");
  await page.goto("/");
  await page
    .getByRole("region", { name: "Continue sua busca" })
    .getByRole("link", { name: /^Retomar leitura/ })
    .click();
  await expect(page).toHaveURL(/\/salas\/corpus-hermeticum\/poimandres-subida-pelas-esferas/);
  if (isMobile) {
    await page.getByRole("button", { name: "Mais", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Mais", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

test("seis viewports, quatro temas e movimento reduzido sem overflow", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await entrarComoMembro(page);
  for (const [width, height] of [
    [1504, 900],
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [360, 800],
  ] as const) {
    await page.setViewportSize({ width, height });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    const grid = await page
      .locator(".sdb-home__columns")
      .evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length);
    expect(grid).toBe(width >= 1440 ? 2 : 1);
    if (width >= 1440) {
      expect((await page.locator(".sdb-banner").boundingBox())?.height).toBe(495);
      expect((await page.locator(".sdb-sidenav--app").boundingBox())?.width).toBe(288);
    }
    await expect(page.getByRole("button", { name: "Retomar rotação" })).toBeVisible();
    const links = await page
      .locator(".sdb-home__leituras .sdb-card__link")
      .evaluateAll((es) => es.map((e) => e.getAttribute("href")));
    expect(new Set(links).size).toBe(links.length);
  }
  for (const tema of ["Escuro", "Vidro claro", "Vidro escuro", "Areia"]) {
    await page.getByRole("button", { name: "Aparência", exact: true }).click();
    await page.getByRole("radio", { name: tema, exact: true }).check();
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(page.locator(".sdb-retomada")).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
  await page.locator(".sdb-footer").scrollIntoViewIfNeeded();
  const footer = await page.locator(".sdb-footer").boundingBox();
  expect(footer).not.toBeNull();
  const main = await page.locator("main").evaluate((e) => parseFloat(getComputedStyle(e).paddingBottom));
  expect(main).toBeGreaterThanOrEqual(92);
});
