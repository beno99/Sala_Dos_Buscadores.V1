import type { Metadata } from "next";
import { FormRecuperar } from "@/features/auth/FormRecuperar";
import { destinoSeguro } from "@/features/auth/validacao";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function Pagina(props: PageProps<"/recuperar-senha">) {
  const { voltar } = await props.searchParams;
  return (
    <div className="w-full">
      <FormRecuperar voltar={destinoSeguro(typeof voltar === "string" ? voltar : null)} />
    </div>
  );
}
