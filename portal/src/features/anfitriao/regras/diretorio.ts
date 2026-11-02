import type { AssinaturaAnfitriao } from "@/data/types";

/** Só assinaturas de Salas públicas recebidas do catálogo; nunca lista contas administrativas. */
export function assinaturasPublicadas(salas: readonly { anfitriao?: AssinaturaAnfitriao }[]) {
  return [
    ...new Map(
      salas.flatMap((s) => (s.anfitriao ? [[s.anfitriao.slug, s.anfitriao] as const] : [])),
    ).values(),
  ];
}
