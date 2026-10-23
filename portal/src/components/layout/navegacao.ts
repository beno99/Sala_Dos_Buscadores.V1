import type { Route } from "next";
import type { AbaApp } from "@/components/ds/BarraAbasApp";
import type { TrilhaBarra } from "@/components/ds/BarraSuperior";
import type { IconName } from "@/components/ds/Icon";
import type { GrupoNavegacaoApp } from "@/components/ds/NavegacaoLateralApp";
import { salaPorSlug } from "@/data/catalogo";
import type { ConteudoBuscavel } from "@/features/busca/sugestoes";

/* Seções do app. A página inicial chama-se "Portal", nunca "Home" ou "Início". */

interface Secao {
  href: Route;
  rotulo: string;
  icone: IconName;
  grupo: "Acervo" | "Estudo" | "Ferramentas" | "Conta";
}

const SECOES: Secao[] = [
  { href: "/", rotulo: "Portal", icone: "inicio", grupo: "Acervo" },
  { href: "/destaques" as Route, rotulo: "Destaques", icone: "destaques", grupo: "Acervo" },
  { href: "/biblioteca" as Route, rotulo: "Biblioteca", icone: "biblioteca", grupo: "Acervo" },
  { href: "/salas" as Route, rotulo: "Salas", icone: "salas", grupo: "Acervo" },
  { href: "/comunidade" as Route, rotulo: "Comunidade", icone: "comunidade", grupo: "Estudo" },
  { href: "/trilhas" as Route, rotulo: "Trilhas", icone: "trilha", grupo: "Estudo" },
  { href: "/estante" as Route, rotulo: "Estante", icone: "estante", grupo: "Estudo" },
  { href: "/comparar", rotulo: "Comparar", icone: "comparar", grupo: "Ferramentas" },
  { href: "/assistente", rotulo: "Assistente", icone: "assistente", grupo: "Ferramentas" },
  { href: "/ajustes" as Route, rotulo: "Ajustes", icone: "ajustes", grupo: "Conta" },
];

const ativa = (href: string, caminho: string) =>
  href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);

/** Área do anfitrião: só aparece para o papel anfitrião. */
export const MINHAS_SALAS = {
  href: "/anfitriao" as Route,
  rotulo: "Minhas Salas",
  icone: "anfitriao" as IconName,
};

/** A página de um conteúdo publicado ("/salas/{sala}/{conteudo}"), achada na lista que a moldura recebe. */
function conteudoDaPagina(caminho: string, conteudos: readonly ConteudoBuscavel[]) {
  if (!/^\/salas\/[^/]+\/[^/]+\/?$/.test(caminho)) return undefined;
  const alvo = decodeURIComponent(caminho.replace(/\/$/, ""));
  return conteudos.find((c) => c.href === alvo);
}

export function tituloDaPagina(caminho: string, conteudos: readonly ConteudoBuscavel[] = []): string {
  if (caminho === "/perfil" || caminho.startsWith("/perfil/")) return "Perfil";
  if (ativa(MINHAS_SALAS.href, caminho)) return MINHAS_SALAS.rotulo;
  // A página de um conteúdo fica dentro de Salas (layout do Figma); o tipo aparece no próprio artigo.
  if (conteudoDaPagina(caminho, conteudos)) return "Salas";
  // A página pública de um anfitrião fica dentro de Salas.
  if (caminho.startsWith("/anfitrioes/")) return "Salas";
  return SECOES.find((s) => ativa(s.href, caminho))?.rotulo ?? "A Sala dos Buscadores";
}

/**
 * Trilha da segunda linha da barra superior nas páginas de detalhe: a da
 * Sala ("Salas / Corpus Hermeticum") e a do conteúdo ("Salas / O Caibalion /
 * Os sete princípios…"). O nome da Sala sai do catálogo, que conhece as Salas
 * visíveis no servidor e no navegador; o título, dos conteúdos publicados.
 */
