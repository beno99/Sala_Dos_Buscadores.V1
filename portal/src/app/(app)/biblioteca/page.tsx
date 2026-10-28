import type { Metadata, Route } from "next";
import { CardConteudo } from "@/components/ds/CardConteudo";
import { CardSala } from "@/components/ds/CardSala";
import { CardVideo } from "@/components/ds/CardVideo";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { salaPorSlug, todosOsTemas } from "@/data/catalogo";
import { acervoPublico, listarSalas, temasDaSala } from "@/data/repositorio";
import type { SalaSlug } from "@/data/types";
import { FaixaBiblioteca, type ItemDaFaixa } from "@/features/biblioteca/FaixaBiblioteca";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";
import { plural } from "@/lib/texto";
import { imagemDaSala } from "@/server/imagens";

export const metadata: Metadata = { title: "Biblioteca" };

type Formato = "video" | "sala" | "artigo";
const FORMATOS: Formato[] = ["video", "sala", "artigo"];

/**
 * Biblioteca (layout do Figma): três faixas, Vídeos, Salas e Artigos, cada uma
 * com chips de tema em areia, trilho de cards e "Ver mais". `?sala=` limita à
 * Sala e `?formato=video|sala|artigo` mostra só aquela faixa (links da página da Sala).
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

  const videos: ItemDaFaixa[] = publico.videos
    .filter((v) => !sala || v.sala === sala)
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
    .map((v) => ({ chave: v.id, temas: [v.tema], card: <CardVideo video={v} /> }));

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

  const artigos: ItemDaFaixa[] = publico.conteudos
    .filter((c) => !sala || c.sala === sala)
    .map((c) => ({
      chave: `${c.sala}/${c.slug}`,
      temas: c.temas,
      card: (
        <CardConteudo
          conteudo={c}
          acoes={<BotaoSalvar tipo="conteudo" alvo={`${c.sala}/${c.slug}`} titulo={c.titulo} estilo="card" />}
        />
      ),
    }));

  const ondeLegenda = nomeDaSala ? ` em ${nomeDaSala}` : " do acervo";
  const vazia = [videos, salas, artigos].every((l, i) => !mostrar(FORMATOS[i] as Formato) || l.length === 0);
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
      {mostrar("video") && videos.length > 0 && (
        <FaixaBiblioteca
          id="faixa-videos"
          titulo="Vídeos"
          legenda={`${plural(videos.length, "vídeo", "vídeos")} do canal${ondeLegenda}, do mais recente ao mais antigo.`}
          rotuloItens="vídeos"
          larguraItem={760}
          colunas={2}
          temas={temas}
          itens={videos}
        />
      )}
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
      {mostrar("artigo") && artigos.length > 0 && (
        <FaixaBiblioteca
          id="faixa-artigos"
          titulo="Artigos"
          legenda={`${plural(artigos.length, "texto", "textos")}${ondeLegenda}, entre artigos e fontes primárias.`}
          rotuloItens="artigos"
          larguraItem={300}
          colunas={4}
          temas={temas}
          itens={artigos}
        />
      )}
    </div>
  );
}
