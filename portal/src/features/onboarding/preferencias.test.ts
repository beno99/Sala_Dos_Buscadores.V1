import { describe, expect, it } from "vitest";
import { OPCOES_CONVICCAO, validarPreferencias } from "./preferencias";

const agora = new Date("2026-10-07T12:00:00Z");
const base = { temas: [], salas: [], conviccao: [], consentimento: false };

describe("validarPreferencias", () => {
  it("aceita tudo em branco: pular não condiciona nada", () => {
    const r = validarPreferencias(base, agora);
    expect(r).toEqual({
      ok: true,
      valor: { temas: [], salas: [], conviccao: { tipo: "pulada" }, concluidoEm: agora.toISOString() },
    });
  });

  it("guarda interesses sem repetir e recusa valores fora do acervo", () => {
    const r = validarPreferencias({ ...base, temas: ["alma", "alma"], salas: ["corpus-hermeticum"] }, agora);
    expect(r.ok && r.valor.temas).toEqual(["alma"]);
    expect(r.ok && r.valor.salas).toEqual(["corpus-hermeticum"]);
    expect(validarPreferencias({ ...base, temas: ["astrologia"] }, agora).ok).toBe(false);
    expect(validarPreferencias({ ...base, salas: ["vedas"] }, agora).ok).toBe(false);
  });

  it("“Prefiro não informar” não pede consentimento e não combina com outras opções", () => {
    expect(validarPreferencias({ ...base, conviccao: ["nao-informar"] }, agora)).toMatchObject({
      ok: true,
      valor: { conviccao: { tipo: "nao-informar" } },
    });
    const r = validarPreferencias(
      { ...base, conviccao: ["nao-informar", "budismo"], consentimento: true },
      agora,
    );
    expect(r).toMatchObject({ ok: false, erro: expect.stringMatching(/não combina/) });
  });

  it("convicção informada só é salva com consentimento (LGPD art. 11)", () => {
    const sem = validarPreferencias({ ...base, conviccao: ["espiritismo"] }, agora);
    expect(sem).toMatchObject({ ok: false, erro: expect.stringMatching(/autorização/) });
    const com = validarPreferencias({ ...base, conviccao: ["espiritismo"], consentimento: true }, agora);
    expect(com).toMatchObject({
      ok: true,
      valor: { conviccao: { tipo: "informada", opcoes: ["espiritismo"], consentidoEm: agora.toISOString() } },
    });
  });

  it("“Outra” exige um texto curto", () => {
    const vazio = validarPreferencias(
      { ...base, conviccao: ["outra"], outra: "  ", consentimento: true },
      agora,
    );
    expect(vazio).toMatchObject({ ok: false, erro: expect.stringMatching(/escreva/) });
    const longo = validarPreferencias(
      { ...base, conviccao: ["outra"], outra: "x".repeat(61), consentimento: true },
      agora,
    );
    expect(longo.ok).toBe(false);
    const ok = validarPreferencias(
      { ...base, conviccao: ["outra"], outra: " Taoísmo ", consentimento: true },
      agora,
    );
    expect(ok).toMatchObject({ ok: true, valor: { conviccao: { tipo: "informada", outra: "Taoísmo" } } });
  });

  it("recusa convicção fora da lista", () => {
    expect(validarPreferencias({ ...base, conviccao: ["seita-x"], consentimento: true }, agora).ok).toBe(
      false,
    );
  });
});

describe("OPCOES_CONVICCAO", () => {
  it("começa pelas três opções gerais e segue em ordem alfabética, terminando em Outra", () => {
    const rotulos = OPCOES_CONVICCAO.map((o) => o.rotulo);
    expect(rotulos.slice(0, 3)).toEqual([
      "Não tenho religião",
      "Espiritualidade sem religião",
      "Prefiro não informar",
    ]);
    const meio = rotulos.slice(3, -1);
    expect(meio).toEqual([...meio].sort((a, b) => a.localeCompare(b, "pt-BR")));
    expect(rotulos.at(-1)).toBe("Outra");
  });
});
