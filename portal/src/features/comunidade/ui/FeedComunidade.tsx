"use client";
import { useId, useState } from "react";
import { Avatar } from "@/components/ds/Avatar";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { Icon } from "@/components/ds/Icon";
import { Segmented } from "@/components/ds/Segmented";
import { salaPorSlug, temaPorSlug } from "@/data/catalogo";
import type { TipoPublicacao } from "@/data/types";
import { TIPOS_PUBLICACAO } from "@/features/comunidade/regras";
import { podeCriarPublicacao } from "@/features/comunidade/regras/publicacao-permitida";
import { normalizar } from "@/lib/texto";
import type { ModeloComunidade } from "@/server/comunidade/consultas";
import { BotaoSeguir } from "./BotaoSeguir";
import { CompositorPublicacao, ICONES_TIPO } from "./CompositorPublicacao";
import { LateralComunidade } from "./LateralComunidade";
import { ListaPublicacoes } from "./ListaPublicacoes";

export function FeedComunidade({
  modelo: m,
  sala,
  tema,
}: {
  modelo: ModeloComunidade;
  sala?: string;
  tema?: string;
}) {
  const [aba, setAba] = useState<"para-voce" | "seguindo">("para-voce");
  const [busca, setBusca] = useState("");
  const [aviso, setAviso] = useState(true);
  const [compondo, setCompondo] = useState(false);
  const [tipoCompositor, setTipoCompositor] = useState<TipoPublicacao>("reflexao");
  const id = useId();
  const podePublicar = podeCriarPublicacao(m.visao.papel);
  const abrir = (tipo: TipoPublicacao) => {
    setTipoCompositor(tipo);
    setCompondo(true);
  };
  const termo = normalizar(busca.trim());
  const filtrar = (lista: ModeloComunidade["publicacoes"]) =>
    lista.filter(
      (p) =>
        (!sala || p.salaSlug === sala) &&
        (!tema || p.temas.some((t) => t === tema)) &&
        normalizar(
          [
            p.texto,
            p.autor.nome,
            p.citacao?.obra,
            p.citacao?.trecho,
            p.salaNome,
            ...p.temas.map((t) => temaPorSlug(t)?.nome ?? t),
            TIPOS_PUBLICACAO[p.tipo],
          ]
            .filter(Boolean)
            .join(" "),
        ).includes(termo),
    );
  const encontradas = termo ? filtrar(aba === "para-voce" ? m.publicacoes : m.seguindo).length : 0;
  return (
    <div className="sdb-community sdb-community--in-app">
      <header className="sdb-community__head">
        <div>
          <p className="sdb-meta">Estudar em companhia</p>
          <h1 className="sdb-title-1">Comunidade</h1>
          <p className="sdb-body-sm">Um caderno de estudos em voz alta.</p>
        </div>
        {podePublicar && (
          <Button variant="gold" onClick={() => abrir("reflexao")}>
            Nova publicação
          </Button>
        )}
      </header>
      <div className="sdb-community__layout">
        <div className="sdb-community__feed">
          <div className="sdb-community__toolbar">
            <Segmented
              abas={id}
              label="Feed da comunidade"
              value={aba}
              onChange={setAba}
              options={[
                { value: "para-voce", label: "Para você" },
                { value: "seguindo", label: "Seguindo" },
              ]}
            />
          </div>
          <CampoTexto
            id={`${id}-busca`}
            type="search"
            label="Buscar publicações"
            placeholder="Texto, autor, obra citada, Sala ou tema"
            autoComplete="off"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            help={
              termo
                ? `${encontradas} ${encontradas === 1 ? "publicação encontrada" : "publicações encontradas"} em “${aba === "para-voce" ? "Para você" : "Seguindo"}”.`
                : undefined
            }
          />
          {(sala || tema) && (
            <div className="sdb-post__tags">
              <span className="sdb-chip">
                {[sala && (salaPorSlug(sala)?.nome ?? sala), tema && (temaPorSlug(tema)?.nome ?? tema)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {sala && salaPorSlug(sala) && (
                <BotaoSeguir
                  alvo={{ tipo: "sala", id: sala }}
                  nome={salaPorSlug(sala)?.nome ?? sala}
                  seguindo={m.visao.seguindoSalas.includes(sala)}
                />
              )}
              <ButtonLink href="/comunidade" variant="plain">
                Limpar filtros
              </ButtonLink>
            </div>
          )}
          {aviso && (
            <aside className="sdb-neutral sdb-neutral--community" aria-label="Aviso de neutralidade">
              <span className="sdb-neutral__icon">
                <Icon name="comunidade" />
              </span>
              <p>
                Compartilhamos estudos, não verdades sobre crenças. Atribua afirmações às fontes e acolha
                leituras diferentes.
              </p>
              <Button
                variant="plain"
                icon="fechar"
                iconOnly
                data-tip-align="end"
                aria-label="Dispensar aviso de neutralidade"
                onClick={() => setAviso(false)}
              />
            </aside>
          )}
          {podePublicar && (
            <section className="sdb-composer sdb-composer--launcher" aria-label="Começar publicação">
              <div className="sdb-composer__prompt">
                <Avatar iniciais={m.pessoa.iniciais} foto={m.pessoa.foto} />
                <Button variant="secondary" onClick={() => abrir("reflexao")}>
                  O que você está estudando?
                </Button>
              </div>
              <div className="sdb-composer__types">
                {(Object.keys(TIPOS_PUBLICACAO) as TipoPublicacao[]).map((chave) => (
                  <Button variant="plain" key={chave} icon={ICONES_TIPO[chave]} onClick={() => abrir(chave)}>
                    {TIPOS_PUBLICACAO[chave]}
                  </Button>
                ))}
              </div>
            </section>
          )}
          <p className="sdb-sr" role="status">
            {filtrar(aba === "para-voce" ? m.publicacoes : m.seguindo).length} publicações
            {aba === "para-voce"
              ? " · Recentes, com prioridade leve às Salas, anfitriões acompanhados e trilhas."
              : " de pessoas que você acompanha."}
          </p>
          {(["para-voce", "seguindo"] as const).map((valor) => (
            <section
              key={valor}
              id={`${id}-painel-${valor}`}
              role="tabpanel"
              aria-labelledby={`${id}-aba-${valor}`}
              hidden={aba !== valor}
            >
              <ListaPublicacoes
                publicacoes={filtrar(valor === "para-voce" ? m.publicacoes : m.seguindo)}
                agora={m.agora}
                visao={m.visao}
                opcoes={m.opcoes}
                vazio={
                  busca || sala || tema
                    ? "Nenhuma publicação encontrada"
                    : valor === "seguindo"
                      ? "Seu caderno de acompanhamentos está vazio"
                      : "Ainda sem estudos compartilhados"
                }
                descricao={
                  valor === "seguindo"
                    ? "Explore Salas e anfitriões para conhecer quem compartilha estudos. As publicações de quem você seguir aparecerão aqui."
                    : "Experimente outro termo ou remova os filtros para encontrar outras leituras."
                }
              />
            </section>
          ))}
        </div>
        <LateralComunidade modelo={m} />
      </div>
      {podePublicar && (
        <CompositorPublicacao
          aberto={compondo}
          tipo={tipoCompositor}
          opcoes={m.opcoes}
          onFechar={() => setCompondo(false)}
        />
      )}
    </div>
  );
}
