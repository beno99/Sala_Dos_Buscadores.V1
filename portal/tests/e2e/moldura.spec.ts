import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

test("cadastro novo passa pelo onboarding e chega ao Portal", async ({ page, isMobile }, info) => {
  await page.goto("/cadastro");
  await page.getByRole("textbox", { name: "Pseudônimo", exact: true }).fill("Leitora de Hermes");
  await page
    .getByRole("textbox", { name: "E-mail", exact: true })
    .fill(`leitora-${info.project.name}-${Date.now()}@exemplo.com`);
  await page.getByLabel("Senha", { exact: true }).fill("escada-de-quem-sobe");
  await page.getByRole("checkbox", { name: /Concordo com o uso/ }).check();
  await page.getByRole("button", { name: "Criar conta" }).click();

  const dialogo = page.getByRole("dialog", { name: "Boas-vindas à Sala dos Buscadores" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByText("Etapa 1 de 4")).toBeVisible();
  await dialogo.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Alma", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Começar" }).click();
  await expect(page.getByText(/Usamos só para sugerir conteúdos/)).toBeVisible();
  await page.getByRole("dialog").getByRole("radio", { name: "Prefiro não informar" }).check();
  await page.getByRole("dialog").getByRole("button", { name: "Começar" }).click();
  await expect(page.getByRole("heading", { name: "Preferências salvas" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Começar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL("/");
  // No celular a saudação sai da barra superior para caber o título.
  if (!isMobile) await expect(page.getByText("Boas-vindas de volta, Leitora de Hermes.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Boas-vindas à Sala dos Buscadores" })).toHaveCount(0);
});

test("⌘K abre a busca e a sugestão de tema leva à grade", async ({ page }) => {
  await entrarComoMembro(page);
  await page.keyboard.press("ControlOrMeta+k");
  const painel = page.getByRole("dialog", { name: "Buscar no acervo" });
  await expect(painel.getByRole("combobox")).toBeFocused();
  await painel.getByRole("combobox").fill("alma");
  await painel.getByRole("combobox").press("ArrowDown");
  await expect(painel.getByRole("option", { name: /Comparar «Alma» entre as Salas/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await painel.getByRole("combobox").press("Enter");
  await expect(page).toHaveURL("/comparar?tema=alma");
  await expect(
    page.getByRole("heading", { level: 2, name: "Como cada tradição descreve a alma?" }),
  ).toBeVisible();
});

test("o orbe abre o mini chat do assistente sobre a página", async ({ page }) => {
  await entrarComoMembro(page, "/salas");
  const orbe = page.getByRole("button", { name: "Abrir o assistente" });
  await orbe.click();
  const chat = page.getByRole("dialog", { name: "Assistente de IA" });
  await expect(chat.getByLabel("Sua pergunta ao acervo")).toBeVisible();
  await expect(chat.getByLabel("Aviso de neutralidade")).toBeVisible();
  await expect(orbe).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
  await expect(orbe).toHaveAttribute("aria-expanded", "false");
  await orbe.click();
  await chat.getByRole("link", { name: "Tela cheia" }).click();
  await expect(page).toHaveURL("/assistente");
  await expect(page.getByRole("button", { name: "Abrir o assistente" })).toHaveCount(0);
});

test("o mini chat responde com trechos separados e fontes", async ({ page }) => {
  await entrarComoMembro(page, "/salas");
  await page.getByRole("button", { name: "Abrir o assistente" }).click();
  const chat = page.getByRole("dialog", { name: "Assistente de IA" });
  await chat.getByLabel("Sua pergunta ao acervo").fill("O que é o Pleroma?");
  await chat.getByRole("button", { name: "Enviar pergunta" }).click();
  const resposta = chat.getByRole("article", { name: "Assistente de IA" });
  await expect(resposta).toBeVisible({ timeout: 15_000 });
  await expect(resposta.getByText("Fontes citadas")).toBeVisible();
});

test("lateral: recolhe, guarda a escolha e marca a página atual", async ({ page, isMobile }) => {
  test.skip(isMobile, "No celular a lateral dá lugar à barra de abas.");
  await entrarComoMembro(page, "/salas");
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(nav.getByRole("link", { name: "Salas", exact: true })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("button", { name: "Recolher navegação" }).click();
  await expect(nav).toHaveClass(/is-collapsed/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Expandir navegação" })).toBeVisible();
  await page.getByRole("button", { name: "Expandir navegação" }).click();
});

test("celular: barra de abas embaixo e “Mais” com o resto do menu", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Só no celular.");
  await entrarComoMembro(page);
  const abas = page.getByRole("navigation", { name: "Navegação principal" });
  for (const nome of ["Portal", "Biblioteca", "Trilhas", "Estante"]) {
    await expect(abas.getByRole("link", { name: nome })).toBeVisible();
  }
  await abas.getByRole("button", { name: "Mais" }).click();
  const mais = page.getByRole("dialog", { name: "Mais" });
  await mais.getByRole("link", { name: "Comparar" }).click();
  await expect(page).toHaveURL("/comparar");
  await expect(abas.getByRole("button", { name: "Mais" })).toHaveAttribute("aria-current", "page");
});

test("aparência: o tema e a lateral translúcida só valem ao salvar e ficam guardados", async ({ page }) => {
  await entrarComoMembro(page);
  await page.getByRole("button", { name: "Aparência" }).click();
  const dialogo = page.getByRole("dialog", { name: "Aparência" });
  await dialogo.getByRole("radio", { name: "Escuro", exact: true }).click();
  await dialogo.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "solido-claro");

  await page.getByRole("button", { name: "Aparência" }).click();
  await dialogo.getByRole("radio", { name: "Escuro", exact: true }).click();
  await dialogo.getByRole("switch", { name: /Barra lateral/ }).check();
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "solido-escuro");
  await expect(page.locator("html")).toHaveAttribute("data-lateral", "translucida");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "solido-escuro");
  await expect(page.locator("html")).toHaveAttribute("data-lateral", "translucida");

  await page.getByRole("button", { name: "Aparência" }).click();
  await dialogo.getByRole("radio", { name: "Areia" }).click();
  await dialogo.getByRole("switch", { name: /Barra lateral/ }).uncheck();
  await dialogo.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "solido-claro");
});
