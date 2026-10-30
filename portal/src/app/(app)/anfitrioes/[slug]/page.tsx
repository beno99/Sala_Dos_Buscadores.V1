import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Arc } from "@/components/ds/Arc";
import { Avatar } from "@/components/ds/Avatar";
import { BotaoCompartilhar } from "@/components/ds/BotaoCompartilhar";
import { classesDoBotao } from "@/components/ds/Button";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { Badge, SeloProveniencia } from "@/components/ds/Selos";
import { TextoMarcado } from "@/components/ds/TextoMarcado";
import { todosOsTemas } from "@/data/catalogo";
import { listarSalas, temasDaSala } from "@/data/repositorio";
import { GradeSalas } from "@/features/acervo/GradeSalas";
import { BotaoSeguir } from "@/features/comunidade/ui/BotaoSeguir";
import { PublicacoesPerfil } from "@/features/comunidade/ui/PublicacoesPerfil";
import { formatarData, iniciais } from "@/lib/texto";
import { perfilPorSlug } from "@/server/anfitriao/consultas";
import { consultarComunidade } from "@/server/comunidade/consultas";
import { imagem, imagemDaSala } from "@/server/imagens";
import { urlDaMidia } from "@/server/midia";

export async function generateMetadata(props: PageProps<"/anfitrioes/[slug]">): Promise<Metadata> {
  const perfil = perfilPorSlug((await props.params).slug);
  return perfil ? { title: perfil.nome, description: perfil.credencial } : {};
}

/**
 * Página pública do anfitrião (§7): nome, credencial, apresentação, avatar,
 * link e as Salas dele que estão no ar.
 */
export default async function PaginaAnfitriao(props: PageProps<"/anfitrioes/[slug]">) {
  const { slug } = await props.params;
  const perfil = perfilPorSlug(slug);
  if (!perfil) notFound();
  const salas = (await listarSalas()).filter((s) => s.anfitriao?.slug === perfil.slug);
  const salasNaGrade = salas.map((sala) => ({
    sala,
    temas: temasDaSala(sala.slug),
    imagem: imagemDaSala(sala),
  }));
  const temas = todosOsTemas()
    .map((tema) => ({
      slug: tema.slug,
      nome: tema.nome,
      contagem: salasNaGrade.filter((sala) => sala.temas.includes(tema.slug)).length,
    }))
    .filter((tema) => tema.contagem > 0);
  const totalConteudos = salas.reduce((total, sala) => total + sala.totalConteudos, 0);
  const capa = imagem("banner", "marca-colunata") ?? imagem("banner", "marca");

  const comunidade = await consultarComunidade();
  return (
    <div className="sdb-publicprofile">
      <header className="sdb-profilehead">
        <div className="sdb-profilehead__cover">
          {capa ? (
            // biome-ignore lint/performance/noImgElement: capa decorativa da marca, servida de public/imagens.
            <img src={capa} alt="" width={1600} height={400} decoding="async" />
          ) : (
            <div className="sdb-plate sdb-plate--bordo" aria-hidden="true">
              <Arc on="bordo" />
            </div>
          )}
        </div>
        <div className="sdb-profilehead__row">
          <span className="sdb-profilehead__photo">
            <Avatar
              size="xl"
              iniciais={iniciais(perfil.nome)}
              foto={perfil.avatar ? urlDaMidia(perfil.avatar) : undefined}
            />
          </span>
          <div className="sdb-profilehead__info">
            <div className="sdb-profilehead__tags">
              <Badge variant="ink">Anfitrião</Badge>
              <Badge>Perfil público</Badge>
            </div>
            <h1 className="sdb-profilehead__name">{perfil.nome}</h1>
            {perfil.credencial && <p className="sdb-profilehead__sub">{perfil.credencial}</p>}
            <ul className="sdb-profilehead__stats" aria-label="Publicações no acervo">
              <li>
                <b>{salas.length}</b> {salas.length === 1 ? "Sala publicada" : "Salas publicadas"}
              </li>
              <li>
                <b>{totalConteudos}</b> {totalConteudos === 1 ? "conteúdo publicado" : "conteúdos publicados"}
              </li>
            </ul>
          </div>
          <div className="sdb-profilehead__actions">
            {perfil.contaId !== comunidade.pessoa.id && (
              <BotaoSeguir
                alvo={{ tipo: "pessoa", id: perfil.contaId }}
                nome={perfil.nome}
                seguindo={comunidade.visao.seguindoPessoas.includes(perfil.contaId)}
              />
            )}
            <BotaoCompartilhar titulo={perfil.nome} />
          </div>
        </div>
      </header>
      <PublicacoesPerfil
        publicacoes={comunidade.publicacoes.filter((p) => p.autorId === perfil.contaId)}
        agora={comunidade.agora}
        visao={comunidade.visao}
        opcoes={comunidade.opcoes}
        rotulo="Sobre e Salas"
      >
        <section className="sdb-publicprofile__section" aria-labelledby="titulo-sobre-anfitriao">
          <h2 id="titulo-sobre-anfitriao" className="sdb-title-2 sdb-publicprofile__heading">
            Sobre
          </h2>
          <div className="sdb-publicprofile__about">
            <div className="sdb-publicprofile__presentation">
              {perfil.apresentacao && (
                <p className="sdb-body">
                  <TextoMarcado texto={perfil.apresentacao} />
                </p>
              )}
              <SeloProveniencia tipo="anfitriao" />
              <p className="sdb-footnote">
                O anfitrião escreve nas próprias Salas; a curadoria revisa cada Sala e cada artigo antes de
                irem ao ar.
              </p>
            </div>
            <aside className="sdb-publicprofile__details" aria-label="Informações públicas">
              {temas.length > 0 && (
                <div className="sdb-publicprofile__detail">
                  <h3 className="sdb-meta">Temas nas Salas</h3>
                  <div className="sdb-publicprofile__tags">
                    {temas.map((tema) => (
                      <Badge key={tema.slug} variant="topic" icon="glossario">
                        {tema.nome}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {perfil.link && (
                <div className="sdb-publicprofile__detail">
                  <h3 className="sdb-meta">Links</h3>
                  <a
                    className={classesDoBotao({ variant: "plain", size: "sm" })}
                    href={perfil.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="externo" size="sm" />
                    Site ou canal
                  </a>
                </div>
              )}
              <p className="sdb-footnote">
                Perfil atualizado em{" "}
                <time dateTime={perfil.atualizadoEm}>{formatarData(perfil.atualizadoEm.slice(0, 10))}</time>
              </p>
            </aside>
          </div>
        </section>

        <section className="sdb-publicprofile__section" aria-labelledby="titulo-salas-anfitriao">
          <h2 id="titulo-salas-anfitriao" className="sdb-title-2 sdb-publicprofile__heading">
            Salas
          </h2>
          {salas.length === 0 ? (
            <EstadoSecao
              simbolo="livro"
              compacto
              titulo="Ainda sem Salas publicadas."
              descricao="Quando a curadoria aprovar uma Sala deste anfitrião, ela aparece aqui."
              acao={{ rotulo: "Explorar Salas", href: "/salas" }}
            />
          ) : (
            <GradeSalas id="salas-do-anfitriao" salas={salasNaGrade} temas={temas} />
          )}
        </section>
      </PublicacoesPerfil>
    </div>
  );
}
