import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { PublicacaoLeitura } from "@/features/comunidade/ui/PublicacaoLeitura";
import { consultarComunidade } from "@/server/comunidade/consultas";
export const metadata = { title: "Publicação da Comunidade" };
export default async function Publicacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await consultarComunidade();
  const p = m.publicacoes.find((p) => p.id === id);
  if (!p) notFound();
  return (
    <div className="sdb-community sdb-community-piece sdb-community-stack">
      <header className="sdb-community__head">
        <h1 className="sdb-title-1">Publicação</h1>
        <ButtonLink href="/comunidade" variant="plain">
          Voltar à Comunidade
        </ButtonLink>
      </header>
      <PublicacaoLeitura p={p} agora={m.agora} completa visao={m.visao} opcoes={m.opcoes} />
    </div>
  );
}
