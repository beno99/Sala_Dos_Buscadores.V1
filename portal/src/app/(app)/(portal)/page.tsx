import type { Metadata } from "next";
import { publicacoesVisiveisComunidade } from "@/data/repositorio";
import { projetarPreviaComunidade } from "@/features/portal/composicao";
import { PortalCliente } from "@/features/portal/PortalCliente";
import { listarPublicados } from "@/modules/publicidade/publicidade.repositorio";
import { modeloDoPortal } from "@/server/estudo";
import { membroAtual, redirecionarParaEntrar } from "@/server/sessao";

export const metadata: Metadata = { title: { absolute: "Portal · A Sala dos Buscadores" } };

/**
 * Portal (RF-09, RF-17, RF-21, RF-24 revisto): banner, Salas recomendadas,
 * progresso pessoal, continuar, publicados recentemente, para ampliar o olhar
 * e o espaço publicitário. Tudo o que é pessoal é privado.
 */
export default async function Portal() {
  const membro = await membroAtual();
  if (!membro) return redirecionarParaEntrar();
  return (
    <PortalCliente
      modelo={await modeloDoPortal(membro)}
      comunidade={projetarPreviaComunidade(publicacoesVisiveisComunidade())}
      anuncios={await listarPublicados().catch(() => null)}
      podeAnunciar={membro.papel === "anfitriao"}
    />
  );
}
