import "server-only";
import type { Route } from "next";
import type { AnuncioVisual } from "@/components/ds/EspacoPublicitario";
import type { Indicador } from "@/components/ds/PainelIndicadores";
import { salaPorSlug, salasOficiais, temaPorSlug, todosOsTemas } from "@/data/catalogo";
import { DESTAQUES_DO_CANAL } from "@/data/referencia/banner";
import {
  acervoDeEstudo,
  acervoPublico,
  alcanceDoTema,
  listarSalas,
  type SalaResumo,
} from "@/data/repositorio";
import type { Conteudo, Nivel, Placa, SalaSlug, TemaSlug } from "@/data/types";
import { avaliarConquistas, type EstadoConquista } from "@/features/estudo/conquistas";
import { chaveEstante } from "@/features/estudo/estante";
import { assuntoEmFoco, NOME_NIVEL, nivelNoAssunto, textoQuantoFalta } from "@/features/estudo/niveis";
import { leiturasEmAndamento, resumoDoPainel, ultimaLeituraConcluida } from "@/features/estudo/painel";
import {
  comecePorAqui,
  conteudoParaAmpliar,
  type MotivoSala,
  noPerfil,
  ordenarSalas,
} from "@/features/estudo/recomendacao";
import { chaveLeitura, type ProgressoEstudo } from "@/features/estudo/tipos";
import { plural } from "@/lib/texto";
import type { Membro } from "@/modules/conta/conta.contratos";
import { imagem, imagemDaSala, imagemDoCard } from "./imagens";
import { perfilDe } from "./perfilBuscador";
import { progressoDe } from "./progresso";

/*
 * Monta, no servidor, o que o Portal e a lateral mostram, a partir do acervo
 * publicado, do progresso da conta e das regras puras de features/estudo.
 */

/** Anúncio aprovado pela curadoria (DRS): sem charlatanismo, promessa de cura ou urgência. */
interface Anuncio {
  id: string;
  anunciante: string;
  /** Título em dois tons: a segunda parte sai em label-secondary. */
  titulo: [string, string];
  texto: string;
  chamada: string;
  href: string;
  placa: Placa;
  /** Até dois atributos com ícone, mostrados no anúncio do painel. */
  atributos?: { icone: "fontePrimaria" | "glossario" | "relogio" | "artigo"; texto: string }[];
  locais: ("banner" | "painel")[];
}

export interface SlideAnuncio {
  id: string;
  tipo: "anuncio";
  anunciante: string;
  titulo: [string, string];
  texto: string;
  chamada: string;
  href: string;
  midia: { placa: Placa; imagem?: string };
}

export interface NivelEmFoco {
  nivel: Nivel;
  assunto: string;
  degraus: [number, number, number];
  quantoFalta: string;
}

export interface ModeloLateral {
  /** Foto que a própria conta enviou no Perfil. */
  foto?: string;
  continuar?: { titulo: string; detalhe: string; pct: number; href: Route; placa: Placa; chave: string };
  /** `chaves` no formato de chaveEstante ("sala:urantia"), para os botões de salvar. */
  salvos: { total: number; texto: string; chaves: string[] };
  mostrarNiveis: boolean;
  nivelFoco?: NivelEmFoco;
  conquistas: EstadoConquista[];
}

export interface SalaNoPortal {
  sala: SalaResumo;
  motivo: MotivoSala;
  temas: TemaSlug[];
  progresso: { pct: number; legenda: string };
  imagem?: string;
}

export interface ConteudoComImagem {
  conteudo: Conteudo;
  imagem?: string;
}

export interface ModeloPortal {
  imagemMarca?: string;
  slidesAnuncio: SlideAnuncio[];
  episodios: {
    id: string;
    rotulo: string;
    titulo: [string, string];
    sub: string;
    url: string;
    placa: Placa;
    imagem?: string;
  }[];
  salas: SalaNoPortal[];
  temas: { slug: TemaSlug; nome: string; contagem: number }[];
  indicadores: Indicador[];
  emAndamento: (ConteudoComImagem & { pct: number })[];
  comecePorAqui: ConteudoComImagem[];
  /** Última leitura concluída, para quem já leu tudo que começou. */
  ultimaLida?: ConteudoComImagem;
  recentes: ConteudoComImagem[];
  ampliar?: ConteudoComImagem & { motivo: string };
  anuncioPainel?: AnuncioVisual;
  nivelFoco?: NivelEmFoco;
  mostrarNiveis: boolean;
}

const preferenciasDe = (m: Membro) =>
  m.preferencias ?? { temas: [], salas: [], conviccao: { tipo: "pulada" as const }, concluidoEm: "" };

const nomeDaSala = (s: SalaSlug) => salaPorSlug(s)?.nome ?? s;

function lista(nomes: string[]): string {
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}

