/** Sala carregando: esqueletos na grade da página (cabeçalho em duas colunas, banner e duas colunas). */
export default function CarregandoSala() {
  return (
    <div
      className="@container flex flex-col gap-8"
      role="status"
      aria-busy="true"
      aria-label="Carregando a Sala"
    >
      <div className="sdb-roomhead">
        <div className="sdb-roomhead__titles">
          <span className="sdb-skel h-3 w-1/2" />
          <span className="sdb-skel h-12 w-4/5" />
        </div>
        <div className="sdb-roomhead__side">
          <div className="flex flex-col gap-2">
            <span className="sdb-skel h-4 w-full" />
            <span className="sdb-skel h-4 w-full" />
            <span className="sdb-skel h-4 w-3/5" />
          </div>
          <span className="sdb-skel h-3 w-4/5" />
        </div>
      </div>
      <div className="sdb-roombanner">
        <div className="video-embed__frame">
          <span className="sdb-skel absolute inset-0" />
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_20rem] items-start gap-8 @max-[65rem]:grid-cols-1">
        <div className="flex flex-col gap-4">
          <span className="sdb-skel h-6 w-[10rem]" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="sdb-card flex flex-col gap-3 p-6">
              <span className="sdb-skel h-3 w-1/4" />
              <span className="sdb-skel h-6 w-3/4" />
              <span className="sdb-skel h-4 w-full" />
              <span className="sdb-skel h-4 w-2/3" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <span className="sdb-skel h-6 w-[12rem]" />
          <span className="sdb-skel aspect-[16/10] w-full" />
          <span className="sdb-skel h-6 w-[12rem]" />
          <span className="sdb-skel h-[16rem] w-full" />
        </div>
      </div>
    </div>
  );
}
