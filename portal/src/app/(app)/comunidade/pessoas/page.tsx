import { PessoasComunidade } from "@/features/comunidade/ui/PessoasComunidade";
import { consultarComunidade } from "@/server/comunidade/consultas";
export const metadata = { title: "Pessoas da Comunidade" };
export default async function Pessoas({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  return (
    <PessoasComunidade
      modelo={await consultarComunidade()}
      seguindo={(await searchParams).aba === "seguindo"}
    />
  );
}
