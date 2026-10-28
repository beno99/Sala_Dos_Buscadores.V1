/*
 * Popula o banco: npm run db:seed (lê .env.local; ver .env.example).
 * Roda com a condição react-server para os módulos marcados com server-only.
 */
import { semear } from "@/modules/acervo/semente";

function exigir(nome: string): string {
  const v = process.env[nome]?.trim();
  if (!v) throw new Error(`${nome} não definida em .env.local.`);
  return v;
}

semear({ email: exigir("SEED_ADMIN_EMAIL"), senha: exigir("SEED_ADMIN_SENHA") }, (linha) =>
  process.stdout.write(`${linha}\n`),
).then(
  () => process.exit(0),
  (erro) => {
    console.error(erro);
    process.exit(1);
  },
);
