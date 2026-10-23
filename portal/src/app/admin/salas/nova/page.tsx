import type { Metadata } from "next";
import { salaOficialVazia } from "@/features/admin/regras/sala";
import { EditorSalaOficial } from "@/features/admin/ui/salas/EditorSalaOficial";

export const metadata: Metadata = { title: "Nova Sala" };

/** Primeiro existe a Sala; dentro dela nascem artigos e vídeos. */
export default function NovaSala() {
  return (
    <EditorSalaOficial
      inicial={salaOficialVazia()}
      imagem={null}
      status="rascunho"
      atualizadoEm={null}
      slugTravado={false}
    />
  );
}
