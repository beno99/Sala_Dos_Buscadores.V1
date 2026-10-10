import "server-only";
import { candidatosDestaques } from "@/data/repositorio";
import {
  type EscolhaDestaques,
  GRUPOS_VAGA,
  type GrupoVaga,
  podarEscolha,
  TAMANHO_GRUPO,
} from "@/features/destaques/vagas";
import { registrar } from "../auditoria";
import { acervo } from "../store";
import type { ResultadoAcao } from "./editorial";

/*
 * Escrita das vagas de Destaques (curadoria). Quem chama já conferiu o papel
 * de administrador (src/server/admin/acoes.ts). Toda mudança vai para o
 * histórico de auditoria, com o título antes e depois.
 */

export const NOME_GRUPO: Record<GrupoVaga, string> = {
  video: "Vídeo principal",
  cards: "Cards em destaque",
  artigos: "Artigos em destaque",
};

export const nomeDaVaga = (grupo: GrupoVaga, indice: number) =>
  grupo === "video" ? NOME_GRUPO.video : `${NOME_GRUPO[grupo]}, vaga ${indice + 1}`;

function tituloDe(id: string | null): string {
  if (!id) return "automática";
  return acervo().conteudos.get(id)?.titulo ?? acervo().videos.get(id)?.titulo ?? id;
}

/** Tira das vagas o que saiu do publicado; a vaga volta a ser automática. */
export function podarDestaques(): void {
  acervo().destaques = podarEscolha(acervo().destaques, candidatosDestaques());
}

function gravar(
  nova: EscolhaDestaques,
  mudancas: { campo: string; antes: string; depois: string }[],
  quem: string,
) {
  acervo().destaques = nova;
  registrar({
    quem,
    acao: "editou",
    tipoItem: "destaques",
    itemId: "destaques",
    itemTitulo: "Destaques",
    mudancas,
  });
}

const falha = (mensagem: string) => ({ ok: false, mensagem }) as const;

/** Escolhe, troca ou esvazia (id null) uma vaga. */
export function definirVaga(
  grupo: GrupoVaga,
  indice: number,
  id: string | null,
  quem: string,
): ResultadoAcao {
  if (!GRUPOS_VAGA.includes(grupo) || indice < 0 || indice >= TAMANHO_GRUPO[grupo]) {
    return falha("Erro: esta vaga não existe.");
  }
  podarDestaques();
  const atual = acervo().destaques;
  if (id) {
    const candidato = candidatosDestaques().find((c) => c.id === id);
    if (!candidato?.grupos.includes(grupo)) {
      return falha(`Erro: este item não está publicado ou não cabe em ${NOME_GRUPO[grupo]}.`);
    }
    for (const g of GRUPOS_VAGA) {
      const j = atual[g].indexOf(id);
      if (j >= 0 && !(g === grupo && j === indice)) {
        return falha(
          `Erro: “${candidato.titulo}” já está em ${nomeDaVaga(g, j)}. Esvazie aquela vaga antes.`,
        );
      }
    }
  }
  const antes = atual[grupo][indice] ?? null;
  if (antes === id) return { ok: true, valor: undefined, mensagem: "Nada mudou nesta vaga." };
  const lista = [...atual[grupo]];
  lista[indice] = id;
  gravar(
    { ...atual, [grupo]: lista },
    [{ campo: nomeDaVaga(grupo, indice), antes: tituloDe(antes), depois: tituloDe(id) }],
    quem,
  );
  return {
    ok: true,
    valor: undefined,
    mensagem: id
      ? `${nomeDaVaga(grupo, indice)}: “${tituloDe(id)}”.`
      : `${nomeDaVaga(grupo, indice)} ficou automática: entra o publicado mais recente.`,
  };
}

/** Troca a vaga com a vizinha de cima (-1) ou de baixo (+1). */
export function moverVaga(grupo: GrupoVaga, indice: number, direcao: 1 | -1, quem: string): ResultadoAcao {
  const destino = indice + direcao;
  if (grupo === "video" || indice < 0 || destino < 0 || destino >= TAMANHO_GRUPO[grupo]) {
    return falha("Erro: não há vaga para onde mover.");
  }
  podarDestaques();
  const atual = acervo().destaques;
  const lista = [...atual[grupo]];
  const [a, b] = [lista[indice] ?? null, lista[destino] ?? null];
  lista[indice] = b;
  lista[destino] = a;
  gravar(
    { ...atual, [grupo]: lista },
    [
      { campo: nomeDaVaga(grupo, indice), antes: tituloDe(a), depois: tituloDe(b) },
      { campo: nomeDaVaga(grupo, destino), antes: tituloDe(b), depois: tituloDe(a) },
    ],
    quem,
  );
  return { ok: true, valor: undefined, mensagem: `Ordem de ${NOME_GRUPO[grupo]} atualizada.` };
}
