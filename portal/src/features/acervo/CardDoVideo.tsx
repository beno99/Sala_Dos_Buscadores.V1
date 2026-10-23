import { CardAcervo } from "@/components/ds/CardAcervo";
import { duracaoPorExtenso } from "@/components/ds/CardVideo";
import { temaPorSlug } from "@/data/catalogo";
import type { Video } from "@/data/types";
import { extrairIdYoutube } from "@/features/admin/regras/youtube";
import { BotaoSalvar } from "@/features/estudo/BotaoSalvar";

/**
 * Vídeo no card de conteúdo com imagem (página da Sala e do conteúdo): leva ao
 * YouTube, e só com a URL de um vídeo específico; sem ela, o card não vira
 * link e diz que o link ainda não foi cadastrado.
 */
export function CardDoVideo({ video, nomeSala }: { video: Video; nomeSala: string }) {
  const destino = extrairIdYoutube(video.url);
  const tema = temaPorSlug(video.tema);
  return (
    <CardAcervo
      id={`video-${video.id}`}
      tipo="Vídeo"
      onde={tema ? `${nomeSala} · ${tema.nome}` : nomeSala}
      titulo={video.titulo}
      href={destino.ok ? destino.canonica : undefined}
      externo
      nota="O link deste episódio ainda não foi cadastrado pela curadoria."
      nivel={video.nivel}
      duracao={video.duracao}
      duracaoExtenso={duracaoPorExtenso(video.duracao)}
      proveniencia="curado"
      imagem={video.imagem}
      placa={video.placa}
      acoes={<BotaoSalvar tipo="video" alvo={video.id} titulo={video.titulo} />}
    />
  );
}
