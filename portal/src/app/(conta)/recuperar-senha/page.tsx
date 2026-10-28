import type { Metadata } from "next";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { FormNovaSenha } from "@/features/auth/FormNovaSenha";
import { FormRecuperar } from "@/features/auth/FormRecuperar";
import { destinoSeguro } from "@/features/auth/validacao";
import { contas } from "@/modules/conta";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function Pagina(props: PageProps<"/recuperar-senha">) {
  const { voltar, token } = await props.searchParams;
  const destino = destinoSeguro(typeof voltar === "string" ? voltar : null);
  const link = typeof token === "string" ? token : "";
  const valido = link ? await contas.linkDeRedefinicaoValido(link) : false;
  return (
    <CenarioConta>
      {valido ? (
        <FormNovaSenha token={link} voltar={destino} />
      ) : (
        <FormRecuperar voltar={destino} linkVencido={Boolean(link)} />
      )}
    </CenarioConta>
  );
}
