import type { Metadata } from "next";
import { LixeiraArtigos } from "@/features/admin/ui/LixeiraArtigos";
import { listarArtigosArquivados } from "@/server/admin/consultas";
import { exigirAdmin } from "@/server/sessao";
export const metadata: Metadata = { title: "Lixeira de Artigos" };
export default async function Lixeira() {
  await exigirAdmin();
  return <LixeiraArtigos artigos={listarArtigosArquivados()} />;
}
