import { expect, test } from "@playwright/test";
import { entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

// As vagas vivem na memória do servidor: cada teste parte da escolha inicial.
test.beforeEach(async ({ browser }) => {
  const admin = await browser.newPage();
  await entrarComoAdmin(admin);
  await restaurarAcervo(admin);
  await admin.close();
});

test("o administrador escolhe um vídeo e um artigo e os vê em Destaques", async ({ page }) => {
  await entrarComoAdmin(page);
  await page.goto("/admin/destaques");
  await expect(page.getByRole("heading", { level: 1, name: "Destaques" })).toBeVisible();

  await page.getByRole("combobox", { name: "Vídeo principal" }).selectOption("v-urantia-mansoes");
  await expect(page.getByText(/Vídeo principal: “Os mundos das mansões/)).toBeVisible();

  // Troca o centro do mosaico por um artigo que não estava na página.
  await page
    .getByRole("combobox", { name: "Artigos em destaque, vaga 1" })
    .selectOption("c-ajustador-do-pensamento");
  await expect(
    page.getByText(/Artigos em destaque, vaga 1: “O que o livro chama de Ajustador/),
  ).toBeVisible();

  await page.goto("/destaques");
  await expect(
    page.getByRole("heading", { level: 3, name: "Os mundos das mansões no Livro de Urântia" }),
  ).toBeVisible();
  const artigos = page.getByRole("region", { name: "Artigos em destaque" });
  await expect(
    artigos.getByRole("link", { name: "O que o livro chama de Ajustador do Pensamento" }),
  ).toBeVisible();
  for (const card of await artigos.getByRole("article").all()) {
    await expect(card.locator(".sdb-seal")).toHaveCount(1);
  }
});

test("membro não acessa /admin/destaques", async ({ page }) => {
  await entrarComoMembro(page);
  await page.goto("/admin/destaques");
  await expect(page.getByRole("heading", { level: 1, name: "Acesso restrito" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Vídeo principal" })).toHaveCount(0);
});

test("Destaques mostra a escolha da curadoria e o ranking de buscas", async ({ page }) => {
  await entrarComoMembro(page);
  await page.goto("/destaques");
  await expect(page.getByRole("heading", { level: 3, name: "Poimandres, a mente que fala" })).toBeVisible();
  const ranking = page.getByRole("complementary", { name: "Mais pesquisados" });
  await expect(ranking.getByRole("listitem")).toHaveCount(7);
  await expect(ranking.getByRole("listitem").first()).toContainText("212 buscas");
  await expect(ranking.getByText("Página 1 de 3")).toBeVisible();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()?.width ?? 0,
  );
});
