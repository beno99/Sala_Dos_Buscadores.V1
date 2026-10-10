import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expect, it } from "vitest";
import { Drawer } from "./Drawer";
import { ModalConfirmacao } from "./Modal";
import { Sheet } from "./Sheet";

it("atualizar callbacks no modal aberto conserva o foco e o gatilho original", async () => {
  const props = {
    titulo: "Excluir nota",
    rotuloConfirmar: "Excluir",
    onConfirmar: () => {},
    children: "Remover esta nota?",
  };
  const { rerender } = render(
    <>
      <button type="button">Abrir</button>
      <ModalConfirmacao {...props} open={false} onCancelar={() => {}} />
    </>,
  );
  const gatilho = screen.getByRole("button", { name: "Abrir" });
  gatilho.focus();
  rerender(
    <>
      <button type="button">Abrir</button>
      <ModalConfirmacao {...props} open onCancelar={() => {}} />
    </>,
  );
  await waitFor(() => expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus());
  const confirmar = screen.getByRole("button", { name: "Excluir" });
  confirmar.focus();
  rerender(
    <>
      <button type="button">Abrir</button>
      <ModalConfirmacao {...props} open carregando onCancelar={() => {}} />
    </>,
  );
  expect(confirmar).toHaveFocus();
  rerender(
    <>
      <button type="button">Abrir</button>
      <ModalConfirmacao {...props} open={false} onCancelar={() => {}} />
    </>,
  );
  expect(gatilho).toHaveFocus();
});

it("um Drawer sem campos habilitados recebe foco no botão Fechar", async () => {
  render(
    <Drawer open title="Filtros" onClose={() => {}}>
      <input aria-label="Filtro indisponível" disabled />
    </Drawer>,
  );
  await waitFor(() => expect(screen.getByRole("button", { name: "Fechar" })).toHaveFocus());
});

it("o sheet recebe o foco ao abrir e o devolve ao gatilho ao fechar", async () => {
  function Exemplo() {
    const [aberto, setAberto] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setAberto(true)}>
          Abrir
        </button>
        <Sheet aberto={aberto} onFechar={() => setAberto(false)} rotuloId="titulo">
          <h2 id="titulo">Editar nota</h2>
          <input aria-label="Nota" />
          <button type="button" onClick={() => setAberto(false)}>
            Fechar
          </button>
        </Sheet>
      </>
    );
  }
  render(<Exemplo />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Abrir" }));
  await waitFor(() => expect(screen.getByRole("textbox", { name: "Nota" })).toHaveFocus());
  await user.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.getByRole("button", { name: "Abrir" })).toHaveFocus();
});

it("o modal de confirmação mantém Tab dentro das suas ações", async () => {
  render(
    <ModalConfirmacao
      open
      titulo="Excluir nota"
      rotuloConfirmar="Excluir"
      onConfirmar={() => {}}
      onCancelar={() => {}}
    >
      Esta ação remove a nota.
    </ModalConfirmacao>,
  );
  const cancelar = screen.getByRole("button", { name: "Cancelar" });
  const excluir = screen.getByRole("button", { name: "Excluir" });
  // jsdom não calcula layout; estes são os dois controles visíveis do diálogo.
  Object.defineProperty(cancelar, "offsetParent", { configurable: true, value: cancelar.parentElement });
  Object.defineProperty(excluir, "offsetParent", { configurable: true, value: excluir.parentElement });
  await waitFor(() => expect(cancelar).toHaveFocus());
  excluir.focus();
  fireEvent.keyDown(excluir, { key: "Tab" });
  expect(cancelar).toHaveFocus();
  fireEvent.keyDown(cancelar, { key: "Tab", shiftKey: true });
  expect(excluir).toHaveFocus();
});
