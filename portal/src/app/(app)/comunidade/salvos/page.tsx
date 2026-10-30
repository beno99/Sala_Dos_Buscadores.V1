import { ButtonLink } from "@/components/ds/Button";
import { ListaPublicacoes } from "@/features/comunidade/ui/ListaPublicacoes";
import { consultarComunidade } from "@/server/comunidade/consultas";
export const metadata = { title: "Publicações salvas" };
export default async function Salvos() {
  const m = await consultarComunidade();
  return (
    <div className="sdb-community sdb-community-piece sdb-community-stack">
      <header className="sdb-community__head">
        <h1 className="sdb-title-1">Publicações salvas</h1>
        <ButtonLink href="/comunidade" variant="plain">
          Voltar à Comunidade
        </ButtonLink>
      </header>
      <ListaPublicacoes
        publicacoes={m.salvos}
        agora={m.agora}
        visao={m.visao}
        opcoes={m.opcoes}
        vazio="Você ainda não salvou publicações"
        descricao="As publicações que você salvar ficarão reunidas aqui, só para você."
      />
    </div>
  );
}
