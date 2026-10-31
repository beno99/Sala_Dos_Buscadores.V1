import type { Metadata, Route } from "next";
import { CardSala } from "@/components/ds/CardSala";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { salaPorSlug, todosOsTemas } from "@/data/catalogo";
import { acervoPublico, listarSalas, temasDaSala } from "@/data/repositorio";
import type { SalaSlug } from "@/data/types";
import { CatalogoBiblioteca } from "@/features/biblioteca/CatalogoBiblioteca";
import { FaixaBiblioteca, type ItemDaFaixa } from "@/features/biblioteca/FaixaBiblioteca";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { plural } from "@/lib/texto";
import { imagemDaSala } from "@/server/imagens";

export const metadata: Metadata = { title: "Biblioteca" };

type Formato = "video" | "sala" | "artigo";
const FORMATOS: Formato[] = ["video", "sala", "artigo"];

/**
 * Biblioteca (layout do Figma): Salas em faixa com chips de tema; Vídeos e
 * Artigos num catálogo só ("Textos e fontes", CatalogoBiblioteca), com busca
 * e o painel de Filtros (Sala, tema, nível, formato) à direita, como no
 * Comparar. `?sala=` limita à Sala e `?formato=video|sala|artigo` mostra só
 * aquela parte (links da página da Sala).
 */
export default async function Biblioteca(props: PageProps<"/biblioteca">) {
  const busca = await props.searchParams;
  const sala =
    typeof busca.sala === "string" && salaPorSlug(busca.sala) ? (busca.sala as SalaSlug) : undefined;
  const formato = FORMATOS.find((f) => f === busca.formato);
  const mostrar = (f: Formato) => !formato || formato === f;

  const publico = acervoPublico();
  const temas = todosOsTemas().map((t) => ({ slug: t.slug, nome: t.nome }));
  const nomeDaSala = sala ? salaPorSlug(sala)?.nome : undefined;

  const salas: ItemDaFaixa[] = (await listarSalas())
    .filter((s) => !sala || s.slug === sala)
    .map((s) => ({
      chave: s.slug,
      temas: temasDaSala(s.slug),
      card: (
        <CardSala
          sala={s}
          imagem={imagemDaSala(s)}
          acoes={<BotaoSalvar estilo="sala" tipo="sala" alvo={s.slug} titulo={s.nome} />}
        />
      ),
    }));

  const mostrarCatalogo = mostrar("video") || mostrar("artigo");
  const videosNaSala = publico.videos.filter((v) => !sala || v.sala === sala).length;
  const conteudosNaSala = publico.conteudos.filter((c) => !sala || c.sala === sala).length;
  const vazia =
    (!mostrar("sala") || salas.length === 0) &&
    (!mostrarCatalogo || (videosNaSala === 0 && conteudosNaSala === 0));
  if (vazia) {
    return (
      <section className="sdb-panel sdb-material min-h-[60vh] justify-center" aria-label="Biblioteca vazia">
        <h1 className="sdb-sr">Biblioteca</h1>
        <EstadoSecao
          simbolo="livro"
          titulo="Sua jornada começa com uma descoberta"
          descricao="Ainda não há nada publicado por aqui. Explore uma Sala e encontre um tema que desperte a sua curiosidade."
          acao={{ rotulo: "Explorar Salas", href: "/salas" as Route }}
        />
      </section>
    );
  }
  return (
    <div className="flex flex-col gap-9">
      <h1 className="sdb-sr">Biblioteca{nomeDaSala ? ` · ${nomeDaSala}` : ""}</h1>
      {mostrar("sala") && salas.length > 0 && (
        <FaixaBiblioteca
          id="faixa-salas"
          titulo="Salas"
          legenda={`${plural(salas.length, "Sala aberta", "Salas abertas")}, em ordem alfabética.`}
          rotuloItens="Salas"
          larguraItem={340}
          temas={temas}
          itens={salas}
        />
      )}
      {mostrarCatalogo && (videosNaSala > 0 || conteudosNaSala > 0) && (
        <CatalogoBiblioteca
          acervo={{ conteudos: publico.conteudos, videos: publico.videos }}
          filtrosIniciais={{
            salas: sala ? [sala] : [],
            formato: formato === "video" ? "video" : formato === "artigo" ? "texto" : null,
          }}
        />
      )}
    </div>
  );
}
