import { screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { publicacaoComunidadePorId } from "@/data/repositorio";
import { restaurarAcervoInicial } from "@/server/store";
import { renderComProviders } from "../../../../tests/support/render";
import { PublicacoesPerfil } from "./PublicacoesPerfil";

it("mantém o estado pessoal ao abrir a aba de publicações de outra pessoa", async () => {
  restaurarAcervoInicial();
  const p = publicacaoComunidadePorId("p-demo-4");
  if (!p) throw new Error("Seed ausente");
  const { user } = renderComProviders(
    <PublicacoesPerfil publicacoes={[p]} agora={new Date().toISOString()} curtidas={[p.id]} salvos={[p.id]}>
      <p>Sobre o anfitrião</p>
    </PublicacoesPerfil>,
  );
  await user.click(screen.getByRole("tab", { name: /Publicações\s*1/ }));
  expect(screen.getByRole("button", { name: "Remover publicação dos salvos" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("button", { name: /Desfazer curtida/ })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: /Desfazer curtida/ })).toBeDisabled();
  expect(screen.getByRole("link", { name: "Abrir publicação" })).toHaveAttribute(
    "href",
    "/comunidade/p/p-demo-4",
  );
});
