import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CascaAnfitriao } from "@/features/anfitriao/ui/CascaAnfitriao";
import { TopoAnfitriao } from "@/features/anfitriao/ui/TopoAnfitriao";
import { aparenciaDoCookie, COOKIE_LATERAL, COOKIE_TEMA, lateralDoCookie } from "@/features/aparencia/tema";
import * as conta from "@/modules/conta/conta.controller";
import { painelDoAnfitriao } from "@/server/anfitriao/consultas";
import { acessoAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = {
  title: { default: "Anfitrião", template: "%s · Anfitrião · A Sala dos Buscadores" },
  robots: { index: false, follow: false },
};

/**
 * Área do anfitrião, com a casca da curadoria (topo próprio e navegação
 * lateral). Fica fora da moldura do portal, então confere aqui a sessão e o
 * e-mail confirmado (como o layout de (app)) e o papel: só anfitrião entra.
 * Membro e administrador veem uma mensagem, sem listar rotas internas. Cada
 * página e cada ação conferem de novo a posse.
 */
export default async function LayoutAnfitriao({ children }: { children: ReactNode }) {
  const pendente = await conta.membroAtual();
  if (pendente && !pendente.emailVerificadoEm) redirect("/confirmar-email");
  const acesso = await acessoAtual();
  if (acesso.tipo === "sem-sessao") await redirecionarParaEntrar();
  const jar = await cookies();
  const aparencia = aparenciaDoCookie(jar.get(COOKIE_TEMA)?.value);
  const lateralTranslucida = lateralDoCookie(jar.get(COOKIE_LATERAL)?.value);
  return (
    <div className="flex min-h-dvh flex-col">
      <TopoAnfitriao aparencia={aparencia} lateralTranslucida={lateralTranslucida} />
      <main
        id="conteudo"
        tabIndex={-1}
        className="flex w-full max-w-[1760px] flex-1 flex-col gap-8 px-4 pt-4 pb-7 nav:px-7"
      >
        {acesso.tipo === "anfitriao" ? (
          <AreaAnfitriao donoId={acesso.membro.id}>{children}</AreaAnfitriao>
        ) : (
          <AcessoRestrito admin={acesso.tipo === "admin"} />
        )}
      </main>
    </div>
  );
}

function AreaAnfitriao({ donoId, children }: { donoId: string; children: ReactNode }) {
  const p = painelDoAnfitriao(donoId);
  const contagens = {
    salas: p.indicadores.salas,
    videos: p.indicadores.videos,
    anuncios: p.indicadores.anuncios,
    novidades: p.novidades.length,
  };
  return <CascaAnfitriao contagens={contagens}>{children}</CascaAnfitriao>;
}

function AcessoRestrito({ admin }: { admin: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-read flex-col gap-4">
      <h1 className="sdb-title-1">Acesso restrito</h1>
      {admin ? (
        <Alerta
          title="Esta área é dos anfitriões"
          actions={
            <ButtonLink href={"/admin" as Route} variant="secondary" size="sm">
              Ir para a Curadoria
            </ButtonLink>
          }
        >
          A curadoria revisa o que os anfitriões enviam, mas não escreve por eles: a revisão fica na
          Curadoria.
        </Alerta>
      ) : (
        <Alerta
          title="Esta área é dos anfitriões"
          actions={
            <ButtonLink href={"/ajustes" as Route} variant="secondary" size="sm">
              Quero ser anfitrião
            </ButtonLink>
          }
        >
          Anfitriões mantêm Salas próprias, revisadas pela curadoria. Para se candidatar, use os Ajustes.
        </Alerta>
      )}
    </div>
  );
}
