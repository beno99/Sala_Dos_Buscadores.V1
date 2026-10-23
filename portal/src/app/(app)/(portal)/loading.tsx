import { CardSalaEsqueleto } from "@/components/ds/CardSala";
import { PainelIndicadoresEsqueleto } from "@/components/ds/PainelIndicadores";

/** Portal carregando: esqueletos na mesma grade da página, com o painel inteiro. */
export default function Carregando() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-busy="true" aria-label="Carregando o Portal">
      <div className="sdb-banner min-h-[340px]">
        <div className="flex flex-col gap-4 p-7">
          <span className="sdb-skel h-3 w-1/4" />
          <span className="sdb-skel h-12 w-1/2" />
          <span className="sdb-skel h-4 w-2/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <CardSalaEsqueleto key={i} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="sdb-skel h-6 w-[12rem]" />
          <span className="sdb-skel h-3 w-[10rem]" />
        </div>
        <div className="sdb-panel sdb-panel--progresso sdb-material">
          <PainelIndicadoresEsqueleto />
          <div className="sdb-panel__main">
            <div className="sdb-panel__block">
              <span className="sdb-skel h-4 w-2/5" />
              <div className="flex items-center gap-4">
                <span className="sdb-skel h-[96px] w-[96px] shrink-0" />
                <div className="flex flex-1 flex-col gap-2">
                  <span className="sdb-skel h-3 w-1/3" />
                  <span className="sdb-skel h-5 w-3/4" />
                  <span className="sdb-skel h-3 w-1/2" />
                </div>
              </div>
            </div>
            <div className="sdb-panel__block">
              <span className="sdb-skel h-4 w-2/5" />
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <span className="sdb-skel h-4 w-3/4" />
                  <span className="sdb-skel h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <div className="sdb-panel__ad">
            <span className="sdb-skel flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
