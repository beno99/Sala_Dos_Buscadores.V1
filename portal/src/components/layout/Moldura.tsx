"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { BarraAbasApp } from "@/components/ds/BarraAbasApp";
import { BarraSuperior } from "@/components/ds/BarraSuperior";
import { CartaoLateral, ContinuarLateral } from "@/components/ds/CartoesLateral";
import { ConquistasMini } from "@/components/ds/Conquista";
import { Drawer } from "@/components/ds/Drawer";
import { Menu } from "@/components/ds/Menu";
import {
  ListaNavegacaoSheet,
  NavegacaoLateralApp,
  useLateralRecolhida,
} from "@/components/ds/NavegacaoLateralApp";
import { OrbeAssistente } from "@/components/ds/OrbeAssistente";
import { SeloNivelProgresso } from "@/components/ds/SeloNivelProgresso";
import { MenuAparencia } from "@/features/aparencia/MenuAparencia";
import type { Aparencia } from "@/features/aparencia/tema";
import { MiniChatAssistente } from "@/features/assistente/MiniChatAssistente";
import type { Membro } from "@/features/auth/contas";
import { useSessao } from "@/features/auth/SessaoProvider";
import { PainelBusca } from "@/features/busca/PainelBusca";
import type { ConteudoBuscavel } from "@/features/busca/sugestoes";
import { dispensarContinuarAcao } from "@/features/estudo/acoes";
import { ModalConquistas } from "@/features/estudo/ModalConquistas";
import { useOuvinteEstudo } from "@/features/estudo/useOuvinteEstudo";
import { Onboarding } from "@/features/onboarding/Onboarding";
import type { ModeloLateral } from "@/server/estudo";
import { type Abertura, EVENTO_ABRIR } from "./aberturas";
import {
  abasDoCelular,
  estaNoMais,
  gruposDaLateral,
  iniciaisDe,
  membroDesde,
  tituloDaPagina,
} from "./navegacao";
import { Rodape } from "./Rodape";

/**
 * Moldura do app: lateral (≥ 900 px) ou barra de abas (celular), barra
 * superior, conteúdo, rodapé, orbe e mini chat do assistente, painel de busca
 * e onboarding de primeiro acesso.
 */
