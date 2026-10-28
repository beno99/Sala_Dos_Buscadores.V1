import type { Placa } from "@/data/types";
import { cx } from "@/lib/cx";
import { Arc } from "./Arc";
import { Button } from "./Button";
import { Icon, type IconName } from "./Icon";
import { ImagemAcervo } from "./ImagemAcervo";

export interface AnuncioVisual {
  id: string;
  anunciante: string;
  titulo: [string, string];
  texto: string;
  chamada: string;
  href: string;
  placa: Placa;
  imagem?: string;
  /** Até dois atributos com ícone, só na variante painel ("Domínio público"). */
  demonstracao?: boolean;
  atributos?: { icone: IconName; texto: string }[];
}

/**
 * Espaço publicitário (EspacoPublicitario): sempre com "Publicidade", o nome do
 * anunciante e "Por que estou vendo isto?". Visual distinto do acervo: sem selo
 * de proveniência, sem tracejado de IA, sem urgência.
 */
export function EspacoPublicitario({
  anuncio,
  variante = "coluna",
  onPorQue,
}: {
  anuncio: AnuncioVisual;
  variante?: "painel" | "coluna" | "banner" | "portal";
  onPorQue: () => void;
}) {
  const cabeca = (
    <div className="sdb-ad__head">
      <span className="sdb-ad__label">Publicidade</span>
      <span className="sdb-ad__advertiser">{anuncio.anunciante}</span>
    </div>
  );
  const midia = (
    <div className="sdb-ad__media">
      {anuncio.imagem ? (
        // biome-ignore lint/performance/noImgElement: peça do anunciante servida de public/.
        <img src={anuncio.imagem} alt="" />
      ) : (
        <div className={`sdb-plate sdb-plate--${anuncio.placa}`}>
          <Arc on={anuncio.placa} />
        </div>
      )}
    </div>
  );

  if (variante === "portal")
    return (
      <div className="sdb-home__publicidade">
        <aside className="sdb-ad sdb-ad--portal" aria-label="Publicidade">
          <span className="sdb-ad__label">PUBLICIDADE</span>
          <div className="sdb-ad__media">
            <ImagemAcervo src={anuncio.imagem} placa={anuncio.placa} />
          </div>
          <span className="sdb-ad__advertiser">{anuncio.anunciante}</span>
          <h2 className="sdb-ad__title">{anuncio.titulo.join(" ")}</h2>
          <p className="sdb-ad__text">{anuncio.texto}</p>
          <a
            className="sdb-btn sdb-btn--secondary sdb-btn--sm"
            href={anuncio.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            {anuncio.chamada}
            <Icon name="externo" size="sm" />
          </a>
          {anuncio.demonstracao && <p className="sdb-ad__demo">Anunciante fictício · exemplo de anúncio</p>}
        </aside>
        <Button variant="plain" size="sm" onClick={onPorQue}>
          Sobre os anúncios
        </Button>
      </div>
    );

  if (variante === "painel") {
    return (
      <aside className="sdb-ad sdb-ad--painel" aria-label="Publicidade">
        {cabeca}
        {midia}
        <div className="sdb-ad__center">
          <h3 className="sdb-ad__title">
            {anuncio.titulo[0]}, {anuncio.titulo[1]}
          </h3>
          <p className="sdb-ad__text">{anuncio.texto}</p>
          {anuncio.atributos && anuncio.atributos.length > 0 && (
            <ul className="sdb-ad__attrs">
              {anuncio.atributos.slice(0, 2).map((a) => (
                <li key={a.texto} className="sdb-ad__attr">
                  <Icon name={a.icone} />
                  {a.texto}
                </li>
              ))}
            </ul>
          )}
          <a
            className="sdb-btn sdb-btn--lg sdb-ad__cta"
            href={anuncio.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            {anuncio.chamada}
            <Icon name="externo" />
          </a>
          <Button variant="plain" className="sdb-ad__why" onClick={onPorQue}>
            Por que estou vendo isto?
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cx("sdb-ad", `sdb-ad--${variante === "coluna" ? "column" : "banner"}`)}
      aria-label="Publicidade"
    >
      {cabeca}
      {midia}
      <h2 className="sdb-ad__title">
        {anuncio.titulo[0]} {anuncio.titulo[1]}
      </h2>
      <p className="sdb-ad__text">{anuncio.texto}</p>
      <div className="sdb-ad__foot">
        <a
          className="sdb-btn sdb-btn--secondary sdb-btn--sm"
          href={anuncio.href}
          target="_blank"
          rel="sponsored noopener noreferrer"
        >
          {anuncio.chamada}
          <Icon name="externo" size="sm" />
        </a>
        <Button variant="plain" size="sm" onClick={onPorQue}>
          Por que estou vendo isto?
        </Button>
      </div>
    </aside>
  );
}
