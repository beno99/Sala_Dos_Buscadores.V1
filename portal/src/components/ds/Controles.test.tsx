import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Accordion, AccordionItem } from "./Accordion";
import { CampoTexto } from "./Campos";
import { AreaTexto, Select } from "./CamposExtras";

describe("controles conforme a biblioteca", () => {
  it("abrir outro item fecha o item inicialmente aberto no Accordion single", async () => {
    render(
      <Accordion single>
        <AccordionItem title="Primeiro" defaultOpen>
          Um
        </AccordionItem>
        <AccordionItem title="Segundo">Dois</AccordionItem>
      </Accordion>,
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Segundo" }));
    expect(screen.getByRole("button", { name: "Primeiro" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Segundo" })).toHaveAttribute("aria-expanded", "true");
  });

  it("mantém os itens independentes fora do modo single", async () => {
    render(
      <Accordion>
        <AccordionItem title="Primeiro" defaultOpen>
          Um
        </AccordionItem>
        <AccordionItem title="Segundo">Dois</AccordionItem>
      </Accordion>,
    );
    await userEvent.setup().click(screen.getByRole("button", { name: "Segundo" }));
    expect(screen.getAllByRole("button").every((b) => b.getAttribute("aria-expanded") === "true")).toBe(true);
  });

  it("o contador acompanha digitação e reset em uma área não controlada", async () => {
    render(
      <form aria-label="Notas">
        <AreaTexto label="Nota" defaultValue="Olá" maxLength={20} contador />
        <button type="reset">Recomeçar</button>
      </form>,
    );
    expect(screen.getByText("3 / 20")).toBeInTheDocument();
    await userEvent.setup().type(screen.getByRole("textbox", { name: /Nota/ }), " mundo");
    expect(screen.getByText("9 / 20")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.getByText("3 / 20")).toBeInTheDocument();
  });

  it("o contador aceita texto sem limite sem referenciar um descritor ausente", () => {
    render(<AreaTexto label="Nota" value="Texto" onChange={() => {}} contador />);
    const campo = screen.getByRole("textbox");
    expect(screen.getByText("5 / ∞")).toBeInTheDocument();
    for (const id of campo.getAttribute("aria-describedby")?.split(" ") ?? [])
      expect(document.getElementById(id)).not.toBeNull();
  });

  it("limpar a busca atualiza o valor controlado e devolve o foco ao campo", async () => {
    function Busca() {
      const [value, setValue] = useState("Poimandres");
      return (
        <CampoTexto
          label="Buscar nesta Sala"
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
    render(<Busca />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("limpa também uma busca não controlada", async () => {
    render(<CampoTexto label="Buscar" type="search" defaultValue="Gnose" />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
  });

  it("não permite revelar uma senha desabilitada", () => {
    render(<CampoTexto label="Senha" type="password" disabled defaultValue="segredo" />);
    expect(screen.getByRole("button", { name: "Mostrar senha" })).toBeDisabled();
  });

  it("preserva descritores externos junto com a ajuda e o erro", () => {
    render(
      <>
        <p id="externo">Instrução geral</p>
        <CampoTexto label="Nome" help="Use seu nome" error="Preencha o nome" aria-describedby="externo" />
        <Select label="Sala" opcoes={[]} help="Escolha uma Sala" aria-describedby="externo" />
        <AreaTexto label="Nota" help="Opcional" aria-describedby="externo" />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveAccessibleDescription(
      "Instrução geral Use seu nome Erro: Preencha o nome",
    );
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription("Instrução geral Escolha uma Sala");
    expect(screen.getByRole("textbox", { name: "Nota" })).toHaveAccessibleDescription(
      "Instrução geral Opcional",
    );
  });

  it("o contador acompanha novas props de um campo controlado", () => {
    const { rerender } = render(
      <AreaTexto label="Nota" value="A" onChange={() => {}} maxLength={20} contador />,
    );
    rerender(<AreaTexto label="Nota" value="Novo texto" onChange={() => {}} maxLength={20} contador />);
    expect(screen.getByText("10 / 20")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ignorado" } });
    expect(screen.getByText("10 / 20")).toBeInTheDocument();
  });
});

it("área marcada controlada entrega a edição ao formulário e à prévia", async () => {
  function Exemplo() {
    const [texto, setTexto] = useState("Uma descrição");
    return (
      <AreaTexto
        label="Descrição"
        formatacao
        contador
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
    );
  }
  render(<Exemplo />);
  const campo = screen.getByRole("textbox") as HTMLTextAreaElement;
  campo.focus();
  campo.setSelectionRange(0, 3);
  await userEvent.setup().click(screen.getByRole("button", { name: "Negrito no descrição" }));
  expect(campo).toHaveValue("**Uma** descrição");
  expect(document.querySelector(".sdb-editor__preview strong")).toHaveTextContent("Uma");
});

it("reset restaura a prévia junto com o textarea marcado não controlado", async () => {
  render(
    <form>
      <AreaTexto label="Apresentação" formatacao defaultValue="Inicial" />
      <button type="reset">Restaurar</button>
    </form>,
  );
  const user = userEvent.setup();
  const campo = screen.getByRole("textbox");
  await user.clear(campo);
  await user.type(campo, "Alterado");
  await user.click(screen.getByRole("button", { name: "Restaurar" }));
  expect(campo).toHaveValue("Inicial");
  expect(document.querySelector(".sdb-editor__preview")).toHaveTextContent("Inicial");
});