function nivelEmFoco(p: ProgressoEstudo, m: Membro): NivelEmFoco | undefined {
  const prefs = preferenciasDe(m);
  const assunto = assuntoEmFoco(p, prefs);
  if (!assunto) return undefined;
  const n = nivelNoAssunto(assunto, acervoDeEstudo(), p.leituras);
  const nome =
    assunto.tipo === "sala" ? nomeDaSala(assunto.sala) : (temaPorSlug(assunto.tema)?.nome ?? assunto.tema);
  return { nivel: n.nivel, assunto: nome, degraus: n.degraus, quantoFalta: textoQuantoFalta(n) };
}

export function modeloDaLateral(m: Membro): ModeloLateral {
  const p = progressoDe(m.id);
  const acervo = acervoDeEstudo();
  const publicos = acervoPublico().conteudos;
  const andamento = leiturasEmAndamento(p)[0];
  const conteudo = andamento && publicos.find((c) => c.sala === andamento.sala && c.slug === andamento.slug);
  const salas = p.estante.filter((e) => e.tipo === "sala").length;
  const conteudos = p.estante.length - salas;
  const foto = perfilDe(m.id).foto;
  return {
    ...(foto ? { foto } : {}),
    ...(conteudo && andamento
      ? {
          continuar: {
            titulo: conteudo.titulo,
            detalhe: `${conteudo.titulo.split(":")[0]} · ${andamento.pct}%`,
            pct: andamento.pct,
            href: `/salas/${conteudo.sala}/${conteudo.slug}` as Route,
            placa: salaPorSlug(conteudo.sala)?.placa ?? "bordo",
            chave: chaveLeitura(conteudo.sala, conteudo.slug),
          },
        }
      : {}),
    salvos: {
      total: p.estante.length,
      texto:
        p.estante.length === 0
          ? "Nada salvo ainda. Use o marcador nos cards."
          : `${plural(salas, "Sala", "Salas")} e ${plural(conteudos, "conteúdo", "conteúdos")} na Estante.`,
      chaves: p.estante.map((e) => chaveEstante(e.tipo, e.ref)),
    },
    mostrarNiveis: p.mostrarNiveis,
    ...(p.mostrarNiveis ? { nivelFoco: nivelEmFoco(p, m) } : {}),
    conquistas: avaliarConquistas(p, { acervo, totalSalas: salasOficiais().length }),
  };
}

