import type { Metadata } from "next";
import { FeedComunidade } from "@/features/comunidade/ui/FeedComunidade";
import { consultarComunidade } from "@/server/comunidade/consultas";
export const metadata: Metadata = { title: "Comunidade" };
export default async function Comunidade({
  searchParams,
}: {
  searchParams: Promise<{ sala?: string; tema?: string }>;
}) {
  const filtros = await searchParams;
  return (
    <FeedComunidade
      key={`${filtros.sala ?? ""}/${filtros.tema ?? ""}`}
      modelo={await consultarComunidade()}
      sala={typeof filtros.sala === "string" ? filtros.sala : undefined}
      tema={typeof filtros.tema === "string" ? filtros.tema : undefined}
    />
  );
}
