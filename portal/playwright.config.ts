import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Testes ponta a ponta da Jornada do Buscador (DRS 7.2) e da curadoria.
 * O acervo vive na memória do servidor e é compartilhado entre os testes,
 * por isso eles rodam um de cada vez.
 * Por padrão sobem o app com `next dev`; defina E2E_BASE_URL para testar um
 * ambiente já no ar (homologação, preview).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "pt-BR",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next dev --port ${PORT}`,
        url: baseURL,
        // Reaproveita o `npm run dev` que já estiver no ar (o Next não permite dois na mesma pasta).
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
