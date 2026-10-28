import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";

/*
 * Conexão única com o Postgres (docker-compose.yml). Fica em globalThis para
 * sobreviver ao recarregamento do código em `next dev` sem abrir um pool por
 * recarga. Os testes trocam o banco por um PGlite com `usarBanco`.
 */

export type Banco = PgDatabase<PgQueryResultHKT, typeof schema>;

const chave = Symbol.for("sala-dos-buscadores.banco");
type ComBanco = typeof globalThis & { [chave]?: Banco };

export function banco(): Banco {
  const g = globalThis as ComBanco;
  if (!g[chave]) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL não definida. Copie .env.example para .env.local.");
    g[chave] = drizzle(new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 10_000 }), {
      schema,
    }) as unknown as Banco;
  }
  return g[chave];
}

/** Só para testes: aponta o cliente para outro banco (PGlite). */
export function usarBanco(b: Banco) {
  (globalThis as ComBanco)[chave] = b;
}
