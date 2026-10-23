"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { RadioGrupo, Select } from "@/components/ds/CamposExtras";
import { Chip } from "@/components/ds/Chip";
import { ChecklistPublicacao, IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { Drawer } from "@/components/ds/Drawer";
import { EditorBlocos } from "@/components/ds/EditorBlocos";
import { Icon } from "@/components/ds/Icon";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { SeloNivel } from "@/components/ds/Selos";
import { useToast } from "@/components/ds/Toast";
import { todosOsTemas } from "@/data/catalogo";
import { limparCorpo } from "@/data/corpo";
import { NIVEL_AJUDA } from "@/data/rotulos";
import type {
  AssinaturaAnfitriao,
  Conteudo,
  Fonte,
  Nivel,
  Sala,
  StatusEditorial,
  TipoFonte,
} from "@/data/types";
import { LeituraConteudo } from "@/features/acervo/LeituraConteudo";
import { escolherRelacionados } from "@/features/acervo/relacionados";
import { normalizar } from "@/lib/texto";
import {
  enviarArtigoAcao,
  excluirItemAcao,
  proporFonteAcao,
  retirarDoArAcao,
  salvarArtigoAnfitriaoAcao,
} from "@/server/anfitriao/acoes";
import { errosDoCorpoResolvidos } from "../../admin/regras/checklist";
import { errosDoCorpo } from "../../admin/regras/corpo";
import { AvisoSaida, focarCampo } from "../../admin/ui/AvisoSaida";
import { useEdicao } from "../../admin/ui/useEdicao";
import {
  checklistEnvioArtigo,
  duracaoDoTexto,
  type FormArtigoAnfitriao,
  type FormFonteProposta,
  interpretarLink,
  LIMITE_RESUMO,
  LIMITE_TITULO,
  resumoDoTexto,
  TIPOS_FONTE,
  temPendencia,
} from "../regras/artigo";
import { DiretrizesAnfitriao } from "./Diretrizes";
import { SheetEnvio } from "./SheetEnvio";

export type FonteParaAnfitriao = Fonte & { nova: boolean };

interface EditorArtigoAnfitriaoProps {
  inicial: FormArtigoAnfitriao;
  status: StatusEditorial;
  atualizadoEm: string | null;
  jaPublicado: boolean;
  congelado: boolean;
  ultimoMotivo?: string;
  sala: Sala & { id: string; status: StatusEditorial };
  assinatura: AssinaturaAnfitriao;
  fontes: FonteParaAnfitriao[];
  imagens: { card: ImagemEnviada | null; thumb: ImagemEnviada | null };
  publicadoEm: string;
  slug: string;
  noAr?: string;
  /** O acervo publicado (sem corpo), para "Continuar a busca" na prévia. */
  publicados?: Conteudo[];
}

const ENVIAVEIS: StatusEditorial[] = ["rascunho", "reprovado"];
const fonteVazia = (): FormFonteProposta => ({ titulo: "", autor: "", tipo: "", localizacao: "" });

/** O artigo do anfitrião (§3.2, §5): formulário, prévia como o público verá e envio para revisão. */
export function EditorArtigoAnfitriao({
  inicial,
  status,
  atualizadoEm,
  jaPublicado,
  congelado,
  ultimoMotivo,
  sala,
  assinatura,
  fontes: fontesIniciais,
  imagens: imagensIniciais,
  publicadoEm,
  slug,
  noAr,
  publicados = [],
}: EditorArtigoAnfitriaoProps) {
  const router = useRouter();
  const toast = useToast();
  const [aba, setAba] = useState<"edicao" | "previa">("edicao");
  const [fontes, setFontes] = useState(fontesIniciais);
  const [buscaFonte, setBuscaFonte] = useState("");
  const [gaveta, setGaveta] = useState(false);
  const [novaFonte, setNovaFonte] = useState(fonteVazia());
  const [errosFonte, setErrosFonte] = useState<Record<string, string>>({});
  const [salvandoFonte, setSalvandoFonte] = useState(false);
  const [imagens, setImagens] = useState(imagensIniciais);
  const [aceite, setAceite] = useState(false);
  const [envio, setEnvio] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [retirar, setRetirar] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const publicado = status === "publicado";
  const emRevisao = status === "em_revisao";
  const travado = emRevisao || congelado;
  const edicao = useEdicao<FormArtigoAnfitriao>({
    inicial,
    status,
    atualizadoEm,
    base: "/anfitriao/artigos",
    salvar: salvarArtigoAnfitriaoAcao,
    podeSalvar: (f) => Boolean(f.titulo.trim()),
    automatico: !publicado && !travado,
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const id = edicao.id.current;

  // O checklist do envio inclui o aceite, que é marcado na hora de enviar.
  const checklist = checklistEnvioArtigo(form, true).filter((i) => i.id !== "aceite");
  const bloqueado = temPendencia(checklist);
  const link = interpretarLink(form.link);
  const avulso = sala.status === "publicado";

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = Object.keys(novos)[0];
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const alternarTema = (t: FormArtigoAnfitriao["temas"][number]) =>
    mudar(
      { temas: form.temas.includes(t) ? form.temas.filter((x) => x !== t) : [...form.temas, t] },
      "campo-temas",
    );

  const alternarFonte = (fid: string) =>
    mudar(
      { fontes: form.fontes.includes(fid) ? form.fontes.filter((x) => x !== fid) : [...form.fontes, fid] },
      "campo-fontes",
    );

  const salvarFonte = async () => {
    setSalvandoFonte(true);
    const r = await proporFonteAcao(novaFonte);
    setSalvandoFonte(false);
    if (!r.ok) {
      const e = (r as { erros?: Record<string, string> }).erros ?? {};
      setErrosFonte(e);
      const primeiro = Object.keys(e)[0];
      if (primeiro) requestAnimationFrame(() => focarCampo(primeiro.replace("campo-fonte", "nova-fonte")));
      else
        toast(r.mensagem.replace(/^Erro: /, ""), {
          variant: "erro",
          title: "Erro: a fonte não foi cadastrada",
        });
      return;
    }
    const titulo = novaFonte.titulo.trim();
    setFontes((x) => [
      ...x,
      {
        id: r.valor.id,
        titulo,
        autor: novaFonte.autor.trim(),
        tradicao: "Indicada por anfitrião",
        tipo: novaFonte.tipo as TipoFonte,
        referencia: novaFonte.localizacao.trim(),
        capa: "grafite",
        inicial: (titulo[0] ?? "?").toUpperCase(),
        nova: true,
      },
    ]);
    mudar({ fontes: [...form.fontes, r.valor.id] }, "campo-fontes");
    setGaveta(false);
    setNovaFonte(fonteVazia());
    setErrosFonte({});
    toast("Fonte cadastrada e escolhida. Ela entra no catálogo quando o artigo for aprovado.");
  };

  const pedirEnvio = () => {
    if (bloqueado) {
      const novos = Object.fromEntries(
        checklist
          .filter((i) => i.estado === "pendente")
          .filter((i) => !i.campo.startsWith("campo-corpo-"))
          .map((i) => [i.campo, i.ajuda.replace(/\.$/, "").toLowerCase()]),
      );
      Object.assign(novos, errosDoCorpo(form.corpo));
      return mostrarErros(novos, "Erro: ainda há itens pendentes para enviar");
    }
    setErroEnvio(null);
    setEnvio(true);
  };

  const enviar = async () => {
    if (!aceite) {
      setErroEnvio("marque a declaração de direitos para enviar.");
      return;
    }
    setEnviando(true);
    if (sujo || !id) {
      const s = await salvarAgora("automatico");
      if (!s?.ok) {
        setEnviando(false);
        setErroEnvio(
          s && !s.ok ? s.mensagem.replace(/^Erro: /, "") : "não foi possível salvar antes de enviar.",
        );
        return;
      }
    }
    const r = await enviarArtigoAcao(edicao.id.current ?? "", aceite);
    setEnviando(false);
    if (!r.ok) {
      setErroEnvio(r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    setEnvio(false);
    toast(r.mensagem);
    router.refresh();
  };

  const salvarPublicado = async () => {
    const r = await salvarAgora("manual");
    setConfirmarEdicao(false);
    if (r?.ok) {
      toast(r.mensagem);
      router.refresh();
    } else if (r && !r.ok) mostrarErros(r.erros ?? {}, r.mensagem);
  };

  const executar = async (acao: () => Promise<{ ok: boolean; mensagem: string }>, depois: () => void) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível concluir" });
      return;
    }
    toast(r.mensagem);
    depois();
  };

  const fontesFiltradas = fontes.filter(
    (f) => !buscaFonte.trim() || normalizar(`${f.titulo} ${f.autor}`).includes(normalizar(buscaFonte)),
  );

  // As obras escolhidas, na ordem das chamadas [1], [2]… do texto.
  const fontesCitaveis = form.fontes.map((fid, i) => ({
    n: i + 1,
    titulo: fontes.find((f) => f.id === fid)?.titulo ?? "Obra escolhida",
  }));

  // Prévia: o artigo exatamente como a página pública o mostra.
  const corpo = limparCorpo(form.corpo);
  const previa: Conteudo = {
    slug: slug || "previa",
    sala: sala.slug,
    tipo: "artigo",
    titulo: form.titulo.trim() || "Título do artigo",
    resumo: resumoDoTexto(corpo),
    temas: form.temas,
    periodo: sala.periodo,
    nivel: form.nivel ?? 1,
    formato: link.ok && link.link?.tipo === "youtube" ? "video" : "texto",
    proveniencia: "anfitriao",
    duracaoMin: duracaoDoTexto(corpo),
    autoria: { nome: assinatura.nome, credencial: assinatura.credencial },
    anfitriao: assinatura,
    publicadoEm: publicadoEm || new Date().toISOString().slice(0, 10),
    corpo: corpo.length ? corpo : ["O texto do artigo aparece aqui."],
    fontes: form.fontes,
    ...(link.ok && link.link ? { link: link.link } : {}),
    ...(imagens.card ? { imagem: imagens.card.url } : {}),
    ...(imagens.thumb ? { thumb: imagens.thumb.url } : {}),
  };

  const titulo = form.titulo.trim() || (id ? "Sem título" : "Novo artigo");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/anfitriao" as Route, rotulo: "Minhas Salas" },
          { href: `/anfitriao/salas/${sala.id}` as Route, rotulo: sala.nome },
        ]}
        atual={titulo}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          {!travado && <IndicadorSalvamento estado={estado} hora={hora} />}
          {!id && (
            <span className="sdb-footnote">O rascunho é salvo sozinho depois que você escreve o título.</span>
          )}
        </div>
        <h1 className="sdb-title-1">{titulo}</h1>
        {noAr && (
          <p className="sdb-footnote">
            No ar em{" "}
            <Link href={noAr as Route} className="sdb-link">
              {noAr}
            </Link>
          </p>
        )}
      </header>

      {status === "reprovado" && ultimoMotivo && (
        <Alerta variant="warning" title="Atenção: a curadoria pediu ajustes neste artigo">
          Motivo: {ultimoMotivo}
          <br />
          Corrija e envie de novo.
        </Alerta>
      )}
      {emRevisao && (
        <Alerta title="Em revisão">
          A curadoria está revisando este artigo. Enquanto isso, ele não pode ser editado.
        </Alerta>
      )}
      {congelado && (
        <Alerta title="Artigo congelado">
          Este artigo foi congelado pela curadoria e não é mais editado.
        </Alerta>
      )}
      {publicado && (
        <Alerta title="Este artigo está no ar">
          Qualquer alteração tira o artigo do ar até a curadoria aprovar a nova versão.
        </Alerta>
      )}

      <Segmented<"edicao" | "previa">
        abas="artigo"
        label="Edição ou prévia"
        value={aba}
        onChange={setAba}
        options={[
          { value: "edicao", label: "Edição" },
          { value: "previa", label: "Prévia" },
        ]}
      />

      <div
        id="artigo-painel-edicao"
        role="tabpanel"
        aria-labelledby="artigo-aba-edicao"
        hidden={aba !== "edicao"}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <form
            className="flex min-w-0 flex-col gap-6"
            noValidate
            onSubmit={(e) => e.preventDefault()}
            aria-label="Edição do artigo"
          >
            <fieldset disabled={travado} className="contents">
              <section className="sdb-material sdb-panel" aria-labelledby="sec-texto">
                <h2 id="sec-texto" className="sdb-headline">
                  Texto
                </h2>
                <CampoTexto
                  id="campo-titulo"
                  label="Título"
                  maxLength={LIMITE_TITULO}
                  placeholder="Ex.: O Reino dentro e fora: o dito 3 em leitura comparada"
                  value={form.titulo}
                  error={erros["campo-titulo"]}
                  onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
                />
                <p className="sdb-help">
                  O texto é feito de blocos. O primeiro, o lead, vira o resumo do card. A barra de cada bloco
                  formata o trecho e marca termos, obras e fontes.
                </p>
                <div id="campo-corpo">
                  <EditorBlocos
                    idBase="campo-corpo"
                    blocos={form.corpo}
                    erros={erros}
                    fontes={fontesCitaveis}
                    limiteResumo={LIMITE_RESUMO}
                    somenteLeitura={travado}
                    onChange={(c) => mudar({ corpo: c }, "campo-corpo", ...errosDoCorpoResolvidos(erros, c))}
                  />
                </div>
                {erros["campo-corpo"] && <ErroCampo id="campo-corpo-erro" texto={erros["campo-corpo"]} />}
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-classificacao">
                <h2 id="sec-classificacao" className="sdb-headline">
                  Temas e nível
                </h2>
                <fieldset
                  id="campo-temas"
                  className="sdb-fieldset"
                  aria-describedby={erros["campo-temas"] ? "campo-temas-erro" : "campo-temas-ajuda"}
                >
                  <legend className="sdb-caption">Temas</legend>
                  <p id="campo-temas-ajuda" className="sdb-help">
                    Pelo menos um. São a sua trilha de conhecimento e ligam o artigo à busca por tema.
                  </p>
                  <div className="sdb-row">
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
                  {erros["campo-temas"] && <ErroCampo id="campo-temas-erro" texto={erros["campo-temas"]} />}
                </fieldset>
                <RadioGrupo<`${Nivel}`>
                  id="campo-nivel"
                  legenda="Nível de aprofundamento"
                  nome="nivel"
                  help="Sem escolha, Iniciante."
                  valor={`${form.nivel ?? 1}` as `${Nivel}`}
                  opcoes={([1, 2, 3] as Nivel[]).map((n) => ({
                    value: `${n}` as `${Nivel}`,
                    label: <SeloNivel nivel={n} plain />,
                    help: NIVEL_AJUDA[n],
                  }))}
                  onChange={(v) => mudar({ nivel: Number(v) as Nivel })}
                />
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-fontes">
                <div className="sdb-row sdb-row--between">
                  <h2 id="sec-fontes" className="sdb-headline">
                    Fontes
                  </h2>
                  <Button variant="tinted" size="sm" icon="mais" onClick={() => setGaveta(true)}>
                    Nova fonte
                  </Button>
                </div>
                <fieldset
                  id="campo-fontes"
                  className="sdb-fieldset"
                  aria-describedby={erros["campo-fontes"] ? "campo-fontes-erro" : "campo-fontes-ajuda"}
                >
                  <legend className="sdb-caption">
                    Obras citadas · {form.fontes.length}{" "}
                    {form.fontes.length === 1 ? "escolhida" : "escolhidas"}
                  </legend>
                  <p id="campo-fontes-ajuda" className="sdb-help">
                    Pelo menos uma. Escolha no catálogo do acervo ou cadastre uma nova: ela é revisada junto
                    com o artigo.
                  </p>
                  <div className="sdb-field">
                    <label className="sdb-label" htmlFor="busca-fonte">
                      Buscar fonte
                    </label>
                    <div className="sdb-control sdb-control--search">
                      <Icon name="busca" />
                      <input
                        id="busca-fonte"
                        type="search"
                        placeholder="Título ou autor"
                        value={buscaFonte}
                        onChange={(e) => setBuscaFonte(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sdb-list">
                    {fontesFiltradas.length === 0 ? (
                      <p className="sdb-list-row sdb-hint">
                        Nenhuma fonte com esse nome. Use “Nova fonte” para cadastrar.
                      </p>
                    ) : (
                      fontesFiltradas.map((f) => {
                        const marcada = form.fontes.includes(f.id);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            className="sdb-option"
                            aria-pressed={marcada}
                            onClick={() => alternarFonte(f.id)}
                          >
                            <span>
                              {f.titulo}
                              <span className="sdb-table__sub">
                                {f.autor} · {f.tipo}
                                {f.nova && " · nova, em revisão"}
                              </span>
                            </span>
                            <Icon name="check" className="sdb-option__check" />
                          </button>
                        );
                      })
                    )}
                  </div>
                  {erros["campo-fontes"] && (
                    <ErroCampo id="campo-fontes-erro" texto={erros["campo-fontes"]} />
                  )}
                </fieldset>
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-midia">
                <h2 id="sec-midia" className="sdb-headline">
                  Link e imagens
                </h2>
                <CampoTexto
                  id="campo-link"
                  label={
                    <>
                      Link <small>opcional</small>
                    </>
                  }
                  type="url"
                  inputMode="url"
                  placeholder="https://"
                  value={form.link}
                  error={erros["campo-link"]}
                  help={
                    link.ok && link.link?.tipo === "youtube"
                      ? "Vídeo do YouTube: vira um player no topo do artigo."
                      : link.ok && link.link?.tipo === "site"
                        ? "Site externo: vira o botão “Ler no site”, que abre em nova aba."
                        : "Um link só: um vídeo do YouTube (vira player) ou um site (vira “Ler no site”)."
                  }
                  onChange={(e) => mudar({ link: e.target.value }, "campo-link")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoImagem
                    id="campo-imagem-card"
                    label="Imagem do card"
                    opcional
                    help="Aparece no card do artigo. Sem ela, a placa da marca."
                    valor={imagens.card}
                    disabled={travado}
                    onMudar={(img) => {
                      setImagens((x) => ({ ...x, card: img }));
                      mudar({ imagemCard: img?.id ?? null });
                    }}
                  />
                  <CampoImagem
                    id="campo-imagem-thumb"
                    label="Imagem de topo"
                    opcional
                    help="Topo da página do artigo, quando não há vídeo. Sem ela, a imagem do card."
                    valor={imagens.thumb}
                    disabled={travado}
                    onMudar={(img) => {
                      setImagens((x) => ({ ...x, thumb: img }));
                      mudar({ thumb: img?.id ?? null });
                    }}
                  />
                </div>
              </section>
            </fieldset>
          </form>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Revisão">
            <DiretrizesAnfitriao />
            <ChecklistPublicacao
              titulo="Para enviar"
              aoIrParaCampo={focarCampo}
              itens={checklist}
              acao={
                travado ? null : publicado ? (
                  <Button variant="primary" block disabled={!sujo} onClick={() => setConfirmarEdicao(true)}>
                    Salvar alterações
                  </Button>
                ) : ENVIAVEIS.includes(status) && avulso ? (
                  <Button
                    variant="primary"
                    block
                    icon="enviar"
                    aria-disabled={bloqueado}
                    onClick={pedirEnvio}
                  >
                    Enviar para revisão
                  </Button>
                ) : (
                  <p className="sdb-footnote">
                    Este artigo vai para a revisão junto com a Sala.{" "}
                    <Link href={`/anfitriao/salas/${sala.id}` as Route} className="sdb-link">
                      Enviar pela Sala
                    </Link>
                  </p>
                )
              }
            />
            {id && !travado && (publicado || !jaPublicado) && (
              <div className="sdb-material sdb-panel">
                <h2 className="sdb-headline">Ações</h2>
                <div className="flex flex-col gap-2">
                  {publicado && (
                    <Button variant="secondary" block onClick={() => setRetirar(true)}>
                      Retirar do ar
                    </Button>
                  )}
                  {!jaPublicado && (
                    <Button variant="destructive" block icon="lixeira" onClick={() => setExcluir(true)}>
                      Excluir artigo
                    </Button>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <div
        id="artigo-painel-previa"
        role="tabpanel"
        aria-labelledby="artigo-aba-previa"
        hidden={aba !== "previa"}
      >
        <div className="flex flex-col gap-6">
          <Alerta title="Prévia">Assim o artigo aparece no portal depois de aprovado pela curadoria.</Alerta>
          <LeituraConteudo
            sala={sala}
            conteudo={previa}
            fontes={fontes.filter((f) => form.fontes.includes(f.id))}
            videos={[]}
            relacionados={escolherRelacionados(previa, publicados)}
          />
        </div>
      </div>

      <Drawer
        open={gaveta}
        onClose={() => setGaveta(false)}
        title="Nova fonte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGaveta(false)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={salvandoFonte} onClick={salvarFonte}>
              Cadastrar e escolher
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="sdb-help">
            A fonte fica visível só para você até a curadoria aprovar o artigo que a usa. Depois, entra no
            catálogo do acervo.
          </p>
          <CampoTexto
            id="nova-fonte-titulo"
            label="Título da obra"
            placeholder="Ex.: The Hymn of the Pearl: The Syriac and Greek Texts"
            value={novaFonte.titulo}
            error={errosFonte["campo-fonte-titulo"]}
            onChange={(e) => setNovaFonte((f) => ({ ...f, titulo: e.target.value }))}
          />
          <CampoTexto
            id="nova-fonte-autor"
            label="Autor, editor ou tradutor"
            placeholder="Ex.: Johan Ferreira (ed. e trad.)"
            help="Com o papel entre parênteses: (ed.), (trad.), (autora)."
            value={novaFonte.autor}
            error={errosFonte["campo-fonte-autor"]}
            onChange={(e) => setNovaFonte((f) => ({ ...f, autor: e.target.value }))}
          />
          <Select
            id="nova-fonte-tipo"
            label="Tipo"
            value={novaFonte.tipo}
            error={errosFonte["campo-fonte-tipo"]}
            opcoes={[
              { value: "", label: "Escolha o tipo" },
              ...TIPOS_FONTE.map((t) => ({ value: t, label: t })),
            ]}
            onChange={(e) => setNovaFonte((f) => ({ ...f, tipo: e.target.value as TipoFonte | "" }))}
          />
          <CampoTexto
            id="nova-fonte-localizacao"
            label="Localização"
            placeholder="Ex.: Sydney: St Pauls Publications, 2002"
            help="Editora e ano, ou o documento de origem."
            value={novaFonte.localizacao}
            error={errosFonte["campo-fonte-localizacao"]}
            onChange={(e) => setNovaFonte((f) => ({ ...f, localizacao: e.target.value }))}
          />
        </div>
      </Drawer>

      <SheetEnvio
        aberto={envio}
        titulo="Enviar para revisão"
        aceite={aceite}
        onAceite={(v) => {
          setAceite(v);
          setErroEnvio(null);
        }}
        erro={erroEnvio}
        enviando={enviando}
        onEnviar={enviar}
        onFechar={() => setEnvio(false)}
      >
        <p className="sdb-body-sm m-0">
          “{form.titulo.trim()}” vai para a curadoria. Se aprovado, entra no ar na Sala {sala.nome}.
        </p>
      </SheetEnvio>

      <ModalConfirmacao
        open={confirmarEdicao}
        titulo="Salvar e tirar o artigo do ar?"
        icone="aviso"
        rotuloConfirmar="Salvar e tirar do ar"
        carregando={estado === "salvando"}
        onCancelar={() => setConfirmarEdicao(false)}
        onConfirmar={salvarPublicado}
      >
        Este artigo sai do ar até a curadoria aprovar a nova versão. Depois de salvar, envie de novo para
        revisão.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={retirar}
        titulo="Retirar o artigo do ar?"
        icone="aviso"
        destrutivo
        rotuloConfirmar="Retirar do ar"
        carregando={ocupado}
        onCancelar={() => setRetirar(false)}
        onConfirmar={() =>
          executar(
            () => retirarDoArAcao("artigo", id ?? ""),
            () => {
              setRetirar(false);
              router.refresh();
            },
          )
        }
      >
        O artigo sai do portal e fica arquivado. Nada é apagado. Se for o último artigo no ar, a Sala sai
        junto.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={excluir}
        titulo="Excluir este artigo?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Excluir artigo"
        carregando={ocupado}
        onCancelar={() => setExcluir(false)}
        onConfirmar={() =>
          executar(
            () => excluirItemAcao("artigo", id ?? ""),
            () => {
              setSujo(false);
              router.push(`/anfitriao/salas/${sala.id}` as Route);
              router.refresh();
            },
          )
        }
      >
        O artigo é apagado. Isso não pode ser desfeito.
      </ModalConfirmacao>

      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}

function ErroCampo({ id, texto }: { id: string; texto: string }) {
  return (
    <p id={id} className="sdb-error-msg">
      <Icon name="erro" />
      <span>
        <b>Erro:</b> {texto}
      </span>
    </p>
  );
}