export function Moldura({
  membroInicial,
  aparencia,
  conteudos,
  lateral,
  children,
}: {
  membroInicial: Membro;
  aparencia: Aparencia;
  conteudos: ConteudoBuscavel[];
  lateral: ModeloLateral;
  children: ReactNode;
}) {
  const caminho = usePathname();
  const router = useRouter();
  const { membro: daSessao, sair } = useSessao();
  const membro = daSessao ?? membroInicial;
  const [recolhida, alternar] = useLateralRecolhida("sdb-lateral");
  const [busca, setBusca] = useState(false);
  const [assistente, setAssistente] = useState(false);
  const [orbePausado, setOrbePausado] = useState(false);
  const [mais, setMais] = useState(false);
  const [conquistas, setConquistas] = useState<"conquistas" | "niveis" | null>(null);
  const [onboarding, setOnboarding] = useState(membroInicial.preferencias === null);
  // Cada abertura começa da primeira etapa, com as respostas atuais.
  const [vezOnboarding, setVezOnboarding] = useState(0);
  const admin = membro.papel === "administrador";
  useOuvinteEstudo();

  const fecharBusca = useCallback(() => setBusca(false), []);
  const abrirAssistente = useCallback(() => setAssistente(true), []);
  const fecharAssistente = useCallback(() => setAssistente(false), []);
  const fecharMais = useCallback(() => setMais(false), []);

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBusca(true);
      }
    };
    const abrir = (e: Event) => {
      const pedido = (e as CustomEvent<Abertura>).detail;
      if (pedido === "assistente") setAssistente(true);
      if (pedido === "conquistas" || pedido === "niveis") setConquistas(pedido);
      if (pedido === "preferencias") {
        setVezOnboarding((v) => v + 1);
        setOnboarding(true);
      }
    };
    document.addEventListener("keydown", atalho);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => {
      document.removeEventListener("keydown", atalho);
      window.removeEventListener(EVENTO_ABRIR, abrir);
    };
  }, []);

  const grupos = gruposDaLateral(caminho, { admin, sair: () => void sair() });
  const menuConta = [
    { label: "Ajustes", icon: "ajustes" as const, onSelect: () => router.push("/ajustes") },
    ...(admin
      ? [{ label: "Curadoria", icon: "editar" as const, onSelect: () => router.push("/admin") }]
      : []),
    { label: "Sair", icon: "sair" as const, onSelect: () => sair(), separarAntes: true },
  ];
  const iniciais = iniciaisDe(membro.pseudonimo);
  const noAssistente = caminho.startsWith("/assistente");

  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh shrink-0 nav:block">
        <NavegacaoLateralApp
          id="navegacao-principal"
          grupos={grupos}
          perfil={{
            iniciais,
            pseudonimo: membro.pseudonimo,
            descricao: membroDesde(membro.membroDesde),
            menu: menuConta,
          }}
          recolhida={recolhida}
          onAlternar={alternar}
          continuar={
            lateral.continuar && (
              <ContinuarLateral
                {...lateral.continuar}
                recolhida={recolhida}
                onDispensar={async () => {
                  await dispensarContinuarAcao(lateral.continuar?.chave ?? "");
                  router.refresh();
                }}
              />
            )
          }
          rodape={
            <>
              <CartaoLateral
                icone="estante"
                rotulo="Salvos para depois"
                numero={lateral.salvos.total}
                href="/estante"
              >
                <p>{lateral.salvos.texto}</p>
              </CartaoLateral>
              {lateral.mostrarNiveis && (
                <CartaoLateral>
                  {lateral.nivelFoco ? (
                    <SeloNivelProgresso {...lateral.nivelFoco} />
                  ) : (
                    <p>Seu nível aparece aqui quando você começar a ler um assunto.</p>
                  )}
                  <ConquistasMini lista={lateral.conquistas} />
                  <button
                    type="button"
                    className="sdb-link self-start"
                    style={{ fontSize: 13 }}
                    onClick={() => setConquistas("conquistas")}
                  >
                    Ver conquistas
                  </button>
                </CartaoLateral>
              )}
            </>
          }
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior
          titulo={tituloDaPagina(caminho)}
          saudacao={caminho === "/" ? `Boas-vindas de volta, ${membro.pseudonimo}.` : undefined}
          onBuscar={() => setBusca(true)}
          acoes={
            <>
              <MenuAparencia inicial={aparencia} />
              <Menu
                right
                triggerClassName="sdb-topbar__account"
                triggerLabel={`Conta de ${membro.pseudonimo}`}
                titulo={`Conectado como ${membro.pseudonimo}`}
                items={menuConta}
                trigger={
                  <span className="sdb-avatar" aria-hidden="true">
                    {iniciais}
                  </span>
                }
              />
            </>
          }
        />
        <main
          id="conteudo"
          tabIndex={-1}
          className="flex w-full max-w-page flex-1 flex-col gap-8 px-4 pt-4 pb-tabbar nav:px-7 nav:pb-7"
        >
          {children}
          <Rodape />
        </main>
      </div>

      <div className="nav:hidden">
        <BarraAbasApp
          abas={abasDoCelular(caminho)}
          onMais={() => setMais(true)}
          maisAtivo={estaNoMais(caminho)}
        />
      </div>
      {!noAssistente && (
        <>
          <OrbeAssistente
            alvo="assistente-mini"
            aberto={assistente}
            pausado={orbePausado}
            acimaDaBarra
            onAlternar={() => setAssistente((v) => !v)}
          />
          <MiniChatAssistente
            id="assistente-mini"
            aberto={assistente}
            acimaDaBarra
            pausado={orbePausado}
            onAbrir={abrirAssistente}
            onFechar={fecharAssistente}
            onPausar={() => setOrbePausado((v) => !v)}
          />
        </>
      )}

      <PainelBusca aberto={busca} onFechar={fecharBusca} conteudos={conteudos} />
      <ModalConquistas
        aberto={conquistas !== null}
        vistaInicial={conquistas ?? "conquistas"}
        conquistas={lateral.conquistas}
        onFechar={() => setConquistas(null)}
      />
      <Drawer open={mais} onClose={fecharMais} title="Mais">
        <ListaNavegacaoSheet grupos={grupos} onNavegar={fecharMais} />
      </Drawer>
      <Onboarding
        key={vezOnboarding}
        aberto={onboarding}
        inicial={membro.preferencias}
        onConcluir={() => {
          setOnboarding(false);
          router.refresh();
        }}
      />
    </div>
  );
}
