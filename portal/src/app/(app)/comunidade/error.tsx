"use client";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
export default function Erro({ reset }: { reset: () => void }) {
  return (
    <EstadoSecao
      simbolo="alerta"
      titulo="Erro: não foi possível abrir a Comunidade"
      descricao="Tente carregar as publicações novamente."
      acao={{ rotulo: "Tentar de novo", executar: reset }}
    />
  );
}
