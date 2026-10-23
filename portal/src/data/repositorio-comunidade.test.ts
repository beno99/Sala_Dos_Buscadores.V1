import { beforeEach, describe, expect, it } from "vitest";
import { gravarPerfil } from "@/server/perfilBuscador";
import { acervo, restaurarAcervoInicial } from "@/server/store";
import {
  pessoaPublicaComunidade,
  publicacaoComunidadePorId,
  publicacoesVisiveisComunidade,
} from "./repositorio-comunidade";

function exigir<T>(valor: T | undefined): T {
  if (!valor) throw new Error("Seed ausente");
  return valor;
}
beforeEach(() => restaurarAcervoInicial());
describe("leitura pública da Comunidade", () => {
  it("projeta só identificação, sem e-mail, convicção, descrição ou progresso privado", () => {
    gravarPerfil("u-buscador", { sobre: "Descrição privada" });
    const pessoa = pessoaPublicaComunidade("u-buscador");
    expect(Object.keys(exigir(pessoa)).sort()).toEqual(["anfitriao", "href", "id", "iniciais", "nome"]);
    expect(JSON.stringify(publicacoesVisiveisComunidade())).not.toMatch(
      /conviccao|preferencias|@exemplo|Descrição privada/,
    );
  });
  it("filtra publicação oculta e sua página direta", () => {
    exigir(acervo().comunidade.publicacoes.get("p-demo-1")).estado = "oculta";
    expect(publicacaoComunidadePorId("p-demo-1")).toBeUndefined();
  });
  it("não entrega comentários ocultos nem respostas órfãs", () => {
    exigir(acervo().comunidade.comentarios.get("cm-demo-3")).estado = "oculta";
    expect(publicacaoComunidadePorId("p-demo-2")?.comentarios).toEqual([]);
  });
  it("referência de acervo despublicada não vaza texto editorial", () => {
    exigir(acervo().conteudos.get("c-poimandres-subida-pelas-esferas")).status = "rascunho";
    expect(publicacaoComunidadePorId("p-demo-4")?.conteudo).toBeUndefined();
  });
  it("publicações de Sala arquivada saem do feed e devolve cópias independentes", () => {
    const p = exigir(publicacaoComunidadePorId("p-demo-1"));
    p.texto = "mudança no retorno";
    expect(publicacaoComunidadePorId(p.id)?.texto).not.toBe(p.texto);
    exigir(acervo().salas.get("corpus-hermeticum")).status = "arquivado";
    expect(publicacoesVisiveisComunidade().some((p) => p.salaSlug === "corpus-hermeticum")).toBe(false);
  });
});
