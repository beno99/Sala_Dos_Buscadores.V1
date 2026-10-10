"use client";

import { useState } from "react";

/** Estado de carregamento de uma chamada de conta (botão com indicador, RNF-USA-02). */
export function useEnvio() {
  const [enviando, setEnviando] = useState(false);
  const enviar = async <T>(acao: () => T | Promise<T>): Promise<T> => {
    setEnviando(true);
    try {
      return await acao();
    } finally {
      setEnviando(false);
    }
  };
  return { enviando, enviar };
}
