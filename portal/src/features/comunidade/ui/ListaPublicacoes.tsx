"use client";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import type { PublicacaoPublica } from "@/data/repositorio-comunidade";
import type { VisaoComunidade } from "@/features/comunidade/regras";
import type { OpcoesCompositor } from "@/server/comunidade/consultas";
import { PublicacaoLeitura } from "./PublicacaoLeitura";
export function ListaPublicacoes({
  publicacoes,
  agora,
  vazio = "Ainda sem publicações",
  descricao = "As leituras compartilhadas aparecerão aqui.",
  visao,
  opcoes,
}: {
  publicacoes: PublicacaoPublica[];
  agora: string;
  vazio?: string;
  descricao?: string;
  visao: VisaoComunidade;
  opcoes: OpcoesCompositor;
}) {
  return (
    <div className="sdb-community-stack">
      {publicacoes.length ? (
        publicacoes.map((p) => (
          <PublicacaoLeitura key={p.id} p={p} agora={agora} visao={visao} opcoes={opcoes} />
        ))
      ) : (
        <EstadoSecao
          simbolo="livro"
          titulo={vazio}
          descricao={descricao}
          acao={{ href: "/salas", rotulo: "Explorar Salas e anfitriões" }}
        />
      )}
    </div>
  );
}
