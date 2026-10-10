import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";
import { FormCadastro } from "@/features/auth/FormCadastro";
import { destinoSeguro } from "@/features/auth/validacao";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Criar conta" };

export default async function Pagina(props: PageProps<"/cadastro">) {
  const { voltar } = await props.searchParams;
  // Quem já está na conta não precisa entrar de novo.
  if (await membroAtual()) redirect(destinoSeguro(typeof voltar === "string" ? voltar : null) as Route);
  return (
    <div className="w-full">
      <FormCadastro voltar={destinoSeguro(typeof voltar === "string" ? voltar : null)} />
    </div>
  );
}
