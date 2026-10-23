import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

/*
 * Jornada do Buscador (DRS 7.2, revista: cadastro obrigatório). Entra →
 * explora uma Sala → lê conteúdo com fonte → compara entre Salas pela busca
 * → consulta o assistente.
 */
test("sem sessão, qualquer rota leva a /entrar com a volta preservada", async ({ page }) => {
  for (const rota of ["/", "/salas/nag-hammadi", "/comparar?tema=morte", "/assistente", "/biblioteca"]) {
    await page.goto(rota);
    await expect(page).toHaveURL(`/entrar?voltar=${encodeURIComponent(rota)}`);
  }
  await expect(page.getByRole("link", { name: "Continuar sem cadastro" })).toHaveCount(0);
  await page.goto("/cadastro");
  await expect(page.getByRole("heading", { level: 1, name: "Criar conta" })).toBeVisible();
});

test("jornada completa do membro", async ({ page, isMobile }) => {
  await test.step("entra e chega ao Portal", async () => {
    await entrarComoMembro(page);
    if (!isMobile) await expect(page.getByText("Boas-vindas de volta, Buscador.")).toBeVisible();
  });

  await test.step("explora uma Sala", async () => {
    await page.goto("/salas");
    await page.getByRole("link", { name: "Biblioteca de Nag Hammadi" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Biblioteca de Nag Hammadi" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trecho de fonte primária" })).toBeVisible();
    // O episódio ainda tem link provisório (busca): o card não vira link até a curadoria cadastrar o vídeo.
    const video = page.getByRole("article", { name: "O que foi encontrado em Nag Hammadi" });
    await expect(video.getByRole("link")).toHaveCount(0);
    await expect(
      video.getByText("O link deste episódio ainda não foi cadastrado pela curadoria."),
    ).toBeVisible();
  });

  await test.step("lê um conteúdo com a fonte indicada", async () => {
    await page.getByRole("link", { name: "O Evangelho de Tomé e os 114 ditos" }).click();
    const meta = page.getByRole("region", { name: "Autoria e dados" });
    await expect(meta.getByText("Editorial curado")).toBeVisible();
  });

  await test.step("busca pela lupa e compara entre Salas", async () => {
    await page.getByRole("button", { name: "Buscar no acervo" }).click();
    const painel = page.getByRole("dialog", { name: "Buscar no acervo" });
    await painel.getByRole("combobox").fill("vida após a morte");
    await painel.getByRole("combobox").press("Enter");
    await expect(
      page.getByRole("heading", { level: 2, name: "O que acontece com a alma após a morte?" }),
    ).toBeVisible();
    await expect(page.getByText("4 Salas respondem diretamente, 1 não trata do tema.")).toBeVisible();
  });

  await test.step("pergunta ao assistente e recebe resposta identificada como IA, com fontes", async () => {
    await page.getByRole("link", { name: "Perguntar ao assistente sobre este tema" }).click();
    await expect(page.getByLabel("Pergunta ao assistente")).toHaveValue(
      "O que acontece com a alma após a morte?",
    );
    await page.getByRole("button", { name: "Enviar pergunta" }).click();
    await expect(page.getByText("Fontes citadas", { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Síntese por IA").first()).toBeVisible();
    await expect(page.getByLabel("Aviso de neutralidade").first()).toBeVisible();
  });
});

test("busca sem resultado orienta a tentar um tema", async ({ page }) => {
  await entrarComoMembro(page, "/comparar?q=xyzabc");
  await expect(page.getByText("Nenhuma Sala trata de “xyzabc” no acervo atual")).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: /^Alma/ }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Como cada tradição descreve a alma?" }),
  ).toBeVisible();
});

test("filtros refinam os resultados e ficam na URL", async ({ page, isMobile }) => {
  await entrarComoMembro(page, "/comparar?tema=morte");
  if (isMobile) await page.getByRole("button", { name: "Filtros" }).click();
  const filtros = isMobile
    ? page.getByRole("dialog", { name: "Filtros" })
    : page.getByRole("region", { name: "Filtros" });
  await filtros.getByRole("button", { name: /^Vídeo/ }).click();
  await filtros.getByRole("button", { name: "Ver 1 resultado" }).click();
  await expect(page).toHaveURL(/formato=video/);
  await expect(page.getByText("0 conteúdos e 1 vídeo.")).toBeVisible();
});
