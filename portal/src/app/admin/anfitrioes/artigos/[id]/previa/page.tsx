import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/ds/Alerta";
import { conteudoParaPublico, relacionadosDoConteudo, resumirSala } from "@/data/repositorio";
import { LeituraConteudo } from "@/features/acervo/LeituraConteudo";
import { STATUS_ROTULO } from "@/features/admin/regras/csv";
import { acervo, salaParaPublico } from "@/server/store";

export const metadata: Metadata = { title: "Prévia do artigo de anfitrião" };

/**
 * Prévia completa de um artigo de anfitrião, em qualquer status, com as
 * fontes propostas (que o público ainda não vê). Mesmo padrão da prévia da curadoria.
 */
export default async function PreviaArtigoAnfitriao(
  props: PageProps<"/admin/anfitrioes/artigos/[id]/previa">,
) {
  const { id } = await props.params;
  const artigo = acervo().conteudos.get(id);
  const sala = artigo?.revisao ? [...acervo().salas.values()].find((s) => s.slug === artigo.sala) : undefined;
  if (!artigo || !sala) notFound();
  const conteudo = conteudoParaPublico(artigo);
  const fontes = artigo.fontes.flatMap((fid) => {
    const f = acervo().fontes.get(fid);
    if (!f) return [];
    const { criadoEm: _a, atualizadoEm: _b, criadoPor: _c, atualizadoPor: _d, proposta, ...publica } = f;
    return [
      proposta?.pendente ? { ...publica, tradicao: `${publica.tradicao} · fonte nova, em revisão` } : publica,
    ];
  });
  const novas = artigo.fontes.filter((fid) => acervo().fontes.get(fid)?.proposta?.pendente).length;
  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-3 z-30">
        <Alerta variant="warning" title={`Prévia · ${STATUS_ROTULO[artigo.status]}`}>
          É assim que o buscador vai ver este artigo{artigo.status === "publicado" ? "" : " se for aprovado"}.
          {novas > 0 &&
            ` ${novas} ${novas === 1 ? "fonte é nova" : "fontes são novas"} e entra no catálogo com a aprovação.`}{" "}
          Esta página não é pública.
        </Alerta>
      </div>
      <LeituraConteudo
        sala={resumirSala(salaParaPublico(sala))}
        conteudo={{ ...conteudo, publicadoEm: conteudo.publicadoEm || new Date().toISOString().slice(0, 10) }}
        fontes={fontes}
        videos={[]}
        relacionados={relacionadosDoConteudo(conteudo)}
      />
    </div>
  );
}
