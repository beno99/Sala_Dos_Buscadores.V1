import { defineConfig, devices } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {}

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * Testes ponta a ponta da Jornada do Buscador (DRS 7.2) e da curadoria.
 * Usam um banco próprio (DATABASE_URL_E2E, um Postgres só para testes) com o
 * cenário de demonstração, compartilhado entre os testes; por isso eles rodam
 * um de cada vez. Por padrão preparam esse banco e sobem o app com `next dev`
 * apontado para ele (pare o `npm run dev` antes: o Next não roda dois na mesma
 * pasta). Defina E2E_BASE_URL para testar um ambiente já no ar.
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
        command: `npm run e2e:banco && npx next dev --port ${PORT}`,
        url: baseURL,
        // O servidor dos testes lê o banco de E2E, nunca o de desenvolvimento.
        env: {
          DATABASE_URL: process.env.DATABASE_URL_E2E ?? "",
          SDB_SERVIDOR_E2E: "1",
        },
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
