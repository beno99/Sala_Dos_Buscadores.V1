"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import type { Nivel } from "@/data/types";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import type { PessoaComunidadeVisual } from "./LinhaPessoa";
import { Badge, SeloNivel } from "./Selos";

/** Anatomia visual; nenhum selo editorial é atribuído à publicação. */
export function CardPublicacao({
  autor,
  tipo,
  data,
  tempo,
  nivel,
  texto,
  tags,
  imagem,
  acoes,
  menu,
  bloco,
  comentarios,
}: {
  autor: PessoaComunidadeVisual;
  tipo: string;
  data: string;
  tempo: string;
  nivel?: { valor: Nivel; assunto: string };
  texto: string;
  tags?: ReactNode;
  imagem?: { src: string; alt: string; credito?: string };
  acoes?: ReactNode;
  menu?: ReactNode;
  bloco?: ReactNode;
  comentarios?: ReactNode;
}) {
  const id = useId();
  const [expandida, setExpandida] = useState(false);
  const textoRef = useRef<HTMLParagraphElement>(null);
  const [excede, setExcede] = useState(false);
  useEffect(() => {
    if (expandida) return;
    const elemento = textoRef.current;
    if (!elemento) return;
    const medir = () => setExcede(elemento.scrollHeight > elemento.clientHeight + 1);
    const observer = new ResizeObserver(medir);
    observer.observe(elemento);
    medir();
    return () => observer.disconnect();
  }, [expandida]);
  return (
    <article className="sdb-post" aria-label={`${tipo} de ${autor.nome}`}>
      <header className="sdb-post__head">
        <Avatar iniciais={autor.iniciais} foto={autor.foto} />
        <div className="sdb-post__identity">
          <div className="sdb-post__byline">
            <a className="sdb-post__name" href={autor.href}>
              {autor.nome}
            </a>
            {autor.anfitriao && <Badge variant="neutral">Anfitrião</Badge>}
          </div>
          <p className="sdb-footnote sdb-post__meta">
            <time dateTime={data}>{tempo}</time> · {tipo}
          </p>
          <span className="sdb-sr">Publicado por um {autor.anfitriao ? "anfitrião" : "buscador"}</span>
        </div>
        {nivel && (
          <div className="sdb-post__level" role="group" aria-label={`Nível em ${nivel.assunto}`}>
            <SeloNivel nivel={nivel.valor} />
            <span className="sdb-sr">em {nivel.assunto}</span>
          </div>
        )}
        {menu}
      </header>
      {tags && <div className="sdb-post__tags">{tags}</div>}
      {imagem && (
        <figure className="sdb-post__media">
          {/* biome-ignore lint/performance/noImgElement: imagem enviada, com proporção reservada pelo DS. */}
          <img src={imagem.src} alt={imagem.alt} width={960} height={720} loading="lazy" />
          {imagem.credito && <figcaption className="sdb-footnote">{imagem.credito}</figcaption>}
        </figure>
      )}
      <p ref={textoRef} id={id} className="sdb-body-sm sdb-post__text" data-collapsed={!expandida}>
        {texto}
      </p>
      {(excede || expandida) && (
        <Button
          variant="plain"
          className="sdb-post__more"
          aria-expanded={expandida}
          aria-controls={id}
          onClick={() => setExpandida(!expandida)}
        >
          {expandida ? "Ver menos" : "Ver mais"}
        </Button>
      )}
      {bloco && <div className="sdb-post__block">{bloco}</div>}
      {acoes}
      {comentarios && <div className="sdb-post__previews">{comentarios}</div>}
    </article>
  );
}
