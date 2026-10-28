import type { Metadata } from "next";
import { salaPorSlug } from "@/data/catalogo";
import { acervoPublico, resumirSala } from "@/data/repositorio";
import { EstanteCliente, type ItemNaEstante } from "@/features/estante/EstanteCliente";
import { imagemDaSala } from "@/server/imagens";
import { progressoDe } from "@/server/progresso";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Estante" };

/**
 * Estante: as Salas, os artigos e os vídeos que a própria conta salvou, do mais
 * recente para o mais antigo. Itens que saíram do ar não aparecem.
 */
export default async function Estante() {
  const membro = await membroAtual();
  const estante = membro ? progressoDe(membro.id).estante : [];
  const publico = acervoPublico();
  const itens = estante.flatMap((e): ItemNaEstante[] => {
    if (e.tipo === "sala") {
      const sala = salaPorSlug(e.ref);
      return sala ? [{ tipo: "sala", sala: resumirSala(sala), imagem: imagemDaSala(sala) }] : [];
    }
    if (e.tipo === "video") {
      const video = publico.videos.find((v) => v.id === e.ref);
      return video ? [{ tipo: "video", video, nomeSala: salaPorSlug(video.sala)?.nome ?? "" }] : [];
    }
    const conteudo = publico.conteudos.find((c) => `${c.sala}/${c.slug}` === e.ref);
    return conteudo ? [{ tipo: "conteudo", conteudo }] : [];
  });
  return <EstanteCliente itens={itens} />;
}
