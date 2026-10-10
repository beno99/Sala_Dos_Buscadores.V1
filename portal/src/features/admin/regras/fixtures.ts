import { artigoVazio, type FormArtigo, type FormVideo, videoVazio } from "../formularios";

/** Artigo completo, pronto para publicar, na Sala do Corpus Hermeticum. Só para testes. */
export function artigoCompleto(parcial: Partial<FormArtigo> = {}): FormArtigo {
  return {
    ...artigoVazio("corpus-hermeticum"),
    titulo: "O Tratado X e o silêncio divino",
    resumo: "Como o Tratado X descreve o conhecimento de Deus como silêncio e suspensão dos sentidos.",
    temas: ["meditacao"],
    nivel: 2,
    periodo: "séc. II – III",
    duracaoMin: 8,
    proveniencia: "curado",
    autoria: { nome: "Equipe editorial da Sala Corpus Hermeticum", credencial: "Curadoria" },
    corpo: ["Segundo o _Tratado X_, o conhecimento de Deus é *silêncio divino* e suspensão dos sentidos."],
    fontes: ["copenhaver-hermetica"],
    situacaoJuridica: { tipo: "trecho-permitido" },
    ...parcial,
  };
}

export function videoCompleto(parcial: Partial<FormVideo> = {}): FormVideo {
  return {
    ...videoVazio(),
    sala: "corpus-hermeticum",
    titulo: "O silêncio no Tratado X",
    url: "https://youtu.be/dQw4w9WgXcQ",
    duracao: "12:30",
    tema: "meditacao",
    nivel: 2,
    episodio: "Episódio 14",
    ...parcial,
  };
}
