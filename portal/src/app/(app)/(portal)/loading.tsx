import { PainelIndicadoresEsqueleto } from "@/components/ds/PainelIndicadores";

/** Mesma ordem e proporções da home, sem métricas simuladas. */
export default function Carregando() {
  return (
    <div className="sdb-home" role="status" aria-busy="true" aria-label="Carregando o Portal">
      <div className="sdb-skel sdb-home__loading-banner" />
      <PainelIndicadoresEsqueleto />
      <div className="sdb-home__columns">
        <div className="sdb-home__editorial">
          {[0, 1, 2].map((i) => (
            <div key={i} className="sdb-skel sdb-home__loading-card" />
          ))}
        </div>
        <div className="sdb-skel sdb-home__loading-card" />
      </div>
    </div>
  );
}
