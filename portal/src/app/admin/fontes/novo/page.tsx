import type { Metadata } from "next";
import { fonteVazia } from "@/features/admin/formularios";
import { EditorFonte } from "@/features/admin/ui/EditorFonte";

export const metadata: Metadata = { title: "Nova fonte" };

export default function NovaFonte() {
  return <EditorFonte inicial={fonteVazia()} usos={[]} />;
}
