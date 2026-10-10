import type { Route } from "next";
import type { AbaApp } from "@/components/ds/BarraAbasApp";
import type { IconName } from "@/components/ds/Icon";
import type { GrupoNavegacaoApp } from "@/components/ds/NavegacaoLateralApp";

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
  { href: "/trilhas" as Route, rotulo: "Trilhas", icone: "trilha", grupo: "Estudo" },
  { href: "/estante" as Route, rotulo: "Estante", icone: "estante", grupo: "Estudo" },
  { href: "/comparar", rotulo: "Comparar", icone: "comparar", grupo: "Ferramentas" },
  { href: "/assistente", rotulo: "Assistente", icone: "assistente", grupo: "Ferramentas" },
  { href: "/ajustes" as Route, rotulo: "Ajustes", icone: "ajustes", grupo: "Conta" },
];

const ativa = (href: string, caminho: string) =>
  href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(`${href}/`);

export function tituloDaPagina(caminho: string): string {
  return SECOES.find((s) => ativa(s.href, caminho))?.rotulo ?? "A Sala dos Buscadores";
}

export function gruposDaLateral(
  caminho: string,
  { admin, sair }: { admin: boolean; sair: () => void },
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
  if (admin) conta?.itens.push({ rotulo: "Curadoria", icone: "editar", href: "/admin" });
  conta?.itens.push({ rotulo: "Sair", icone: "sair", onClick: sair });
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
  const partes = pseudonimo
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
