import type { Metadata, Route } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Badge } from "@/components/ds/Selos";
import { listarSalas } from "@/data/repositorio";
import { assinaturasPublicadas } from "@/features/anfitriao/regras/diretorio";
import { iniciais, plural } from "@/lib/texto";
import { perfilPorSlug } from "@/server/anfitriao/consultas";
import { urlDaMidia } from "@/server/midia";

export const metadata: Metadata = { title: "Anfitriões" };
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");

export default async function DiretorioAnfitrioes(props: PageProps<"/anfitrioes">) {
  const params = await props.searchParams;
  const busca = typeof params.busca === "string" ? params.busca.trim().slice(0, 100) : "";
  const salas = await listarSalas();
  const perfis = assinaturasPublicadas(salas)
    .flatMap((assinatura) => {
      const perfil = perfilPorSlug(assinatura.slug);
      return perfil ? [perfil] : [];
    })
    .filter((p) => normalizar(p.nome).includes(normalizar(busca)))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const paginas = Math.max(1, Math.ceil(perfis.length / 12));
  const pagina = Math.min(paginas, Math.max(1, Number.parseInt(String(params.pagina), 10) || 1));
  const hrefPagina = (n: number) =>
    `/anfitrioes?${new URLSearchParams({ ...(busca ? { busca } : {}), pagina: String(n) })}` as Route;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="sdb-title-1">Anfitriões</h1>
        <p className="sdb-body-sm">
          Conheça as pessoas que compartilham estudos e perspectivas em suas Salas.
        </p>
      </header>
      <form action="/anfitrioes" className="flex flex-wrap items-end gap-3">
        <CampoTexto
          name="busca"
          type="search"
          label="Buscar Anfitrião pelo nome público"
          defaultValue={busca}
          maxLength={100}
        />
        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>
      <p className="sdb-footnote" role="status">
        {plural(perfis.length, "Anfitrião encontrado", "Anfitriões encontrados")}
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        {perfis.slice((pagina - 1) * 12, pagina * 12).map((p) => {
          const publicadas = salas.filter((s) => s.anfitriao?.slug === p.slug);
          return (
            <article
              key={p.slug}
              className="sdb-card flex flex-col gap-4"
              aria-labelledby={`anfitriao-${p.slug}`}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  size="lg"
                  iniciais={iniciais(p.nome)}
                  foto={p.avatar ? urlDaMidia(p.avatar) : undefined}
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <Badge>Anfitrião</Badge>
                  <h2 className="sdb-title-2" id={`anfitriao-${p.slug}`}>
                    <Link href={`/anfitrioes/${p.slug}` as Route}>{p.nome}</Link>
                  </h2>
                  {p.credencial && <p className="sdb-body-sm">{p.credencial}</p>}
                </div>
              </div>
              <p className="sdb-footnote">
                {plural(publicadas.length, "Sala publicada", "Salas publicadas")} ·{" "}
                {plural(
                  publicadas.reduce((n, s) => n + s.totalConteudos, 0),
                  "conteúdo",
                  "conteúdos",
                )}
              </p>
              <ul className="flex flex-wrap gap-2" aria-label={`Salas de ${p.nome}`}>
                {publicadas.map((s) => (
                  <li key={s.slug}>
                    <Link className="sdb-chip" href={`/salas/${s.slug}` as Route}>
                      {s.nome}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link className="sdb-btn sdb-btn--secondary" href={`/anfitrioes/${p.slug}` as Route}>
                Conhecer perfil e materiais
              </Link>
            </article>
          );
        })}
      </div>
      {!perfis.length && (
        <EstadoSecao
          simbolo="busca"
          titulo={busca ? "Nenhum Anfitrião encontrado" : "Novas vozes em preparação"}
          descricao={
            busca
              ? "Experimente outro nome público."
              : "Os Anfitriões aparecem aqui quando suas Salas são publicadas."
          }
        />
      )}
      {paginas > 1 && (
        <nav className="flex flex-wrap items-center gap-3" aria-label="Páginas de Anfitriões">
          {pagina > 1 && (
            <Link className="sdb-btn sdb-btn--secondary" href={hrefPagina(pagina - 1)}>
              Anterior
            </Link>
          )}
          <span className="sdb-footnote">
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && (
            <Link className="sdb-btn sdb-btn--secondary" href={hrefPagina(pagina + 1)}>
              Próxima
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
