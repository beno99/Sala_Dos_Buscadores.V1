import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { type Banco, usarBanco } from "@/modules/compartilhado/banco/cliente";
import * as schema from "@/modules/compartilhado/banco/schema";

/*
 * Postgres de verdade (PGlite, em memória) com as mesmas migrações de
 * drizzle/. Cada chamada começa um banco limpo e passa a ser o banco da app.
 */
export async function bancoDeTeste(): Promise<Banco> {
  const db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: resolve(process.cwd(), "drizzle") });
  usarBanco(db as unknown as Banco);
  return db as unknown as Banco;
}
