import { expect, type Page, test } from "@playwright/test";
import { confirmar, entrar, entrarComoAdmin, entrarComoMembro, restaurarAcervo } from "./apoio";

/*
 * Página do artigo (docs/prompts/artigo.md): trilha, banner, título ao lado da
 * autoria, texto em blocos, compartilhar, trecho, "Continuar a busca"; e os
 * editores de blocos da curadoria e do anfitrião.
 */

const ARTIGO = "/salas/caibalion/sete-principios-hermeticos";
const TITULO = "Os sete princípios, em linguagem simples";
const ANFITRIA = { email: "helena.varga@exemplo.com", senha: "anfitria-do-codice-ii" };
// PNG mínimo: o servidor confere o tipo pelos magic bytes.
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

async function adicionarBloco(page: Page, depoisDe: number, tipo: string) {
  const gatilho = page.getByRole("button", { name: `Adicionar bloco depois do bloco ${depoisDe}` });
  await gatilho.click();
  const menu = page.locator(`[id="${await gatilho.getAttribute("aria-controls")}"]`);
  await menu.getByRole("menuitem", { name: tipo }).click();
}

test("membro lê o artigo: trilha, banner, autoria ao lado do título, blocos, trecho e Continuar a busca", async ({
  page,
  context,
}, info) => {
  const celular = info.project.name === "celular";
  await entrarComoMembro(page, ARTIGO);
  const titulo = page.getByRole("heading", { level: 1, name: TITULO });
  await expect(titulo).toBeVisible();

  await test.step("trilha, banner e título alinhado ao topo da autoria", async () => {
    const banner = page.locator(".sdb-roombanner");
    await expect(banner.getByRole("img", { name: /figura coroada/ })).toBeVisible();
    await expect(banner).toContainText("Éliphas Lévi");
    const autoria = page.getByRole("region", { name: "Autoria e dados" });
    await expect(autoria.getByText("Equipe editorial da Sala O Caibalion")).toBeVisible();
    if (celular) {
      await expect(page.getByRole("navigation", { name: "Trilha" })).toBeHidden();
      await expect(page.locator(".sdb-roomhead__back")).toContainText("O Caibalion");
    } else {
      const trilha = page.getByRole("navigation", { name: "Trilha" });
      await expect(trilha.getByText(TITULO)).toHaveAttribute("aria-current", "page");
      await expect(page.locator(".sdb-topbar__title")).toHaveText("Salas");
      const [t, a] = await Promise.all([titulo.boundingBox(), autoria.boundingBox()]);
      expect(Math.abs((t?.y ?? 0) - (a?.y ?? 99))).toBeLessThan(2);
    }
  });

  await test.step("destaque e imagem no texto", async () => {
    const corpo = page.locator("[data-leitura]");
    await expect(corpo.locator("figure.sdb-pullquote figcaption")).toContainText("cap. II (1908)");
    await expect(corpo.getByRole("img", { name: /templo no alto de sete degraus/ })).toBeVisible();
    await expect(corpo.getByRole("heading", { level: 2, name: "O que a pesquisa diz" })).toBeVisible();
  });

  await test.step("copia o link", async () => {
    if (!celular) await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: /^(Copiar link|Compartilhar)$/ }).click();
    if (!celular) await expect(page.getByText("Link copiado.")).toBeVisible();
  });

  await test.step("troca o trecho para Original", async () => {
    const trecho = page.getByRole("region", { name: "Trecho de fonte primária" });
    await expect(trecho.getByRole("button", { name: "Tradução" })).toHaveAttribute("aria-pressed", "true");
    await trecho.getByRole("button", { name: "Original" }).click();
    await expect(trecho.locator('.sdb-quote__views[data-view="orig"]')).toBeVisible();
  });

  await test.step("usa as setas do carrossel", async () => {
    const continuar = page.getByRole("region", { name: "Continuar a busca" });
    const trilho = continuar.getByRole("region", { name: "conteúdos" });
    await trilho.scrollIntoViewIfNeeded();
    const antes = await trilho.evaluate((t) => t.scrollLeft);
    await continuar.getByRole("button", { name: "Ver mais conteúdos" }).click();
    await expect.poll(() => trilho.evaluate((t) => t.scrollLeft)).toBeGreaterThan(antes);
    await expect(continuar.getByRole("button", { name: "Ver conteúdos anteriores" })).toBeEnabled();
  });

  await test.step("“Ver todos” leva à Biblioteca filtrada", async () => {
    await expect(page.getByRole("link", { name: "Ver todos" })).toHaveAttribute(
      "href",
      "/biblioteca?tema=conhecimento-interior",
    );
  });

  await test.step("compara um tema", async () => {
    await page.getByRole("link", { name: "Comparar: Origem do universo" }).click();
    await expect(page).toHaveURL(/\/comparar\?tema=origem-do-universo/);
  });

  await test.step("volta à Sala pela trilha", async () => {
    await page.goto(ARTIGO);
    if (celular)
      await page
        .getByRole("link", { name: "O Caibalion", exact: true })
        .and(page.locator(".sdb-roomhead__back"))
        .click();
    else
      await page
        .getByRole("navigation", { name: "Trilha" })
        .getByRole("link", { name: "O Caibalion" })
        .click();
    await expect(page).toHaveURL(/\/salas\/caibalion$/);
  });
});

