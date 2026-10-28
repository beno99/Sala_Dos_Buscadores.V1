import type { Route } from "next";
import Link from "next/link";
import { Arc } from "@/components/ds/Arc";
import { TEXTO_NEUTRALIDADE } from "@/components/ds/AvisoNeutralidade";

/* Rodapé global (Rodape). "Sobre" e "Legal" apontam para as seções de /sobre. */
const COLUNAS: { titulo: string; links: { rotulo: string; href: string; externo?: boolean }[] }[] = [
  {
    titulo: "Acervo",
    links: [
      { rotulo: "Destaques", href: "/destaques" },
      { rotulo: "Biblioteca", href: "/biblioteca" },
      { rotulo: "Salas", href: "/salas" },
      { rotulo: "Comparar", href: "/comparar" },
      { rotulo: "Assistente", href: "/assistente" },
    ],
  },
  {
    titulo: "Sobre",
    links: [
      { rotulo: "Como funciona o assistente", href: "/sobre#assistente" },
      { rotulo: "Política editorial", href: "/sobre#politica-editorial" },
      { rotulo: "Política de publicidade", href: "/sobre#politica-publicidade" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { rotulo: "Termos em linguagem simples", href: "/sobre#termos" },
      { rotulo: "Privacidade e LGPD", href: "/sobre#privacidade" },
    ],
  },
  {
    titulo: "Canal",
    links: [{ rotulo: "YouTube", href: "https://www.youtube.com/", externo: true }],
  },
];

export function Rodape() {
  return (
    <footer className="sdb-footer">
      <div className="sdb-footer__top">
        <div className="sdb-footer__brand">
          <span className="sdb-footer__mark">
            <Arc on="bege" />A Sala dos Buscadores
          </span>
          <p className="sdb-footer__tagline">
            Biblioteca digital de estudos comparados. A porta está aberta; a escada é de quem sobe.
          </p>
        </div>
        {COLUNAS.map((c) => (
          <nav key={c.titulo} className="sdb-footer__col" aria-labelledby={`rodape-${c.titulo}`}>
            <h2 id={`rodape-${c.titulo}`}>{c.titulo}</h2>
            <ul>
              {c.links.map((l) => (
                <li key={l.rotulo}>
                  {l.externo ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.rotulo}
                    </a>
                  ) : (
                    <Link href={l.href as Route}>{l.rotulo}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="sdb-footer__bottom">
        <p>A Sala dos Buscadores · Curador de museu, não pregador</p>
        <p>{TEXTO_NEUTRALIDADE}</p>
      </div>
    </footer>
  );
}
