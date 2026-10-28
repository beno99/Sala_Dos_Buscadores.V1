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
  await expect(
    page.getByRole("heading", { name: "O que cada Sala diz, lado a lado", level: 1 }),
  ).toBeVisible();
});

test("diálogo de orientação preserva contexto e retorno do foco", async ({ page }) => {
  // O Aviso contextual ("Seção em preparação") saiu da Estante, que agora funciona.
  await entrarComoMembro(page, "/");
  const painel = page.getByRole("main");
  const gatilho = painel.getByRole("button", { name: "Sobre os anúncios" });
  await gatilho.click();
  const dialogo = page.getByRole("dialog", { name: "Por que estou vendo isto?" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator('.sdb-ui-volume[data-symbol="escudo"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).not.toBeVisible();
  await expect(gatilho).toBeFocused();
  await page
    .getByRole("region", { name: "Seu caminho" })
    .getByRole("link", { name: "Ver conquistas" })
    .click();
  await expect(page.getByRole("progressbar", { name: "Conquistas obtidas" })).toBeVisible();
});
