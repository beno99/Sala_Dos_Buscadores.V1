import type { Metadata } from "next";
import { filtrarSalas, lerFiltrosSalas } from "@/features/admin/listas";
import { ListaSalasAdmin } from "@/features/admin/ui/salas/ListaSalasAdmin";
import { listarSalasAdmin } from "@/server/admin/salas";
import { imagemDaSala } from "@/server/imagens";

export const metadata: Metadata = { title: "Salas" };

/** Lista de Salas (curadoria a partir da Sala, §3): oficiais e de anfitriões, com filtros e exportação. */
export default async function Salas(props: PageProps<"/admin/salas">) {
  const filtros = lerFiltrosSalas(await props.searchParams);
  const todas = listarSalasAdmin();
  const anfitrioes = new Map<string, string>();
  for (const r of todas) if (r.donoId) anfitrioes.set(r.donoId, r.anfitriao ?? "Anfitrião");
  const linhas = filtrarSalas(todas, filtros).map((r) => ({
    id: r.sala.id,
    slug: r.sala.slug,
    nome: r.sala.nome,
    tradicao: r.sala.tradicao,
    origem: r.sala.origem,
    anfitriao: r.anfitriao,
    donoId: r.donoId,
    status: r.sala.status,
    artigos: r.artigos,
    videos: r.videos,
    naComparacao: r.sala.naComparacao,
    atualizadaEm: r.sala.atualizadoEm,
    imagem: imagemDaSala(r.sala),
    placa: r.sala.placa,
    foraDoAr: r.foraDoAr,
  }));
  return (
    <ListaSalasAdmin
      salas={linhas}
      filtros={filtros}
      anfitrioes={[...anfitrioes].map(([id, nome]) => ({ id, nome }))}
    />
  );
}
