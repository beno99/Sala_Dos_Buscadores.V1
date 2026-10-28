import type { Metadata, Route } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Avatar } from "@/components/ds/Avatar";
import { ButtonLink } from "@/components/ds/Button";
import { Badge, SeloNivel } from "@/components/ds/Selos";
import { todosOsTemas } from "@/data/catalogo";
import { GradeSalas } from "@/features/acervo/GradeSalas";
import { PublicacoesPerfil } from "@/features/comunidade/ui/PublicacoesPerfil";
import { ColecaoConquistas } from "@/features/conquistas/ColecaoConquistas";
import { EditarPerfil } from "@/features/perfil/EditarPerfil";
import { cx } from "@/lib/cx";
import { formatarData, iniciais, plural } from "@/lib/texto";
import { consultarComunidade } from "@/server/comunidade/consultas";
import { modeloDoPerfil } from "@/server/perfil";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Perfil" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const desde = (iso: string) => {
  const [ano, mes] = iso.split("-").map(Number);
  return ano && mes ? `${MESES[mes - 1]} ${ano}` : formatarData(iso);
};

/**
 * Perfil do buscador (layout do Figma "Jornada do buscador"): página privada
 * com capa, foto, números de estudo, temas acompanhados, níveis por Sala, o que
 * está em andamento, conquistas e as Salas visitadas.
 */
