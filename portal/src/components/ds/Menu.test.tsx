import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Menu } from "./Menu";

it("só preferências com checked usam menuitemcheckbox em menus mistos", async () => {
  render(
    <Menu
      trigger="Opções"
      items={[
        { label: "Mostrar original", checked: true, onSelect: () => {} },
        { label: "Copiar", onSelect: () => {} },
      ]}
    />,
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Opções" }));
  expect(screen.getByRole("menuitemcheckbox", { name: "Mostrar original" })).toBeChecked();
  expect(screen.getByRole("menuitem", { name: "Copiar" })).toBeInTheDocument();
});

it("ignora ações desabilitadas ao navegar e selecionar", async () => {
  const escolher = vi.fn();
  render(
    <Menu
      trigger="Opções"
      items={[
        { label: "Ouvir", disabled: true, onSelect: escolher },
        { label: "Copiar", onSelect: () => {} },
        { label: "Salvar", onSelect: () => {} },
      ]}
    />,
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Opções" }));
  const ouvir = screen.getByRole("menuitem", { name: "Ouvir" });
  expect(ouvir).toBeDisabled();
  await user.click(ouvir);
  expect(escolher).not.toHaveBeenCalled();
  screen.getByRole("menuitem", { name: "Salvar" }).focus();
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: "Copiar" })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "Opções" })).toHaveFocus();
});
