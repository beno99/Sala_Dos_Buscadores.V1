import type { Metadata, Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { SeloStatus } from "@/components/ds/Curadoria";
import { formatarData } from "@/lib/texto";
import { videosDoAnfitriao } from "@/server/anfitriao/consultas";
import { anfitriaoDaPagina } from "@/server/anfitriao/pagina";

export const metadata: Metadata = { title: "Vídeos" };

/** Vídeos do anfitrião: cada um vai ao ar depois da aprovação da curadoria. */
export default async function VideosDoAnfitriao() {
  const membro = await anfitriaoDaPagina();
  const videos = videosDoAnfitriao(membro.id);
  return (
    <>
      <header className="flex flex-col gap-4">
        <h1 className="sdb-title-1">Vídeos</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Vídeos do YouTube ligados a uma das suas Salas e, se quiser, a artigos. Cada um passa pela curadoria
          antes de ir ao ar.
        </p>
        <div className="sdb-row">
          <ButtonLink href={"/anfitriao/videos/novo" as Route} variant="primary" icon="play">
            Criar vídeo
          </ButtonLink>
        </div>
      </header>
      {videos.length === 0 ? (
        <p className="sdb-body-sm sdb-secondary">
          Você ainda não tem vídeos. Use “Criar vídeo” para começar.
        </p>
      ) : (
        <section className="sdb-material sdb-list" aria-label={`Seus vídeos · ${videos.length}`}>
          {videos.map((v) => (
            <div key={v.id} className="sdb-list-row">
              <div className="flex flex-col gap-1">
                <span className="sdb-callout">
                  <Link href={`/anfitriao/videos/${v.id}` as Route}>{v.titulo || "Sem título"}</Link>
                </span>
                <span className="sdb-footnote">
                  {v.salaNome}
                  {v.duracao && ` · ${v.duracao}`} · atualizado em {formatarData(v.atualizadoEm.slice(0, 10))}
                </span>
                {v.status === "reprovado" && v.revisao?.ultimoMotivo && (
                  <span className="sdb-footnote">Motivo: {v.revisao.ultimoMotivo}</span>
                )}
              </div>
              <SeloStatus status={v.status} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
