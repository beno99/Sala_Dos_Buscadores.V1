"use client";
import type { Route } from "next";
import { useOptimistic, useState } from "react";
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
import type { ComentarioPublicoComunidade, PublicacaoPublica } from "@/data/repositorio-comunidade";
import type { TipoReacaoComunidade } from "@/data/types";
import { podeOcultarComentario, TIPOS_PUBLICACAO, type VisaoComunidade } from "@/features/comunidade/regras";
import { marcarRespostaAcao, reagirAcao, salvarAcao } from "@/server/comunidade/acoes";
import type { OpcoesCompositor } from "@/server/comunidade/consultas";
import { CampoComentario, type Respondendo } from "./CampoComentario";
import { CompositorPublicacao } from "./CompositorPublicacao";
import { type DialogoItem, DialogosItem } from "./DialogosItem";
import { useAcaoComunidade } from "./useAcaoComunidade";

export function tempoComunidade(data: string, agora: string) {
  const minutos = Math.max(0, Math.floor((Date.parse(agora) - Date.parse(data)) / 60_000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há cerca de ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há cerca de ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} ${dias === 1 ? "dia" : "dias"}`;
}
function ItemComentario({
  c,
  p,
  agora,
  visao,
  onResponder,
}: {
  c: ComentarioPublicoComunidade;
  p: PublicacaoPublica;
  agora: string;
  visao: VisaoComunidade;
  onResponder: (r: Respondendo) => void;
}) {
  const { executar } = useAcaoComunidade();
  const [dialogo, setDialogo] = useState<DialogoItem>(null);
  const alvo = { tipo: "comentario", id: c.id } as const;
  const [curtida, curtir] = useOptimistic(
    { ativa: visao.comentariosCurtidos.includes(c.id), total: c.curtidas },
    (e) => ({ ativa: !e.ativa, total: e.total + (e.ativa ? -1 : 1) }),
  );
  const proprio = c.autorId === visao.pessoaId;
  const podeOcultar = podeOcultarComentario(
    visao.papel,
    visao.pessoaId,
    p.salaSlug && visao.salasProprias.includes(p.salaSlug) ? visao.pessoaId : undefined,
  );
  return (
    <>
      <LinhaComentario
        autor={c.autor}
        texto={c.texto}
        data={c.criadaEm}
        tempo={tempoComunidade(c.criadaEm, agora)}
        resposta={Boolean(c.paiId)}
        destacarAnfitriao={p.tipo === "pergunta"}
        ajudou={p.respostaQueAjudouId === c.id}
        acoes={
          <>
            <Button
              variant="plain"
              size="sm"
              onClick={() => onResponder({ id: c.paiId ?? c.id, nome: c.autor.nome })}
            >
              Responder
            </Button>
            <button
              type="button"
              className="sdb-community-actions__button"
              aria-pressed={curtida.ativa}
              aria-label={`${curtida.ativa ? "Desfazer curtida" : "Curtir comentário"}, ${curtida.total} curtidas`}
              onClick={() =>
                executar(
                  () => reagirAcao(alvo, "curtir"),
                  () => curtir(null),
                )
              }
            >
              <Icon name="util" />
              <span>{curtida.total}</span>
            </button>
            {p.tipo === "pergunta" && p.autorId === visao.pessoaId && (
              <Button
                variant="plain"
                size="sm"
                onClick={() => executar(() => marcarRespostaAcao(p.id, c.id))}
              >
                {p.respostaQueAjudouId === c.id ? "Desmarcar resposta" : "Ajudou"}
              </Button>
            )}
            <Button variant="plain" size="sm" onClick={() => setDialogo(proprio ? "excluir" : "denunciar")}>
              {proprio ? "Excluir" : "Denunciar"}
            </Button>
            {podeOcultar && (
              <Button variant="plain" size="sm" onClick={() => setDialogo("ocultar")}>
                Ocultar
              </Button>
            )}
          </>
        }
      />
      <DialogosItem dialogo={dialogo} alvo={alvo} onFechar={() => setDialogo(null)} />
    </>
  );
}
export function ComentariosLeitura({
  p,
  agora,
  visao,
  onResponder,
}: {
  p: PublicacaoPublica;
  agora: string;
  visao: VisaoComunidade;
  onResponder: (r: Respondendo) => void;
}) {
  return p.comentarios.length ? (
    <div className="sdb-community-stack">
      {p.comentarios.map((c) => (
        <ItemComentario key={c.id} c={c} p={p} agora={agora} visao={visao} onResponder={onResponder} />
      ))}
    </div>
  ) : (
    <EstadoSecao
      simbolo="livro"
      compacto
      titulo="Ainda sem comentários"
      descricao="Comece a conversa com uma leitura ou uma pergunta."
    />
  );
}
type MudancaPublicacao = { tipo: "reagir"; reacao: TipoReacaoComunidade } | { tipo: "salvar" };
export function PublicacaoLeitura({
  p,
  agora,
  visao,
  opcoes,
  completa = false,
}: {
  p: PublicacaoPublica;
  agora: string;
  visao: VisaoComunidade;
  opcoes: OpcoesCompositor;
  completa?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [dialogo, setDialogo] = useState<DialogoItem>(null);
  const [respondendo, setRespondendo] = useState<Respondendo | null>(null);
  const { executar } = useAcaoComunidade();
  const copiar = useCopiar();
  const href = `/comunidade/p/${p.id}` as Route;
  const alvo = { tipo: "publicacao", id: p.id } as const;
  const [estado, mudar] = useOptimistic(
    { curtidas: p.curtidas, reacoes: visao.reacoes[p.id] ?? [], salva: visao.salvos.includes(p.id) },
    (e, m: MudancaPublicacao) => {
      if (m.tipo === "salvar") return { ...e, salva: !e.salva };
      const ativa = e.reacoes.includes(m.reacao);
      return {
        ...e,
        curtidas: e.curtidas + (m.reacao === "curtir" ? (ativa ? -1 : 1) : 0),
        reacoes: ativa ? e.reacoes.filter((r) => r !== m.reacao) : [...e.reacoes, m.reacao],
      };
    },
  );
  const reagir = (reacao: TipoReacaoComunidade) =>
    executar(
      () => reagirAcao(alvo, reacao),
      () => mudar({ tipo: "reagir", reacao }),
    );
  const salvar = () =>
    executar(
      () => salvarAcao(p.id),
      () => mudar({ tipo: "salvar" }),
    );
  const proprio = p.autorId === visao.pessoaId;
  const campo = (
    <CampoComentario
      publicacaoId={p.id}
      respondendo={respondendo}
      onCancelarResposta={() => setRespondendo(null)}
    />
  );
  return (
    <>
      <CardPublicacao
        autor={p.autor}
        nivel={p.nivel}
        tipo={`${TIPOS_PUBLICACAO[p.tipo]}${p.editadaEm ? " · editada" : ""}`}
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
              {
                label: estado.salva ? "Remover dos salvos" : "Salvar",
                icon: "estante",
                onSelect: salvar,
              },
              ...(proprio
                ? [
                    { label: "Editar", icon: "editar" as const, onSelect: () => setEditando(true) },
                    {
                      label: "Excluir",
                      icon: "lixeira" as const,
                      danger: true,
                      onSelect: () => setDialogo("excluir"),
                    },
                  ]
                : [{ label: "Denunciar", icon: "aviso" as const, onSelect: () => setDialogo("denunciar") }]),
              ...(visao.papel === "administrador"
                ? [{ label: "Ocultar", icon: "olhoFechado" as const, onSelect: () => setDialogo("ocultar") }]
                : []),
            ]}
          />
        }
        acoes={
          <BarraAcoesComunidade
            curtidas={estado.curtidas}
            comentarios={p.comentarios.length}
            curtida={estado.reacoes.includes("curtir")}
            salva={estado.salva}
            reacoes={estado.reacoes.filter((r) => r !== "curtir")}
            onCurtir={() => reagir("curtir")}
            onSalvar={salvar}
            onReagir={reagir}
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
          <ComentariosLeitura p={p} agora={agora} visao={visao} onResponder={setRespondendo} />
          {campo}
        </section>
      )}
      <PainelComentarios aberto={aberto} onFechar={() => setAberto(false)} campo={campo}>
        <ComentariosLeitura p={p} agora={agora} visao={visao} onResponder={setRespondendo} />
      </PainelComentarios>
      <CompositorPublicacao
        aberto={editando}
        edicao={p}
        opcoes={opcoes}
        onFechar={() => setEditando(false)}
      />
      <DialogosItem dialogo={dialogo} alvo={alvo} onFechar={() => setDialogo(null)} />
    </>
  );
}
