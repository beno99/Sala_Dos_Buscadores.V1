import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ds/Button";
import { Icon } from "@/components/ds/Icon";
import { ColecaoConquistas } from "@/features/conquistas/ColecaoConquistas";
import { modeloDoPerfil } from "@/server/perfil";
import { membroAtual } from "@/server/sessao";

export const metadata: Metadata = { title: "Conquistas" };

export default async function Conquistas() {
  const membro = await membroAtual();
  if (!membro) return null;
  const m = await modeloDoPerfil(membro);
  const obtidas = m.conquistas.filter((c) => c.obtida).length;
  return (
    <div className="sdb-conquistas-page">
      <div className="sdb-conquistas-page__heading">
        <div>
          <p className="sdb-caption sdb-secondary">SEU CAMINHO NO ACERVO</p>
          <h1 className="sdb-large-title">Conquistas</h1>
        </div>
        <Link href="/perfil" className="sdb-link sdb-footnote">
          Voltar ao perfil →
        </Link>
      </div>
      {!m.mostrarNiveis ? (
        <section className="sdb-card p-6">
          <h2 className="sdb-title-2">Conquistas estão ocultas</h2>
          <p>Você pode voltar a exibir seus níveis e conquistas nos Ajustes.</p>
          <ButtonLink href="/ajustes" variant="secondary">
            Abrir Ajustes
          </ButtonLink>
        </section>
      ) : (
        <>
          <section className="sdb-collection-summary" aria-labelledby="titulo-colecao">
            <div className="sdb-collection-summary__intro">
              <span className="sdb-collection-summary__eyebrow">
                <Icon name="trilha" size="sm" /> Sua coleção
              </span>
              <h2 id="titulo-colecao" className="sdb-title-1">
                Cada descoberta deixa uma marca.
              </h2>
              <p>
                Leituras, encontros com as fontes e conexões entre Salas. Reconheça os passos que já fazem
                parte da sua busca.
              </p>
            </div>
            <div className="sdb-collection-summary__progress">
              <p>
                <strong>{obtidas}</strong>
                <span> / {m.conquistas.length}</span>
              </p>
              <span className="sdb-footnote">conquistas obtidas</span>
              <progress aria-label="Conquistas obtidas" value={obtidas} max={m.conquistas.length} />
              <span className="sdb-footnote">
                {obtidas === m.conquistas.length
                  ? "Sua coleção está completa."
                  : `${m.conquistas.length - obtidas} descobertas pela frente`}
              </span>
            </div>
          </section>
          <ColecaoConquistas conquistas={m.conquistas} />
          <p className="sdb-conquistas-page__privacy">
            <Icon name="cadeado" size="sm" /> Só você vê. Cada jornada tem seu próprio ritmo.
          </p>
        </>
      )}
    </div>
  );
}
