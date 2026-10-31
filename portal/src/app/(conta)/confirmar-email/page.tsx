import type { Metadata } from "next";
import { CenarioConta } from "@/components/ds/CenarioConta";
import { ConfirmarEmail } from "@/features/auth/ConfirmarEmail";

export const metadata: Metadata = { title: "Confirmar e-mail" };

export default async function Pagina(props: PageProps<"/confirmar-email">) {
  const { token } = await props.searchParams;
  return (
    <CenarioConta>
      <ConfirmarEmail token={typeof token === "string" ? token : undefined} />
    </CenarioConta>
  );
}
