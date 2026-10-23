import { describe, expect, it } from "vitest";
import { alternarItem, chaveEstante, contarEstante } from "./estante";
import type { ItemEstante } from "./tipos";

const AGORA = "2026-10-20T12:00:00.000Z";

describe("Estante", () => {
  it("salva um item que não estava na Estante, no topo da lista", () => {
    const antes: ItemEstante[] = [{ tipo: "sala", ref: "urantia", em: "2026-09-21T10:00:00.000Z" }];
    const r = alternarItem(antes, "conteudo", "caibalion/sete-principios-hermeticos", AGORA);
    expect(r.salvo).toBe(true);
    expect(r.estante[0]).toEqual({
      tipo: "conteudo",
      ref: "caibalion/sete-principios-hermeticos",
      em: AGORA,
    });
    expect(r.estante).toHaveLength(2);
    expect(antes).toHaveLength(1);
  });

  it("tira o item quando ele já estava salvo", () => {
    const antes: ItemEstante[] = [{ tipo: "video", ref: "v-poimandres", em: AGORA }];
    const r = alternarItem(antes, "video", "v-poimandres", AGORA);
    expect(r.salvo).toBe(false);
    expect(r.estante).toEqual([]);
  });

  it("a mesma referência em tipos diferentes são itens diferentes", () => {
    expect(chaveEstante("sala", "urantia")).not.toBe(chaveEstante("conteudo", "urantia"));
  });

  it("conta Salas, artigos e vídeos", () => {
    const estante: ItemEstante[] = [
      { tipo: "sala", ref: "urantia", em: AGORA },
      { tipo: "conteudo", ref: "a/b", em: AGORA },
      { tipo: "conteudo", ref: "a/c", em: AGORA },
      { tipo: "video", ref: "v1", em: AGORA },
    ];
    expect(contarEstante(estante)).toEqual({ todos: 4, sala: 1, conteudo: 2, video: 1 });
  });
});
