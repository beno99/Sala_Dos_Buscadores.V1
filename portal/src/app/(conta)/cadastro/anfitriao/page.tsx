import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { Candidatura } from "@/features/anfitriao/ui/Candidatura";
import { FormCadastroAnfitriao } from "@/features/anfitriao/ui/FormCadastroAnfitriao";
import { ultimaCandidaturaDe } from "@/server/anfitriao/usuarios";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Seja anfitrião" };

export default async function Pagina() {
  const membro = await membroAtual();
  if (membro?.papel === "anfitriao") redirect("/anfitriao" as Route);
  if (membro?.papel === "administrador") {
    return (
      <CenarioConta cadastro fundo="/imagens/conta/cadastro-anfitriao.webp">
        <Alerta
          title="Você já está numa conta"
          actions={
            <ButtonLink href={"/portal" as Route} variant="secondary" size="sm">
              Ir para o Portal
            </ButtonLink>
          }
        >
          Contas da curadoria não se candidatam a anfitrião.
        </Alerta>
      </CenarioConta>
    );
  }
  if (membro) {
    return (
      <CenarioConta cadastro fundo="/imagens/conta/cadastro-anfitriao.webp">
        <Candidatura ultima={ultimaCandidaturaDe(membro.id)} pseudonimo={membro.pseudonimo} />
      </CenarioConta>
    );
  }
  return (
    <CenarioConta cadastro fundo="/imagens/conta/cadastro-anfitriao.webp">
      <FormCadastroAnfitriao />
    </CenarioConta>
  );
}
