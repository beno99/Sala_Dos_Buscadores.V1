import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it } from "vitest";
import { Slider } from "./Slider";
import { Switch } from "./Switch";

it("clicar no rótulo do Switch aplica a preferência imediatamente", async () => {
  function Exemplo() {
    const [checked, setChecked] = useState(false);
    return (
      <>
        <Switch label="Mostrar original" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <p>{checked ? "Original visível" : "Original oculto"}</p>
      </>
    );
  }
  render(<Exemplo />);
  await userEvent.setup().click(screen.getByText("Mostrar original"));
  expect(screen.getByRole("switch")).toBeChecked();
  expect(screen.getByText("Original visível")).toBeInTheDocument();
});

it("o Switch desabilitado conserva o valor e a ajuda", async () => {
  render(<Switch label="Citar fontes" help="Sempre ligado" defaultChecked disabled />);
  await userEvent.setup().click(screen.getByText("Citar fontes"));
  expect(screen.getByRole("switch")).toBeChecked();
  expect(screen.getByRole("switch")).toBeDisabled();
  expect(screen.getByRole("switch")).toHaveAccessibleDescription("Sempre ligado");
});

it("o Slider mostra o valor atual, a unidade e os extremos ao ajustar e resetar", async () => {
  render(
    <form>
      <Slider label="Texto de leitura" min={16} max={24} defaultValue={19} format="{v} px" />
      <button type="reset">Restaurar</button>
    </form>,
  );
  expect(screen.getByRole("slider", { name: "Texto de leitura" })).toHaveValue("19");
  expect(screen.getByRole("status")).toHaveTextContent("19 px");
  expect(screen.getByText("16")).toBeInTheDocument();
  expect(screen.getByText("24")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("slider"), { target: { value: "22" } });
  expect(screen.getByRole("status")).toHaveTextContent("22 px");
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "22 px");
  await userEvent.setup().click(screen.getByRole("button", { name: "Restaurar" }));
  expect(screen.getByRole("status")).toHaveTextContent("19 px");
});

it("o Slider acompanha valores controlados externos", () => {
  const { rerender } = render(<Slider label="Densidade" value={30} onChange={() => {}} />);
  rerender(<Slider label="Densidade" value={70} onChange={() => {}} />);
  expect(screen.getByRole("status")).toHaveTextContent("70");
  expect(screen.getByRole("slider")).toHaveValue("70");
});

it("o Slider acompanha a sanitização nativa ao mudar seus limites", () => {
  const { rerender } = render(<Slider label="Densidade" min={0} max={100} defaultValue={70} />);
  rerender(<Slider label="Densidade" min={0} max={50} defaultValue={70} />);
  expect(screen.getByRole("slider")).toHaveValue("50");
  expect(screen.getByRole("status")).toHaveTextContent("50");
  rerender(<Slider label="Densidade" min={0} max={100} defaultValue={70} />);
  expect(screen.getByRole("slider")).toHaveValue("50");
  expect(screen.getByRole("status")).toHaveTextContent("50");
});
