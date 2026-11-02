import assert from "node:assert/strict";
import test from "node:test";
import { projetarPreviaComunidade } from "../src/features/portal/composicao";

test("prévia pública tem projeção mínima, três registros únicos e ordenação recente", () => {
  const p = (id: string, criadaEm: string) => ({
    id,
    criadaEm,
    texto: "Texto publicado",
    autor: { nome: "Nome público", href: "/perfil/publico", email: "privado@example.invalid" },
    autorId: "privado",
    comentarios: [{ texto: "fora da prévia" }],
    email: "privado@example.invalid",
  });
  const lista = projetarPreviaComunidade([
    p("a", "2026-01-01"),
    p("b", "2026-02-01"),
    p("b", "2026-02-01"),
    p("c", "2026-03-01"),
    p("d", "2026-04-01"),
  ]);
  assert.deepEqual(
    lista.map((p) => p.id),
    ["d", "c", "b"],
  );
  assert.ok(lista[0]);
  assert.deepEqual(Object.keys(lista[0]).sort(), ["autorHref", "autorNome", "criadaEm", "id", "texto"]);
  assert.equal(JSON.stringify(lista).includes("privado"), false);
  assert.deepEqual(projetarPreviaComunidade([]), []);
});
test("texto longo tem limite e conteúdo HTML permanece apenas texto", () => {
  const [p] = projetarPreviaComunidade([
    {
      id: "a",
      criadaEm: "2026-01-01",
      texto: `<script>texto</script>${"a".repeat(300)}`,
      autor: { nome: "Nome", href: "/perfil/a" },
    },
  ]);
  assert.ok(p);
  assert.ok(p.texto.length <= 240);
  assert.ok(p.texto.startsWith("<script>"));
  assert.ok(p.texto.endsWith("…"));
});
