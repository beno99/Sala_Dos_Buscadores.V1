import "server-only";
import { acervoPublico } from "@/data/repositorio";
import type { AssinaturaAnfitriao, SalaEditorial } from "@/data/types";
import { salaParaPublico } from "../store";
import { fontesParaAnfitriao, painelDoAnfitriao } from "./consultas";

/* Dados que as telas de edição do anfitrião recebem do servidor. */

export function dadosDoEditorDeArtigo(sala: SalaEditorial, contaId: string, pseudonimo: string) {
  const perfil = painelDoAnfitriao(contaId).perfil;
  const assinatura: AssinaturaAnfitriao = sala.anfitriao ?? {
    nome: perfil?.nome ?? pseudonimo,
    credencial: perfil?.credencial ?? "",
    slug: perfil?.slug ?? "",
  };
  return {
    sala: { ...salaParaPublico(sala), id: sala.id, status: sala.status },
    fontes: fontesParaAnfitriao(contaId).map(
      ({ criadoEm: _a, atualizadoEm: _b, criadoPor: _c, atualizadoPor: _d, proposta: _e, ...f }) => f,
    ),
    assinaturaPadrao: assinatura,
    /** Para "Continuar a busca" na prévia: o acervo publicado, sem o corpo. */
    publicados: acervoPublico().conteudos.map((c) => ({ ...c, corpo: [] })),
  };
}
