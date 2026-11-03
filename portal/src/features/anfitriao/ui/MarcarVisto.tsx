"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  marcarAnuncioVistoAcao,
  marcarNovidadesVistasAcao,
  marcarVideoVistoAcao,
} from "@/server/anfitriao/acoes";

/** Abrir o item marca como vistas as decisões da curadoria sobre ele (§10) e atualiza o contador. */
export function MarcarVisto({
  tipo,
  id,
  pendente,
}: {
  tipo: "sala" | "artigo" | "video" | "anuncio";
  id: string;
  pendente: boolean;
}) {
  const router = useRouter();
  const feito = useRef(false);
  useEffect(() => {
    if (!pendente || feito.current) return;
    feito.current = true;
    const marcar =
      tipo === "video"
        ? marcarVideoVistoAcao(id)
        : tipo === "anuncio"
          ? marcarAnuncioVistoAcao(id)
          : marcarNovidadesVistasAcao(tipo, id);
    void marcar.then((r) => {
      if (r.ok) router.refresh();
    });
  }, [pendente, tipo, id, router]);
  return null;
}
