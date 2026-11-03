import type { Route } from "next";
import Link from "next/link";

const COLUNAS: { titulo: string; links: { rotulo: string; href: string }[] }[] = [
  {
    titulo: "Explore",
    links: [
      { rotulo: "Portal", href: "/" },
      { rotulo: "Salas", href: "/salas" },
      { rotulo: "Artigos e vídeos", href: "/biblioteca" },
      { rotulo: "Jornada do Buscador", href: "/jornada" },
    ],
  },
  {
    titulo: "Participe",
    links: [
      { rotulo: "Quero ser Anfitrião", href: "/ajustes" },
      { rotulo: "Perguntas frequentes", href: "/sobre" },
      { rotulo: "Contato", href: "mailto:contato@asaladosbuscadores.com.br" },
    ],
  },
  {
    titulo: "Transparência",
    links: [
      { rotulo: "Política editorial", href: "/sobre#politica-editorial" },
      { rotulo: "Privacidade e LGPD", href: "/sobre#privacidade" },
      { rotulo: "Termos de uso", href: "/sobre#termos" },
    ],
  },
];

const REDES = [
  { rotulo: "YouTube", href: "https://youtube.com/@asaladosbuscadores" },
  { rotulo: "Instagram", href: "https://www.instagram.com/asaladosbuscadores" },
  { rotulo: "TikTok", href: "https://www.tiktok.com/@asaladosbuscadores" },
  { rotulo: "X", href: "https://x.com/saladobuscador" },
];

export function Rodape() {
  return (
    <footer className="sdb-footer -mx-4 -mb-tabbar nav:-mx-7 nav:-mb-7">
      <section className="sdb-footer__cta" aria-labelledby="rodape-chamada">
        <div>
          <p className="sdb-footer__eyebrow">Continue sua busca</p>
          <h2 id="rodape-chamada" className="sdb-footer__headline">
            Uma pergunta pode abrir <em>novos caminhos.</em>
          </h2>
          <p className="sdb-footer__lead">
            Explore Salas, artigos e vídeos sobre tradições, filosofias e diferentes maneiras de compreender a
            existência. Construa sua Jornada do Buscador, no seu ritmo.
          </p>
          <Link href="/" className="sdb-footer__button">
            Entrar no Portal <span aria-hidden="true">→</span>
          </Link>
          <p className="sdb-footer__perks">Conta gratuita • Diferentes perspectivas • Autoria identificada</p>
        </div>
        <div className="sdb-footer__card">
          {/* biome-ignore lint/performance/noImgElement: logo fixa, sem necessidade de otimização do next/image */}
          <img src="/imagens/logo_sala.png" alt="" aria-hidden="true" />
          <strong>
            A Sala dos
            <br />
            Buscadores
          </strong>
          <p className="sdb-footer__eyebrow">Conhecer. Comparar. Refletir.</p>
        </div>
      </section>
      <div className="sdb-footer__dark">
        <div className="sdb-footer__top">
          <div className="sdb-footer__brand">
            <span className="sdb-footer__mark">
              {/* biome-ignore lint/performance/noImgElement: logo fixa, sem necessidade de otimização do next/image */}
              <img src="/imagens/logo_sala.png" alt="" className="sdb-footer__logo" aria-hidden="true" />A
              Sala dos Buscadores
            </span>
            <p className="sdb-footer__tagline">
              Um espaço de estudo e encontro entre tradições, fontes e perspectivas.
            </p>
            <p className="sdb-footer__motto">Sua busca, com liberdade para perguntar.</p>
          </div>
          {COLUNAS.map((c) => (
            <nav key={c.titulo} className="sdb-footer__col" aria-labelledby={`rodape-${c.titulo}`}>
              <h2 id={`rodape-${c.titulo}`}>{c.titulo}</h2>
              <ul>
                {c.links.map((l) => (
                  <li key={l.rotulo}>
                    <Link href={l.href as Route}>{l.rotulo}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="sdb-footer__social">
          <div>
            <p className="sdb-footer__eyebrow">Acompanhe o canal</p>
            <ul>
              {REDES.map((r) => (
                <li key={r.rotulo}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer">
                    {r.rotulo} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a className="sdb-footer__email" href="mailto:contato@asaladosbuscadores.com.br">
            E-mail de contato ↗
          </a>
        </div>
        <div className="sdb-footer__bottom">
          <p>© {new Date().getFullYear()} A Sala dos Buscadores</p>
          <a href="#conteudo">Voltar ao topo ↑</a>
        </div>
      </div>
    </footer>
  );
}
