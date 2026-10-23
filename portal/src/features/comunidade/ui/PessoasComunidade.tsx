"use client";
import { useState } from "react";
import { ButtonLink } from "@/components/ds/Button";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { LinhaPessoa } from "@/components/ds/LinhaPessoa";
import type { ModeloComunidade } from "@/server/comunidade/consultas";
export function PessoasComunidade({
  modelo: m,
  seguindo = false,
}: {
  modelo: ModeloComunidade;
  seguindo?: boolean;
}) {
  const [busca, setBusca] = useState("");
  const lista = (seguindo ? m.seguindoPessoas : m.pessoas).filter((p) =>
    p.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")),
  );
  return (
    <div className="sdb-community sdb-community-stack">
      <header className="sdb-community__head">
        <h1 className="sdb-title-1">{seguindo ? "Quem você acompanha" : "Encontrar pessoas"}</h1>
        <ButtonLink href="/comunidade" variant="plain">
          Voltar à Comunidade
        </ButtonLink>
      </header>
      <label className="sdb-searchfield">
        <Icon name="busca" />
        <span className="sdb-sr">Buscar pessoas pelo nome</span>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome…"
        />
      </label>
      <p className="sdb-footnote" role="status">
        {lista.length} pessoas encontradas
      </p>
      <div className="sdb-community-side">
        {lista.map((p) => (
          <LinhaPessoa key={p.id} pessoa={p} />
        ))}
        {!lista.length && (
          <EstadoSecao
            compacto
            simbolo="busca"
            titulo="Nenhuma pessoa encontrada"
            descricao="Experimente outro nome ou explore as conversas na Comunidade."
          />
        )}
      </div>
      {seguindo && m.seguindoSalas.length > 0 && (
        <section className="sdb-community-side" aria-label="Salas acompanhadas">
          <h2 className="sdb-title-2">Salas que você acompanha</h2>
          <div className="sdb-post__tags">
            {m.seguindoSalas.map((s) => (
              <a className="sdb-chip" key={s.slug} href={`/comunidade?sala=${s.slug}`}>
                {s.nome}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
