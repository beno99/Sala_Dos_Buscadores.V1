import { describe, expect, it } from "vitest";
import {
  abasDoCelular,
  gruposDaLateral,
  iniciaisDe,
  membroDesde,
  tituloDaPagina,
  trilhaDaPagina,
} from "./navegacao";

describe("navegação do app", () => {
  it("a página inicial chama-se Portal e cada seção tem o próprio título", () => {
    expect(tituloDaPagina("/")).toBe("Portal");
    expect(tituloDaPagina("/salas/corpus-hermeticum")).toBe("Salas");
    expect(tituloDaPagina("/comparar")).toBe("Comparar");
    expect(tituloDaPagina("/ajustes")).toBe("Ajustes");
  });

  it("a página da Sala ganha a trilha Salas / {nome}; as outras páginas, não", () => {
    expect(trilhaDaPagina("/salas/corpus-hermeticum")).toEqual({
      itens: [{ href: "/salas", rotulo: "Salas" }],
      atual: "Corpus Hermeticum",
    });
    expect(trilhaDaPagina("/salas")).toBeUndefined();
    expect(trilhaDaPagina("/salas/corpus-hermeticum/poimandres")).toBeUndefined();
    expect(trilhaDaPagina("/salas/nao-existe")).toBeUndefined();
    expect(trilhaDaPagina("/")).toBeUndefined();
  });

  it("a página de um conteúdo leva o tipo no título e a trilha Salas / {Sala} / {título}", () => {
    const conteudos = [
      {
        titulo: "Os sete princípios, em linguagem simples",
        salaNome: "O Caibalion",
        href: "/salas/caibalion/sete-principios-hermeticos",
        tipo: "artigo" as const,
      },
    ];
    expect(tituloDaPagina("/salas/caibalion/sete-principios-hermeticos", conteudos)).toBe("Salas");
    expect(trilhaDaPagina("/salas/caibalion/sete-principios-hermeticos", conteudos)).toEqual({
      itens: [
        { href: "/salas", rotulo: "Salas" },
        { href: "/salas/caibalion", rotulo: "O Caibalion" },
      ],
      atual: "Os sete princípios, em linguagem simples",
    });
    expect(trilhaDaPagina("/salas/caibalion/nao-publicado", conteudos)).toBeUndefined();
    expect(tituloDaPagina("/salas/caibalion/nao-publicado", conteudos)).toBe("Salas");
  });

  it("lateral em grupos; Curadoria só para administrador", () => {
    const membro = gruposDaLateral("/biblioteca", { admin: false, sair: () => {} });
    expect(membro.map((g) => g.titulo)).toEqual(["Acervo", "Estudo", "Ferramentas", "Conta"]);
    expect(membro[0]?.itens.map((i) => i.rotulo)).toEqual(["Portal", "Destaques", "Biblioteca", "Salas"]);
    expect(membro[0]?.itens.find((i) => i.ativo)?.rotulo).toBe("Biblioteca");
    expect(membro.at(-1)?.itens.map((i) => i.rotulo)).toEqual(["Ajustes", "Sair"]);
    const admin = gruposDaLateral("/", { admin: true, sair: () => {} });
    expect(admin.at(-1)?.itens.map((i) => i.rotulo)).toEqual(["Ajustes", "Curadoria", "Sair"]);
  });

  it("“Minhas Salas” só para anfitrião, com as novidades no contador", () => {
    const anfitriao = gruposDaLateral("/anfitriao/salas/s-1", {
      admin: false,
      anfitriao: { novidades: 2 },
      sair: () => {},
    });
    const conta = anfitriao.at(-1)?.itens ?? [];
    expect(conta.map((i) => i.rotulo)).toEqual(["Minhas Salas", "Ajustes", "Sair"]);
    expect(conta[0]).toMatchObject({ ativo: true, contagem: 2, href: "/anfitriao" });
    const semNovidade = gruposDaLateral("/", { admin: false, anfitriao: { novidades: 0 }, sair: () => {} });
    expect(semNovidade.at(-1)?.itens[0]?.contagem).toBeUndefined();
    expect(tituloDaPagina("/anfitriao/perfil")).toBe("Minhas Salas");
  });

  it("celular: Portal, Biblioteca, Trilhas e Estante (o resto vai para Mais)", () => {
    expect(abasDoCelular("/trilhas").map((a) => [a.rotulo, a.ativa])).toEqual([
      ["Portal", false],
      ["Biblioteca", false],
      ["Trilhas", true],
      ["Estante", false],
    ]);
  });

  it("perfil: iniciais e mês do cadastro", () => {
    expect(iniciaisDe("Leitora de Hermes")).toBe("LH");
    expect(iniciaisDe("Buscador")).toBe("BU");
    expect(iniciaisDe("Helena Varga (demonstração)")).toBe("HV");
    expect(membroDesde("2026-09-14T13:00:00.000Z")).toBe("Membro desde set 2026");
  });
});
