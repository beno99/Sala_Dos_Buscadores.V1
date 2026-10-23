"use server";

import { revalidatePath } from "next/cache";
import { midiaDoDono } from "@/server/midia";
import { gravarPerfil } from "@/server/perfilBuscador";
import { membroAtual } from "@/server/sessao";
import { validarSobre } from "./regras";

/**
 * Salva foto, capa e "Sobre a sua busca" da própria conta. As imagens só
 * valem se foram enviadas pela mesma conta; `null` tira a imagem.
 */
export async function salvarPerfilAcao(dados: {
  fotoId: string | null;
  capaId: string | null;
  sobre: string;
}): Promise<{ ok: true } | { ok: false; erro: string }> {
  const conta = await membroAtual();
  if (!conta) return { ok: false, erro: "Erro: entre na sua conta para editar o perfil." };
  const sobre = validarSobre(dados.sobre);
  if (!sobre.ok) return sobre;
  const fotoId = midiaDoDono(dados.fotoId, conta.id);
  const capaId = midiaDoDono(dados.capaId, conta.id);
  if ((dados.fotoId && !fotoId) || (dados.capaId && !capaId)) {
    return { ok: false, erro: "Erro: a imagem não foi encontrada. Envie de novo." };
  }
  gravarPerfil(conta.id, {
    sobre: sobre.texto,
    ...(fotoId ? { fotoId } : {}),
    ...(capaId ? { capaId } : {}),
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
