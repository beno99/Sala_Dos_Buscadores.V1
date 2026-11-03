import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { CabecalhoPerfilPublico, PerfilPublico } from "@/components/ds/PerfilPublico";
import { pessoaPublicaComunidade } from "@/data/repositorio";
import { BotaoSeguir } from "@/features/comunidade/ui/BotaoSeguir";
import { PublicacoesPerfil } from "@/features/comunidade/ui/PublicacoesPerfil";
import { consultarComunidade } from "@/server/comunidade/consultas";
export const metadata = { title: "Perfil público" };
export default async function PerfilDaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await consultarComunidade();
  const pessoa = pessoaPublicaComunidade(id);
  if (!pessoa) notFound();
  if (pessoa.href.startsWith("/anfitrioes/")) redirect(pessoa.href as Route);
  const publicacoes = m.publicacoes.filter((p) => p.autorId === id);
  return (
    <PerfilPublico>
      <CabecalhoPerfilPublico
        pessoa={pessoa}
        publicacoes={publicacoes.length}
        acao={
          id !== m.pessoa.id && (
            <>
              <BotaoSeguir
                alvo={{ tipo: "pessoa", id }}
                nome={pessoa.nome}
                seguindo={m.visao.seguindoPessoas.includes(id)}
              />
              <ButtonLink href={`/mensagens/${id}` as Route} variant="secondary" icon="enviar">
                Enviar mensagem
              </ButtonLink>
            </>
          )
        }
      />
      <PublicacoesPerfil publicacoes={publicacoes} agora={m.agora} visao={m.visao} opcoes={m.opcoes} />
    </PerfilPublico>
  );
}
