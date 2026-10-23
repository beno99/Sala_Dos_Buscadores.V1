import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

test.afterEach(async ({ browser }) => {
  const admin = await browser.newPage();
  await entrarComoAdmin(admin);
  await restaurarAcervo(admin);
  await admin.close();
});

const FOTO = join(process.cwd(), "public/imagens/salas/corpus-hermeticum.webp");

test("o buscador envia uma foto, escreve sobre a busca e vê o Perfil atualizado", async ({ page }) => {
  await entrarComoMembro(page, "/perfil");
  await expect(page.getByRole("heading", { level: 1, name: "Buscador" })).toBeVisible();
  await expect(page.getByText("Privado · só você vê esta página")).toBeVisible();

  await page.getByRole("button", { name: "Editar perfil" }).click();
  const dialogo = page.getByRole("dialog", { name: "Editar perfil" });
  await dialogo.locator('input[type="file"]').first().setInputFiles(FOTO);
  await expect(dialogo.locator("img").first()).toBeVisible();
  await dialogo
    .getByRole("textbox", { name: "Sobre a sua busca" })
    .fill("Comecei pelo Caibalion e hoje leio o Poimandres devagar.");
  await dialogo.getByRole("button", { name: "Salvar" }).click();

  await expect(
    page
      .getByRole("paragraph")
      .filter({ hasText: "Comecei pelo Caibalion e hoje leio o Poimandres devagar." }),
  ).toBeVisible();
  await expect(page.locator(".sdb-profilehead__photo .sdb-avatar--foto img")).toHaveAttribute(
    "src",
    /\/midia\//,
  );
});
