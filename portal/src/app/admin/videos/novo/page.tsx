import type { Metadata } from "next";
import { videoVazio } from "@/features/admin/formularios";
import { EditorVideo } from "@/features/admin/ui/EditorVideo";
import { listarArtigos } from "@/server/admin/consultas";

export const metadata: Metadata = { title: "Novo vídeo" };

export default function NovoVideo() {
  const artigos = listarArtigos().map(({ id, titulo, sala, status }) => ({ id, titulo, sala, status }));
  return <EditorVideo inicial={videoVazio()} status="rascunho" atualizadoEm={null} artigos={artigos} />;
}
