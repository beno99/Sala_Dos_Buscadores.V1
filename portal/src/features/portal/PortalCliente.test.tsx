import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CONTEUDOS } from "@/data/semente/conteudos";
import type { ModeloPortal } from "@/server/estudo";
import { PortalCliente } from "./PortalCliente";

vi.mock("@/features/estudo/BotaoSalvar", () => ({
  BotaoSalvar: () => <button type="button">Salvar</button>,
}));
const conteudo = CONTEUDOS[0];
if (!conteudo) throw new Error("Fixture de conteúdo ausente");
const vazio: ModeloPortal = {
  slidesAnuncio: [],
  episodios: [],
  salas: [],
  temas: [],
  indicadores: [],
  emAndamento: [],
  comecePorAqui: [],
  recentes: [],
  mostrarNiveis: false,
};
describe("estados honestos do Portal", () => {
  it("sem retomada, sugestões, Salas, novidades e anúncio mantém destinos reais e estado neutro", () => {
    render(<PortalCliente modelo={vazio} />);
    expect(screen.getByRole("heading", { name: "Comece sua busca" })).toBeVisible();
    expect(screen.getByText("Escolha uma leitura para começar.")).toBeVisible();
    expect(screen.getByText("Explore o acervo para encontrar sua próxima leitura.")).toBeVisible();
    expect(screen.getByText("Sem novidades por enquanto.")).toBeVisible();
    expect(screen.getByText("Nenhuma Sala disponível por enquanto.")).toBeVisible();
    expect(screen.queryByRole("complementary", { name: "Publicidade" })).not.toBeInTheDocument();
    expect(screen.queryByText(/% lido/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver conquistas" })).toHaveAttribute("href", "/conquistas");
  });
  it("ocultar níveis remove selo e quanto falta, mesmo se o contrato contiver nível", () => {
    const { container } = render(
      <PortalCliente
        modelo={{
          ...vazio,
          ampliar: { conteudo: conteudo, motivo: "Outra leitura" },
          nivelFoco: {
            nivel: 2,
            assunto: "Corpus Hermeticum",
            degraus: [1, 0.5, 0],
            quantoFalta: "Falta uma leitura",
          },
        }}
      />,
    );
    expect(container.querySelector(".sdb-level")).toBeNull();
    expect(screen.queryByText("Falta uma leitura")).not.toBeInTheDocument();
  });
  it("imagem quebrada mantém fallback e barra corresponde ao percentual real", () => {
    const { container } = render(
      <PortalCliente
        modelo={{ ...vazio, emAndamento: [{ conteudo: conteudo, imagem: "/inexistente.webp", pct: 38 }] }}
      />,
    );
    const retomada = screen.getByRole("region", { name: "Continue sua busca" });
    expect(within(retomada).getByText("38% lido")).toBeVisible();
    expect(retomada.querySelector(".sdb-progress__track i")).toHaveStyle({ "--p": "0.38" });
    const foto = container.querySelector(".sdb-retomada img") as HTMLImageElement;
    fireEvent.error(foto);
    expect(container.querySelector(".sdb-retomada img")).toBeNull();
    expect(container.querySelector(".sdb-retomada .sdb-imagem-acervo__fallback")).not.toBeNull();
  });
  it("percentual indisponível não vira zero conhecido", () => {
    render(<PortalCliente modelo={{ ...vazio, emAndamento: [{ conteudo, pct: Number.NaN }] }} />);
    const retomada = screen.getByRole("region", { name: "Continue sua busca" });
    expect(within(retomada).queryByText(/% lido/)).not.toBeInTheDocument();
    expect(retomada.querySelector(".sdb-progress__track")).toBeNull();
    expect(within(retomada).getByRole("link", { name: /^Retomar leitura/ })).toBeVisible();
  });
});
