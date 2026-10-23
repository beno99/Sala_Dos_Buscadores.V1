import "server-only";
import { imagemDaSala } from "../imagens";
import { salaOficialDaRota } from "./rotas";
import { impactoDeArquivar, resumirSalaAdmin } from "./salas";

/** Dados do cabeçalho da Sala oficial na curadoria (comum às abas Artigos e Vídeos). */
export function cabecalhoDaSala(slug: string) {
  const sala = salaOficialDaRota(slug);
  const resumo = resumirSalaAdmin(sala);
  return {
    sala,
    cabecalho: {
      sala: {
        id: sala.id,
        slug: sala.slug,
        nome: sala.nome,
        tradicao: sala.tradicao,
        status: sala.status,
        imagem: imagemDaSala(sala),
        placa: sala.placa,
      },
      foraDoAr: resumo.foraDoAr,
      impacto: impactoDeArquivar(sala.slug),
      contagens: { artigos: resumo.artigos.total, videos: resumo.videos },
    },
  };
}
