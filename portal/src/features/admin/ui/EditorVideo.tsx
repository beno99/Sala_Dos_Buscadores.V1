"use client";

import type { Route } from "next";
import { type ReactNode, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { CardVideo } from "@/components/ds/CardVideo";
import { ChecklistPublicacao, IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { SeloNivel } from "@/components/ds/Selos";
import { useToast } from "@/components/ds/Toast";
import { salaPorSlug, todasAsSalas, todosOsTemas } from "@/data/catalogo";
import { NIVEL_AJUDA } from "@/data/rotulos";
import type { Nivel, Placa, SalaSlug, StatusEditorial, TemaSlug } from "@/data/types";
import { salvarVideoAcao } from "@/server/admin/acoes";
import type { FormVideo } from "../formularios";
import {
  checklistVideo,
  errosDePublicacaoVideo,
  ORDEM_CAMPOS_VIDEO,
  primeiroCampoComErro,
  temPendencia,
} from "../regras/checklist";
import { extrairIdYoutube } from "../regras/youtube";
import { AvisoSaida, focarCampo } from "./AvisoSaida";
import { PLACAS } from "./CamposFonte";
import { useAcaoStatus } from "./useAcaoStatus";
import { useEdicao } from "./useEdicao";

export interface ArtigoLigavel {
  id: string;
  titulo: string;
  sala: SalaSlug;
  status: StatusEditorial;
}

interface EditorVideoProps {
  inicial: FormVideo;
  status: StatusEditorial;
  atualizadoEm: string | null;
  artigos: ArtigoLigavel[];
  historico?: ReactNode;
}

/** Formulário de vídeo do canal (RF-16): URL do YouTube, duração, tema, nível e artigos ligados. */
export function EditorVideo({ inicial, status, atualizadoEm, artigos, historico }: EditorVideoProps) {
  const toast = useToast();
  const [aba, setAba] = useState<"edicao" | "historico">("edicao");
  const [confirmar, setConfirmar] = useState(false);
  const [avisoPublicar, setAvisoPublicar] = useState(false);
  const edicao = useEdicao<FormVideo>({
    inicial,
    status,
    atualizadoEm,
    base: "/admin/videos",
    salvar: salvarVideoAcao,
    podeSalvar: (f) => Boolean(f.sala && f.titulo.trim()),
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const { pedir, modal } = useAcaoStatus("video");
  const checklist = checklistVideo(form);
  const bloqueado = temPendencia(checklist);
  const publicado = status === "publicado";
  const arquivado = status === "arquivado";
  const url = extrairIdYoutube(form.url);
  const doMesmoSala = artigos.filter((a) => a.sala === form.sala && a.status !== "arquivado");

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = primeiroCampoComErro(novos, ORDEM_CAMPOS_VIDEO);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const publicar = async () => {
    if (bloqueado) {
      setAvisoPublicar(true);
      mostrarErros(errosDePublicacaoVideo(form), "Erro: ainda há itens pendentes para publicar");
      return;
    }
    if (sujo || !edicao.id.current) {
      const r = await salvarAgora("automatico");
      if (!r?.ok) {
        if (r && !r.ok && r.erros) mostrarErros(r.erros, r.mensagem);
        return;
      }
    }
    if (edicao.id.current) pedir({ id: edicao.id.current, titulo: form.titulo, sala: form.sala }, "publicar");
  };

  const salvarAlteracoes = () => {
    const pendencias = errosDePublicacaoVideo(form);
    if (Object.keys(pendencias).length) {
      mostrarErros(pendencias, "Erro: a alteração deixaria o vídeo publicado com pendências");
      return;
    }
    setConfirmar(true);
  };

  const titulo = form.titulo.trim() || (form.id ? "Sem título" : "Novo vídeo");
  const alvo = { id: form.id ?? "", titulo: form.titulo, sala: form.sala };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/admin" as Route, rotulo: "Curadoria" },
          { href: "/admin/videos" as Route, rotulo: "Vídeos" },
        ]}
        atual={titulo}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          <IndicadorSalvamento estado={estado} hora={hora} />
          {publicado && (
            <span className="sdb-footnote">
              Publicado: as alterações só valem depois de “Salvar alterações”.
            </span>
          )}
        </div>
        <h1 className="sdb-title-1">{titulo}</h1>
      </header>

      {form.id && (
        <Segmented<"edicao" | "historico">
          abas="item"
          label="Seções do vídeo"
          value={aba}
          onChange={setAba}
          options={[
            { value: "edicao", label: "Edição" },
            { value: "historico", label: "Histórico" },
          ]}
        />
      )}

      <div
        id="item-painel-edicao"
        role="tabpanel"
        aria-labelledby={form.id ? "item-aba-edicao" : undefined}
        hidden={aba !== "edicao"}
      >
        {arquivado && (
          <Alerta title="Este vídeo está arquivado" className="mb-6">
            Ele não aparece no portal e não pode ser editado. Restaure-o como rascunho para voltar a trabalhar
            nele.
          </Alerta>
        )}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <form
            className="flex min-w-0 flex-col gap-6"
            noValidate
            onSubmit={(e) => e.preventDefault()}
            aria-label="Edição do vídeo"
          >
            <fieldset disabled={arquivado} className="contents">
              <section className="sdb-material sdb-panel" aria-labelledby="sec-video">
                <h2 id="sec-video" className="sdb-headline">
                  Vídeo
                </h2>
                <Select
                  id="campo-sala"
                  label="Sala"
                  value={form.sala}
                  error={erros["campo-sala"]}
                  opcoes={[
                    { value: "", label: "Escolha a Sala" },
                    ...todasAsSalas().map((s) => ({ value: s.slug, label: s.nome })),
                  ]}
                  onChange={(e) => mudar({ sala: e.target.value as SalaSlug, artigos: [] }, "campo-sala")}
                />
                <CampoTexto
                  id="campo-titulo"
                  label="Título"
                  placeholder="Ex.: O que foi encontrado em Nag Hammadi"
                  value={form.titulo}
                  error={erros["campo-titulo"]}
                  onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
                />
                <CampoTexto
                  id="campo-url"
                  label="Endereço no YouTube"
                  type="url"
                  inputMode="url"
                  placeholder="https://www.youtube.com/watch?v=… ou https://youtu.be/…"
                  help={
                    url.ok
                      ? `Código do vídeo: ${url.id}`
                      : "Aceitamos youtube.com/watch, youtu.be e youtube.com/shorts. Não usamos a API do YouTube."
                  }
                  value={form.url}
                  error={erros["campo-url"]}
                  onChange={(e) => mudar({ url: e.target.value }, "campo-url")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto
                    id="campo-duracao"
                    label="Duração (mm:ss)"
                    inputMode="numeric"
                    placeholder="18:42"
                    value={form.duracao}
                    error={erros["campo-duracao"]}
                    onChange={(e) => mudar({ duracao: e.target.value }, "campo-duracao")}
                  />
                  <CampoTexto
                    id="campo-episodio"
                    label="Episódio"
                    placeholder="Ex.: Episódio 12"
                    value={form.episodio}
                    onChange={(e) => mudar({ episodio: e.target.value })}
                  />
                </div>
                <CampoTexto
                  id="campo-data"
                  label="Data de publicação no canal"
                  type="date"
                  value={form.publicadoEm}
                  onChange={(e) => mudar({ publicadoEm: e.target.value })}
                />
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-classificacao-video">
                <h2 id="sec-classificacao-video" className="sdb-headline">
                  Classificação
                </h2>
                <Select
                  id="campo-tema"
                  label="Tema"
                  value={form.tema}
                  error={erros["campo-tema"]}
                  opcoes={[
                    { value: "", label: "Escolha o tema" },
                    ...todosOsTemas().map((t) => ({ value: t.slug, label: t.nome })),
                  ]}
                  onChange={(e) => mudar({ tema: e.target.value as TemaSlug }, "campo-tema")}
                />
                <RadioGrupo<`${Nivel}`>
                  id="campo-nivel"
                  legenda="Nível"
                  nome="nivel-video"
                  valor={form.nivel ? (`${form.nivel}` as `${Nivel}`) : null}
                  error={erros["campo-nivel"]}
                  opcoes={([1, 2, 3] as Nivel[]).map((n) => ({
                    value: `${n}` as `${Nivel}`,
                    label: <SeloNivel nivel={n} plain />,
                    help: NIVEL_AJUDA[n],
                  }))}
                  onChange={(v) => mudar({ nivel: Number(v) as Nivel }, "campo-nivel")}
                />
                <RadioGrupo<Placa>
                  id="campo-placa"
                  legenda="Placa da miniatura"
                  nome="placa"
                  valor={form.placa}
                  help="Sem miniatura do canal, o card usa a placa da marca com o arco."
                  opcoes={PLACAS}
                  onChange={(placa) => mudar({ placa })}
                />
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-artigos">
                <h2 id="sec-artigos" className="sdb-headline">
                  Artigos ligados
                </h2>
                <p className="sdb-help">
                  O vídeo aparece em “Vídeos relacionados” na página de cada artigo publicado escolhido.
                </p>
                {!form.sala ? (
                  <p className="sdb-hint">Escolha a Sala para ver os artigos dela.</p>
                ) : doMesmoSala.length === 0 ? (
                  <p className="sdb-hint">Esta Sala ainda não tem artigos ativos.</p>
                ) : (
                  <fieldset className="sdb-fieldset">
                    <legend className="sdb-caption">Artigos da Sala {salaPorSlug(form.sala)?.nome}</legend>
                    <div className="sdb-list">
                      {doMesmoSala.map((a) => {
                        const marcado = form.artigos.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            className="sdb-option"
                            aria-pressed={marcado}
                            onClick={() =>
                              mudar({
                                artigos: marcado
                                  ? form.artigos.filter((x) => x !== a.id)
                                  : [...form.artigos, a.id],
                              })
                            }
                          >
                            <span>
                              {a.titulo}
                              {a.status !== "publicado" && (
                                <span className="sdb-table__sub">Rascunho: aparece quando for publicado</span>
                              )}
                            </span>
                            <Icon name="check" className="sdb-option__check" />
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-previa-video">
                <h2 id="sec-previa-video" className="sdb-headline">
                  Pré-visualização
                </h2>
                <div className="max-w-form">
                  <CardVideo
                    video={{
                      id: form.id ?? "previa",
                      sala: (form.sala || "nag-hammadi") as SalaSlug,
                      titulo: form.titulo || "Título do vídeo",
                      duracao: form.duracao || "00:00",
                      tema: (form.tema || "alma") as TemaSlug,
                      nivel: form.nivel ?? 1,
                      episodio: form.episodio || "Episódio",
                      publicadoEm: form.publicadoEm || new Date().toISOString().slice(0, 10),
                      url: url.ok ? url.canonica : "https://www.youtube.com/",
                      placa: form.placa,
                    }}
                  />
                </div>
              </section>
            </fieldset>
          </form>
          <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Publicação">
            {avisoPublicar && bloqueado && (
              <Alerta variant="error" title="Erro: ainda há itens pendentes">
                Cada item abaixo leva ao campo que falta.
              </Alerta>
            )}
            <ChecklistPublicacao
              aoIrParaCampo={focarCampo}
              itens={checklist}
              acao={
                arquivado ? null : publicado ? (
                  <Button variant="primary" block onClick={salvarAlteracoes} disabled={!sujo}>
                    Salvar alterações
                  </Button>
                ) : (
                  <Button variant="primary" block aria-disabled={bloqueado} onClick={publicar}>
                    Publicar
                  </Button>
                )
              }
            />
            <div className="sdb-material sdb-panel">
              <h2 className="sdb-headline">Ações</h2>
              <div className="flex flex-col gap-2">
                {publicado && form.id && (
                  <Button variant="secondary" block onClick={() => pedir(alvo, "despublicar")}>
                    Despublicar
                  </Button>
                )}
                {form.id && !arquivado && (
                  <Button variant="destructive" block icon="cadeado" onClick={() => pedir(alvo, "arquivar")}>
                    Arquivar
                  </Button>
                )}
                {arquivado && form.id && (
                  <Button variant="primary" block icon="regenerar" onClick={() => pedir(alvo, "restaurar")}>
                    Restaurar como rascunho
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {form.id && (
        <div
          id="item-painel-historico"
          role="tabpanel"
          aria-labelledby="item-aba-historico"
          hidden={aba !== "historico"}
        >
          {historico}
        </div>
      )}

      <ModalConfirmacao
        open={confirmar}
        titulo="Salvar as alterações no portal?"
        icone="check"
        rotuloConfirmar="Salvar e atualizar"
        carregando={estado === "salvando"}
        onCancelar={() => setConfirmar(false)}
        onConfirmar={async () => {
          const r = await salvarAgora("manual");
          setConfirmar(false);
          if (r?.ok) toast("Alterações salvas e já visíveis no portal.");
          else if (r && !r.ok && r.erros) mostrarErros(r.erros, r.mensagem);
        }}
      >
        <b>{form.titulo}</b>
        <br />O vídeo está publicado: as alterações aparecem na mesma hora na Sala e na busca.
      </ModalConfirmacao>
      {modal}
      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}
