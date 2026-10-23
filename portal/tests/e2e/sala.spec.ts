import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

test("membro filtra os conteúdos, troca o trecho e compara um tema a partir da Sala", async ({ page }) => {
  await entrarComoMembro(page, "/salas/corpus-hermeticum");
  await expect(page.getByRole("heading", { level: 1, name: "Corpus Hermeticum" })).toBeVisible();

  await page.getByRole("button", { name: /Avançado/ }).click();
  const lista = page.getByRole("region", { name: "Conteúdos" });
  await expect(lista.getByRole("article")).toHaveCount(1);
  await expect(lista.getByRole("link", { name: /Tratado XIII/ })).toBeVisible();

  const trecho = page.getByRole("region", { name: "Trecho de fonte primária" });
  await trecho.getByRole("button", { name: "Original" }).click();
  await expect(trecho.getByRole("button", { name: "Original" })).toHaveAttribute("aria-pressed", "true");
  await expect(trecho.locator('.sdb-quote__views[data-view="orig"]')).toBeVisible();

  await page
    .getByRole("region", { name: /Comparar um tema/ })
    .getByRole("link", { name: "Morte" })
    .click();
  await expect(page).toHaveURL(/\/comparar\?tema=morte/);
});

test("Sala de anfitrião mostra a assinatura com o selo, e a trilha volta a Salas", async ({ page }, info) => {
  await entrarComoMembro(page, "/salas/leituras-do-evangelho-de-tome");
  await expect(page.getByRole("heading", { level: 1, name: "Leituras do Evangelho de Tomé" })).toBeVisible();
  const cabecalho = page.locator(".sdb-roomhead");
  await expect(cabecalho.getByRole("link", { name: /Helena Varga/ })).toBeVisible();
  await expect(cabecalho.locator(".sdb-seal--anfitriao")).toContainText("Anfitrião");

  if (info.project.name === "celular") {
    // Abaixo de 900 px a barra esconde a trilha; o botão "‹ Salas" faz o papel dela.
    await expect(page.getByRole("navigation", { name: "Trilha" })).toBeHidden();
    await page.locator(".sdb-roomhead__back").click();
  } else {
    const trilha = page.getByRole("navigation", { name: "Trilha" });
    await expect(trilha.getByText("Leituras do Evangelho de Tomé")).toHaveAttribute("aria-current", "page");
    await trilha.getByRole("link", { name: "Salas" }).click();
  }
  await expect(page).toHaveURL(/\/salas$/);
});
