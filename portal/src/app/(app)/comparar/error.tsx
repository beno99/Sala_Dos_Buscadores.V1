"use client";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
export default function Erro({ retry }: { error: Error; retry: () => void }) {
  return (
    <EstadoSecao
      simbolo="alerta"
      titulo="Erro: não foi possível consultar as Salas"
      descricao="A consulta não terminou. Tente de novo; se o erro continuar, volte à página das Salas e escolha um tema."
      acao={{ rotulo: "Tentar de novo", executar: retry }}
    />
  );
}
