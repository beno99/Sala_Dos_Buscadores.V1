"use client";

import type { Route } from "next";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { CardVideo } from "@/components/ds/CardVideo";
import { Chip } from "@/components/ds/Chip";
import { IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { Icon } from "@/components/ds/Icon";
import { SeloNivel } from "@/components/ds/Selos";
import { useToast } from "@/components/ds/Toast";
import { todosOsTemas } from "@/data/catalogo";
import { NIVEL_AJUDA } from "@/data/rotulos";
import type { Nivel, Placa, SalaSlug, StatusEditorial } from "@/data/types";
import type { FormVideo } from "@/features/admin/formularios";
import { checklistVideo, ORDEM_CAMPOS_VIDEO, primeiroCampoComErro } from "@/features/admin/regras/checklist";
import { extrairIdYoutube } from "@/features/admin/regras/youtube";
import { AvisoSaida, focarCampo } from "@/features/admin/ui/AvisoSaida";
import { PLACAS } from "@/features/admin/ui/CamposFonte";
import { useEdicao } from "@/features/admin/ui/useEdicao";
import {
  enviarVideoAcao,
  excluirVideoAcao,
  retirarVideoAcao,
  salvarVideoAnfitriaoAcao,
} from "@/server/anfitriao/acoes";
import { AcoesEnvio } from "./AcoesEnvio";

export interface SalaParaVideo {
  slug: string;
  nome: string;
}

export interface ArtigoParaVideo {
  id: string;
  titulo: string;
  salaNome: string;
  status: StatusEditorial;
  meu: boolean;
}

/**
 * Vídeo do anfitrião (YouTube): nasce numa Sala dele e pode acompanhar
 * artigos. Rascunho salva sozinho; vai ao ar só com a aprovação da curadoria.
 */
export function EditorVideoAnfitriao({
  inicial,
  status,
  atualizadoEm,
  salas,
  artigos,
  jaPublicado,
  congelado,
  motivo,
}: {
  inicial: FormVideo;
  status: StatusEditorial;
  atualizadoEm: string | null;
  salas: SalaParaVideo[];
  artigos: ArtigoParaVideo[];
  jaPublicado: boolean;
  congelado: boolean;
  /** Motivo da última reprovação, quando voltou da curadoria. */
  motivo?: string;
}) {
  const toast = useToast();
  const publicado = status === "publicado";
  const travado = status === "em_revisao" || congelado;
  const edicao = useEdicao<FormVideo>({
    inicial,
    status,
    atualizadoEm,
    base: "/anfitriao/videos",
    salvar: salvarVideoAnfitriaoAcao,
    podeSalvar: (f) => Boolean(f.sala && f.titulo.trim()),
    automatico: !publicado && !travado,
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const [buscaArtigo, setBuscaArtigo] = useState("");
  const checklist = checklistVideo(form);
  const url = extrairIdYoutube(form.url);
  const sala = salas.find((s) => s.slug === form.sala);

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = primeiroCampoComErro(novos, [...ORDEM_CAMPOS_VIDEO, "campo-artigos"]);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const alternarTema = (t: FormVideo["temas"][number]) =>
    mudar(
      { temas: form.temas.includes(t) ? form.temas.filter((x) => x !== t) : [...form.temas, t] },
      "campo-temas",
    );
  const alternarArtigo = (id: string) =>
    mudar(
      { artigos: form.artigos.includes(id) ? form.artigos.filter((x) => x !== id) : [...form.artigos, id] },
      "campo-artigos",
    );

  const termo = buscaArtigo.trim().toLowerCase();
  const visiveis = artigos.filter(
    (a) => form.artigos.includes(a.id) || !termo || a.titulo.toLowerCase().includes(termo),
  );
  const titulo = form.titulo.trim() || (form.id ? "Sem título" : "Novo vídeo");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/anfitriao/videos" as Route, rotulo: "Vídeos" }]} atual={titulo} />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          <IndicadorSalvamento estado={estado} hora={hora} />
          {publicado && (
            <span className="sdb-footnote">
              No ar: salvar alterações tira o vídeo do ar até a nova aprovação.
            </span>
          )}
        </div>
        <h1 className="sdb-title-1">{titulo}</h1>
      </header>
      {edicao.conflito && (
        <Alerta variant="error" title="Conflito de edição">
          {edicao.conflito}
        </Alerta>
      )}
      {status === "reprovado" && motivo && (
        <Alerta variant="warning" title="A curadoria pediu ajustes">
          {motivo}
        </Alerta>
      )}
      {salas.length === 0 && (
        <Alerta title="Crie uma Sala primeiro">Todo vídeo pertence a uma das suas Salas.</Alerta>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <form
          className="flex min-w-0 flex-col gap-6"
          noValidate
          onSubmit={(e) => e.preventDefault()}
          aria-label="Edição do vídeo"
        >
          <fieldset disabled={travado} className="contents">
            <section className="sdb-material sdb-panel" aria-labelledby="sec-video">
              <h2 id="sec-video" className="sdb-headline">
                Vídeo
              </h2>
              <Select
                id="campo-sala"
                label="Sala"
                value={form.sala}
                disabled={Boolean(form.id) || travado}
                help={
                  form.id
                    ? "O vídeo não muda de Sala depois de criado."
                    : "O vídeo aparece na página desta Sala."
                }
                error={erros["campo-sala"]}
                opcoes={[
                  { value: "", label: "Escolha uma das suas Salas", disabled: true },
                  ...salas.map((s) => ({ value: s.slug, label: s.nome })),
                ]}
                onChange={(e) => mudar({ sala: e.target.value as SalaSlug }, "campo-sala")}
              />
              <CampoTexto
                id="campo-titulo"
                label="Título"
                maxLength={120}
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
                    : "Aceitamos youtube.com/watch, youtu.be, youtube.com/shorts e youtube.com/embed."
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
                  label="Episódio ou série"
                  placeholder="Ex.: Episódio 12"
                  value={form.episodio}
                  onChange={(e) => mudar({ episodio: e.target.value })}
                />
              </div>
            </section>

            <section className="sdb-material sdb-panel" aria-labelledby="sec-classificacao">
              <h2 id="sec-classificacao" className="sdb-headline">
                Classificação
              </h2>
              <fieldset id="campo-temas" className="sdb-fieldset">
                <legend className="sdb-caption">Temas</legend>
                <div className="sdb-row sdb-tag-picker">
                  {todosOsTemas().map((t) => (
                    <Chip
                      key={t.slug}
                      small
                      pressed={form.temas.includes(t.slug)}
                      onClick={() => alternarTema(t.slug)}
                    >
                      {t.nome}
                    </Chip>
                  ))}
                </div>
                {erros["campo-temas"] && (
                  <p className="sdb-error-msg">
                    <Icon name="erro" />
                    <span>
                      <b>Erro:</b> {erros["campo-temas"]}
                    </span>
                  </p>
                )}
              </fieldset>
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
                Artigos que o vídeo acompanha
              </h2>
              <p className="sdb-help m-0">
                Opcional. Seus artigos aparecem primeiro, em qualquer estado; de outras Salas, só os
                publicados. O vídeo aparece na página de cada artigo publicado.
              </p>
              <CampoTexto
                type="search"
                label="Buscar artigo"
                value={buscaArtigo}
                onChange={(e) => setBuscaArtigo(e.target.value)}
              />
              <fieldset id="campo-artigos" className="sdb-fieldset flex flex-col gap-2">
                <legend className="sdb-caption">
                  {form.artigos.length
                    ? `${form.artigos.length} selecionado(s)`
                    : "Nenhum artigo selecionado"}
                </legend>
                {visiveis.slice(0, 40).map((a) => (
                  <Checkbox
                    key={a.id}
                    label={a.titulo}
                    help={`${a.meu ? "Seu artigo" : "Outra Sala"} · ${a.salaNome}${a.status !== "publicado" ? " · ainda não publicado" : ""}`}
                    checked={form.artigos.includes(a.id)}
                    onChange={() => alternarArtigo(a.id)}
                  />
                ))}
                {visiveis.length === 0 && <p className="sdb-help m-0">Nenhum artigo encontrado.</p>}
                {erros["campo-artigos"] && (
                  <p className="sdb-error-msg">
                    <Icon name="erro" />
                    <span>
                      <b>Erro:</b> {erros["campo-artigos"]}
                    </span>
                  </p>
                )}
              </fieldset>
            </section>

            <section className="sdb-material sdb-panel" aria-labelledby="sec-previa">
              <h2 id="sec-previa" className="sdb-headline">
                Pré-visualização
              </h2>
              <div className="max-w-form">
                <CardVideo
                  previa
                  video={{
                    id: form.id ?? "previa",
                    sala: (form.sala || "previa") as SalaSlug,
                    titulo: form.titulo || "Título do vídeo",
                    duracao: form.duracao || "00:00",
                    temas: form.temas.length ? form.temas : ["alma"],
                    nivel: form.nivel ?? 1,
                    episodio: form.episodio || sala?.nome || "Episódio",
                    publicadoEm: form.publicadoEm || new Date().toISOString().slice(0, 10),
                    url: url.ok ? url.canonica : "https://www.youtube.com/",
                    placa: form.placa,
                  }}
                />
              </div>
            </section>
          </fieldset>
        </form>
        <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Envio">
          <AcoesEnvio
            item={{ artigo: "o", nome: "vídeo" }}
            titulo={form.titulo}
            status={status}
            jaPublicado={jaPublicado}
            congelado={congelado}
            checklist={checklist}
            sujo={sujo}
            salvando={estado === "salvando"}
            id={edicao.id.current}
            salvarAgora={salvarAgora}
            aoErro={mostrarErros}
            enviar={enviarVideoAcao}
            retirar={retirarVideoAcao}
            excluir={excluirVideoAcao}
            depoisDeExcluir={"/anfitriao/videos" as Route}
            destinoEnvio={sala ? `na Sala ${sala.nome}` : "na sua Sala"}
          />
        </aside>
      </div>
      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}
