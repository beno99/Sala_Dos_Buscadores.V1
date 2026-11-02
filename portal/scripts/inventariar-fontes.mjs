// P13: inventário somente leitura. Sem decisões automáticas de exclusão.
import fs from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const destino = path.resolve(process.argv[2] ?? "../docs/refinamento-2026-11-02/fontes-revisao.md");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
});
const escapar = (s) =>
  String(s ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ")
    .replaceAll("\r", " ");
const normalizar = (s) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
try {
  if (!process.env.DATABASE_URL) throw new Error("CONFIGURACAO_AUSENTE");
  await client.connect();
  await client.query("BEGIN READ ONLY");
  const { rows } = await client.query(`SELECT f.id, f.titulo, f.autor, f.tipo, f.referencia,
    count(c.id)::int AS usos,
    count(c.id) FILTER (WHERE c.status = 'publicado')::int AS usos_publicados
    FROM fontes f LEFT JOIN conteudos c ON f.id = ANY(c.fontes)
    GROUP BY f.id ORDER BY f.titulo, f.id`);
  await client.query("COMMIT");
  const grupos = new Map();
  for (const f of rows) {
    const chave = normalizar(f.titulo);
    grupos.set(chave, [...(grupos.get(chave) ?? []), f]);
  }
  const semelhantes = [...grupos.values()].filter((g) => g.length > 1).flat();
  const semUso = rows.filter((f) => f.usos === 0);
  const tabela = (fontes) =>
    fontes.length
      ? "| ID | Título | Responsável bibliográfico | Tipo | Usos / publicados | Referência |\n| --- | --- | --- | --- | --- | --- |\n" +
        fontes
          .map(
            (f) =>
              `| ${escapar(f.id)} | ${escapar(f.titulo)} | ${escapar(f.autor)} | ${escapar(f.tipo)} | ${f.usos} / ${f.usos_publicados} | ${escapar(f.referencia)} |`,
          )
          .join("\n")
      : "Nenhum registro neste critério.";
  const texto = `# P13 — inventário para decisão editorial\n\nConsulta somente leitura em ${new Date().toISOString()}. ${rows.length} fontes examinadas. Nenhuma alteração, exclusão ou decisão de duplicidade foi executada.\n\nTítulos normalizados iguais são apenas candidatos a comparação: tradução, edição, autoria e tipo podem justificar registros distintos. Ausência de vínculo também não significa que a fonte seja indevida. Usos incluem todos os estados de artigos e não são autorização para remoção.\n\n## Títulos normalizados iguais\n\n${tabela(semelhantes)}\n\n## Fontes sem vínculo em artigos\n\n${tabela(semUso)}\n\n## Próximo passo da Curadoria\n\nIdentificar os IDs realmente indevidos, conferir edição/referência e usos, e aprovar a ação por ID. Nada deve ser apagado apenas pelo volume da lista ou por estes critérios automáticos. Refaça o inventário antes de executar uma limpeza aprovada, pois os vínculos podem mudar.\n`;
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, texto);
  process.stdout.write(
    JSON.stringify({
      fontes: rows.length,
      titulosSemelhantes: semelhantes.length,
      semVinculos: semUso.length,
      relatorio: destino,
    }),
  );
} catch (e) {
  // Não imprimir URL de conexão, credenciais ou mensagens do driver com dados de ambiente.
  process.stderr.write(
    `Inventário não concluído (${e.code ?? "conexao-ou-configuracao"}). Nenhum dado foi alterado.\n`,
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
