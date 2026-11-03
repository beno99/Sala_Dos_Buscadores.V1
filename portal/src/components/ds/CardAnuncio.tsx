import type { CSSProperties } from "react";
import { CHAMADA_PADRAO, linkValido } from "@/features/anuncios/regras";

export interface DadosCardAnuncio {
  imagem?: string | null;
  focoX: number;
  focoY: number;
  alt: string;
  categoria: string;
  titulo: string;
  descricao: string;
  href: string;
  chamada: string;
  anunciante: string;
}

const PLACEHOLDERS = {
  titulo: "Título do anúncio",
  descricao: "Explique brevemente o que você oferece.",
  anunciante: "Nome do anunciante",
};

/**
 * Card de publicidade do Portal (EspacoPublicitario, variante portal). O mesmo
 * componente desenha a prévia do anfitrião (`previa`): campos vazios mostram
 * placeholders só na tela, e o link só vira link com endereço válido.
 */
export function CardAnuncio({ anuncio: a, previa = false }: { anuncio: DadosCardAnuncio; previa?: boolean }) {
  const texto = (valor: string, chave: keyof typeof PLACEHOLDERS) =>
    valor || (previa ? <span className="is-placeholder">{PLACEHOLDERS[chave]}</span> : null);
  const chamada = a.chamada || CHAMADA_PADRAO;
  const conteudoLink = (
    <>
      {chamada}
      <span aria-hidden="true">↗</span>
    </>
  );
  return (
    <aside className="sdb-ad sdb-ad--portal" aria-label="Publicidade">
      <span className="sdb-ad__label">Publicidade</span>
      <div className="sdb-ad__media" style={{ "--sdb-ad-foco": `${a.focoX}% ${a.focoY}%` } as CSSProperties}>
        {a.imagem ? (
          // biome-ignore lint/performance/noImgElement: imagem enviada pelo anunciante, servida por /midia.
          <img src={a.imagem} alt={a.alt} />
        ) : (
          previa && <span className="sdb-ad__vazio">Imagem do produto</span>
        )}
      </div>
      {a.categoria && <p className="sdb-ad__category">{a.categoria}</p>}
      <h2 className="sdb-ad__title">{texto(a.titulo, "titulo")}</h2>
      <p className="sdb-ad__text">{texto(a.descricao, "descricao")}</p>
      {linkValido(a.href) ? (
        <a className="sdb-ad__link" href={a.href} target="_blank" rel="sponsored noopener noreferrer">
          {conteudoLink}
          <span className="sdb-sr"> (abre em nova aba)</span>
        </a>
      ) : (
        previa && <span className="sdb-ad__link">{conteudoLink}</span>
      )}
      <p className="sdb-ad__advertiser">{texto(a.anunciante, "anunciante")}</p>
    </aside>
  );
}
