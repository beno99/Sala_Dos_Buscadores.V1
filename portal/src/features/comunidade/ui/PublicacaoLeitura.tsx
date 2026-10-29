"use client";
import type { Route } from "next";
import { useState } from "react";
import { BarraAcoesComunidade } from "@/components/ds/BarraAcoesComunidade";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CardPublicacao } from "@/components/ds/CardPublicacao";
import { EstadoSecao } from "@/components/ds/EstadosInterface";
import { Icon } from "@/components/ds/Icon";
import { LinhaComentario } from "@/components/ds/LinhaComentario";
import { Menu } from "@/components/ds/Menu";
import { PainelComentarios } from "@/components/ds/PainelComentarios";
import { ICONE_PROVENIENCIA, SeloProveniencia } from "@/components/ds/Selos";
import { useCopiar } from "@/components/ds/Toast";
import { temaPorSlug } from "@/data/catalogo";
import type { PublicacaoPublica } from "@/data/repositorio-comunidade";

export const TIPOS_PUBLICACAO = {
  reflexao: "Reflexão",
  citacao: "Citação com fonte",
  pergunta: "Pergunta",
  achado: "Achado do acervo",
} as const;
export function tempoComunidade(data: string, agora: string) {
  const minutos = Math.max(0, Math.floor((Date.parse(agora) - Date.parse(data)) / 60_000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há cerca de ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há cerca de ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}
export function ComentariosLeitura({ p, agora }: { p: PublicacaoPublica; agora: string }) {
  return p.comentarios.length ? (
    <div className="sdb-community-stack">
      {p.comentarios.map((c) => (
        <LinhaComentario
          key={c.id}
          autor={c.autor}
          texto={c.texto}
          data={c.criadaEm}
          tempo={tempoComunidade(c.criadaEm, agora)}
          resposta={Boolean(c.paiId)}
          destacarAnfitriao={p.tipo === "pergunta"}
          ajudou={p.respostaQueAjudouId === c.id}
          acoes={<span>{c.curtidas} curtidas</span>}
        />
      ))}
    </div>
  ) : (
    <EstadoSecao
      simbolo="livro"
      compacto
      titulo="Ainda sem comentários"
      descricao="Esta leitura ainda não recebeu comentários."
    />
  );
}
const semEscrita = () => {};
export function PublicacaoLeitura({
  p,
  agora,
  curtida = false,
  salva = false,
  completa = false,
}: {
  p: PublicacaoPublica;
  agora: string;
  curtida?: boolean;
  salva?: boolean;
  completa?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const copiar = useCopiar();
  const href = `/comunidade/p/${p.id}` as Route;
  return (
    <>
      <CardPublicacao
        autor={p.autor}
        nivel={p.nivel}
        tipo={TIPOS_PUBLICACAO[p.tipo]}
        data={p.criadaEm}
        tempo={tempoComunidade(p.criadaEm, agora)}
        texto={p.texto}
        imagem={p.imagem}
        tags={
          <>
            {p.salaSlug && (
              <a className="sdb-chip" href={`/comunidade?sala=${p.salaSlug}`}>
                <Icon name="salas" size="sm" />
                {p.salaNome}
              </a>
            )}
            {p.temas.map((t) => (
              <a className="sdb-chip" key={t} href={`/comunidade?tema=${t}`}>
                {temaPorSlug(t)?.nome ?? t}
              </a>
            ))}
          </>
        }
        menu={
          <Menu
            right
            trigger={<Icon name="reticencias" />}
            triggerLabel={`Mais ações da publicação de ${p.autor.nome}`}
            items={[
              {
                label: "Copiar link",
                icon: "copiar",
                onSelect: () => copiar(`${window.location.origin}${href}`, "Link da publicação copiado."),
              },
              { label: "Salvar", icon: "estante", disabled: true, onSelect: semEscrita },
            ]}
          />
        }
        acoes={
          <BarraAcoesComunidade
            curtidas={p.curtidas}
            comentarios={p.comentarios.length}
            curtida={curtida}
            salva={salva}
            bloqueada
            onCurtir={semEscrita}
            onSalvar={semEscrita}
            onReagir={semEscrita}
            onComentar={() => setAberto(true)}
          />
        }
        bloco={
          <>
            {p.tipo === "citacao" && p.citacao && (
              <BlocoCitacao
                estreito
                comunidade
                citacao={{
                  id: p.id,
                  sala: p.salaSlug ?? "",
                  obra: p.citacao.obra,
                  localizacao: p.citacao.passagem,
                  proveniencia: "comunidade",
                  rotuloSelo: "Fonte informada pelo autor",
                  traducao: p.citacao.trecho,
                  rotuloTraducao: "Trecho compartilhado",
                  referencia: `${p.citacao.obra} · ${p.citacao.passagem}`,
                  capa: "bege",
                  inicial: p.citacao.obra[0] ?? "C",
                }}
              />
            )}
            {p.tipo === "pergunta" && (
              <div className="sdb-post__question">
                <Icon name="assistente" />
                <div>
                  <strong>Pergunta à Sala</strong>
                  <p>
                    {p.dirigidaA ? (
                      <>
                        Dirigida a <a href={p.dirigidaA.href}>{p.dirigidaA.nome}</a>
                      </>
                    ) : (
                      p.salaNome
                    )}
                  </p>
                </div>
              </div>
            )}
            {p.tipo === "achado" &&
              (p.conteudo ? (
                <article className="sdb-card sdb-community-linked">
                  <div className="sdb-card__body">
                    <Icon name={ICONE_PROVENIENCIA[p.conteudo.proveniencia]} size="lg" />
                    <div className="sdb-community-linked__content">
                      <SeloProveniencia tipo={p.conteudo.proveniencia} />
                      <p className="sdb-footnote">{p.salaNome}</p>
                      <h3 className="sdb-headline">
                        <a href={`/salas/${p.conteudo.sala}/${p.conteudo.slug}`}>{p.conteudo.titulo}</a>
                      </h3>
                      <a className="sdb-link" href={`/salas/${p.conteudo.sala}/${p.conteudo.slug}`}>
                        Abrir no acervo →
                      </a>
                    </div>
                  </div>
                </article>
              ) : (
                <p className="sdb-footnote">O conteúdo vinculado não está disponível no acervo.</p>
              ))}
          </>
        }
        comentarios={
          !completa && (
            <>
              {p.comentarios.slice(0, 2).map((c) => (
                <LinhaComentario
                  key={c.id}
                  autor={c.autor}
                  texto={c.texto}
                  data={c.criadaEm}
                  tempo={tempoComunidade(c.criadaEm, agora)}
                />
              ))}
              <div className="sdb-post__links">
                {p.comentarios.length > 0 && (
                  <Button variant="plain" onClick={() => setAberto(true)}>
                    Ver todos os comentários ({p.comentarios.length})
                  </Button>
                )}
                <ButtonLink variant="plain" href={href}>
                  Abrir publicação
                </ButtonLink>
              </div>
            </>
          )
        }
      />
      {completa && (
        <section className="sdb-community-side" aria-label="Comentários da publicação">
          <h2 className="sdb-title-2">Comentários</h2>
          <ComentariosLeitura p={p} agora={agora} />
        </section>
      )}
      <PainelComentarios
        aberto={aberto}
        onFechar={() => setAberto(false)}
        campo={
          <ButtonLink href={href} variant="secondary">
            Abrir publicação completa
          </ButtonLink>
        }
      >
        <ComentariosLeitura p={p} agora={agora} />
      </PainelComentarios>
    </>
  );
}
