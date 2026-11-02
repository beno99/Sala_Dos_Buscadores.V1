import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { FormEntrar } from "@/features/auth/FormEntrar";
import { destinoAposLogin } from "@/features/auth/validacao";
import { membroAtual } from "@/modules/conta/conta.controller";

export const metadata: Metadata = { title: "Entrar" };

export default async function Pagina(props: PageProps<"/entrar">) {
  const { voltar } = await props.searchParams;
  // Quem já está na conta não precisa entrar de novo.
  const membro = await membroAtual();
  if (membro) redirect(destinoAposLogin(membro, typeof voltar === "string" ? voltar : null) as Route);
  return (
    <CenarioConta>
      <FormEntrar voltar={typeof voltar === "string" ? voltar : undefined} />
    </CenarioConta>
  );
}
