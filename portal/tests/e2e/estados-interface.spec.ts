import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

test("busca sem resultados usa ícone opaco e permite limpar a consulta", async ({ page }) => {
  await entrarComoMembro(page, "/comparar?q=zzzinexistentezzz");
  const vazio = page.getByRole("region", { name: /Nenhuma Sala trata/ });
  await expect(vazio).toBeVisible();
  const camada = vazio.locator(".sdb-ui-volume-front");
  expect(await camada.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain("rgb(249, 250, 247)");
  await vazio.getByRole("link", { name: "Limpar busca" }).click();
  await expect(page).toHaveURL("/comparar");
  await expect(page.getByRole("heading", { name: "Escolha um tema para começar" })).toBeVisible();
});

test("diálogo de orientação preserva contexto e retorno do foco", async ({ page }) => {
  // O Aviso contextual ("Seção em preparação") saiu da Estante, que agora funciona.
  await entrarComoMembro(page, "/");
  const painel = page.getByRole("region", { name: "Seu progresso" });
  const gatilho = painel.getByRole("button", { name: "Por que estou vendo isto?" });
  await gatilho.click();
  const dialogo = page.getByRole("dialog", { name: "Por que estou vendo isto?" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator('.sdb-ui-volume[data-symbol="escudo"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).not.toBeVisible();
  await expect(gatilho).toBeFocused();
  await page.getByRole("button", { name: "Ver conquistas" }).first().click();
  await expect(page.getByRole("progressbar", { name: "Conquistas obtidas" })).toBeVisible();
});
