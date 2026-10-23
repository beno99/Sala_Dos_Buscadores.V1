import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { salaPorSlug } from "@/data/catalogo";
import { RevisaoSala } from "@/features/admin/ui/anfitrioes/RevisaoSala";
import { painelDoAnfitriao, salaParaRevisao } from "@/server/anfitriao/consultas";

export const metadata: Metadata = { title: "Revisão da Sala" };

/** Revisão de anfitriões, nível 3: a Sala em revisão, seus artigos e as decisões. */
export default async function RevisaoDaSala(props: PageProps<"/admin/anfitrioes/[contaId]/salas/[salaId]">) {
  const { contaId, salaId } = await props.params;
  const dados = salaParaRevisao(salaId);
  if (!dados || dados.sala.revisao?.donoId !== contaId) notFound();
  const { sala, dono, artigos } = dados;
  const perfil = painelDoAnfitriao(contaId).perfil;
  const ordem = ["em_revisao", "reprovado", "rascunho", "publicado", "arquivado"];
  return (
    <RevisaoSala
      contaId={contaId}
      anfitriao={perfil?.nome ?? dono?.pseudonimo ?? "Anfitrião"}
      sala={{
        id: sala.id,
        slug: sala.slug,
        nome: sala.nome,
        descricao: sala.descricao,
        periodo: sala.periodo,
        link: sala.link,
        imagem: sala.imagem,
        placa: sala.placa,
        status: sala.status,
        naComparacao: sala.naComparacao,
        congelada: Boolean(sala.revisao?.congelado),
        enviadoEm: sala.revisao?.enviadoEm,
        aceite: sala.revisao?.aceite,
        ultimoMotivo: sala.revisao?.ultimoMotivo,
        noAr: Boolean(salaPorSlug(sala.slug)),
      }}
      artigos={artigos
        .sort((a, b) => ordem.indexOf(a.artigo.status) - ordem.indexOf(b.artigo.status))
        .map(({ artigo, fontes }) => ({
          id: artigo.id,
          titulo: artigo.titulo,
          resumo: artigo.resumo,
          status: artigo.status,
          link: artigo.link ? { tipo: artigo.link.tipo, url: artigo.link.url } : undefined,
          fontes: fontes.map((f) => ({ id: f.id, titulo: f.titulo, autor: f.autor, nova: f.nova })),
          ultimoMotivo: artigo.revisao?.ultimoMotivo,
          enviadoEm: artigo.revisao?.enviadoEm,
        }))}
    />
  );
}
