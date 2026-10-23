import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderComProviders } from "../../../tests/support/render";
import { CampoImagem, type ImagemEnviada } from "./CampoImagem";

function Campo() {
  const [valor, setValor] = useState<ImagemEnviada | null>(null);
  return <CampoImagem label="Imagem da Sala" opcional valor={valor} onMudar={setValor} />;
}

describe("CampoImagem", () => {
  it("recusa tipo errado no navegador, sem enviar", async () => {
    const enviar = vi.spyOn(globalThis, "fetch");
    renderComProviders(<Campo />);
    const gif = new File(["GIF89a"], "foto.gif", { type: "image/gif" });
    // Arrastar ignora o "accept" do input: o componente confere o tipo de novo.
    fireEvent.change(screen.getByLabelText(/Imagem da Sala/), { target: { files: [gif] } });
    expect(await screen.findByText(/o arquivo precisa ser JPEG, PNG ou WebP/)).toBeInTheDocument();
    expect(enviar).not.toHaveBeenCalled();
  });

  it("envia a imagem, mostra a prévia e remove", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, id: "m-1", url: "/midia/m-1" }), { status: 201 }),
    );
    const { user } = renderComProviders(<Campo />);
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "codice.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/Imagem da Sala/), png);
    expect(await screen.findByText("codice.png")).toBeInTheDocument();
    expect(document.querySelector(".sdb-upload")).toHaveClass("has-file");
    await user.click(screen.getByRole("button", { name: "Remover" }));
    expect(document.querySelector(".sdb-upload")).not.toHaveClass("has-file");
  });

  it("mostra o erro que o servidor devolve (magic bytes)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: false, erro: "o arquivo precisa ser JPEG, PNG ou WebP." }), {
        status: 422,
      }),
    );
    const { user } = renderComProviders(<Campo />);
    const falso = new File(["não é png"], "falso.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/Imagem da Sala/), falso);
    expect(await screen.findByText(/o arquivo precisa ser JPEG, PNG ou WebP/)).toBeInTheDocument();
  });
});