export async function modeloDoPortal(m: Membro): Promise<ModeloPortal> {
  const p = progressoDe(m.id);
  const prefs = preferenciasDe(m);
  const acervo = acervoDeEstudo();
  const { conteudos: publicos, videos } = acervoPublico();
  const salas = await listarSalas();
  const porChave = (sala: string, slug: string) => publicos.find((c) => c.sala === sala && c.slug === slug);
  const comImagem = (c: Conteudo): ConteudoComImagem => ({
    conteudo: c,
    imagem: imagemDoCard(c) ?? imagemDaSala({ slug: c.sala }),
  });

  const ordem = ordenarSalas(
    salas.map((s) => s.slug),
    { acervo, leituras: p.leituras, interesses: prefs, conviccao: prefs.conviccao },
  );
  const salasNoPortal: SalaNoPortal[] = ordem.flatMap(({ sala, motivo }) => {
    const resumo = salas.find((s) => s.slug === sala);
    if (!resumo) return [];
    const n = nivelNoAssunto({ tipo: "sala", sala }, acervo, p.leituras);
    const visitada = p.salasVisitadas.includes(sala);
    const legenda =
      !visitada && n.lidas === 0
        ? `Ainda não visitada · ${plural(n.total, "conteúdo", "conteúdos")}`
        : `${p.mostrarNiveis ? `${NOME_NIVEL[n.nivel]} · ` : ""}${n.lidas} de ${n.total} lidos`;
    return [
      {
        sala: resumo,
        motivo,
        temas: [...new Set(acervo.filter((c) => c.sala === sala).flatMap((c) => c.temas))],
        progresso: { pct: n.total ? n.lidas / n.total : 0, legenda },
        imagem: imagemDaSala(resumo),
      },
    ];
  });

  const resumo = resumoDoPainel(p, acervo, salas.length);
  const naoVisitadas = salas.filter((s) => !p.salasVisitadas.includes(s.slug)).map((s) => s.nome);
  const indicadores: Indicador[] = [
    {
      rotulo: "Salas visitadas",
      valor: resumo.salas.visitadas,
      complemento: `de ${resumo.salas.total}`,
      progresso: resumo.salas.total ? resumo.salas.visitadas / resumo.salas.total : 0,
      dica:
        naoVisitadas.length === 0
          ? "Você já visitou todas as Salas."
          : naoVisitadas.length <= 2
            ? `Falta visitar ${lista(naoVisitadas)}.`
            : `${naoVisitadas.length} Salas ainda não visitadas.`,
    },
    {
      rotulo: "Conteúdos lidos",
      valor: resumo.lidos.total,
      dica: plural(resumo.lidos.fontesPrimarias, "fonte primária", "fontes primárias"),
    },
    {
      rotulo: "Temas comparados",
      valor: resumo.temas.total,
      dica: resumo.temas.total
        ? lista(resumo.temas.slugs.map((t) => temaPorSlug(t)?.nome ?? t))
        : "Nenhum ainda. Escolha um tema para comparar.",
    },
  ];

  const emAndamento = leiturasEmAndamento(p)
    .slice(0, 1)
    .flatMap((l) => {
      const c = porChave(l.sala, l.slug);
      return c ? [{ ...comImagem(c), pct: l.pct }] : [];
    });
  const comeceItens =
    p.leituras.length === 0
      ? comecePorAqui(acervo, prefs).flatMap((c) => {
          const x = porChave(c.sala, c.slug);
          return x ? [comImagem(x)] : [];
        })
      : [];
  // Quem já leu tudo que começou (nada em andamento, mas já leu algo): mostra a última
  // leitura concluída em vez de tratar como se nunca tivesse lido nada.
  const concluida = ultimaLeituraConcluida(p);
  const conteudoConcluido = concluida && porChave(concluida.sala, concluida.slug);
  const ultimaLida = conteudoConcluido ? comImagem(conteudoConcluido) : undefined;
  const sugestao = conteudoParaAmpliar(
    acervo,
    p.leituras,
    prefs,
    [...emAndamento, ...comeceItens].flatMap((e) =>
      acervo.filter((a) => a.sala === e.conteudo.sala && a.slug === e.conteudo.slug),
    ),
  );
  const conteudoAmpliar = sugestao && porChave(sugestao.sala, sugestao.slug);
  const jaNaTela = (c: Conteudo) =>
    [...emAndamento, ...comeceItens].some((e) => e.conteudo.slug === c.slug && e.conteudo.sala === c.sala) ||
    (conteudoAmpliar?.slug === c.slug && conteudoAmpliar.sala === c.sala);
  const recentes = [...publicos]
    .filter((c) => !jaNaTela(c))
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm))
    .slice(0, 5)
    .map(comImagem);
  const temasLidos = new Set(
    acervo
      .filter((c) => p.leituras.some((l) => l.concluidaEm && l.sala === c.sala && l.slug === c.slug))
      .flatMap((c) => c.temas),
  );
  const temaEmComum = conteudoAmpliar?.temas.find((t) => temasLidos.has(t));

  // Anúncios entram quando houver anunciantes reais, com tabela própria e aprovação da curadoria.
  const anuncios: (Anuncio & { imagem?: string })[] = [];
  const episodios = DESTAQUES_DO_CANAL.flatMap((d) => {
    const v = videos.find((x) => x.id === d.video);
    if (!v) return [];
    return [
      {
        id: v.id,
        rotulo: `Episódio do canal · ${v.duracao} · ${nomeDaSala(v.sala)}`,
        titulo: d.titulo,
        sub: d.sub,
        url: v.url,
        placa: v.placa,
        imagem: imagem("banner", v.id) ?? imagem("episodios", v.id),
      },
    ];
  });

  return {
    imagemMarca: imagem("banner", "marca-colunata") ?? imagem("banner", "marca"),
    slidesAnuncio: anuncios
      .filter((a) => a.locais.includes("banner"))
      .map((a) => ({
        id: a.id,
        tipo: "anuncio" as const,
        anunciante: a.anunciante,
        titulo: a.titulo,
        texto: a.texto,
        chamada: a.chamada,
        href: a.href,
        midia: { placa: a.placa, imagem: imagem("banner", a.id) ?? a.imagem },
      })),
    episodios,
    salas: salasNoPortal,
    temas: todosOsTemas().map((t) => ({ slug: t.slug, nome: t.nome, contagem: alcanceDoTema(t.slug).itens })),
    indicadores,
    emAndamento,
    comecePorAqui: comeceItens,
    ultimaLida,
    recentes,
    ...(conteudoAmpliar
      ? {
          ampliar: {
            ...comImagem(conteudoAmpliar),
            motivo: temaEmComum
              ? `Outra Sala sobre ${temaPorSlug(temaEmComum)?.nome.toLowerCase()}, um tema que você já leu.`
              : noPerfil(conteudoAmpliar.sala, acervo, prefs)
                ? `Uma Sala que você ainda não visitou: ${nomeDaSala(conteudoAmpliar.sala)}.`
                : `Uma Sala fora dos seus interesses: ${nomeDaSala(conteudoAmpliar.sala)}.`,
          },
        }
      : {}),
    ...(p.mostrarNiveis ? { nivelFoco: nivelEmFoco(p, m) } : {}),
    anuncioPainel: anuncios.find((a) => a.locais.includes("painel")),
    mostrarNiveis: p.mostrarNiveis,
  };
}
