import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { entrarComoMembro } from "./apoio";

const pasta = resolve(process.cwd(), "../artifacts/assistente-2026-10-28");
mkdirSync(pasta, { recursive: true });

test("tela integrada: desktop/celular, modos e contexto real", async ({ page, isMobile }, info) => {
  // Referência capturada separadamente: a regressão não depende do servidor do catálogo.
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await entrarComoMembro(page, "/assistente");
  await expect(page.getByRole("heading", { level: 1, name: /O que você quer/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar pergunta", exact: true })).toBeDisabled();
  const campo = page.getByRole("textbox", { name: "Sua pergunta ao acervo" });
  await expect(page.locator(".hero-orb canvas")).toHaveAttribute("data-renderer", /webgl|fallback/);
  await expect(page.getByText("Você entrou como Buscador.")).not.toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: `${pasta}/assistente-${info.project.name}-escura.png`, fullPage: true });
  await page.getByRole("button", { name: "Pausar movimento", exact: true }).click();
  for (const [titulo, modo, sala] of [
    ["Entender um conceito", "explorar", "nag-hammadi"],
    ["Comparar tradições", "comparar", "todo"],
    ["Explorar um texto", "leitura", "corpus-hermeticum"],
  ]) {
    await page.getByRole("button", { name: new RegExp(titulo ?? "") }).click();
    await expect(page.getByRole("combobox", { name: "Modo de estudo" })).toHaveValue(modo ?? "");
    await expect(page.getByRole("combobox", { name: "Sala de estudo" })).toHaveValue(sala ?? "");
  }
  await page.getByRole("button", { name: "Dourada", exact: true }).click();
  await expect(page.locator(".orb-visual")).toHaveAttribute("data-orb-paused", "true");
  await expect(campo).toHaveValue("Uma leitura do Poimandres.");
  await page.screenshot({ path: `${pasta}/assistente-${info.project.name}-dourada.png`, fullPage: true });
  await page.getByRole("button", { name: "Escura", exact: true }).click();
  await expect(page.locator(".dark-visual")).toHaveAttribute("data-orb-paused", "true");
  await expect(page.getByRole("combobox", { name: "Modo de estudo" })).toHaveValue("leitura");
  // IME nunca envia. Teclado móvel mantém newline; desktop Shift+Enter também.
  await campo.dispatchEvent("compositionstart");
  await campo.press("Enter");
  await campo.dispatchEvent("compositionend");
  await expect(page.locator(".study-turn")).toHaveCount(0);
  await campo.fill("O que é o Pleroma?");
  await campo.press(isMobile ? "Enter" : "Shift+Enter");
  await expect(campo).toHaveValue("O que é o Pleroma?\n");
  await expect(page.locator(".study-turn")).toHaveCount(0);
  for (const modo of ["explorar", "comparar", "leitura"]) {
    await page.getByRole("combobox", { name: "Modo de estudo" }).selectOption(modo);
    await page.getByRole("combobox", { name: "Sala de estudo" }).selectOption("urantia");
    const envio = page.waitForRequest((r) => r.url().endsWith("/api/assistente") && r.method() === "POST");
    if (!isMobile) await campo.press("Enter");
    else await page.getByRole("button", { name: "Enviar pergunta", exact: true }).click();
    expect((await envio).postDataJSON()).toEqual({ pergunta: "O que é o Pleroma?", modo, escopo: "urantia" });
    await expect(page.locator(".study-turn").last().getByRole("alert")).toContainText(
      "serviço de IA ainda não está conectado",
    );
    await expect(campo).toHaveValue("O que é o Pleroma?\n");
  }
  await page.getByRole("button", { name: "Tentar novamente" }).last().click();
  await expect(page.locator(".study-turn").last().getByRole("alert")).toContainText(
    "serviço de IA ainda não está conectado",
  );
  await expect(page.locator(".question-bubble")).toHaveCount(3);
  await page.getByRole("button", { name: "Dourada", exact: true }).click();
  await expect(page.locator(".question-bubble")).toHaveCount(3);
  await page.screenshot({
    path: `${pasta}/assistente-${info.project.name}-indisponivel.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Nova conversa", exact: true }).click();
  await expect(page.locator(".question-bubble")).toHaveCount(0);
  await expect(campo).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Modo de estudo" })).toHaveValue("leitura");
  await expect(page.getByRole("combobox", { name: "Sala de estudo" })).toHaveValue("urantia");
  await expect(page.getByRole("button", { name: "Dourada" })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("fontes e cópia com resposta controlada apenas no teste", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await entrarComoMembro(page, "/assistente");
  // Fixture só no transporte do teste: nenhuma resposta sintética entra na aplicação.
  await page.route("**/api/assistente", async (route) => {
    await route.fulfill({
      json: {
        ok: true,
        resposta: {
          id: "fixture-e2e",
          pergunta: "Uma leitura do Poimandres.",
          escopo: "corpus-hermeticum",
          trechos: [
            {
              tipo: "ai",
              rotulo: "Síntese da IA · fixture de teste",
              texto: "Resposta controlada do teste [1].",
              refs: [1],
            },
          ],
          fontes: [
            {
              titulo: "Corpus Hermeticum",
              referencia: "Poimandres, tratado I · fonte usada pelo teste",
              href: "/salas/corpus-hermeticum",
              capa: "grafite",
              inicial: "C",
              proveniencia: "primaria",
            },
          ],
          salasConsultadas: 1,
          trechosLidos: 1,
          semFonte: false,
        },
      },
    });
  });
  await page.getByRole("button", { name: /Explorar um texto/ }).click();
  await page.getByRole("button", { name: "Enviar pergunta", exact: true }).click();
  await expect(page.getByText("Resposta controlada do teste [1].")).toBeVisible();
  const campo = page.getByRole("textbox", { name: "Sua pergunta ao acervo" });
  await campo.fill("Meu próximo rascunho");
  await page.getByRole("button", { name: "Dourada", exact: true }).click();
  await expect(campo).toHaveValue("Meu próximo rascunho");
  await expect(page.getByText("Resposta controlada do teste [1].")).toBeVisible();
  await page.getByRole("button", { name: "Conferir fontes (1)" }).click();
  await expect(page.getByRole("dialog", { name: "Fontes da resposta" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Corpus Hermeticum" })).toHaveAttribute(
    "href",
    "/salas/corpus-hermeticum",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Conferir fontes (1)" })).toBeFocused();
  await page.getByRole("button", { name: "Copiar com fontes" }).click();
  await expect(page.getByText("Resposta copiada com as referências.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Poimandres, tratado I");
});

test("fallback sem WebGL, movimento reduzido, pausado e larguras estreitas", async ({
  page,
  isMobile,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await entrarComoMembro(page, "/assistente");
  await expect(page.locator(".hero-orb canvas")).toHaveAttribute("data-renderer", "fallback");
  await page.getByRole("button", { name: "Pausar movimento", exact: true }).click();
  await page.getByRole("button", { name: "Dourada", exact: true }).click();
  await expect(page.locator(".hero-orb canvas")).toHaveAttribute("data-renderer", "fallback");
  await expect(page.locator(".orb-visual")).toHaveAttribute("data-orb-paused", "true");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(
    await page
      .locator(".orb-fallback-rings i")
      .first()
      .evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe("0s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of isMobile ? [390, 360] : [1504, 1024, 768]) {
    await page.setViewportSize({ width, height: isMobile ? 844 : 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole("button", { name: "Enviar pergunta", exact: true })).toBeVisible();
  }
  await page.screenshot({ path: `${pasta}/assistente-${info.project.name}-fallback.png`, fullPage: true });
});

test("endpoint exige sessão e valida contexto sem produzir fontes fictícias", async ({ page }) => {
  const anon = await page.request.post("/api/assistente", {
    data: { pergunta: "Alma?", modo: "explorar", escopo: "todo" },
    maxRedirects: 0,
  });
  expect([307, 401]).toContain(anon.status());
  await entrarComoMembro(page, "/assistente");
  for (const data of [
    { pergunta: "Alma?", modo: "inventado", escopo: "todo" },
    { pergunta: "Alma?", modo: "explorar", escopo: "sala-privada" },
    { pergunta: "", modo: "explorar", escopo: "todo" },
  ]) {
    expect((await page.request.post("/api/assistente", { data })).status()).toBe(400);
  }
  const r = await page.request.post("/api/assistente", {
    data: { pergunta: "Alma?", modo: "comparar", escopo: "todo" },
  });
  expect(r.status()).toBe(503);
  expect(await r.json()).toEqual({
    ok: false,
    erro: expect.stringContaining("serviço de IA ainda não está conectado"),
  });
});

test("WebGL desenha, pausa, troca pausado e suspende movimento reduzido/fora da tela", async ({ page }) => {
  await page.addInitScript(() => {
    const nomes = new WeakMap<WebGLUniformLocation, string>();
    const localizar = WebGLRenderingContext.prototype.getUniformLocation;
    WebGLRenderingContext.prototype.getUniformLocation = function (program, nome) {
      const local = localizar.call(this, program, nome);
      if (local) nomes.set(local, nome);
      return local;
    };
    const escrever = WebGLRenderingContext.prototype.uniform1f;
    WebGLRenderingContext.prototype.uniform1f = function (local, valor) {
      if (local && nomes.get(local) === "uTime")
        (this.canvas as HTMLCanvasElement).dataset.orbTime = String(valor);
      escrever.call(this, local, valor);
    };
    const desenhar = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const canvas = this.canvas as HTMLCanvasElement;
      canvas.dataset.draws = String(Number(canvas.dataset.draws ?? 0) + 1);
      return desenhar.apply(this, args);
    };
  });
  await entrarComoMembro(page, "/assistente");
  const canvas = page.locator(".hero-orb canvas");
  await expect(canvas).toHaveAttribute("data-renderer", "webgl");
  const desenhos = async () => Number(await canvas.getAttribute("data-draws"));
  const tempoAnimado = async () => Number(await canvas.getAttribute("data-orb-time"));
  const ativo = await desenhos();
  await expect.poll(desenhos).toBeGreaterThan(ativo);
  await page.getByRole("button", { name: "Pausar movimento", exact: true }).click();
  for (const aparencia of ["Dourada", "Escura"]) {
    await page.getByRole("button", { name: aparencia, exact: true }).click();
    await expect(canvas).toHaveAttribute("data-renderer", "webgl");
    // Resize/IntersectionObservers podem pedir o primeiro frame, mesmo pausado.
    await page.waitForTimeout(200);
    const pausado = await tempoAnimado();
    expect(pausado).toBeGreaterThan(0);
    await page.waitForTimeout(200);
    expect(await tempoAnimado()).toBe(pausado);
  }
  await page.getByRole("button", { name: "Retomar movimento", exact: true }).click();
  const retomado = await desenhos();
  await expect.poll(desenhos).toBeGreaterThan(retomado);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(200);
  const reduzido = await tempoAnimado();
  await page.waitForTimeout(200);
  expect(await tempoAnimado()).toBe(reduzido);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator(".sdb-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const fora = await desenhos();
  await page.waitForTimeout(200);
  expect(await desenhos()).toBe(fora);
});

test("moldura mantém busca, conta e navegação móvel com tema local", async ({ page, isMobile }) => {
  await entrarComoMembro(page, "/assistente");
  await page.getByRole("button", { name: "Fechar notificação" }).click();
  const tema = await page.locator("html").getAttribute("data-theme");
  await expect(page.locator(".sdb-assistant-screen--portal")).toHaveAttribute("data-theme", "solido-escuro");
  await page.getByRole("button", { name: "Buscar no acervo", exact: true }).click();
  await expect(
    page.getByRole("dialog").filter({ has: page.getByRole("combobox", { name: /Buscar/ }) }),
  ).toBeVisible();
  await page.getByRole("combobox", { name: "Buscar no acervo", exact: true }).press("Escape");
  await expect(page.getByRole("dialog", { name: "Buscar no acervo" })).toBeHidden();
  if (isMobile) {
    await page.getByRole("button", { name: "Mais", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Conta de Buscador", exact: true }).last().click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await page.locator("html").getAttribute("data-theme")).toBe(tema);
});
