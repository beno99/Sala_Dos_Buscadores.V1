import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { ButtonLink } from "@/components/ds/Button";
import { CascaCuradoria } from "@/features/admin/ui/CascaCuradoria";
import { TopoCuradoria } from "@/features/admin/ui/TopoCuradoria";
import { COOKIE_TEMA } from "@/features/aparencia/tema";
import { listarArtigos, listarFontes, listarVideos } from "@/server/admin/consultas";
import { acessoAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = {
  title: { default: "Curadoria", template: "%s · Curadoria · A Sala dos Buscadores" },
  robots: { index: false, follow: false },
};

/**
 * Tudo em /admin passa por aqui (a checagem do proxy é só otimista):
 * sem sessão vai para /entrar com a volta preservada; membro vê uma mensagem
 * de acesso restrito, sem listar rotas internas; só administrador entra (RF-08).
 */
export default async function LayoutCuradoria({ children }: { children: ReactNode }) {
  const acesso = await acessoAtual();
  if (acesso.tipo === "sem-sessao") await redirecionarParaEntrar();
  const aparencia = (await cookies()).get(COOKIE_TEMA)?.value === "escuro" ? "escuro" : "claro";
  return (
    <div className="flex min-h-dvh flex-col">
      <TopoCuradoria aparencia={aparencia} />
      <main
        id="conteudo"
        tabIndex={-1}
        className="flex w-full max-w-[1440px] flex-1 flex-col gap-8 px-4 pt-4 pb-7 nav:px-7"
      >
        {acesso.tipo === "admin" ? <AreaCuradoria>{children}</AreaCuradoria> : <AcessoRestrito />}
      </main>
    </div>
  );
}

function AcessoRestrito() {
  return (
    <div className="mx-auto flex w-full max-w-read flex-col gap-4">
      <h1 className="sdb-title-1">Acesso restrito</h1>
      <Alerta
        title="Esta área é da equipe de curadoria"
        actions={
          <ButtonLink href={"/" as Route} variant="secondary" size="sm">
            Ir para o Portal
          </ButtonLink>
        }
      >
        Sua conta é de membro. Todo o acervo, a busca comparativa e o assistente continuam abertos para você
        no Portal.
      </Alerta>
    </div>
  );
}

function AreaCuradoria({ children }: { children: ReactNode }) {
  const contagens = {
    artigos: listarArtigos().length,
    videos: listarVideos().length,
    fontes: listarFontes().length,
  };
  return <CascaCuradoria contagens={contagens}>{children}</CascaCuradoria>;
}
