import assert from "node:assert/strict";
import { test } from "node:test";
import { alertasDeLinguagem, anuncioVazio, checklistEnvioAnuncio, validarAnuncioParaSalvar } from "./regras";

const completo = {
  ...anuncioVazio(),
  titulo: "Sal grosso e guiné",
  descricao: "Um aroma para acompanhar seus momentos de pausa.",
  href: "https://exemplo.com/incenso-fenix",
  anunciante: "Fênix · Incensos naturais",
  textoAlternativo: "Caixa verde de incenso ao lado de um incensário de barro.",
  midia: "m-1",
};

test("rascunho precisa só do título e respeita os limites", () => {
  assert.deepEqual(Object.keys(validarAnuncioParaSalvar(anuncioVazio())), ["campo-titulo"]);
  assert.deepEqual(validarAnuncioParaSalvar({ ...anuncioVazio(), titulo: "Incenso" }), {});
  const longo = validarAnuncioParaSalvar({ ...anuncioVazio(), titulo: "x".repeat(81) });
  assert.match(longo["campo-titulo"] ?? "", /80 caracteres/);
});

test("link só https", () => {
  const erros = validarAnuncioParaSalvar({ ...anuncioVazio(), titulo: "a", href: "http://exemplo.com" });
  assert.ok(erros["campo-href"]);
});

test("envio exige imagem, textos, link, anunciante e descrição da imagem", () => {
  const vazio = checklistEnvioAnuncio(anuncioVazio()).filter((i) => i.estado === "pendente");
  assert.deepEqual(
    vazio.map((i) => i.id),
    ["imagem", "textos", "link", "anunciante", "alternativo"],
  );
  assert.equal(checklistEnvioAnuncio(completo).filter((i) => i.estado === "pendente").length, 0);
});

test("linguagem de cura e urgência vira alerta, sem bloquear", () => {
  const f = { ...completo, descricao: "Cura a ansiedade. Últimas unidades!" };
  assert.deepEqual(
    alertasDeLinguagem(f).map((a) => a.motivo),
    ["promessa de cura", "urgência"],
  );
  const linguagem = checklistEnvioAnuncio(f).find((i) => i.id === "linguagem");
  assert.equal(linguagem?.estado, "alerta");
});
