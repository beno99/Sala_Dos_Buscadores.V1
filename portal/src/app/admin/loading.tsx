import { TabelaEsqueleto } from "@/components/ds/TabelaDados";

export default function CarregandoCuradoria() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Carregando a curadoria">
      <div className="sdb-skel h-9 w-2/5" />
      <TabelaEsqueleto />
    </div>
  );
}
