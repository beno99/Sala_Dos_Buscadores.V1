import type { Route } from "next";
import { redirect } from "next/navigation";
import { listarSalasAdmin } from "@/server/admin/salas";

export default async function NovoVideo(props: PageProps<"/admin/videos/novo">) {
  const { sala } = await props.searchParams;
  const valida = listarSalasAdmin().some(
    (r) => r.sala.slug === sala && r.sala.origem === "oficial" && r.sala.status !== "arquivado",
  );
  redirect((valida ? `/admin/salas/${sala}/videos/novo` : "/admin/videos") as Route);
}
