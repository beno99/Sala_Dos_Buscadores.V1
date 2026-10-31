import type { ReactNode } from "react";
import { CarrosselImagemConta } from "./CarrosselImagemConta";

/** Composição da Conta: imagem lateral no acesso e cenário completo no cadastro. */
export function CenarioConta({ cadastro = false, children }: { cadastro?: boolean; children: ReactNode }) {
  if (cadastro) {
    return (
      <div className="sdb-conta sdb-conta--cadastro">
        {/* biome-ignore lint/performance/noImgElement: gravura decorativa servida de public/imagens. */}
        <img className="sdb-conta__fundo" src="/imagens/conta/cadastro.webp" alt="" fetchPriority="high" />
        <div className="sdb-conta__cadastro">{children}</div>
      </div>
    );
  }

  return (
    <div className="sdb-conta sdb-conta--entrada">
      <CarrosselImagemConta />
      <div className="sdb-conta__conteudo">
        <p className="sdb-conta__marca">A Sala dos Buscadores</p>
        {children}
      </div>
    </div>
  );
}
