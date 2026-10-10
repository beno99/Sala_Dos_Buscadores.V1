import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, type Page } from "@playwright/test";

/**
 * Lê a conta de demonstração do administrador direto do arquivo de contas,
 * para a senha não ser repetida nos testes. (O módulo é server-only e não
 * pode ser importado aqui.)
 */
export function contaAdmin(): { email: string; senha: string } {
  const fonte = readFileSync(join(process.cwd(), "src/features/auth/contas.ts"), "utf8");
  const bloco = fonte.slice(fonte.indexOf("CONTA_ADMIN_DEMONSTRACAO = {"));
  const email = /email: "([^"]+)"/.exec(bloco)?.[1];
  const senha = /senha: "([^"]+)"/.exec(bloco)?.[1];
  if (!email || !senha) throw new Error("Conta de administrador não encontrada em contas.ts");
  return { email, senha };
}

export async function entrar(page: Page, email: string, senha: string, voltar = "/") {
  await page.goto(`/entrar?voltar=${encodeURIComponent(voltar)}`);
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

export const CONTA_MEMBRO = { email: "buscador@exemplo.com", senha: "escada-de-quem-sobe" };

/** Entra com a conta de demonstração de membro (onboarding já feito) e espera o destino. */
export async function entrarComoMembro(page: Page, voltar = "/") {
  await entrar(page, CONTA_MEMBRO.email, CONTA_MEMBRO.senha, voltar);
  await expect(page).toHaveURL(new RegExp(`${voltar.replace(/[?]/g, "\\?")}$`));
}

export async function entrarComoAdmin(page: Page) {
  const { email, senha } = contaAdmin();
  await entrar(page, email, senha, "/admin");
  await expect(page.getByRole("heading", { level: 1, name: "Painel do acervo" })).toBeVisible();
}

export async function restaurarAcervo(page: Page) {
  await page.goto("/admin");
  await page.getByRole("button", { name: "Restaurar acervo de demonstração" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Restaurar" }).click();
  await expect(page.getByText("Acervo de demonstração restaurado.")).toBeVisible();
}

/** Confirma o Modal de mudança de status. */
export async function confirmar(page: Page, rotulo: string) {
  const dialogo = page.getByRole("alertdialog");
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole("button", { name: rotulo, exact: true }).click();
}
