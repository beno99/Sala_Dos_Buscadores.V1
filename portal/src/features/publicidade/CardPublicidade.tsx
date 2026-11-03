import { ImagemPublicidade } from "./ImagemPublicidade";
import { type AnuncioPublico, type FormPublicidade, TEXTO_LINK_PADRAO, urlImagemPublicidade } from "./tipos";
import "./publicidade.css";

export function CardPublicidade({
  anuncio,
  previa = false,
}: {
  anuncio: FormPublicidade | AnuncioPublico;
  previa?: boolean;
}) {
  const destinoValido = /^https?:\/\//i.test(anuncio.href.trim());
  const textoLink = anuncio.textoLink.trim() || TEXTO_LINK_PADRAO;
  return (
    <article className="sdb-publicidade" aria-label={previa ? "Prévia da publicidade" : "Publicidade"}>
      <p className="sdb-publicidade__rotulo">PUBLICIDADE</p>
      {anuncio.imagemId ? (
        <ImagemPublicidade
          src={urlImagemPublicidade(anuncio.imagemId)}
          alt={anuncio.alt}
          enquadramento={anuncio.enquadramento}
        />
      ) : previa ? (
        <div className="sdb-publicidade__sem-imagem">A imagem do seu produto aparecerá aqui</div>
      ) : null}
      <div className="sdb-publicidade__conteudo">
        {anuncio.categoria.trim() && <p className="sdb-publicidade__categoria">{anuncio.categoria}</p>}
        <h2 className="sdb-publicidade__titulo">
          {anuncio.titulo || (previa ? "O título do seu anúncio" : "")}
        </h2>
        <p className="sdb-publicidade__descricao">
          {anuncio.descricao ||
            (previa ? "Apresente seu produto e o que ele pode oferecer a quem visita o Portal." : "")}
        </p>
        {destinoValido ? (
          <a
            className="sdb-publicidade__link"
            href={anuncio.href.trim()}
            target="_blank"
            rel="sponsored noopener noreferrer"
          >
            {textoLink} <span aria-hidden="true">↗</span>
            <span className="sdb-publicidade__sr"> (abre em nova aba)</span>
          </a>
        ) : previa ? (
          <span className="sdb-publicidade__link">
            {textoLink} <span aria-hidden="true">↗</span>
          </span>
        ) : null}
      </div>
      <footer className="sdb-publicidade__rodape">
        Anunciante: {anuncio.anunciante || (previa ? "Nome do anunciante" : "")}
      </footer>
    </article>
  );
}
