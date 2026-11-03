import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { ButtonLink } from "@/components/ds/Button";
import { CabecalhoPerfilPublico, PerfilPublico } from "@/components/ds/PerfilPublico";
import { acervoDeEstudo, pessoaPublicaComunidade, videosDeEstudo } from "@/data/repositorio";
import { BotaoSeguir } from "@/features/comunidade/ui/BotaoSeguir";
import { PublicacoesPerfil } from "@/features/comunidade/ui/PublicacoesPerfil";
import { ColecaoConquistas } from "@/features/conquistas/ColecaoConquistas";
import { avaliarConquistas } from "@/features/estudo/conquistas";
import { consultarComunidade } from "@/server/comunidade/consultas";
import { progressoDe } from "@/server/progresso";
export const metadata = { title: "Perfil público" };
export default async function PerfilDaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await consultarComunidade();
  const pessoa = pessoaPublicaComunidade(id);
  if (!pessoa) notFound();
  if (pessoa.href.startsWith("/anfitrioes/")) redirect(pessoa.href as Route);
  const publicacoes = m.publicacoes.filter((p) => p.autorId === id);
  const gemas = avaliarConquistas(progressoDe(id), {
    contaId: id,
    acervo: acervoDeEstudo(),
    videos: videosDeEstudo(),
  }).filter((c) => c.obtida);
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
      {gemas.length > 0 && (
        <section className="flex flex-col gap-4 pt-8" aria-labelledby="titulo-gemas">
          <h2 id="titulo-gemas" className="sdb-title-2">
            Gemas da Jornada
          </h2>
          <ColecaoConquistas
            conquistas={gemas}
            compacta
            legenda={`Gemas que ${pessoa.nome} conquistou na Jornada do Buscador.`}
          />
        </section>
      )}
      <PublicacoesPerfil publicacoes={publicacoes} agora={m.agora} visao={m.visao} opcoes={m.opcoes} />
    </PerfilPublico>
  );
}
