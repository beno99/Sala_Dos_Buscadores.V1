import type { Metadata } from "next";
import { acervoPublico, listarSalas, videosDeEstudo } from "@/data/repositorio";
import { CatalogoVideos } from "@/features/acervo/CatalogoVideos";
import { progressoDe } from "@/server/progresso";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: "Vídeos" };
export default async function Videos() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const { videos } = acervoPublico();
  const salas = (await listarSalas()).map(({ slug, nome, origem }) => ({ slug, nome, origem }));
  const jornada = {
    concluidos: (progressoDe(membro.id).videosConcluidos ?? []).map((v) => v.id),
    proprios: videosDeEstudo()
      .filter((v) => v.donoId === membro.id)
      .map((v) => v.id),
  };
  return <CatalogoVideos videos={videos} salas={salas} jornada={jornada} />;
}
