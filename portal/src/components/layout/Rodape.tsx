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
  {
    rotulo: "YouTube",
    href: "https://youtube.com/@asaladosbuscadores",
    d: "M164.44,121.34l-48-32A8,8,0,0,0,104,96v64a8,8,0,0,0,12.44,6.66l48-32a8,8,0,0,0,0-13.32ZM120,145.05V111l25.58,17ZM234.33,69.52a24,24,0,0,0-14.49-16.4C185.56,39.88,131,40,128,40s-57.56-.12-91.84,13.12a24,24,0,0,0-14.49,16.4C19.08,79.5,16,97.74,16,128s3.08,48.5,5.67,58.48a24,24,0,0,0,14.49,16.41C69,215.56,120.4,216,127.34,216h1.32c6.94,0,58.37-.44,91.18-13.11a24,24,0,0,0,14.49-16.41c2.59-10,5.67-28.22,5.67-58.48S236.92,79.5,234.33,69.52Zm-15.49,113a8,8,0,0,1-4.77,5.49c-31.65,12.22-85.48,12-86,12H128c-.54,0-54.33.2-86-12a8,8,0,0,1-4.77-5.49C34.8,173.39,32,156.57,32,128s2.8-45.39,5.16-54.47A8,8,0,0,1,41.93,68c30.52-11.79,81.66-12,85.85-12h.27c.54,0,54.38-.18,86,12a8,8,0,0,1,4.77,5.49C221.2,82.61,224,99.43,224,128S221.2,173.39,218.84,182.47Z",
  },
  {
    rotulo: "Instagram",
    href: "https://www.instagram.com/asaladosbuscadores",
    d: "M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z",
  },
  {
    rotulo: "TikTok",
    href: "https://www.tiktok.com/@asaladosbuscadores",
    d: "M224,72a48.05,48.05,0,0,1-48-48,8,8,0,0,0-8-8H128a8,8,0,0,0-8,8V156a20,20,0,1,1-28.57-18.08A8,8,0,0,0,96,130.69V88a8,8,0,0,0-9.4-7.88C50.91,86.48,24,119.1,24,156a76,76,0,0,0,152,0V116.29A103.25,103.25,0,0,0,224,128a8,8,0,0,0,8-8V80A8,8,0,0,0,224,72Zm-8,39.64a87.19,87.19,0,0,1-43.33-16.15A8,8,0,0,0,160,102v54a60,60,0,0,1-120,0c0-25.9,16.64-49.13,40-57.6v27.67A36,36,0,1,0,136,156V32h24.5A64.14,64.14,0,0,0,216,87.5Z",
  },
  {
    rotulo: "Facebook",
    href: "https://www.facebook.com/share/1CGMMFLfbp/",
    d: "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z",
  },
  {
    rotulo: "X",
    href: "https://x.com/saladobuscador",
    d: "M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z",
  },
  {
    rotulo: "E-mail de contato",
    href: "mailto:contato@asaladosbuscadores.com.br",
    d: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z",
  },
];

function IconeRede({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 256 256" width="32" height="32" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

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
                  <a
                    href={r.href}
                    aria-label={r.rotulo}
                    title={r.rotulo}
                    {...(r.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    <IconeRede d={r.d} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="sdb-footer__bottom">
          <p>© {new Date().getFullYear()} A Sala dos Buscadores</p>
          <a href="#conteudo">Voltar ao topo ↑</a>
        </div>
      </div>
    </footer>
  );
}
