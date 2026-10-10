import { todasAsSalas, todosOsTemas } from "@/data/catalogo";
import type { TipoConteudo } from "@/data/types";
import { normalizar } from "@/lib/texto";
import { detectarTemas, type ModoBusca } from "./busca";

/* Sugestões ao vivo do Painel de busca (RF-17): temas, Salas, conteúdos e o assistente. */

export interface ConteudoBuscavel {
  titulo: string;
  salaNome: string;
  href: string;
  tipo: TipoConteudo;
}

export type GrupoSugestao = "Temas" | "Salas" | "Conteúdos" | "Assistente";

export interface Sugestao {
  id: string;
  grupo: GrupoSugestao;
  rotulo: string;
  detalhe?: string;
  href: string;
  tipo: "tema" | "sala" | "assistente" | TipoConteudo;
}

const MAX_CONTEUDOS = 5;

export function sugerir(texto: string, modo: ModoBusca, conteudos: ConteudoBuscavel[]): Sugestao[] {
  const q = normalizar(texto).trim();
  const contem = (alvo: string) => !q || normalizar(alvo).includes(q);

  const salas: Sugestao[] = todasAsSalas()
    .filter((s) => contem(s.nome) || contem(s.tradicaoCurta))
    .map((s) => ({
      id: `sala-${s.slug}`,
      grupo: "Salas",
      rotulo: s.nome,
      detalhe: s.tradicaoCurta,
      href: `/salas/${s.slug}`,
      tipo: "sala",
    }));
  if (modo === "sala") return salas;

  const reconhecidos = q ? detectarTemas(texto) : [];
  const temas: Sugestao[] = todosOsTemas()
    .filter((t) => !q || contem(t.nome) || reconhecidos.includes(t.slug))
    .sort((a, b) => {
      const ia = reconhecidos.indexOf(a.slug);
      const ib = reconhecidos.indexOf(b.slug);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((t) => ({
      id: `tema-${t.slug}`,
      grupo: "Temas",
      rotulo: `Comparar «${t.nome}» entre as Salas`,
      href: `/comparar?tema=${t.slug}`,
      tipo: "tema",
    }));

  if (!q) return [...temas, ...salas];

  const achados: Sugestao[] = conteudos
    .filter((c) => contem(c.titulo))
    .slice(0, MAX_CONTEUDOS)
    .map((c) => ({
      id: `conteudo-${c.href}`,
      grupo: "Conteúdos",
      rotulo: c.titulo,
      detalhe: c.salaNome,
      href: c.href,
      tipo: c.tipo,
    }));

  const assistente: Sugestao = {
    id: "assistente",
    grupo: "Assistente",
    rotulo: `Perguntar ao assistente: «${texto.trim()}»`,
    href: `/assistente?pergunta=${encodeURIComponent(texto.trim())}`,
    tipo: "assistente",
  };

  return [...temas, ...salas, ...achados, assistente];
}
