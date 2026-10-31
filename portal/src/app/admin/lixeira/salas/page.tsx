import type { Metadata } from "next";
import { LixeiraSalas } from "@/features/admin/ui/salas/LixeiraSalas";
import { listarLixeiraSalas } from "@/server/salas/lixeira";
import { exigirAdmin } from "@/server/sessao";
export const metadata: Metadata = { title: "Lixeira de Salas" };
export default async function Lixeira() {
  await exigirAdmin();
  return <LixeiraSalas salas={listarLixeiraSalas()} />;
}
