import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import type { Video } from "@/data/types";
import { extrairIdYoutube } from "@/features/admin/regras/youtube";
import { formatarData } from "@/lib/texto";
import { Arc } from "./Arc";

/** "24:10" → "24 minutos e 10 segundos", para o leitor de tela. */
export function duracaoPorExtenso(duracao: string): string {
  const [min = 0, seg = 0] = duracao.split(":").map(Number);
  const partes = [];
  if (min) partes.push(`${min} ${min === 1 ? "minuto" : "minutos"}`);
  if (seg) partes.push(`${seg} ${seg === 1 ? "segundo" : "segundos"}`);
  return partes.join(" e ") || duracao;
}

/**
 * Vídeo do canal (CardVideo 1.0, RF-16): horizontal, informações sobre a
 * própria imagem com desfoque progressivo. Não há reprodução incorporada: a
 * ação abre o vídeo no YouTube em nova aba, e só vira link com o endereço de
 * um vídeo específico (links de busca não contam).
 */
export function CardVideo({ video }: { video: Video }) {
  const sala = salaPorSlug(video.sala);
  const tema = temaPorSlug(video.tema);
  const destino = extrairIdYoutube(video.url);
  const id = `video-${video.id}`;
  const notaId = `${id}-nota`;
  const conteudoAcao = (
    <>
      Assistir no YouTube
      <svg viewBox="0 0 256 256" aria-hidden="true">
        <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
      </svg>
    </>
  );

  return (
    <article className="video" aria-labelledby={id}>
      <div className="video__media">
        {video.imagem ? (
          // biome-ignore lint/performance/noImgElement: miniatura decorativa servida de public/imagens.
          <img className="video__image" src={video.imagem} alt="" width={736} height={414} decoding="async" />
        ) : (
          <div className={`video__placa sdb-plate--${video.placa}`} aria-hidden="true">
            <Arc line on={video.placa} />
          </div>
        )}
        <div className="video__blur" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="video__shade" aria-hidden="true" />
        <div className="video__top">
          <span className="video__duration">
            <svg viewBox="0 0 256 256" aria-hidden="true">
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z" />
            </svg>
            <span aria-hidden="true">{video.duracao}</span>
            <span className="sdb-sr">Duração: {duracaoPorExtenso(video.duracao)}</span>
          </span>
        </div>
        <div className="video__content">
          <div className="video__info">
            <p className="video__context">
              <span>{sala?.nome}</span>
              {tema && <span>Tema: {tema.nome.toLowerCase()}</span>}
            </p>
            <h3 className="video__title" id={id}>
              {video.titulo}
            </h3>
            <p className="video__meta">
              {video.episodio} · <time dateTime={video.publicadoEm}>{formatarData(video.publicadoEm)}</time>
            </p>
          </div>
          {destino.ok ? (
            <a className="video__action" href={destino.canonica} target="_blank" rel="noopener noreferrer">
              {conteudoAcao}
              <span className="sdb-sr">: {video.titulo} (abre em nova aba)</span>
            </a>
          ) : (
            <span
              className="video__action"
              role="link"
              aria-disabled="true"
              aria-describedby={notaId}
              tabIndex={0}
            >
              {conteudoAcao}
              <span className="sdb-sr">: {video.titulo}</span>
            </span>
          )}
        </div>
      </div>
      {!destino.ok && (
        <p id={notaId} className="sdb-footnote m-0 px-2 pt-2">
          O link deste episódio ainda não foi cadastrado pela curadoria.
        </p>
      )}
    </article>
  );
}