export function trilhaDaPagina(
  caminho: string,
  conteudos: readonly ConteudoBuscavel[] = [],
): TrilhaBarra | undefined {
  const conteudo = conteudoDaPagina(caminho, conteudos);
  if (conteudo) {
    const sala = conteudo.href.split("/")[2] ?? "";
    return {
      itens: [
        { href: "/salas" as Route, rotulo: "Salas" },
        { href: `/salas/${sala}` as Route, rotulo: salaPorSlug(sala)?.nome ?? conteudo.salaNome },
      ],
      atual: conteudo.titulo,
    };
  }
  const sala = /^\/salas\/([^/]+)\/?$/.exec(caminho)?.[1];
  const nome = sala ? salaPorSlug(decodeURIComponent(sala))?.nome : undefined;
  if (!nome) return undefined;
  return { itens: [{ href: "/salas" as Route, rotulo: "Salas" }], atual: nome };
}

/** Segunda linha da barra superior nas seções que têm uma frase própria (layout do Figma); nas outras, a saudação. */
export function subtituloDaPagina(caminho: string): string | undefined {
  if (caminho === "/estante" || caminho.startsWith("/estante/")) return "Todos os conteúdos salvos";
  if (caminho === "/perfil" || caminho.startsWith("/perfil/")) return "Seu perfil";
  return undefined;
}

export function gruposDaLateral(
  caminho: string,
  {
    admin,
    anfitriao,
    sair,
  }: {
    admin: boolean;
    /** Anfitrião: "Minhas Salas", com as decisões da curadoria ainda não vistas. */
    anfitriao?: { novidades: number };
    sair: () => void;
  },
): GrupoNavegacaoApp[] {
  const grupos: GrupoNavegacaoApp[] = (["Acervo", "Estudo", "Ferramentas", "Conta"] as const).map((g) => ({
    titulo: g,
    itens: SECOES.filter((s) => s.grupo === g).map((s) => ({
      rotulo: s.rotulo,
      icone: s.icone,
      href: s.href,
      ativo: ativa(s.href, caminho),
    })),
  }));
  const conta = grupos.at(-1);
  if (anfitriao) {
    conta?.itens.unshift({
      rotulo: MINHAS_SALAS.rotulo,
      icone: MINHAS_SALAS.icone,
      href: MINHAS_SALAS.href,
      ativo: ativa(MINHAS_SALAS.href, caminho),
      contagem: anfitriao.novidades > 0 ? anfitriao.novidades : undefined,
    });
  }
  if (admin) conta?.itens.push({ rotulo: "Curadoria", icone: "editar", href: "/admin" });
  conta?.itens.push({ rotulo: "Sair", icone: "sair", onClick: sair, perigo: true });
  return grupos;
}

const ABAS = ["/", "/biblioteca", "/trilhas", "/estante"];

export function abasDoCelular(caminho: string): AbaApp[] {
  return SECOES.filter((s) => ABAS.includes(s.href)).map((s) => ({
    href: s.href,
    rotulo: s.rotulo,
    icone: s.icone,
    ativa: ativa(s.href, caminho),
  }));
}

/** O caminho está numa seção que só aparece no "Mais" do celular. */
export function estaNoMais(caminho: string): boolean {
  return !ABAS.some((a) => ativa(a, caminho));
}

export function iniciaisDe(pseudonimo: string): string {
  // O que vem entre parênteses ("Helena Varga (demonstração)") não entra nas iniciais.
  const partes = pseudonimo
    .replace(/\([^)]*\)/g, " ")
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-ZÀ-Ú]/.test(p));
  const letras = partes.length > 1 ? `${partes[0]?.[0]}${partes.at(-1)?.[0]}` : pseudonimo.trim().slice(0, 2);
  return letras.toUpperCase();
}

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function membroDesde(iso: string): string {
  const d = new Date(iso);
  return `Membro desde ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
