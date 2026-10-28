import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CabecalhoAssistente } from "@/components/ds/CabecalhoAssistente";
import { renderComProviders } from "../../../tests/support/render";
import { ASSISTENTE_INDISPONIVEL, validarPedido } from "./contrato";
import type { Resposta } from "./motor";
import { TelaAssistente } from "./TelaAssistente";

vi.mock("@/components/ds/EsferaAssistente", () => ({
  EsferaAssistente: ({ onPerguntar }: { onPerguntar: () => void }) => (
    <button type="button" onClick={onPerguntar}>
      Começar uma pergunta
    </button>
  ),
}));
const salas = [
  { slug: "nag-hammadi", nome: "Biblioteca de Nag Hammadi" },
  { slug: "corpus-hermeticum", nome: "Corpus Hermeticum" },
];
const resposta: Resposta = {
  id: "teste",
  pergunta: "Pergunta de teste",
  escopo: "todo",
  trechos: [
    {
      tipo: "ai",
      rotulo: "Síntese da IA",
      texto: "Resposta controlada exclusivamente pelo teste.",
      refs: [],
    },
  ],
  fontes: [],
  salasConsultadas: 0,
  trechosLidos: 0,
  semFonte: true,
};
const tela = (
  <>
    <CabecalhoAssistente conta={null} onBuscar={() => {}} />
    <TelaAssistente salas={salas} />
  </>
);
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true })),
  );
});

describe("contrato do assistente", () => {
  it("valida modo, Sala publicada, limite e pergunta no servidor", () => {
    for (const modo of ["explorar", "comparar", "leitura"])
      expect(
        validarPedido({ pergunta: "  Pleroma? ", modo, escopo: "nag-hammadi" }, ["nag-hammadi"]),
      ).toEqual({ pergunta: "Pleroma?", modo, escopo: "nag-hammadi" });
    for (const p of [
      { pergunta: "" },
      { pergunta: "x".repeat(2001) },
      { modo: "toString" },
      { escopo: "sala-privada" },
    ])
      expect(validarPedido({ pergunta: "Alma?", modo: "explorar", escopo: "todo", ...p }, [])).toBeNull();
  });
});
describe("TelaAssistente", () => {
  it("prepara sugestões editáveis e conserva contexto/rascunho ao trocar aparência pausada", async () => {
    const consultar = vi.fn().mockRejectedValue(new Error(ASSISTENTE_INDISPONIVEL));
    const { user } = renderComProviders(tela, { consultar });
    await user.click(screen.getByRole("button", { name: /Explorar um texto/ }));
    const campo = screen.getByRole("textbox", { name: "Sua pergunta ao acervo" });
    expect(campo).toHaveValue("Uma leitura do Poimandres.");
    expect(consultar).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Pausar movimento" }));
    await user.click(screen.getByRole("button", { name: "Dourada" }));
    expect(screen.getByRole("combobox", { name: "Modo de estudo" })).toHaveValue("leitura");
    expect(screen.getByRole("combobox", { name: "Sala de estudo" })).toHaveValue("corpus-hermeticum");
    expect(campo).toHaveValue("Uma leitura do Poimandres.");
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(ASSISTENTE_INDISPONIVEL);
    expect(consultar).toHaveBeenCalledWith(
      "Uma leitura do Poimandres.",
      expect.objectContaining({ modo: "leitura", escopo: "corpus-hermeticum" }),
    );
    await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    expect(document.querySelectorAll(".question-bubble")).toHaveLength(1);
    expect(campo).toHaveValue("Uma leitura do Poimandres.");
    await user.click(screen.getByRole("button", { name: "Nova conversa" }));
    expect(campo).toHaveValue("");
    expect(screen.getByRole("combobox", { name: "Modo de estudo" })).toHaveValue("leitura");
    expect(screen.getByRole("button", { name: "Dourada" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Retomar movimento" })).toHaveAttribute("aria-pressed", "true");
  });
  it("não envia durante IME, Shift+Enter ou Enter em dispositivo de toque", async () => {
    const consultar = vi.fn().mockRejectedValue(new Error("offline"));
    const { user } = renderComProviders(tela, { consultar });
    const campo = screen.getByRole("textbox");
    await user.type(campo, "Uma pergunta");
    fireEvent.compositionStart(campo);
    fireEvent.keyDown(campo, { key: "Enter", code: "Enter" });
    fireEvent.compositionEnd(campo);
    fireEvent.keyDown(campo, { key: "Enter", shiftKey: true });
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    fireEvent.keyDown(campo, { key: "Enter" });
    expect(consultar).not.toHaveBeenCalled();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    fireEvent.keyDown(campo, { key: "Enter" });
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));
  });
  it("interrompe, tenta novamente sem duplicar e descarta uma resposta tardia", async () => {
    let concluir: (r: Resposta) => void = () => {};
    const consultar = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Resposta>((resolve) => {
            concluir = resolve;
          }),
      )
      .mockResolvedValue(resposta);
    const { user } = renderComProviders(tela, { consultar });
    await user.type(screen.getByRole("textbox"), "Pergunta de teste");
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await user.click(screen.getByRole("button", { name: "Interromper a consulta" }));
    expect(consultar.mock.calls[0]?.[1].signal.aborted).toBe(true);
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await screen.findByText(resposta.trechos[0]?.texto ?? "");
    await act(async () =>
      concluir({
        ...resposta,
        trechos: [{ tipo: "ai", rotulo: "Síntese da IA", refs: [], texto: "Resposta atrasada" }],
      }),
    );
    expect(screen.queryByText("Resposta atrasada")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".question-bubble")).toHaveLength(1);
    await user.type(screen.getByRole("textbox"), "Outro rascunho");
    await user.click(screen.getByRole("button", { name: "Dourada" }));
    expect(screen.getByRole("textbox")).toHaveValue("Outro rascunho");
    expect(screen.getByText(resposta.trechos[0]?.texto ?? "")).toBeInTheDocument();
  });
  it("nova conversa invalida uma consulta pendente mesmo que o adaptador ignore abort", async () => {
    let concluir: (r: Resposta) => void = () => {};
    const { user } = renderComProviders(tela, {
      consultar: () =>
        new Promise<Resposta>((resolve) => {
          concluir = resolve;
        }),
    });
    await user.type(screen.getByRole("textbox"), "Pergunta de teste");
    await user.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    await user.click(screen.getByRole("button", { name: "Nova conversa" }));
    await user.type(screen.getByRole("textbox"), "Pergunta de teste");
    await act(async () => concluir(resposta));
    expect(document.querySelectorAll(".question-bubble")).toHaveLength(0);
    expect(screen.getByRole("textbox")).toHaveValue("Pergunta de teste");
  });
});
