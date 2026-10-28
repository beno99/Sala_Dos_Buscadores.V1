import "server-only";
import type { Route } from "next";
import type { ConquistaVisual } from "@/components/ds/Conquista";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import { trilhaDaSala } from "@/data/referencia/trilhas";
import { acervoDeEstudo, acervoPublico, listarSalas, temasDaSala } from "@/data/repositorio";
import type { Nivel, SalaSlug } from "@/data/types";
import type { SalaNaGrade } from "@/features/acervo/GradeSalas";
import { avaliarConquistas } from "@/features/estudo/conquistas";
import { nivelNoAssunto, textoQuantoFalta } from "@/features/estudo/niveis";
import { leiturasEmAndamento } from "@/features/estudo/painel";
import type { Membro } from "@/modules/conta/conta.contratos";
import { imagem, imagemDaSala } from "./imagens";
import { perfilDe } from "./perfilBuscador";
import { progressoDe } from "./progresso";

/*
 * Perfil do buscador (layout do Figma): página privada, só da própria conta.
 * Junta o que o estudo já registra: Salas visitadas, leituras, temas
 * comparados, níveis por Sala, leitura e trilha em andamento e conquistas.
 */

export interface ModeloPerfil {
  capa?: string;
  /** Imagens enviadas pela própria conta, para o "Editar perfil". */
  enviadas: { foto: { id: string; url: string } | null; capa: { id: string; url: string } | null };
  foto?: string;
  sobre: string;
  numeros: { salas: string; lidos: number; temas: number; conquistas: string };
  temasAcompanhados: string[];
  mostrarNiveis: boolean;
  niveis: { sala: string; href: Route; nivel: Nivel; pct: number; quantoFalta: string }[];
  continuar?: { titulo: string; onde: string; pct: number; href: Route };
  trilha?: { titulo: string; sala: string; degrau: number; total: number; proximo?: string; href: Route };
  conquistas: ConquistaVisual[];
  minhasSalas: SalaNaGrade[];
}

export async function modeloDoPerfil(m: Membro): Promise<ModeloPerfil> {
  const p = progressoDe(m.id);
  const acervo = acervoDeEstudo();
  const salas = await listarSalas();
  const oficiais = salas.filter((s) => s.origem === "oficial");
  const lidas = p.leituras.filter((l) => l.concluidaEm).length;
  const conquistas = avaliarConquistas(p, { acervo, totalSalas: oficiais.length });

  const niveis = [...new Set([...p.salasVisitadas, ...p.leituras.map((l) => l.sala)])]
    .map((sala) => ({ sala, n: nivelNoAssunto({ tipo: "sala", sala }, acervo, p.leituras) }))
    .filter(({ n }) => n.lidas > 0)
    .sort((a, b) => b.n.lidas - a.n.lidas)
    .slice(0, 3)
    .map(({ sala, n }) => ({
      sala: salaPorSlug(sala)?.nome ?? sala,
      href: `/salas/${sala}` as Route,
      nivel: n.nivel,
      pct: n.total ? n.lidas / n.total : 0,
      quantoFalta: textoQuantoFalta(n),
    }));

  const andamento = leiturasEmAndamento(p)[0];
  const conteudo =
    andamento &&
    acervoPublico().conteudos.find((c) => c.sala === andamento.sala && c.slug === andamento.slug);

  const [salaDaTrilha, degrau] = (Object.entries(p.trilhas) as [SalaSlug, number][])[0] ?? [];
  const trilha = salaDaTrilha ? trilhaDaSala(salaDaTrilha) : undefined;

  const visitadas = new Set(p.salasVisitadas);
  const perfil = perfilDe(m.id);
  return {
    capa: perfil.capa ?? imagem("banner", "marca-colunata") ?? imagem("banner", "marca"),
    enviadas: {
      foto: perfil.fotoId && perfil.foto ? { id: perfil.fotoId, url: perfil.foto } : null,
      capa: perfil.capaId && perfil.capa ? { id: perfil.capaId, url: perfil.capa } : null,
    },
    ...(perfil.foto ? { foto: perfil.foto } : {}),
    sobre: perfil.sobre,
    numeros: {
      salas: `${p.salasVisitadas.filter((s) => oficiais.some((o) => o.slug === s)).length}/${oficiais.length}`,
      lidos: lidas,
      temas: p.temasComparados.length,
      conquistas: `${conquistas.filter((c) => c.obtida).length}/${conquistas.length}`,
    },
    temasAcompanhados: (m.preferencias?.temas ?? []).map((t) => temaPorSlug(t)?.nome ?? t),
    mostrarNiveis: p.mostrarNiveis,
    niveis,
    ...(conteudo && andamento
      ? {
          continuar: {
            titulo: conteudo.titulo,
            onde: salaPorSlug(conteudo.sala)?.nome ?? "",
            pct: andamento.pct,
            href: `/salas/${conteudo.sala}/${conteudo.slug}` as Route,
          },
        }
      : {}),
    ...(trilha && salaDaTrilha && degrau !== undefined
      ? {
          trilha: {
            titulo: trilha.titulo,
            sala: salaPorSlug(salaDaTrilha)?.nome ?? "",
            degrau,
            total: trilha.degraus.length,
            proximo: trilha.degraus[degrau]?.titulo,
            href: "/trilhas" as Route,
          },
        }
      : {}),
    conquistas,
    minhasSalas: salas
      .filter((s) => visitadas.has(s.slug))
      .map((s) => ({ sala: s, temas: temasDaSala(s.slug), imagem: imagemDaSala(s) })),
  };
}
