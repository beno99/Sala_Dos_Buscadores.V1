import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CITACOES } from "@/data/mock/citacoes";
import { CONTEUDOS } from "@/data/mock/conteudos";
import { FONTES } from "@/data/mock/fontes";
import { SALAS } from "@/data/mock/salas";
import { VIDEOS } from "@/data/mock/videos";
import type { Conteudo, Sala } from "@/data/types";
import { renderComProviders } from "../../../tests/support/render";
import { LeituraConteudo } from "./LeituraConteudo";

const sala = SALAS.find((s) => s.slug === "caibalion") as Sala;
const artigo = CONTEUDOS.find((c) => c.slug === "sete-principios-hermeticos") as Conteudo;
const poimandres = CONTEUDOS.find((c) => c.sala === "corpus-hermeticum") as Conteudo;

function renderLeitura(parcial: Partial<Parameters<typeof LeituraConteudo>[0]> = {}) {
  return renderComProviders(
    <LeituraConteudo
      sala={sala}
      conteudo={artigo}
      citacao={CITACOES.find((c) => c.id === "caibalion-mentalismo")}
      fontes={FONTES.filter((f) => artigo.fontes.includes(f.id))}
      videos={VIDEOS.filter((v) => v.id === "v-caibalion-principios")}
      relacionados={[poimandres]}
      imagemCard="/imagens/conteudos/sete-principios-hermeticos.webp"
      {...parcial}
    />,
  );
}

describe("LeituraConteudo", () => {
  it("mostra o título, o lead, o intertítulo, o destaque com atribuição e a imagem com alt e crédito", () => {
    renderLeitura();
    expect(screen.getByRole("heading", { level: 1, name: artigo.titulo })).toBeInTheDocument();
    const corpo = document.querySelector("[data-leitura]") as HTMLElement;
    expect(corpo.querySelector(".sdb-articlebody__lead")).toHaveTextContent(/publicado em Chicago em 1908/);
    expect(
      within(corpo).getByRole("heading", { level: 2, name: "O que a pesquisa diz" }),
    ).toBeInTheDocument();
    const destaque = corpo.querySelector("figure.sdb-pullquote") as HTMLElement;
    expect(destaque.querySelector("blockquote")).toHaveTextContent(
      /O que está em cima é como o que está embaixo/,
    );
    expect(destaque.querySelector("figcaption")).toHaveTextContent(
      "O Caibalion, cap. II (1908), em tradução da equipe",
    );
    const imagem = within(corpo).getByRole("img", { name: /templo no alto de sete degraus/ });
    expect(imagem.closest("figure")).toHaveTextContent(/Pintura alquímica, provavelmente séc\. XVII/);
  });

  it("o banner usa a imagem do card, com alt e crédito do item de imagens do acervo", () => {
    renderLeitura();
    const banner = document.querySelector(".sdb-roombanner") as HTMLElement;
    expect(within(banner).getByRole("img", { name: /figura coroada/ })).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Éliphas Lévi/);
  });

  it("sem imagem, o banner é a placa da Sala", () => {
    renderLeitura({ imagemCard: undefined });
    const banner = document.querySelector(".sdb-roombanner") as HTMLElement;
    expect(banner.querySelector("img")).toBeNull();
    expect(banner.querySelector(".sdb-plate")).not.toBeNull();
  });

  it("autoria e dados: o Selo de proveniência e a explicação sempre aparecem; a divergência, quando existe", () => {
    renderLeitura();
    const autoria = screen.getByRole("region", { name: "Autoria e dados" });
    expect(within(autoria).getByText("Equipe editorial da Sala O Caibalion")).toBeInTheDocument();
    expect(within(autoria).getByText("Editorial curado")).toBeInTheDocument();
    expect(within(autoria).getByText("Escrito e revisado pela equipe da Sala.")).toBeInTheDocument();
    expect(within(autoria).getByText("Leitura")).toBeInTheDocument();
    expect(screen.getByText("Atenção: este tema tem leituras divergentes")).toBeInTheDocument();
  });

  it("lateral: vídeos do assunto, trecho e fontes; cada bloco some quando está vazio", () => {
    const { unmount } = renderLeitura();
    expect(screen.getByRole("heading", { name: "Vídeos do assunto" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trecho de fonte primária" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fontes" })).toBeInTheDocument();
    unmount();
    renderLeitura({ videos: [], citacao: undefined, fontes: [] });
    expect(screen.queryByRole("heading", { name: "Vídeos do assunto" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Trecho de fonte primária" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Fontes" })).toBeNull();
    expect(screen.queryByRole("complementary", { name: "Para acompanhar a leitura" })).toBeNull();
  });

  it("Continuar a busca: Comparar, assistente, Ver todos e os cards; sem relacionados, só os chips e o assistente", () => {
    const { unmount } = renderLeitura();
    expect(screen.getByRole("link", { name: "Comparar: Origem do universo" })).toHaveAttribute(
      "href",
      "/comparar?tema=origem-do-universo",
    );
    expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute(
      "href",
      "/biblioteca?tema=conhecimento-interior",
    );
    expect(screen.getByRole("link", { name: poimandres.titulo })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver mais conteúdos" })).toBeInTheDocument();
    unmount();
    renderLeitura({ relacionados: [] });
    expect(screen.getByRole("link", { name: "Perguntar ao assistente" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ver todos" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Ver mais conteúdos" })).toBeNull();
    expect(screen.queryByRole("region", { name: "conteúdos" })).toBeNull();
  });

  it("artigo de anfitrião com YouTube: o player ocupa o lugar do banner e o nome leva à página do anfitrião", () => {
    renderLeitura({
      conteudo: {
        ...artigo,
        proveniencia: "anfitriao",
        anfitriao: { nome: "Helena Varga", credencial: "Pesquisadora", slug: "helena-varga" },
        autoria: { nome: "Helena Varga", credencial: "Pesquisadora" },
        link: {
          tipo: "youtube",
          url: "https://www.youtube.com/watch?v=abcdefghijk",
          youtubeId: "abcdefghijk",
        },
      },
    });
    expect(document.querySelector(".sdb-roombanner")).toBeNull();
    expect(screen.getByTitle(`Vídeo: ${artigo.titulo}`)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Helena Varga" })).toHaveAttribute(
      "href",
      "/anfitrioes/helena-varga",
    );
  });
});
