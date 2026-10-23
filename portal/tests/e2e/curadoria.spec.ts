import { expect, test } from "@playwright/test";
import { confirmar, entrar, entrarComoAdmin, restaurarAcervo } from "./apoio";

test.describe("curadoria", () => {
  test("artigo: checklist bloqueia, publica, aparece no portal, arquiva, some e restaura", async ({
    page,
  }, info) => {
    const titulo = `O Tratado X e o silêncio divino (${info.project.name})`;
    await entrarComoAdmin(page);
    await restaurarAcervo(page);

    await test.step("cria o rascunho na Sala do Corpus Hermeticum", async () => {
      await page.goto("/admin/artigos/novo");
      await page.getByRole("combobox", { name: "Sala", exact: true }).selectOption("corpus-hermeticum");
      await page.getByRole("textbox", { name: "Título" }).fill(titulo);
      await expect(page.getByText(/Salvo às/)).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/artigos\/c-/);
    });

    await test.step("o checklist bloqueia a publicação e leva ao primeiro campo pendente", async () => {
      const publicar = page.getByRole("button", { name: "Publicar", exact: true });
      await expect(publicar).toHaveAttribute("aria-disabled", "true");
      // Bloqueado mas focável: pelo teclado, Enter mostra o que falta.
      await publicar.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Erro: ainda há itens pendentes").first()).toBeVisible();
      await expect(page.getByRole("textbox", { name: "Resumo" })).toBeFocused();
    });

    await test.step("completa os campos", async () => {
      await page
        .getByRole("textbox", { name: "Resumo" })
        .fill("Como o Tratado X descreve o conhecimento de Deus como silêncio e suspensão dos sentidos.");
      await page.getByRole("button", { name: "Meditação", exact: true }).click();
      await page.getByRole("radio", { name: /Intermediário/ }).check();
      await page.getByRole("radio", { name: /Editorial curado/ }).check();
      await page
        .getByRole("textbox", { name: "Nome", exact: true })
        .fill("Equipe editorial da Sala Corpus Hermeticum");
      await page
        .getByRole("textbox", { name: "Bloco 1, parágrafo de abertura (lead)" })
        .fill("Segundo o _Tratado X_, o conhecimento de Deus é *silêncio divino* e suspensão dos sentidos.");
      await page.getByRole("button", { name: /^Hermetica/ }).click();
      await page.getByRole("radio", { name: /Trecho permitido com referência/ }).check();
      await expect(page.getByRole("button", { name: "Publicar", exact: true })).toHaveAttribute(
        "aria-disabled",
        "false",
      );
      await expect(page.getByText(/Salvo às/)).toBeVisible();
    });

    await test.step("publica", async () => {
      await page.getByRole("button", { name: "Publicar", exact: true }).click();
      await confirmar(page, "Publicar");
      await expect(page.getByText("Publicado na Sala Corpus Hermeticum.")).toBeVisible();
    });

    const url = page.url();

    await test.step("aparece na Sala, na página do conteúdo e na busca por tema", async () => {
      await page.goto("/salas/corpus-hermeticum");
      await page.getByRole("link", { name: titulo, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
      await expect(page.getByText("Editorial curado").first()).toBeVisible();
      await page.goto("/comparar?tema=meditacao");
      await expect(page.getByRole("link", { name: titulo, exact: true })).toBeVisible();
    });

    await test.step("arquiva e some do portal", async () => {
      await page.goto(url);
      await page.getByRole("button", { name: "Arquivar" }).click();
      await confirmar(page, "Arquivar");
      await expect(page.getByText(/Arquivado\. Nada foi apagado/)).toBeVisible();
      await page.goto("/salas/corpus-hermeticum");
      await expect(page.getByRole("link", { name: titulo, exact: true })).toHaveCount(0);
      await page.goto("/comparar?tema=meditacao");
      await expect(page.getByRole("link", { name: titulo, exact: true })).toHaveCount(0);
    });

    await test.step("restaura como rascunho", async () => {
      await page.goto(url);
      await page.getByRole("button", { name: "Restaurar como rascunho" }).click();
      await confirmar(page, "Restaurar");
      await expect(page.getByText("Restaurado como rascunho.")).toBeVisible();
      await page.getByRole("tab", { name: "Histórico" }).click();
      await expect(page.getByText("Arquivou", { exact: true })).toBeVisible();
      await expect(page.getByText("Publicou", { exact: true })).toBeVisible();
    });
  });

  test("vídeo: valida a URL, publica, aparece no portal, arquiva, some e restaura", async ({
    page,
  }, info) => {
    const titulo = `O silêncio no Tratado X (${info.project.name})`;
    await entrarComoAdmin(page);
    await restaurarAcervo(page);

    await page.goto("/admin/videos/novo");
    await page.getByRole("combobox", { name: "Sala", exact: true }).selectOption("corpus-hermeticum");
    await page.getByRole("textbox", { name: "Título" }).fill(titulo);
    await page.getByRole("textbox", { name: "Endereço no YouTube" }).fill("https://vimeo.com/123456");
    await expect(page.getByText(/só aceitamos vídeos do YouTube/)).toBeVisible();
    await page.getByRole("textbox", { name: "Endereço no YouTube" }).fill("https://youtu.be/dQw4w9WgXcQ");
    await page.getByRole("textbox", { name: "Duração (mm:ss)" }).fill("12:30");
    await page.getByRole("combobox", { name: "Tema", exact: true }).selectOption("meditacao");
    await page.getByRole("radio", { name: /Intermediário/ }).check();
    await expect(page.getByText(/Salvo às/)).toBeVisible();
    await page.getByRole("button", { name: "Publicar", exact: true }).click();
    await confirmar(page, "Publicar");
    await expect(page.getByText("Vídeo publicado na Sala Corpus Hermeticum.")).toBeVisible();
    const url = page.url();

    await page.goto("/salas/corpus-hermeticum");
    const card = page.getByRole("link", { name: new RegExp(titulo.replace(/[()]/g, "\\$&")) });
    await expect(card).toHaveAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.goto("/comparar?tema=meditacao&formato=video");
    await expect(page.getByRole("link", { name: new RegExp(titulo.replace(/[()]/g, "\\$&")) })).toBeVisible();

    await page.goto(url);
    await page.getByRole("button", { name: "Arquivar" }).click();
    await confirmar(page, "Arquivar");
    await expect(page.getByText(/Vídeo arquivado/)).toBeVisible();
    await page.goto("/salas/corpus-hermeticum");
    await expect(page.getByText(titulo)).toHaveCount(0);

    await page.goto(url);
    await page.getByRole("button", { name: "Restaurar como rascunho" }).click();
    await confirmar(page, "Restaurar");
    await expect(page.getByText("Vídeo restaurado como rascunho.")).toBeVisible();
  });

  test("sem sessão e membro não acessam /admin", async ({ page }) => {
    await page.goto("/admin/artigos");
    await expect(page).toHaveURL(/\/entrar\?voltar=%2Fadmin%2Fartigos/);

    await entrar(page, "buscador@exemplo.com", "escada-de-quem-sobe", "/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Acesso restrito" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Curadoria" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Curadoria" })).toHaveCount(0);

    const exportacao = await page.request.get("/admin/exportar/artigos");
    expect(exportacao.status()).toBe(403);
  });
});
