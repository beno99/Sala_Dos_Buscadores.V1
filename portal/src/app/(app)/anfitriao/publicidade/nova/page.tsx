import type { Metadata } from "next";
import { EditorPublicidade } from "@/features/publicidade/EditorPublicidade";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";
import { acervo } from "@/server/store";
export const metadata: Metadata = { title: "Criar publicidade" };
export default async function CriarPublicidade() {
  const membro = await anfitriaoDaPagina();
  return <EditorPublicidade nomeAnunciante={acervo().perfis.get(membro.id)?.nome ?? membro.pseudonimo} />;
}
