"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { deveMedirCaminho } from "@/features/analitica/regras/rastreio";

const ID_MEDICAO = "G-JZNRTQR4JH";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const INICIO = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ID_MEDICAO}', {
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});`;

export function GoogleAnalytics() {
  const caminho = usePathname();
  const ultimo = useRef<string | null>(null);

  useEffect(() => {
    if (ultimo.current === caminho) return;
    ultimo.current = caminho;
    if (!deveMedirCaminho(caminho)) return;
    window.gtag?.("event", "page_view", { page_location: `${window.location.origin}${caminho}` });
  }, [caminho]);

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ID_MEDICAO}`} strategy="afterInteractive" />
      <Script id="google-analytics-inicio" strategy="afterInteractive">
        {INICIO}
      </Script>
    </>
  );
}
