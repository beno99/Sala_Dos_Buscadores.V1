import "server-only";
import { publicacoesVisiveisComunidade } from "@/data/repositorio";
import { ListaPublicacoes } from "./ListaPublicacoes";
/** Componente isolado para o painel da aba Conversas. A página da Sala é mantida por outra sessão. */
export function ConversasDaSala({ salaSlug }: { salaSlug: string }) {
  const lista = publicacoesVisiveisComunidade()
    .filter((p) => p.salaSlug === salaSlug)
    .sort((a, b) => Number(b.fixada) - Number(a.fixada) || b.criadaEm.localeCompare(a.criadaEm));
  return (
    <section className="sdb-community" aria-label="Conversas da Sala">
      <ListaPublicacoes
        publicacoes={lista}
        agora={new Date().toISOString()}
        vazio="Ainda sem conversas nesta Sala"
        descricao="Os estudos associados a esta Sala aparecerão aqui."
      />
    </section>
  );
}
