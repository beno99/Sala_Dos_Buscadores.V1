"use client";
import { useState } from "react";
import { ButtonLink } from "@/components/ds/Button";
import { CartaoLateralComunidade } from "@/components/ds/CartaoLateralComunidade";
import { Icon } from "@/components/ds/Icon";
import { LinhaPessoa } from "@/components/ds/LinhaPessoa";
import { SeloNivel } from "@/components/ds/Selos";
import type { ModeloComunidade } from "@/server/comunidade/consultas";
import { BotaoSeguir } from "./BotaoSeguir";
export function LateralComunidade({ modelo: m }: { modelo: ModeloComunidade }) {
  const [busca, setBusca] = useState("");
  const pessoas = m.pessoas.filter(
    (p) =>
      p.id !== m.pessoa.id && p.nome.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")),
  );
  return (
    <aside className="sdb-community__aside" aria-label="Pessoas e conversas">
      <CartaoLateralComunidade id="comunidade-conta" titulo="Sua conta">
        <LinhaPessoa pessoa={m.pessoa} />
        {m.nivel && (
          <div className="sdb-post__tags">
            <SeloNivel nivel={m.nivel.valor} />
            <span className="sdb-footnote">em {m.nivel.assunto}</span>
          </div>
        )}
        <div className="sdb-community-side__numbers" role="group" aria-label="Sua atividade na comunidade">
          {[
            ["Publicações", m.numeros.publicacoes],
            ["Seguidores", m.numeros.seguidores],
            ["Seguindo", m.numeros.seguindo],
          ].map(([rotulo, n]) => (
            <div key={rotulo} className="sdb-stat">
              <span className="sdb-stat__value">{n}</span>
              <span className="sdb-stat__label sdb-footnote">{rotulo}</span>
            </div>
          ))}
        </div>
        <div className="sdb-post__tags">
          <ButtonLink href="/perfil" variant="secondary">
            Ver perfil
          </ButtonLink>
          <ButtonLink href="/comunidade/salvos" variant="plain" icon="estante">
            Salvos
          </ButtonLink>
        </div>
      </CartaoLateralComunidade>
      <CartaoLateralComunidade id="comunidade-pessoas" titulo="Encontrar pessoas">
        <label className="sdb-searchfield">
          <Icon name="busca" />
          <span className="sdb-sr">Encontrar pessoas por nome</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
          />
        </label>
        <div className="sdb-community-side__list">
          {pessoas.slice(0, busca ? 6 : 2).map((p) => (
            <LinhaPessoa
              key={p.id}
              pessoa={p}
              acao={
                <BotaoSeguir
                  alvo={{ tipo: "pessoa", id: p.id }}
                  nome={p.nome}
                  seguindo={m.visao.seguindoPessoas.includes(p.id)}
                />
              }
            />
          ))}
        </div>
        <p className="sdb-footnote" role="status">
          {busca ? `${pessoas.length} pessoas encontradas` : "Pessoas que compartilham estudos"}
        </p>
        <ButtonLink href="/comunidade/pessoas" variant="plain">
          Ver todas
        </ButtonLink>
      </CartaoLateralComunidade>
      <CartaoLateralComunidade id="comunidade-debate" titulo="Em debate nesta semana">
        <div className="sdb-community-side__list">
          {m.debate.map((d) => (
            <div key={`${d.tema}/${d.sala}`}>
              <a className="sdb-chip" href={`/comunidade?tema=${d.tema}&sala=${d.sala}`}>
                {d.temaNome}
              </a>
              <p className="sdb-footnote">
                {d.conversas} {d.conversas === 1 ? "conversa" : "conversas"} · {d.salaNome}
              </p>
            </div>
          ))}
        </div>
        {!m.debate.length && <p className="sdb-footnote">Ainda não houve conversas nesta semana.</p>}
      </CartaoLateralComunidade>
      <CartaoLateralComunidade id="comunidade-acompanha" titulo="Quem você acompanha">
        <div className="sdb-community-side__list">
          {m.seguindoPessoas.slice(0, 3).map((p) => (
            <LinhaPessoa key={p.id} pessoa={p} />
          ))}
          {m.seguindoSalas.slice(0, 2).map((s) => (
            <a key={s.slug} className="sdb-chip" href={`/comunidade?sala=${s.slug}`}>
              {s.nome}
            </a>
          ))}
        </div>
        {!m.numeros.seguindo && <p className="sdb-footnote">Você ainda não acompanha pessoas ou Salas.</p>}
        <ButtonLink href="/comunidade/pessoas?aba=seguindo" variant="plain">
          Ver tudo
        </ButtonLink>
      </CartaoLateralComunidade>
    </aside>
  );
}
