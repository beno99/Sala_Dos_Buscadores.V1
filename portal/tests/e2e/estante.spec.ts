import { expect, test } from "@playwright/test";
import { entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

test.beforeEach(async ({ browser }) => {
  const admin = await browser.newPage();
  await entrarComoAdmin(admin);
  await restaurarAcervo(admin);
  await admin.close();
});

test("salvar um conteúdo na Sala o leva à Estante, e tirar o remove", async ({ page }) => {
  await entrarComoMembro(page, "/salas/corpus-hermeticum");
  const card = page.getByRole("article").filter({ hasText: "Tratado XIII" });
  const salvar = card.getByRole("button", { name: /Salvar na Estante/ });
  await expect(salvar).toHaveAttribute("aria-pressed", "false");
  await salvar.click();
  await expect(salvar).toHaveAttribute("aria-pressed", "true");

  await page.goto("/estante");
  await expect(page.getByRole("heading", { level: 1, name: "Conteúdos salvos" })).toBeVisible();
  await page.getByRole("button", { name: /Artigos/ }).click();
  const salvo = page.getByRole("article").filter({ hasText: "Tratado XIII" });
  await expect(salvo).toBeVisible();

  await salvo.getByRole("button", { name: /Salvar na Estante/ }).click();
  await expect(page.getByRole("article").filter({ hasText: "Tratado XIII" })).toHaveCount(0);
});