export default async function Perfil() {
  const membro = await membroAtual();
  if (!membro) return null;
  const m = await modeloDoPerfil(membro);
  const temasDasSalas = todosOsTemas()
    .map((t) => ({
      slug: t.slug,
      nome: t.nome,
      contagem: m.minhasSalas.filter((s) => s.temas.includes(t.slug)).length,
    }))
    .filter((t) => t.contagem > 0);
  const papel =
    membro.papel === "administrador" ? "Curadoria" : membro.papel === "anfitriao" ? "Anfitrião" : "Buscador";

  const comunidade = await consultarComunidade();
  return (
    <div className="flex flex-col gap-9">
      <header className="sdb-profilehead">
        <div className="sdb-profilehead__cover">
          {m.capa ? (
            // biome-ignore lint/performance/noImgElement: capa decorativa servida de public/imagens.
            <img src={m.capa} alt="" decoding="async" style={{ objectPosition: "50% 40%" }} />
          ) : (
            <div className="sdb-plate sdb-plate--bordo" aria-hidden="true" />
          )}
        </div>
        <div className="sdb-profilehead__row">
          <span className="sdb-profilehead__photo">
            <Avatar iniciais={iniciais(membro.pseudonimo)} foto={m.foto} />
          </span>
          <div className="sdb-profilehead__info">
            <div className="sdb-profilehead__tags">
              <span className="sdb-badge sdb-badge--ink">{papel}</span>
              <span className="sdb-badge sdb-badge--neutral">Privado · só você vê esta página</span>
            </div>
            <h1 className="sdb-profilehead__name">{membro.pseudonimo}</h1>
            <p className="sdb-profilehead__sub">Membro desde {desde(membro.membroDesde)}</p>
            <ul className="sdb-profilehead__stats">
              <li>
                <b>{m.numeros.salas}</b>Salas visitadas
              </li>
              <li>
                <b>{m.numeros.lidos}</b>
                {m.numeros.lidos === 1 ? "conteúdo lido" : "conteúdos lidos"}
              </li>
              <li>
                <b>{m.numeros.temas}</b>
                {m.numeros.temas === 1 ? "tema comparado" : "temas comparados"}
              </li>
              <li>
                <b>{m.numeros.conquistas}</b>conquistas
              </li>
            </ul>
          </div>
          <div className="sdb-profilehead__actions">
            <ButtonLink href={"/ajustes" as Route} variant="secondary" size="sm">
              Ajustes
            </ButtonLink>
            <EditarPerfil foto={m.enviadas.foto} capa={m.enviadas.capa} sobre={m.sobre} />
          </div>
        </div>
      </header>
      <PublicacoesPerfil
        publicacoes={comunidade.publicacoes.filter((p) => p.autorId === membro.id)}
        agora={comunidade.agora}
        curtidas={comunidade.curtidas}
        salvos={comunidade.salvos.map((p) => p.id)}
        rotulo="Meu estudo"
      >
        <section className="flex flex-col gap-4" aria-labelledby="titulo-busca">
          <Cabecalho id="titulo-busca" titulo="Sobre a sua busca" />
          <div className="sdb-card p-6">
            <div className="flex flex-wrap gap-6">
              <p className={cx("sdb-body m-0 min-w-[16rem] flex-1", !m.sobre && "sdb-secondary")}>
                {m.sobre ||
                  "Aqui vai, quando você quiser, uma frase sobre o que procura no acervo. Use “Editar perfil”. Só você vê."}
              </p>
              <div className="flex min-w-[14rem] flex-col gap-2">
                <p className="sdb-meta sdb-secondary m-0">Temas que você acompanha</p>
                {m.temasAcompanhados.length > 0 ? (
                  <div className="sdb-row" style={{ gap: 8 }}>
                    {m.temasAcompanhados.map((t) => (
                      <Badge key={t} variant="topic" icon="glossario">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="sdb-footnote m-0">Nenhum tema escolhido. Você pode escolher em Ajustes.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {m.mostrarNiveis && m.niveis.length > 0 && (
          <section className="flex flex-col gap-4" aria-labelledby="titulo-niveis">
            <Cabecalho id="titulo-niveis" titulo="Seus níveis" />
            <p className="sdb-footnote m-0">
              Os níveis são por assunto e sobem conforme você lê. Medem só o estudo no acervo.
            </p>
            <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[640px]:grid-cols-1">
              {m.niveis.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="sdb-card sdb-card--warm flex flex-col gap-3 p-5 no-underline"
                >
                  <span className="self-start">
                    <SeloNivel nivel={n.nivel} />
                  </span>
                  <span className="sdb-headline">{n.sala}</span>
                  <span className="sdb-progress__track" aria-hidden="true">
                    <i style={{ "--p": n.pct } as CSSProperties} />
                  </span>
                  <span className="sdb-footnote">{n.quantoFalta}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(m.continuar || m.trilha) && (
          <section className="flex flex-col gap-4" aria-labelledby="titulo-andamento">
            <Cabecalho
              id="titulo-andamento"
              titulo="Em andamento"
              acao={{ rotulo: "Ver Estante", href: "/estante" as Route }}
            />
            <div className="grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
              {m.continuar && (
                <div className="sdb-card sdb-card--warm flex flex-col gap-3 p-5">
                  <p className="sdb-meta sdb-secondary m-0">Continue de onde parou</p>
                  <p className="sdb-footnote m-0">{m.continuar.onde}</p>
                  <p className="sdb-headline m-0">{m.continuar.titulo}</p>
                  <span className="sdb-progress__track" aria-hidden="true">
                    <i style={{ "--p": m.continuar.pct / 100 } as CSSProperties} />
                  </span>
                  <p className="sdb-footnote m-0">Lido até {m.continuar.pct}%</p>
                  <ButtonLink href={m.continuar.href} variant="secondary" size="sm" className="self-start">
                    Retomar leitura
                  </ButtonLink>
                </div>
              )}
              {m.trilha && (
                <div className="sdb-card sdb-card--warm flex flex-col gap-3 p-5">
                  <p className="sdb-meta sdb-secondary m-0">Trilha em andamento</p>
                  <p className="sdb-footnote m-0">Trilha · {m.trilha.sala}</p>
                  <p className="sdb-headline m-0">{m.trilha.titulo}</p>
                  <span className="sdb-progress__track" aria-hidden="true">
                    <i style={{ "--p": m.trilha.degrau / m.trilha.total } as CSSProperties} />
                  </span>
                  <p className="sdb-footnote m-0">
                    Degrau {m.trilha.degrau} de {m.trilha.total}
                    {m.trilha.proximo && ` · próximo: ${m.trilha.proximo}`}
                  </p>
                  <ButtonLink href={m.trilha.href} variant="secondary" size="sm" className="self-start">
                    Continuar trilha
                  </ButtonLink>
                </div>
              )}
            </div>
          </section>
        )}

        {m.mostrarNiveis && (
          <section className="flex flex-col gap-4" aria-labelledby="titulo-conquistas">
            <Cabecalho
              id="titulo-conquistas"
              titulo="Conquistas"
              acao={{ rotulo: "Ver todas as conquistas", href: "/conquistas" as Route }}
              nota={`${m.conquistas.filter((c) => c.obtida).length} de ${m.conquistas.length}`}
            />
            <ColecaoConquistas conquistas={m.conquistas} compacta />
          </section>
        )}

        <section className="flex flex-col gap-4" aria-labelledby="titulo-minhas-salas">
          <Cabecalho
            id="titulo-minhas-salas"
            titulo="Minhas Salas"
            nota={plural(m.minhasSalas.length, "visitada", "visitadas")}
          />
          {m.minhasSalas.length > 0 ? (
            <GradeSalas id="grade-minhas-salas" salas={m.minhasSalas} temas={temasDasSalas} />
          ) : (
            <p className="sdb-footnote m-0">
              Você ainda não abriu nenhuma Sala.{" "}
              <Link className="sdb-link" href={"/salas" as Route}>
                Ver as Salas
              </Link>
            </p>
          )}
        </section>
      </PublicacoesPerfil>
    </div>
  );
}

function Cabecalho({
  id,
  titulo,
  nota,
  acao,
}: {
  id: string;
  titulo: string;
  nota?: string;
  acao?: { rotulo: string; href: Route };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-x-0 border-t-0 border-b border-solid border-separator pb-3">
      <h2 id={id} className="sdb-title-2">
        {titulo}
      </h2>
      {nota && <span className="sdb-footnote">{nota}</span>}
      {acao && (
        <Link className="sdb-link sdb-footnote" href={acao.href}>
          {acao.rotulo} →
        </Link>
      )}
    </div>
  );
}
