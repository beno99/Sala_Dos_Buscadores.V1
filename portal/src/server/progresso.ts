import "server-only";
import { salasOficiais, todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { CONTA_DEMONSTRACAO } from "@/features/auth/contas";
import { conquistasNovas } from "@/features/estudo/conquistas";
import { alternarItem, type TipoEstante } from "@/features/estudo/estante";
import {
  type ConquistaId,
  chaveLeitura,
  type EventoEstudo,
  type ItemAcervo,
  type ProgressoEstudo,
  progressoVazio,
} from "@/features/estudo/tipos";

/*
 * Progresso de estudo por conta, em memória no servidor (some quando ele
 * reinicia, como as contas). Privado: só a própria conta lê e grava. Num
 * backend real, vira uma tabela por membro com as mesmas operações.
 */

const chaveEstado = Symbol.for("sala-dos-buscadores.progresso");
type ComEstado = typeof globalThis & { [chaveEstado]?: Map<string, ProgressoEstudo> };

/** Histórico da conta de demonstração: 3 Salas, 6 leituras e uma em andamento. */
function progressoDemonstracao(): ProgressoEstudo {
  const lida = (sala: ItemAcervo["sala"], slug: string, dia: string) => ({
    sala,
    slug,
    pct: 100,
    atualizadaEm: `${dia}T14:00:00.000Z`,
    concluidaEm: `${dia}T14:00:00.000Z`,
  });
  return {
    ...progressoVazio(),
    salasVisitadas: ["nag-hammadi", "corpus-hermeticum", "caibalion"],
    leituras: [
      lida("nag-hammadi", "evangelho-de-tome-114-ditos", "2026-09-15"),
      lida("nag-hammadi", "evangelho-de-tome-ditos-1-a-3", "2026-09-16"),
      lida("corpus-hermeticum", "poimandres-a-mente-que-fala", "2026-09-20"),
      lida("corpus-hermeticum", "tratado-xiii-renascimento-silencio", "2026-09-24"),
      lida("caibalion", "caibalion-principio-do-mentalismo", "2026-09-26"),
      lida("caibalion", "sete-principios-hermeticos", "2026-09-27"),
      {
        sala: "corpus-hermeticum",
        slug: "poimandres-subida-pelas-esferas",
        pct: 38,
        atualizadaEm: "2026-10-06T19:30:00.000Z",
      },
    ],
    temasComparados: ["morte", "alma"],
    verbetesAbertos: ["Pleroma", "Sofia", "Nous", "Ogdóade", "Gnose", "Mentalismo"],
    trilhas: { "corpus-hermeticum": 2 },
    estante: [
      { tipo: "sala", ref: "urantia", em: "2026-09-21T10:00:00.000Z" },
      { tipo: "sala", ref: "apocrifos-cristianismo-primitivo", em: "2026-09-22T10:00:00.000Z" },
      { tipo: "conteudo", ref: "urantia/documento-47-mundos-das-mansoes", em: "2026-09-28T10:00:00.000Z" },
      {
        tipo: "conteudo",
        ref: "apocrifos-cristianismo-primitivo/apocalipse-de-pedro-imagens-do-alem",
        em: "2026-10-01T10:00:00.000Z",
      },
    ],
    conquistas: {
      "porta-aberta": "2026-09-14T13:10:00.000Z",
      "lado-a-lado": "2026-09-18T20:00:00.000Z",
      "degrau-iii": "2026-09-24T14:00:00.000Z",
    },
  };
}

function estado(): Map<string, ProgressoEstudo> {
  const g = globalThis as ComEstado;
  g[chaveEstado] ??= new Map([[CONTA_DEMONSTRACAO.email, progressoDemonstracao()]]);
  return g[chaveEstado];
}

function doMembro(email: string): ProgressoEstudo {
  const m = estado();
  let p = m.get(email);
  if (!p) {
    p = progressoVazio();
    m.set(email, p);
  }
  return p;
}

export function progressoDe(email: string): ProgressoEstudo {
  return structuredClone(doMembro(email));
}

const TEMAS = new Set<string>(todosOsTemas().map((t) => t.slug));

export interface ResultadoEvento {
  /** Conquistas obtidas agora. */
  novas: ConquistaId[];
  /** O resumo (lateral, indicadores) mudou e vale atualizar a página. */
  mudouResumo: boolean;
}

/** Grava um evento de estudo, confere as conquistas e devolve as novas. */
export function registrarEvento(
  email: string,
  evento: EventoEstudo,
  acervo: ItemAcervo[],
  agora = new Date(),
): ResultadoEvento | null {
  const p = doMembro(email);
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
      const leitura = p.leituras.find((l) => l.sala === evento.sala && l.slug === evento.slug);
      if (leitura && leitura.pct >= 100 && !leitura.concluidaEm) leitura.concluidaEm = quando;
      if (p.continuarDispensado === chaveLeitura(evento.sala, evento.slug) && !leitura?.concluidaEm) {
        p.continuarDispensado = null;
      }
      break;
    }
    case "comparacao": {
      if (!TEMAS.has(evento.tema)) return null;
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

  const novas = conquistasNovas(p, { acervo, totalSalas: salasOficiais().length });
  for (const id of novas) p.conquistas[id] = quando;
  return { novas, mudouResumo: mudouResumo || novas.length > 0 };
}

export function dispensarContinuar(email: string, chave: string) {
  doMembro(email).continuarDispensado = chave;
}

/** Salva ou tira um item da Estante da própria conta; devolve se ficou salvo. */
export function alternarNaEstante(email: string, tipo: TipoEstante, ref: string): boolean {
  const p = doMembro(email);
  const r = alternarItem(p.estante, tipo, ref, new Date().toISOString());
  p.estante = r.estante;
  return r.salvo;
}

export function definirMostrarNiveis(email: string, mostrar: boolean) {
  doMembro(email).mostrarNiveis = mostrar;
}

/** "Restaurar acervo de demonstração": só a conta de demonstração volta ao histórico inicial. */
export function restaurarProgressoDemonstracao() {
  estado().set(CONTA_DEMONSTRACAO.email, progressoDemonstracao());
}

/** Só para testes: volta ao estado inicial. */
export function reiniciarProgresso() {
  (globalThis as ComEstado)[chaveEstado] = undefined;
}
