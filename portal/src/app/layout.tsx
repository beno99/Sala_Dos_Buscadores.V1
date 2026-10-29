import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import "@/design-system/tokens.css";
import "@/design-system/bundle.css";
// Design system 1.0: materiais dos temas, peças refeitas e, por último, os ajustes de ritmo (8 px).
import "@/design-system/themes.css";
import "@/design-system/card-sala.css";
import "@/design-system/card-conteudo.css";
import "@/design-system/card-video.css";
import "@/design-system/card-comparativo.css";
import "@/design-system/assistant-orb.css";
import "@/design-system/refinement.css";
// 1.1: cards de Conquista, sempre escuros; carregados depois dos ajustes, como pede o guia.
import "@/design-system/card-conquista.css";
import "@/design-system/conta.css";
import "@/design-system/estados-interface.css";
import "@/design-system/components/TelaAssistente/tela-assistente.css";
import "@/design-system/components/Comunidade/comunidade.css";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { GOOGLE_FONTS_URL } from "@/design-system/fontes.generated";
import { COOKIE_LATERAL, COOKIE_TEMA, lateralDoCookie, temaDoCookie } from "@/features/aparencia/tema";
import { membroAtual } from "@/server/sessao";
import { leiturasParaAssistente, salasVisiveis, temasDoAcervo } from "@/server/store";

export const metadata: Metadata = {
  title: { default: "A Sala dos Buscadores", template: "%s · A Sala dos Buscadores" },
  description:
    "Portal de estudo que organiza tradições religiosas, espirituais e filosóficas em Salas, com busca comparativa por tema e um assistente de IA que cita as fontes.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6E7CE" },
    { media: "(prefers-color-scheme: dark)", color: "#111313" },
  ],
};

/** Raiz: tema (Sólido claro por padrão, escolha guardada em cookie) e providers. A moldura fica em (app). */
export default async function RootLayout({ children }: { children: ReactNode }) {
  // A sessão e o tema vêm de cookies; por isso as páginas são renderizadas a cada pedido.
  const [membro, jar] = await Promise.all([membroAtual(), cookies()]);
  return (
    <html
      lang="pt-BR"
      data-theme={temaDoCookie(jar.get(COOKIE_TEMA)?.value)}
      data-lateral={lateralDoCookie(jar.get(COOKIE_LATERAL)?.value) ? "translucida" : undefined}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GOOGLE_FONTS_URL} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
        >
          <span className="sdb-btn sdb-btn--primary sdb-btn--sm">Pular para o conteúdo</span>
        </a>
        <Providers
          membro={membro}
          salas={salasVisiveis()}
          temas={temasDoAcervo()}
          leituras={leiturasParaAssistente().filter((l) =>
            salasVisiveis().some((s) => s.slug === l.sala && s.naComparacao),
          )}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
