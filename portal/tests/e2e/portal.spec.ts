import { expect, type Page, test } from "@playwright/test";
import { entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

const valorDoIndicador = async (page: Page, rotulo: string) =>
  Number(
    await page
      .getByRole("group", { name: "Seu progresso no acervo" })
      .locator(".sdb-stat", { hasText: rotulo })
      .locator(".sdb-stat__value")
      .evaluate((el) => el.firstChild?.textContent ?? ""),
  );

// O progresso vive na memória do servidor: cada teste parte do histórico inicial da demonstração.
test.beforeEach(async ({ browser }) => {
  const admin = await browser.newPage();
  await entrarComoAdmin(admin);
  await restaurarAcervo(admin);
  await admin.close();
});

test("a conta de demonstração vê indicadores, “Continuar” e conquistas", async ({ page }) => {
  await entrarComoMembro(page);
  const painel = page.getByRole("main");
  const indicadores = painel.getByRole("group", { name: "Seu progresso no acervo" });
  for (const rotulo of ["Salas visitadas", "Conteúdos lidos", "Temas comparados", "Trilhas em andamento"]) {
    await expect(indicadores.getByText(rotulo)).toBeVisible();
  }
  expect(await valorDoIndicador(page, "Salas visitadas")).toBe(3);

  const continuar = painel.getByRole("region", { name: "Continue sua busca" });
  await expect(continuar.getByRole("link", { name: /Retomar leitura/ })).toHaveCount(1);
  await expect(continuar.getByRole("link", { name: /Poimandres, §24–26/ })).toBeVisible();
  await expect(continuar.getByText("38% lido")).toBeVisible();
  await expect(continuar.getByText("Retomar leitura")).toBeVisible();

  await expect(
    page.getByRole("region", { name: "Conheça outras Salas" }).getByText("Para ampliar o olhar"),
  ).toBeVisible();
  await expect(
    painel.getByRole("region", { name: "Para sua próxima leitura" }).getByRole("article"),
  ).toHaveCount(1);

  await page
    .getByRole("region", { name: "Seu caminho" })
    .getByRole("link", { name: "Ver conquistas" })
    .click();
  await expect(page).toHaveURL("/conquistas");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("“Novidades do acervo” é uma lista de links, cada um com o Selo de proveniência", async ({ page }) => {
  await entrarComoMembro(page);
  const recentes = page.getByRole("main").getByRole("region", { name: "Novidades do acervo" });
  const linhas = recentes.getByRole("listitem");
  await expect(linhas).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    const link = linhas.nth(i).getByRole("link");
    await expect(link).toHaveAttribute("href", /^\/salas\//);
    await expect(link.locator(".sdb-seal")).toHaveCount(1);
  }
  await expect(recentes.locator(".sdb-card")).toHaveCount(0);
  await recentes.getByRole("link", { name: "Ver Biblioteca" }).click();
  await expect(page).toHaveURL("/biblioteca");
});

test("o anúncio fica na lateral de apoio, identificado como publicidade", async ({ page }) => {
  await entrarComoMembro(page);
  const anuncio = page.getByRole("main").getByRole("complementary", { name: "Publicidade" });
  await expect(anuncio.getByText("PUBLICIDADE", { exact: true })).toBeVisible();
  await expect(anuncio.getByText("Edições Pórtico (anunciante fictício)")).toBeVisible();
  await expect(anuncio.locator(".sdb-seal")).toHaveCount(0);
  const chamada = anuncio.getByRole("link", { name: /Conhecer a coleção/ });
  await expect(chamada).toHaveAttribute("rel", /sponsored/);
  await expect(chamada).toHaveAttribute("target", "_blank");
  await page.getByRole("button", { name: "Sobre os anúncios" }).click();
  await expect(page.getByRole("dialog", { name: "Por que estou vendo isto?" })).toBeVisible();
  // Só um anúncio fora do banner rotativo: a coluna lateral de antes saiu.
  await expect(page.locator("main aside.sdb-ad")).toHaveCount(1);
});

test("o chip de tema filtra as Salas e oferece a comparação", async ({ page }) => {
  await entrarComoMembro(page);
  const salas = page.getByRole("region", { name: "Conheça outras Salas" });
  await salas.locator("summary").click();
  await salas.getByRole("button", { name: /^Meditação/ }).click();
  await expect(salas.getByRole("article")).toHaveCount(1);
  await salas.getByRole("link", { name: "Comparar meditação entre as Salas" }).click();
  await expect(page).toHaveURL("/comparar?tema=meditacao");
});

test("o banner gira sozinho e para com o botão de pausa", async ({ page }) => {
  await page.clock.install();
  await entrarComoMembro(page);
  await page.mouse.move(0, 0);
  const banner = page.getByRole("region", { name: "Destaques do Portal" });
  await expect(banner.getByRole("button", { name: "Destaque 1" })).toHaveAttribute("aria-current", "true");
  await page.clock.fastForward(7500);
  await expect(banner.getByRole("button", { name: "Destaque 2" })).toHaveAttribute("aria-current", "true");
  await banner.getByRole("button", { name: "Pausar rotação" }).click();
  await page.mouse.move(0, 0);
  await page.locator("body").focus();
  await page.clock.fastForward(15_000);
  await expect(banner.getByRole("button", { name: "Destaque 2" })).toHaveAttribute("aria-current", "true");
  await expect(banner.getByRole("button", { name: "Retomar rotação" })).toBeVisible();
});

test("visitar uma Sala e abrir um conteúdo entram no progresso", async ({ page }) => {
  await entrarComoMembro(page);
  await page.goto("/salas/urantia/o-universo-segundo-urantia");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForTimeout(800);
  await page.goto("/");
  // Só a leitura mais recente aparece em "Continue sua busca": agora é a que acabou de abrir.
  await expect(async () => {
    await page.reload();
    await expect(
      page.getByRole("region", { name: "Continue sua busca" }).getByRole("link", { name: /universo/i }),
    ).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
  expect(await valorDoIndicador(page, "Salas visitadas")).toBe(4);
});
