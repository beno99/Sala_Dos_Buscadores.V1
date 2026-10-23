"use client";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import type { PublicacaoPublica } from "@/data/repositorio-comunidade";
import { PublicacaoLeitura } from "./PublicacaoLeitura";
export function ListaPublicacoes({
  publicacoes,
  agora,
  vazio = "Ainda sem publicações",
  descricao = "As leituras compartilhadas aparecerão aqui.",
  curtidas = [],
  salvos = [],
}: {
  publicacoes: PublicacaoPublica[];
  agora: string;
  vazio?: string;
  descricao?: string;
  curtidas?: string[];
  salvos?: string[];
}) {
  return (
    <div className="sdb-community-stack">
      {publicacoes.length ? (
        publicacoes.map((p) => (
          <PublicacaoLeitura
            key={p.id}
            p={p}
            agora={agora}
            curtida={curtidas.includes(p.id)}
            salva={salvos.includes(p.id)}
          />
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
