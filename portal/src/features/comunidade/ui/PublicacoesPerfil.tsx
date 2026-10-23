"use client";
import { type ReactNode, useId, useState } from "react";
import { Segmented } from "@/components/ds/Segmented";
import type { PublicacaoPublica } from "@/data/repositorio-comunidade";
import { ListaPublicacoes } from "./ListaPublicacoes";
export function PublicacoesPerfil({
  publicacoes,
  agora,
  children,
  rotulo = "Sobre e Salas",
  curtidas = [],
  salvos = [],
}: {
  publicacoes: PublicacaoPublica[];
  agora: string;
  children?: ReactNode;
  rotulo?: string;
  curtidas?: string[];
  salvos?: string[];
}) {
  const [aba, setAba] = useState<"sobre" | "publicacoes">(children ? "sobre" : "publicacoes");
  const id = useId();
  return (
    <div className="sdb-community sdb-community-stack">
      <Segmented
        abas={id}
        label="Seções do perfil"
        value={aba}
        onChange={setAba}
        options={[
          ...(children ? [{ value: "sobre" as const, label: rotulo }] : []),
          { value: "publicacoes", label: "Publicações", count: publicacoes.length },
        ]}
      />
      {children && (
        <section
          className="sdb-community-stack"
          role="tabpanel"
          id={`${id}-painel-sobre`}
          aria-labelledby={`${id}-aba-sobre`}
          hidden={aba !== "sobre"}
        >
          {children}
        </section>
      )}
      <section
        role="tabpanel"
        id={`${id}-painel-publicacoes`}
        aria-labelledby={`${id}-aba-publicacoes`}
        hidden={aba !== "publicacoes"}
      >
        <ListaPublicacoes
          publicacoes={publicacoes}
          curtidas={curtidas}
          salvos={salvos}
          agora={agora}
          descricao="Este perfil ainda não compartilhou estudos na comunidade."
        />
      </section>
    </div>
  );
}
