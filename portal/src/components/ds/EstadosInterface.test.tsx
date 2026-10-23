import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ErroDoApp from "@/app/(app)/error";
import { CarregamentoSala, EstadoSecao, IconeVolume, ProgressoReal } from "./EstadosInterface";

it("estado contextual conecta a ação e associa o título à seção", () => {
  const executar = vi.fn();
  render(
    <EstadoSecao
      simbolo="busca"
      titulo="Nenhum resultado"
      descricao="Escolha outro tema."
      acao={{ rotulo: "Limpar busca", executar }}
    />,
  );
  expect(screen.getByRole("region", { name: "Nenhum resultado" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
  expect(executar).toHaveBeenCalledOnce();
});
it("progresso limita valores e omite barra sem total", () => {
  const { rerender } = render(<ProgressoReal concluidos={2} total={3} rotulo="Conquistas obtidas" />);
  expect(screen.getByRole("progressbar", { name: "Conquistas obtidas" })).toHaveAttribute("value", "2");
  expect(screen.getByText("67%", { selector: "strong" })).toBeInTheDocument();
  rerender(<ProgressoReal concluidos={9} total={3} rotulo="Conquistas obtidas" />);
  expect(screen.getByText("100%", { selector: "strong" })).toBeInTheDocument();
  rerender(<ProgressoReal concluidos={1} total={0} rotulo="Conquistas obtidas" />);
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  expect(screen.getByText(/quando houver etapas/)).toBeInTheDocument();
});
it("carregamento anuncia a operação e ícones são decorativos", () => {
  const { container } = render(
    <>
      <CarregamentoSala />
      <IconeVolume simbolo="pasta" pequeno />
    </>,
  );
  expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  expect(container.querySelector('[data-symbol="pasta"]')).toHaveAttribute("aria-hidden", "true");
  expect(container.querySelector('[data-symbol="pasta"] svg')).toBeInTheDocument();
});
it("erro oferece uma nova consulta com retry", () => {
  const retry = vi.fn();
  render(<ErroDoApp error={new Error("falha")} retry={retry} />);
  fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
  expect(retry).toHaveBeenCalledOnce();
});
