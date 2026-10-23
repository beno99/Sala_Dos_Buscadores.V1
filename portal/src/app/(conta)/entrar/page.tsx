import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { CONTA_DEMONSTRACAO } from "@/features/auth/contas";
import { FormEntrar } from "@/features/auth/FormEntrar";
import { destinoSeguro } from "@/features/auth/validacao";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Entrar" };

export default async function Pagina(props: PageProps<"/entrar">) {
  const { voltar } = await props.searchParams;
  // Quem já está na conta não precisa entrar de novo.
  if (await membroAtual()) redirect(destinoSeguro(typeof voltar === "string" ? voltar : null) as Route);
  return (
    <CenarioConta>
      <FormEntrar
        voltar={destinoSeguro(typeof voltar === "string" ? voltar : null)}
        dica={{ email: CONTA_DEMONSTRACAO.email, senha: CONTA_DEMONSTRACAO.senha }}
      />
    </CenarioConta>
  );
}
