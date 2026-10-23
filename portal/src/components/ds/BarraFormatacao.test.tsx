import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { BarraFormatacao, type FonteCitavel } from "./BarraFormatacao";
import { aplicarMarcacao, citarFonte, jaMarcado, limparMarcacoes } from "./marcacao";
import { TextoMarcado } from "./TextoMarcado";

function Campo({ inicial, fontes }: { inicial: string; fontes?: FonteCitavel[] }) {
  const [valor, setValor] = useState(inicial);
  const area = useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <BarraFormatacao area={area} valor={valor} onChange={setValor} alvo="bloco 1" fontes={fontes} />
      <textarea ref={area} aria-label="Bloco 1" value={valor} onChange={(e) => setValor(e.target.value)} />
    </div>
  );
}

function selecionar(area: HTMLTextAreaElement, trecho: string) {
  const i = area.value.indexOf(trecho);
  area.focus();
  area.setSelectionRange(i, i + trecho.length);
  document.dispatchEvent(new Event("selectionchange"));
}

describe("marcação do acervo", () => {
  it("envolve a seleção e tira a marcação no segundo toque", () => {
    const marcado = aplicarMarcacao("a gnose salva", 2, 7, "termo");
    expect(marcado.texto).toBe("a *gnose* salva");
    expect(marcado.trecho).toBe("*gnose*");
    expect([marcado.cursorInicio, marcado.cursorFim]).toEqual([3, 8]);
    expect(jaMarcado(marcado.texto, 3, 8, "termo")).toBe(true);
    expect(aplicarMarcacao(marcado.texto, 3, 8, "termo").texto).toBe("a gnose salva");
  });

  it("sem seleção, insere um modelo já selecionado", () => {
    const r = aplicarMarcacao("", 0, 0, "negrito");
    expect(r.texto).toBe("**texto**");
    expect(r.texto.slice(r.cursorInicio, r.cursorFim)).toBe("texto");
  });

  it("o link deixa o endereço selecionado para digitar por cima", () => {
    const r = aplicarMarcacao("leia o dito 3", 7, 13, "link");
    expect(r.texto).toBe("leia o [dito 3](endereço)");
    expect(r.texto.slice(r.cursorInicio, r.cursorFim)).toBe("endereço");
  });

  it("limpa as marcações do texto todo quando não há seleção", () => {
    const r = limparMarcacoes("**forte**, *gnose*, _obra_ e [texto](https://exemplo.org)", 0, 0);
    expect(r.texto).toBe("forte, gnose, obra e texto");
  });

  it("insere a chamada da fonte no cursor", () => {
    const r = citarFonte("segundo o Poimandres", 20, 2);
    expect(r.texto).toBe("segundo o Poimandres[2]");
    expect(r.cursorInicio).toBe(23);
  });
});

describe("BarraFormatacao", () => {
  it("marca o trecho selecionado e acende o botão", async () => {
    const user = userEvent.setup();
    render(<Campo inicial="a gnose salva" />);
    const area = screen.getByLabelText("Bloco 1") as HTMLTextAreaElement;
    selecionar(area, "gnose");
    await user.click(screen.getByRole("button", { name: "Marcar termo da tradição no bloco 1" }));
    expect(area).toHaveValue("a *gnose* salva");
    // O botão acende no quadro seguinte, quando o cursor volta para o trecho marcado.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Marcar termo da tradição no bloco 1" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });

  it("cita a obra escolhida pelo número e diz quando não há obra", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Campo inicial="o Reino está dentro" />);
    expect(screen.getByRole("button", { name: "Citar fonte no bloco 1" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    rerender(<Campo inicial="o Reino está dentro" fontes={[{ n: 1, titulo: "The Nag Hammadi Library" }]} />);
    const area = screen.getByLabelText("Bloco 1") as HTMLTextAreaElement;
    area.focus();
    area.setSelectionRange(area.value.length, area.value.length);
    await user.click(screen.getByRole("button", { name: "Citar fonte no bloco 1" }));
    await user.click(screen.getByRole("menuitem", { name: "[1] The Nag Hammadi Library" }));
    expect(area).toHaveValue("o Reino está dentro[1]");
  });
});

describe("TextoMarcado", () => {
  it("renderiza negrito, termo, obra, link e chamada de fonte", () => {
    render(
      <p>
        <TextoMarcado
          texto="**Sete** princípios de *gnose* no ::Caibalion::, em [domínio público](https://exemplo.org)[1]."
          hrefRef={(n) => `#fonte-${n}`}
        />
      </p>,
    );
    expect(screen.getByText("Sete").tagName).toBe("STRONG");
    expect(screen.getByText("gnose").tagName).toBe("DFN");
    expect(screen.getByText("Caibalion").tagName).toBe("CITE");
    const link = screen.getByRole("link", { name: "domínio público" });
    expect(link).toHaveAttribute("href", "https://exemplo.org");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Fonte 1" })).toHaveAttribute("href", "#fonte-1");
  });

  it("sem lista de fontes, a chamada vira marca em vez de sumir", () => {
    render(
      <p>
        <TextoMarcado texto="Segundo o Poimandres[2], a alma sobe." />
      </p>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Fonte").closest(".sdb-ref")).toHaveTextContent("Fonte 2");
  });

  it("endereço inseguro não vira link", () => {
    render(
      <p>
        <TextoMarcado texto="veja [aqui](javascript:alert(1)) o resto" />
      </p>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/aqui \(javascript:alert\(1\)\)/)).toBeInTheDocument();
  });
});

describe("nova gramática", () => {
  it("separa itálico, sublinhado, tachado e obra", () => {
    render(
      <p>
        <TextoMarcado texto="_ênfase_ __linha__ ~~fora~~ ::Obra::" />
      </p>,
    );
    expect(screen.getByText("ênfase").tagName).toBe("EM");
    expect(screen.getByText("linha").tagName).toBe("U");
    expect(screen.getByText("fora").tagName).toBe("S");
    expect(screen.getByText("Obra").tagName).toBe("CITE");
  });
  it("preserva aninhamento literal e bloqueia links relativos a outro host", () => {
    render(
      <p>
        <TextoMarcado texto="**_texto_** [obra](//evil.org)" />
      </p>,
    );
    expect(screen.getByText(/\*\*_texto_\*\*/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("permite itálico pelo teclado e uma só entrada por Tab na barra", async () => {
    const user = userEvent.setup();
    render(<Campo inicial="Texto" />);
    const area = screen.getByLabelText("Bloco 1") as HTMLTextAreaElement;
    selecionar(area, "Texto");
    await user.keyboard("{Control>}i{/Control}");
    expect(area).toHaveValue("_Texto_");
    const barra = screen.getByRole("toolbar");
    expect(
      [...barra.querySelectorAll("button,select")].filter(
        (e) => (e as HTMLElement).tabIndex === 0 && !e.closest("[role=menu]"),
      ),
    ).toHaveLength(1);
  });
});
