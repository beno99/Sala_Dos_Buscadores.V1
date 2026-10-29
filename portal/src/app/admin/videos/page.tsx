import type { Metadata } from "next";
import { Button } from "@/components/ds/Button";
import { Select } from "@/components/ds/CamposExtras";
import { videoParaForm } from "@/features/admin/formularios";
import { lerFiltrosVideos } from "@/features/admin/listas";
import { checklistVideo } from "@/features/admin/regras/checklist";
import { ListaVideos } from "@/features/admin/ui/ListaVideos";
import { listarArtigos, listarVideos } from "@/server/admin/consultas";
import { listarSalasAdmin } from "@/server/admin/salas";

export const metadata: Metadata = { title: "Vídeos" };

export default async function PaginaVideos() {
  const salas = listarSalasAdmin()
    .map((r) => r.sala)
    .filter((s) => s.origem === "oficial" && s.status !== "arquivado");
  const videos = listarVideos();
  const titulos = Object.fromEntries(listarArtigos().map((a) => [a.id, a.titulo || "Sem título"]));
  const filtros = { ...lerFiltrosVideos({}), sala: "", pagina: 1 };
  return (
    <>
      <header className="flex flex-col gap-4">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Vídeos</h1>
        <p className="sdb-body-sm sdb-secondary">
          Vídeos do canal nas Salas oficiais. Escolha a Sala para criar um vídeo; na edição dele, ligue os
          artigos relacionados.
        </p>
        <form action="/admin/videos/novo" className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <Select
              id="campo-video-sala"
              name="sala"
              label="Sala do novo vídeo"
              opcoes={salas.map((s) => ({ value: s.slug, label: s.nome }))}
            />
          </div>
          <Button type="submit" variant="primary" icon="mais" disabled={salas.length === 0}>
            Novo vídeo
          </Button>
        </form>
      </header>
      {videos.length === 0 && <p className="sdb-hint">Nenhum vídeo cadastrado ainda.</p>}
      {salas.map((s) => {
        const daSala = videos.filter((v) => v.sala === s.slug);
        if (daSala.length === 0) return null;
        return (
          <section key={s.slug} className="flex flex-col gap-3" aria-labelledby={`videos-${s.slug}`}>
            <h2 id={`videos-${s.slug}`} className="sdb-title-2">
              {s.nome}
            </h2>
            <ListaVideos
              itens={daSala.map((v) => ({
                ...v,
                pendencias: checklistVideo(videoParaForm(v)).filter((i) => i.estado === "pendente").length,
              }))}
              total={daSala.length}
              pagina={1}
              totalPaginas={1}
              filtros={filtros}
              sala={{ slug: s.slug, nome: s.nome }}
              titulosDosArtigos={titulos}
            />
          </section>
        );
      })}
    </>
  );
}
