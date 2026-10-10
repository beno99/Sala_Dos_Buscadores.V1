import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Moldura } from "@/components/layout/Moldura";
import { listarConteudosBuscaveis } from "@/data/repositorio";
import { COOKIE_TEMA } from "@/features/aparencia/tema";
import { modeloDaLateral } from "@/server/estudo";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

/**
 * Todo o app exige conta (RF-01, RF-05 revisto). O proxy só faz a checagem
 * otimista pelo cookie; aqui vale a sessão de verdade.
 */
export default async function LayoutApp({ children }: { children: ReactNode }) {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const aparencia = (await cookies()).get(COOKIE_TEMA)?.value === "escuro" ? "escuro" : "claro";
  return (
    <Moldura
      membroInicial={membro}
      aparencia={aparencia}
      conteudos={listarConteudosBuscaveis()}
      lateral={modeloDaLateral(membro)}
    >
      {children}
    </Moldura>
  );
}
