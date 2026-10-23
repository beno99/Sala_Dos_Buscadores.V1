import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { expect, test } from "@playwright/test";

const exemplo = pathToFileURL(resolve("../design-system/exemplos/BarraFormatacao.html")).href;
test("biblioteca independente: marcas, desfazer, propriedades, fontes e teclado", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message));
  await page.goto(exemplo);
  const campo = page.locator("#fmt-vazio");
  const barra = page.getByRole("toolbar", { name: "Formatação do vazio", exact: true });
  await campo.fill("Uma linha\nOutra linha");
  await campo.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.setSelectionRange(0, 3);
  });
  await barra.getByRole("button", { name: "Negrito no vazio", exact: true }).click();
  await expect(campo).toHaveValue("**Uma** linha\nOutra linha");
  await expect(barra.getByRole("button", { name: "Negrito no vazio", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await campo.press("ControlOrMeta+z");
  await expect(campo).toHaveValue("Uma linha\nOutra linha");
  await campo.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.setSelectionRange(0, 3);
  });
  await barra.getByRole("button", { name: "Negrito no vazio", exact: true }).click();
  await campo.evaluate((el: HTMLTextAreaElement) => {
    const i = el.value.indexOf("Outra");
    el.focus();
    el.setSelectionRange(i, i + 5);
  });
  await campo.press("ControlOrMeta+i");
  await expect(campo).toHaveValue("**Uma** linha\n_Outra_ linha");
  await campo.press("ControlOrMeta+z");
  await expect(campo).toHaveValue("**Uma** linha\nOutra linha");
  await campo.press("ControlOrMeta+z");
  await expect(campo).toHaveValue("Uma linha\nOutra linha");
  await barra.getByRole("button", { name: "Centralizar no vazio", exact: true }).click();
  await expect(page.locator('[data-fmt-preview-for="fmt-vazio"] .sdb-texto--centro')).toContainText(
    "Uma linha",
  );
  await barra.getByRole("button", { name: "Lista numerada no vazio", exact: true }).click();
  await expect(page.locator('[data-fmt-preview-for="fmt-vazio"] ol li')).toHaveCount(2);
  await barra.getByRole("button", { name: "Lista numerada no vazio", exact: true }).click();
  await expect(campo).toHaveValue("Uma linha\nOutra linha");
  await barra.getByRole("combobox").selectOption("titulo-3");
  await expect(page.locator('[data-fmt-preview-for="fmt-vazio"] h3')).toContainText("Uma linha");
  await expect(barra.getByRole("button", { name: "Lista numerada no vazio", exact: true })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await barra.getByRole("combobox").focus();
  await page.keyboard.press("ArrowRight");
  await expect(barra.getByRole("button", { name: "Negrito no vazio", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(campo).toBeFocused();
  await campo.fill("Veja [obra](javascript:alert(1)) **_literal_** [3]");
  const previa = page.locator('[data-fmt-preview-for="fmt-vazio"]');
  await expect(previa.locator("a")).toHaveCount(0);
  await expect(previa).toContainText("obra (javascript:alert(1)) **_literal_** Fonte 3");
  await expect(
    page
      .locator("#fmt-selecao")
      .locator("..")
      .getByRole("button", { name: /Negrito/ }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(erros).toEqual([]);
});
test("quatro temas e campo estreito conservam funções sem rolagem horizontal", async ({ page }, info) => {
  await page.goto(exemplo);
  for (const tema of ["solido-claro", "solido-escuro", "vidro-claro", "vidro-escuro"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
    const barra = page.getByRole("toolbar", { name: "Formatação do vazio", exact: true });
    for (const nome of [
      "Sublinhado no vazio",
      "Tachado no vazio",
      "Lista numerada no vazio",
      "Alinhar à direita no vazio",
      "Limpar formatação no vazio",
    ])
      await expect(barra.getByRole("button", { name: nome, exact: true })).toBeVisible();
    const largura = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      tela: window.innerWidth,
    }));
    expect(largura.pagina).toBeLessThanOrEqual(largura.tela);
    if (tema === "solido-claro")
      await page.screenshot({ path: `/tmp/barra-formatacao-${info.project.name}.png`, fullPage: true });
  }
});

test("portal: marcação, desfazer e alinhamento chegam iguais à página pública", async ({ page }) => {
  const { entrarComoAdmin, confirmar } = await import("./apoio");
  await entrarComoAdmin(page);
  await page.goto("/admin/salas/caibalion/artigos/c-quem-foram-os-tres-iniciados");
  const campo = page.locator("#campo-corpo-0");
  await expect(campo).toBeVisible();
  await campo.fill("Uma leitura atribuída às fontes.");
  await campo.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.setSelectionRange(0, 3);
  });
  const barra = page.getByRole("toolbar", { name: "Formatação do bloco 1", exact: true });
  await barra.getByRole("button", { name: "Negrito no bloco 1", exact: true }).click();
  await expect(campo).toHaveValue("**Uma** leitura atribuída às fontes.");
  await campo.press("ControlOrMeta+z");
  await expect(campo).toHaveValue("Uma leitura atribuída às fontes.");
  await campo.evaluate((el: HTMLTextAreaElement) => {
    el.focus();
    el.setSelectionRange(0, 3);
  });
  await campo.press("ControlOrMeta+i");
  await expect(campo).toHaveValue("_Uma_ leitura atribuída às fontes.");
  await barra.getByRole("button", { name: "Centralizar no bloco 1", exact: true }).click();
  await expect(page.locator("#campo-corpo-0-previa .sdb-texto--centro em")).toHaveText("Uma");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await confirmar(page, "Salvar e atualizar");
  await expect(page.getByText("Alterações salvas e já visíveis no portal.")).toBeVisible();
  await page.goto("/salas/caibalion/quem-foram-os-tres-iniciados");
  await expect(page.locator("[data-leitura] .sdb-texto--centro em")).toHaveText("Uma");
});

test("campo de parágrafo único do DS mantém uma entrada por Tab", async ({ page }) => {
  await page.goto(pathToFileURL(resolve("../design-system/exemplos/AreaTexto.html")).href);
  const barra = page.locator(".sdb-fmt[data-fmt-inline]");
  const entrada = barra.locator('[tabindex="0"]');
  await expect(entrada).toHaveCount(1);
  await expect(entrada).toBeEnabled();
  await entrada.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(barra.getByRole("button", { name: /Limpar formatação/ })).toBeFocused();
});
