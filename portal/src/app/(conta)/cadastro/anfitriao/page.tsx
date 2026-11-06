import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { FormCadastroAnfitriao } from "@/features/anfitriao/ui/FormCadastroAnfitriao";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Seja anfitrião" };

export default async function Pagina() {
  const membro = await membroAtual();
  if (membro?.papel === "anfitriao") redirect("/anfitriao" as Route);
  if (membro) {
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
          {membro.papel === "administrador"
            ? "Contas da curadoria não se candidatam a anfitrião."
            : "Envie sua candidatura a anfitrião em Seja anfitrião, com a conta atual."}
        </Alerta>
      </CenarioConta>
    );
  }
  return (
    <CenarioConta cadastro fundo="/imagens/conta/cadastro-anfitriao.webp">
      <FormCadastroAnfitriao />
    </CenarioConta>
  );
}
