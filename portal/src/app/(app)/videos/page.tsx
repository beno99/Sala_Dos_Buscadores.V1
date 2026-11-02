import type { Metadata } from "next";
import { acervoPublico, listarSalas } from "@/data/repositorio";
import { CatalogoVideos } from "@/features/acervo/CatalogoVideos";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: "Vídeos" };
export default async function Videos() {
  if (!(await membroAtual())) return redirecionarParaEntrar();
  const { videos } = acervoPublico();
  const salas = (await listarSalas()).map(({ slug, nome, origem }) => ({ slug, nome, origem }));
  return <CatalogoVideos videos={videos} salas={salas} />;
}
