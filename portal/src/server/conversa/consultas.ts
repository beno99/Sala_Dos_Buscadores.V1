import "server-only";
import {
  type MensagemCuradoria,
  mensagensDoAnfitriao,
  ultimasMensagens,
} from "@/modules/conversa/conversa.repositorio";
import { painelDoAnfitriao } from "../anfitriao/consultas";
import { contaNoDiretorio } from "../store";

export interface MensagemVisivel {
  id: string;
  texto: string;
  criadaEm: string;
  daCuradoria: boolean;
}

export const nomeDoAnfitriao = (contaId: string) =>
  painelDoAnfitriao(contaId).perfil?.nome ?? contaNoDiretorio(contaId)?.pseudonimo ?? "Anfitrião";

const visivel = (m: MensagemCuradoria): MensagemVisivel => ({
  id: m.id,
  texto: m.texto,
  criadaEm: m.criadaEm,
  daCuradoria: m.autorId !== m.anfitriaoId,
});

export async function conversaDoAnfitriao(anfitriaoId: string): Promise<MensagemVisivel[]> {
  return (await mensagensDoAnfitriao(anfitriaoId)).map(visivel);
}

export async function conversasDaCuradoria() {
  return (await ultimasMensagens()).map((m) => ({
    contaId: m.anfitriaoId,
    nome: nomeDoAnfitriao(m.anfitriaoId),
    ultima: visivel(m),
    aguardando: m.autorId === m.anfitriaoId,
  }));
}
