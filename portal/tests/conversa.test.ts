import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chaveConversa,
  LIMITE_ENVIOS,
  LIMITE_MENSAGEM,
  nomeDeArquivo,
  normalizarMensagem,
  recusaDeEnvio,
  validarEnvio,
  validarMensagem,
} from "../src/features/conversa/regras/mensagem";

test("mensagem vazia ou só com espaços é recusada", () => {
  for (const v of ["", "   ", "\n\n\t", null, undefined]) assert.equal(validarMensagem(v).ok, false);
});

test("limite de caracteres", () => {
  assert.equal(validarMensagem("a".repeat(LIMITE_MENSAGEM)).ok, true);
  assert.equal(validarMensagem("a".repeat(LIMITE_MENSAGEM + 1)).ok, false);
});

test("normaliza quebras de linha e espaços", () => {
  assert.equal(
    normalizarMensagem("  Olá,\r\ncuradoria   \r\n\r\n\r\n\r\nObrigado  "),
    "Olá,\ncuradoria\n\nObrigado",
  );
});

test("texto com HTML é guardado como texto", () => {
  const r = validarMensagem("<script>alert(1)</script>");
  assert.ok(r.ok && r.texto === "<script>alert(1)</script>");
});

test("chave da conversa é a mesma dos dois lados", () => {
  assert.equal(chaveConversa("u-b", "u-a"), chaveConversa("u-a", "u-b"));
  assert.equal(chaveConversa("u-a", "u-b"), "u-a:u-b");
});

test("recusas de envio direto", () => {
  const base = {
    remetenteId: "a",
    destinatarioId: "b",
    destinoAtivo: true,
    bloqueado: false,
    enviadasNaJanela: 0,
  };
  assert.equal(recusaDeEnvio(base), null);
  assert.equal(recusaDeEnvio({ ...base, destinatarioId: "a" }), "si-mesmo");
  assert.equal(recusaDeEnvio({ ...base, destinoAtivo: false }), "destino-inexistente");
  assert.equal(recusaDeEnvio({ ...base, bloqueado: true }), "bloqueio");
  assert.equal(recusaDeEnvio({ ...base, enviadasNaJanela: LIMITE_ENVIOS.quantidade }), "excesso");
});

test("buscador só envia texto; anfitrião e curadoria anexam", () => {
  const anexo = [{ midia: "m-abcdefgh12", nome: "foto.png" }];
  assert.equal(validarEnvio("oi", anexo, "membro").ok, false);
  assert.equal(validarEnvio("oi", [], "membro").ok, true);
  assert.equal(validarEnvio("", anexo, "anfitriao").ok, true);
  assert.equal(validarEnvio("", anexo, "administrador").ok, true);
  assert.equal(validarEnvio("", [], "anfitriao").ok, false);
});

test("anexos: limite, duplicados e id inválido", () => {
  const varios = Array.from({ length: 5 }, (_, i) => ({ midia: `m-abcdefgh1${i}`, nome: "a.pdf" }));
  assert.equal(validarEnvio("x", varios, "anfitriao").ok, false);
  assert.equal(validarEnvio("x", [varios[0], varios[0]], "anfitriao").ok, false);
  assert.equal(validarEnvio("x", [{ midia: "../etc/passwd", nome: "a" }], "anfitriao").ok, false);
});

test("nome de arquivo sem caminho nem controle", () => {
  assert.equal(nomeDeArquivo("C:\\x\\..\\relatorio.pdf"), "relatorio.pdf");
  assert.equal(nomeDeArquivo("a\u0000b.png"), "ab.png");
  assert.equal(nomeDeArquivo(""), "anexo");
});