test.describe("editores de blocos", () => {
  test.skip(({ isMobile }) => isMobile, "Fluxo de edição; roda no desktop.");

  test("administrador adiciona destaque e imagem a um artigo publicado e vê os dois na página", async ({
    page,
  }) => {
    await entrarComoAdmin(page);
    await restaurarAcervo(page);
    await page.goto("/admin/salas/caibalion/artigos/c-quem-foram-os-tres-iniciados");
    await expect(page.getByText("Parágrafo · lead")).toBeVisible();

    await adicionarBloco(page, 1, "Destaque");
    await page
      .getByRole("textbox", { name: "Frase do destaque" })
      .fill("A Sala registra a hipótese como hipótese.");
    await page.getByRole("textbox", { name: "Atribuição" }).fill("Equipe editorial da Sala O Caibalion");

    await adicionarBloco(page, 2, "Imagem");
    const imagem = page.locator('[data-tipo="imagem"]');
    await imagem
      .locator('input[type="file"]')
      .setInputFiles({ name: "folha-de-rosto.png", mimeType: "image/png", buffer: PNG });
    await expect(imagem.getByRole("button", { name: "Trocar" })).toBeVisible();
    await imagem.getByRole("textbox", { name: "Texto alternativo" }).fill("Folha de rosto da edição de 1908");
    // Sem crédito, a publicação fica bloqueada e o checklist leva ao bloco.
    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await expect(imagem.getByRole("textbox", { name: "Crédito" })).toBeFocused();
    await imagem
      .getByRole("textbox", { name: "Crédito" })
      .fill("Yogi Publication Society, Chicago, 1908; domínio público");

    await page.getByRole("button", { name: "Salvar alterações" }).click();
    await confirmar(page, "Salvar e atualizar");
    await expect(page.getByText("Alterações salvas e já visíveis no portal.")).toBeVisible();

    await page.goto("/salas/caibalion/quem-foram-os-tres-iniciados");
    const corpo = page.locator("[data-leitura]");
    await expect(corpo.locator("figure.sdb-pullquote")).toContainText(
      "A Sala registra a hipótese como hipótese.",
    );
    await expect(corpo.getByRole("img", { name: "Folha de rosto da edição de 1908" })).toBeVisible();
  });

  test("anfitrião adiciona uma imagem ao artigo, envia para revisão e, aprovada, ela aparece", async ({
    page,
    browser,
    baseURL,
  }) => {
    await entrarComoAdmin(page);
    await restaurarAcervo(page);

    const anf = await (await browser.newContext({ baseURL })).newPage();
    await entrar(anf, ANFITRIA.email, ANFITRIA.senha, "/anfitriao");
    await anf.getByRole("link", { name: "Leituras do Evangelho de Tomé" }).first().click();
    await anf.getByRole("link", { name: "O Reino dentro e fora: o dito 3 em leitura comparada" }).click();
    await expect(anf.getByText("Parágrafo · lead")).toBeVisible();

    await adicionarBloco(anf, 1, "Imagem");
    const imagem = anf.locator('[data-tipo="imagem"]');
    await imagem
      .locator('input[type="file"]')
      .setInputFiles({ name: "codice-ii.png", mimeType: "image/png", buffer: PNG });
    await expect(imagem.getByRole("button", { name: "Trocar" })).toBeVisible();
    await imagem
      .getByRole("textbox", { name: "Texto alternativo" })
      .fill("Página do Códice II de Nag Hammadi");
    await imagem.getByRole("textbox", { name: "Crédito" }).fill("Foto da autora, 2026");
    await anf.getByRole("button", { name: "Salvar alterações" }).click();
    await anf.getByRole("alertdialog").getByRole("button", { name: "Salvar e tirar do ar" }).click();
    await expect(anf.getByText(/O artigo saiu do ar/)).toBeVisible();

    await anf.getByRole("button", { name: "Enviar para revisão" }).click();
    const sheet = anf.getByRole("dialog", { name: "Enviar para revisão" });
    await sheet.getByRole("checkbox", { name: /Declaro que tenho direito/ }).check();
    await sheet.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(anf.getByText("Artigo enviado para revisão.")).toBeVisible();

    await page.goto("/admin/anfitrioes");
    await page
      .getByRole("link", { name: /Helena Varga/ })
      .first()
      .click();
    await page.getByRole("link", { name: "Leituras do Evangelho de Tomé" }).click();
    await page
      .getByRole("article", { name: "O Reino dentro e fora: o dito 3 em leitura comparada" })
      .getByRole("button", { name: "Aprovar este artigo" })
      .click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Aprovar e publicar" }).click();
    await expect(page.getByText("Artigo publicado.")).toBeVisible();

    await page.goto("/salas/leituras-do-evangelho-de-tome/o-reino-dentro-e-fora-dito-3");
    await expect(
      page.locator("[data-leitura]").getByRole("img", { name: "Página do Códice II de Nag Hammadi" }),
    ).toBeVisible();
  });
});
