import "server-only";
import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { alternarItem, type TipoEstante } from "@/features/estudo/estante";
import {
  chaveLeitura,
  type EventoEstudo,
  type ItemAcervo,
  type ItemVideo,
  type ProgressoEstudo,
  progressoVazio,
} from "@/features/estudo/tipos";
import { type CodigoGema, conceder } from "@/features/jornada/regras";
import { progressos } from "./store";

/*
 * Progresso de estudo por conta (pelo id), no banco (tabela progresso_estudo).
 * Privado: só a própria conta lê e grava. Cada operação grava o progresso
 * inteiro de volta no snapshot persistido (src/server/store.ts).
 */

function doMembro(contaId: string): ProgressoEstudo {
  return structuredClone(progressos().get(contaId) ?? progressoVazio());
}

const gravar = (contaId: string, p: ProgressoEstudo) => progressos().set(contaId, p);

export function progressoDe(contaId: string): ProgressoEstudo {
  return doMembro(contaId);
}

export interface ResultadoEvento {
  /** Gemas da Jornada concedidas agora. */
  novas: CodigoGema[];
  /** O resumo (lateral, indicadores) mudou e vale atualizar a página. */
  mudouResumo: boolean;
}

/** Grava um evento de estudo, confere as conquistas e devolve as novas. */
export function registrarEvento(
  contaId: string,
  evento: EventoEstudo,
  acervo: ItemAcervo[],
  videos: ItemVideo[],
  agora = new Date(),
): ResultadoEvento | null {
  const p = doMembro(contaId);
  const quando = agora.toISOString();
  let mudouResumo = true;

  switch (evento.tipo) {
    case "sala": {
      if (!todasAsSalas().some((s) => s.slug === evento.sala)) return null;
      if (p.salasVisitadas.includes(evento.sala)) mudouResumo = false;
      else p.salasVisitadas.push(evento.sala);
      break;
    }
    case "leitura": {
      const existe = acervo.some((c) => c.sala === evento.sala && c.slug === evento.slug);
      if (!existe || !Number.isFinite(evento.pct)) return null;
      const pct = Math.max(0, Math.min(100, Math.round(evento.pct)));
      if (!p.salasVisitadas.includes(evento.sala)) p.salasVisitadas.push(evento.sala);
      const atual = p.leituras.find((l) => l.sala === evento.sala && l.slug === evento.slug);
      if (!atual) {
        p.leituras.push({ sala: evento.sala, slug: evento.slug, pct, atualizadaEm: quando });
      } else {
        const terminou = !atual.concluidaEm && pct >= 100;
        mudouResumo = terminou;
        atual.pct = Math.max(atual.pct, pct);
        atual.atualizadaEm = quando;
      }
      // Desde a Jornada, chegar ao fim do texto não conclui: a conclusão é declarada.
      if (atual) mudouResumo = false;
      const leitura = p.leituras.find((l) => l.sala === evento.sala && l.slug === evento.slug);
      if (p.continuarDispensado === chaveLeitura(evento.sala, evento.slug) && !leitura?.concluidaEm) {
        p.continuarDispensado = null;
      }
      break;
    }
    case "concluir":
    case "desmarcar": {
      const item = acervo.find((c) => c.sala === evento.sala && c.slug === evento.slug);
      if (!item || item.donoId === contaId) return null;
      let leitura = p.leituras.find((l) => l.sala === evento.sala && l.slug === evento.slug);
      if (evento.tipo === "concluir") {
        if (leitura?.concluidaEm) return { novas: [], mudouResumo: false };
        if (!leitura) {
          leitura = { sala: item.sala, slug: item.slug, pct: 0, atualizadaEm: quando };
          p.leituras.push(leitura);
        }
        Object.assign(leitura, {
          concluidaEm: quando,
          origem: "declarada",
          temas: [...item.temas],
          atualizadaEm: quando,
        });
        if (!p.salasVisitadas.includes(item.sala)) p.salasVisitadas.push(item.sala);
      } else {
        if (!leitura?.concluidaEm) return { novas: [], mudouResumo: false };
        delete leitura.concluidaEm;
        delete leitura.origem;
        delete leitura.temas;
        p.ajustes = [
          ...(p.ajustes ?? []),
          { alvo: chaveLeitura(item.sala, item.slug), acao: "desmarcou", em: quando },
        ];
      }
      break;
    }
    case "concluir-video":
    case "desmarcar-video": {
      const video = videos.find((v) => v.id === evento.id);
      if (!video || video.donoId === contaId) return null;
      const lista = p.videosConcluidos ?? [];
      const ja = lista.some((v) => v.id === video.id);
      if (evento.tipo === "concluir-video") {
        if (ja) return { novas: [], mudouResumo: false };
        p.videosConcluidos = [
          ...lista,
          { id: video.id, sala: video.sala, temas: [...video.temas], em: quando },
        ];
      } else {
        if (!ja) return { novas: [], mudouResumo: false };
        p.videosConcluidos = lista.filter((v) => v.id !== video.id);
        p.ajustes = [...(p.ajustes ?? []), { alvo: `video:${video.id}`, acao: "desmarcou", em: quando }];
      }
      break;
    }
    case "comparacao": {
      if (!todosOsTemas().some((t) => t.slug === evento.tema)) return null;
      if (p.temasComparados.includes(evento.tema)) mudouResumo = false;
      else p.temasComparados.push(evento.tema);
      break;
    }
    case "verbete": {
      const termo = String(evento.termo).trim().slice(0, 80);
      if (!termo) return null;
      if (p.verbetesAbertos.includes(termo)) mudouResumo = false;
      else p.verbetesAbertos.push(termo);
      break;
    }
    case "fontes": {
      p.fontesConferidas += 1;
      mudouResumo = p.fontesConferidas === 1;
      break;
    }
    default:
      return null;
  }

  const novas = conceder(p, { contaId, acervo, videos }, quando);
  gravar(contaId, p);
  return { novas, mudouResumo: mudouResumo || novas.length > 0 };
}

export function dispensarContinuar(contaId: string, chave: string) {
  gravar(contaId, { ...doMembro(contaId), continuarDispensado: chave });
}

/** Salva ou tira um item da Estante da própria conta; devolve se ficou salvo. */
export function alternarNaEstante(contaId: string, tipo: TipoEstante, ref: string): boolean {
  const p = doMembro(contaId);
  const r = alternarItem(p.estante, tipo, ref, new Date().toISOString());
  gravar(contaId, { ...p, estante: r.estante });
  return r.salvo;
}

export function definirMostrarNiveis(contaId: string, mostrar: boolean) {
  gravar(contaId, { ...doMembro(contaId), mostrarNiveis: mostrar });
}
