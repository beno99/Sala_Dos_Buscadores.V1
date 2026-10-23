import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Moldura } from "@/components/layout/Moldura";
import { listarConteudosBuscaveis } from "@/data/repositorio";
import { aparenciaDoCookie, COOKIE_LATERAL, COOKIE_TEMA, lateralDoCookie } from "@/features/aparencia/tema";
import { novidadesDe } from "@/server/anfitriao/consultas";
import { modeloDaLateral } from "@/server/estudo";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

/**
 * Todo o app exige conta (RF-01, RF-05 revisto). O proxy só faz a checagem
 * otimista pelo cookie; aqui vale a sessão de verdade.
 */
export default async function LayoutApp({ children }: { children: ReactNode }) {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  const jar = await cookies();
  const aparencia = aparenciaDoCookie(jar.get(COOKIE_TEMA)?.value);
  const lateralTranslucida = lateralDoCookie(jar.get(COOKIE_LATERAL)?.value);
  return (
    <Moldura
      membroInicial={membro}
      aparencia={aparencia}
      lateralTranslucida={lateralTranslucida}
      conteudos={listarConteudosBuscaveis()}
      lateral={modeloDaLateral(membro)}
      novidadesAnfitriao={membro.papel === "anfitriao" ? novidadesDe(membro.id).length : 0}
    >
      {children}
    </Moldura>
  );
}
