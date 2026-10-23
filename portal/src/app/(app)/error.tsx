"use client";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
export default function Erro({ retry }: { error: Error; retry: () => void }) {
  return (
    <EstadoSecao
      simbolo="alerta"
      titulo="Erro: não foi possível carregar esta página."
      descricao="Seus dados e seu progresso continuam salvos. Se o erro voltar, recarregue a página."
      acao={{ rotulo: "Tentar de novo", executar: retry }}
    />
  );
}
