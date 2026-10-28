/*
 * Prepara o banco dos testes ponta a ponta (DATABASE_URL_E2E): aplica as
 * migrações e põe o cenário de demonstração. Chamado pelo Playwright antes de
 * subir o servidor e por `restaurarAcervo` (tests/e2e/apoio.ts) entre os fluxos.
 * Nunca aponta para o banco de desenvolvimento.
 */

import { restaurarDemonstracaoNoBanco } from "@tests/support/demonstracao";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const url = process.env.DATABASE_URL_E2E;
if (!url) throw new Error("DATABASE_URL_E2E não definida em .env.local.");
if (url === process.env.DATABASE_URL && !url.includes("e2e")) {
  throw new Error("DATABASE_URL_E2E não pode ser o banco de desenvolvimento.");
}
process.env.DATABASE_URL = url;

async function principal() {
  if (process.argv.includes("--migrar")) {
    const conexao = new Pool({ connectionString: url, max: 1 });
    await migrate(drizzle(conexao), { migrationsFolder: "drizzle" });
    await conexao.end();
  }
  await restaurarDemonstracaoNoBanco();
}

principal().then(
  () => process.exit(0),
  (erro) => {
    console.error(erro);
    process.exit(1);
  },
);
