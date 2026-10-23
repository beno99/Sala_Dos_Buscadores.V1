import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { FormCadastroConvite } from "@/features/anfitriao/ui/FormCadastroConvite";
import { FormCadastro } from "@/features/auth/FormCadastro";
import { destinoSeguro } from "@/features/auth/validacao";
import { situacaoDoConvite } from "@/server/anfitriao/usuarios";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Criar conta" };

export default async function Pagina(props: PageProps<"/cadastro">) {
  const { voltar, convite } = await props.searchParams;
  const membro = await membroAtual();

  // Cadastro pelo link do convite de anfitrião (§2.3).
  if (typeof convite === "string") {
    if (membro) {
      return (
        <CenarioConta cadastro>
          <Alerta
            title="Você já está numa conta"
            actions={
              <ButtonLink href={"/" as Route} variant="secondary" size="sm">
                Ir para o Portal
              </ButtonLink>
            }
          >
            O convite cria uma conta nova de anfitrião. Saia da conta atual para usá-lo, ou peça à curadoria
            que promova esta conta.
          </Alerta>
        </CenarioConta>
      );
    }
    const { convite: dados, erro } = situacaoDoConvite(convite);
    if (!dados || erro) {
      return (
        <CenarioConta cadastro>
          <Alerta
            variant="error"
            title={`Erro: ${erro ?? "convite inválido."}`}
            actions={
              <ButtonLink href={"/cadastro" as Route} variant="secondary" size="sm">
                Criar conta de membro
              </ButtonLink>
            }
          >
            A curadoria pode enviar um novo convite para o mesmo e-mail.
          </Alerta>
        </CenarioConta>
      );
    }
    return (
      <CenarioConta cadastro>
        <FormCadastroConvite token={convite} email={dados.email} />
      </CenarioConta>
    );
  }

  // Quem já está na conta não precisa entrar de novo.
  if (membro) redirect(destinoSeguro(typeof voltar === "string" ? voltar : null) as Route);
  return (
    <CenarioConta cadastro>
      <FormCadastro voltar={destinoSeguro(typeof voltar === "string" ? voltar : null)} />
    </CenarioConta>
  );
}
