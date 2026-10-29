"use client";

import type { Route } from "next";
import { type ReactNode, useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { BlocoCitacao } from "@/components/ds/BlocoCitacao";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button } from "@/components/ds/Button";
import { CampoImagem } from "@/components/ds/CampoImagem";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { AreaTexto, RadioGrupo } from "@/components/ds/CamposExtras";
import { Chip } from "@/components/ds/Chip";
import { ChecklistPublicacao, IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { Drawer } from "@/components/ds/Drawer";
import { EditorBlocos } from "@/components/ds/EditorBlocos";
import { Icon } from "@/components/ds/Icon";
import { Menu } from "@/components/ds/Menu";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { Segmented } from "@/components/ds/Segmented";
import { SeloNivel, SeloProveniencia } from "@/components/ds/Selos";
import { useToast } from "@/components/ds/Toast";
import { todosOsTemas } from "@/data/catalogo";
import { NIVEL_AJUDA, PROVENIENCIA_AJUDA, PROVENIENCIA_ROTULO } from "@/data/rotulos";
import type {
  Citacao,
  Fonte,
  Nivel,
  Placa,
  Proveniencia,
  SalaSlug,
  SituacaoJuridica,
  StatusEditorial,
  Tema,
} from "@/data/types";
import { normalizar } from "@/lib/texto";
import { criarTemaAcao, salvarArtigoAcao, salvarFonteAcao } from "@/server/admin/acoes";
import { type FormArtigo, type FormFonte, fonteVazia, type TipoArtigo } from "../formularios";
import {
  checklistArtigo,
  errosDePublicacaoArtigo,
  errosDoCorpoResolvidos,
  ORDEM_CAMPOS_ARTIGO,
  primeiroCampoComErro,
  tamanhoReproduzido,
  temPendencia,
} from "../regras/checklist";
import {
  LIMITE_NOTA_DIVERGENCIA,
  LIMITE_RESUMO,
  LIMITE_TITULO,
  LIMITE_TRECHO_PERMITIDO,
} from "../regras/config";
import { gerarSlug } from "../regras/slug";
import { AvisoSaida, focarCampo } from "./AvisoSaida";
import { CamposFonte } from "./CamposFonte";
import { MoverParaSala } from "./MoverParaSala";
import { useAcaoStatus } from "./useAcaoStatus";
import { useEdicao } from "./useEdicao";

type TipoSituacao = SituacaoJuridica["tipo"];

const SITUACOES: { value: TipoSituacao; label: string; help: string }[] = [
  {
    value: "dominio-publico",
    label: "Domínio público",
    help: "Obra sem direitos autorais vigentes, como textos antigos ou O Caibalion (1908).",
  },
  {
    value: "licenca",
    label: "Licença compatível",
    help: "Tradução ou edição protegida com licença que permite publicar. Diga qual.",
  },
  {
    value: "cessao",
    label: "Cessão do autor",
    help: "O autor cedeu os direitos à Sala por escrito. Informe o registro da cessão.",
  },
  {
    value: "trecho-permitido",
    label: "Trecho permitido com referência",
    help: "Texto protegido citado em recorte curto, sempre com a referência completa.",
  },
];

/** A Sala vem da rota: o artigo nasce dentro dela e não muda pelo formulário. */
export interface SalaDoItem {
  slug: string;
  nome: string;
  placa: Placa;
}

interface EditorArtigoProps {
  inicial: FormArtigo;
  status: StatusEditorial;
  atualizadoEm: string | null;
  slugTravado: boolean;
  fontes: Fonte[];
  sala: SalaDoItem;
  /** Outras Salas oficiais ativas, para "Mover para outra Sala". */
  salasDestino?: { slug: string; nome: string }[];
  historico?: ReactNode;
}

// "Anfitrião" é só dos artigos de anfitrião: a curadoria não a atribui.
const PROVENIENCIAS = (Object.keys(PROVENIENCIA_ROTULO) as Proveniencia[]).filter((p) => p !== "anfitriao");

/** Formulário de artigo e fonte primária (RF-11 a RF-13, RF-15, RNF-DOM-01, RNF-DOM-03, RNF-DOM-04). */
export function EditorArtigo({
  inicial,
  status,
  atualizadoEm,
  slugTravado,
  fontes: fontesIniciais,
  sala,
  salasDestino = [],
  historico,
}: EditorArtigoProps) {
  const toast = useToast();
  const [aba, setAba] = useState<"edicao" | "historico">("edicao");
  const [fontes, setFontes] = useState(fontesIniciais);
  const [buscaFonte, setBuscaFonte] = useState("");
  const [gavetaFonte, setGavetaFonte] = useState(false);
  const [novaFonte, setNovaFonte] = useState<FormFonte>(fonteVazia());
  const [errosFonte, setErrosFonte] = useState<Record<string, string>>({});
  const [salvandoFonte, setSalvandoFonte] = useState(false);
  const [confirmarAlteracoes, setConfirmarAlteracoes] = useState(false);
  const [avisoPublicar, setAvisoPublicar] = useState(false);
  const [mover, setMover] = useState(false);

  const edicao = useEdicao<FormArtigo>({
    inicial,
    status,
    atualizadoEm,
    base: `/admin/salas/${sala.slug}/artigos`,
    salvar: salvarArtigoAcao,
    podeSalvar: (f) => Boolean(f.sala && f.titulo.trim()),
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const { pedir, modal } = useAcaoStatus("artigo");

  const checklist = checklistArtigo(form);
  const bloqueado = temPendencia(checklist);
  const salaNome = sala.nome;
  const alvo = (id: string) => ({ id, titulo: form.titulo, sala: form.sala, salaNome });
  const publicado = status === "publicado";
  const arquivado = status === "arquivado";

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = primeiroCampoComErro(novos, ORDEM_CAMPOS_ARTIGO);
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const publicar = async () => {
    if (bloqueado) {
      setAvisoPublicar(true);
      mostrarErros(errosDePublicacaoArtigo(form), "Erro: ainda há itens pendentes para publicar");
      return;
    }
    setAvisoPublicar(false);
    if (sujo || !edicao.id.current) {
      const r = await salvarAgora("automatico");
      if (!r?.ok) {
        if (r && !r.ok && r.erros) mostrarErros(r.erros, r.mensagem);
        return;
      }
    }
    if (edicao.id.current) pedir(alvo(edicao.id.current), "publicar");
  };

  const salvarAlteracoes = () => {
    const pendencias = errosDePublicacaoArtigo(form);
    if (Object.keys(pendencias).length) {
      mostrarErros(pendencias, "Erro: a alteração deixaria o conteúdo publicado com pendências");
      return;
    }
    setConfirmarAlteracoes(true);
  };

  const confirmarSalvar = async () => {
    const r = await salvarAgora("manual");
    setConfirmarAlteracoes(false);
    if (r?.ok) toast("Alterações salvas e já visíveis no portal.");
    else if (r && !r.ok) {
      if (r.erros) mostrarErros(r.erros, r.mensagem);
      else
        toast(r.pendencias?.map((p) => p.rotulo).join(" · ") || "Tente de novo.", {
          variant: "erro",
          title: r.mensagem,
        });
    }
  };

  const salvarNovaFonte = async () => {
    setSalvandoFonte(true);
    const r = await salvarFonteAcao(novaFonte);
    setSalvandoFonte(false);
    if (!r.ok) {
      setErrosFonte(r.erros ?? {});
      const primeiro = r.erros ? Object.keys(r.erros)[0] : undefined;
      if (primeiro) requestAnimationFrame(() => focarCampo(primeiro.replace("campo-fonte", "nova-fonte")));
      return;
    }
    const fonte: Fonte = {
      id: r.valor.id,
      titulo: novaFonte.titulo.trim(),
      autor: novaFonte.autor.trim(),
      tradicao: novaFonte.tradicao.trim(),
      tipo: novaFonte.tipo,
      referencia: novaFonte.referencia.trim(),
      capa: novaFonte.capa,
      inicial: (novaFonte.inicial || novaFonte.titulo.trim()[0] || "?").toUpperCase(),
    };
    setFontes((atual) => [...atual, fonte]);
    mudar({ fontes: [...form.fontes, fonte.id] }, "campo-fontes");
    setGavetaFonte(false);
    setNovaFonte(fonteVazia());
    setErrosFonte({});
    toast("Fonte cadastrada e escolhida para este artigo.");
  };

  const citacaoPrevia: Citacao | null =
    form.temCitacao && (form.citacao.traducao.trim() || form.citacao.obra.trim())
      ? {
          id: "previa",
          sala: sala.slug as SalaSlug,
          obra: form.citacao.obra || "Obra",
          localizacao: form.citacao.localizacao || "Localização",
          proveniencia: "primaria",
          traducao: form.citacao.traducao || "Tradução do trecho",
          referencia: form.citacao.referencia || "Referência completa",
          capa: sala.placa,
          inicial: (form.citacao.obra.trim()[0] ?? "?").toUpperCase(),
          ...(form.citacao.rotuloTraducao.trim() ? { rotuloTraducao: form.citacao.rotuloTraducao } : {}),
          ...(form.citacao.originalTexto.trim()
            ? {
                original: {
                  texto: form.citacao.originalTexto,
                  idioma: form.citacao.originalIdioma || "idioma",
                  lang: form.citacao.originalLang || "und",
                },
              }
            : {}),
        }
      : null;

  const fontesFiltradas = fontes.filter(
    (f) => !buscaFonte.trim() || normalizar(`${f.titulo} ${f.autor}`).includes(normalizar(buscaFonte)),
  );
  const reproduzido = tamanhoReproduzido(form);
  const situacao = form.situacaoJuridica;

  const alternarTema = (t: FormArtigo["temas"][number]) =>
    mudar(
      { temas: form.temas.includes(t) ? form.temas.filter((x) => x !== t) : [...form.temas, t] },
      "campo-temas",
    );

  const [novoTema, setNovoTema] = useState("");
  const [erroNovoTema, setErroNovoTema] = useState<string>();
  const [criandoTema, setCriandoTema] = useState(false);
  const [temasCriados, setTemasCriados] = useState<Tema[]>([]);
  const temas = [
    ...todosOsTemas(),
    ...temasCriados.filter((n) => !todosOsTemas().some((t) => t.slug === n.slug)),
  ];
  const adicionarTema = async () => {
    setCriandoTema(true);
    const r = await criarTemaAcao(novoTema);
    setCriandoTema(false);
    if (!r.ok) {
      setErroNovoTema(r.erros?.["campo-novo-tema"] ?? r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    setTemasCriados((x) => [...x, r.valor]);
    if (!form.temas.includes(r.valor.slug)) mudar({ temas: [...form.temas, r.valor.slug] }, "campo-temas");
    setNovoTema("");
    toast(r.mensagem);
  };

  const mudarSituacao = (tipo: TipoSituacao) => {
    const anterior = form.situacaoJuridica;
    const nova: SituacaoJuridica =
      tipo === "licenca"
        ? { tipo, licenca: anterior?.tipo === "licenca" ? anterior.licenca : "" }
        : tipo === "cessao"
          ? { tipo, registro: anterior?.tipo === "cessao" ? anterior.registro : "" }
          : { tipo };
    mudar({ situacaoJuridica: nova }, "campo-situacao", "campo-licenca", "campo-cessao");
  };

  const titulo = form.titulo.trim() || (form.id ? "Sem título" : "Novo artigo");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/admin/salas" as Route, rotulo: "Salas" },
          { href: `/admin/salas/${sala.slug}` as Route, rotulo: sala.nome },
        ]}
        atual={titulo}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          <IndicadorSalvamento estado={estado} hora={hora} />
          {edicao.automatico && !form.id && (
            <span className="sdb-footnote">O rascunho é salvo sozinho depois que você escreve o título.</span>
          )}
          {publicado && (
            <span className="sdb-footnote">
              Publicado: as alterações só valem depois de “Salvar alterações”.
            </span>
          )}
        </div>
        <h1 className="sdb-title-1">{titulo}</h1>
        <p className="sdb-footnote">
          Sala: <b>{sala.nome}</b>
        </p>
      </header>

      {form.id && (
        <Segmented<"edicao" | "historico">
          abas="item"
          label="Seções do artigo"
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
          <Alerta title="Este conteúdo está arquivado" className="mb-6">
            Ele não aparece no portal e não pode ser editado. Restaure-o como rascunho para voltar a trabalhar
            nele.
          </Alerta>
        )}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
          <form
            className="flex min-w-0 flex-col gap-6"
            noValidate
            onSubmit={(e) => e.preventDefault()}
            aria-label="Edição do artigo"
          >
            <fieldset disabled={arquivado} className="contents">
              {/* a) Identificação */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-identificacao">
                <h2 id="sec-identificacao" className="sdb-headline">
                  Identificação
                </h2>
                {erros["campo-sala"] && <ErroCampo id="campo-sala" texto={erros["campo-sala"]} />}
                <RadioGrupo<TipoArtigo>
                  id="campo-tipo"
                  legenda="Tipo"
                  nome="tipo"
                  valor={form.tipo}
                  opcoes={[
                    {
                      value: "artigo",
                      label: "Artigo",
                      help: "Texto editorial ou de especialista, com fontes citadas.",
                    },
                    {
                      value: "fonte-primaria",
                      label: "Fonte primária",
                      help: "Trecho do texto antigo, transcrito ou traduzido, com a citação completa.",
                    },
                  ]}
                  onChange={(tipo) =>
                    mudar(
                      { tipo, ...(tipo === "fonte-primaria" ? { temCitacao: true } : {}) },
                      "campo-tem-citacao",
                    )
                  }
                />
                <CampoTexto
                  id="campo-titulo"
                  label="Título"
                  maxLength={LIMITE_TITULO}
                  placeholder="Ex.: Poimandres: a Mente que fala a Hermes"
                  value={form.titulo}
                  error={erros["campo-titulo"]}
                  onChange={(e) => mudar({ titulo: e.target.value }, "campo-titulo")}
                />
                <div className="flex flex-col gap-2">
                  <CampoTexto
                    id="campo-slug"
                    label="Endereço (slug)"
                    placeholder={gerarSlug(form.titulo) || "poimandres-a-mente-que-fala"}
                    value={form.slug}
                    disabled={slugTravado}
                    error={erros["campo-slug"]}
                    help={
                      slugTravado
                        ? `Travado depois da publicação, para não quebrar links: /salas/${form.sala}/${form.slug}`
                        : `Em branco, é gerado do título. Fica: /salas/${form.sala || "sala"}/${form.slug || gerarSlug(form.titulo) || "…"}`
                    }
                    onChange={(e) => mudar({ slug: e.target.value.toLowerCase() }, "campo-slug")}
                  />
                  {!slugTravado && (
                    <div>
                      <Button
                        variant="plain"
                        size="sm"
                        icon="regenerar"
                        disabled={!form.titulo.trim()}
                        onClick={() => mudar({ slug: gerarSlug(form.titulo) }, "campo-slug")}
                      >
                        Gerar do título
                      </Button>
                    </div>
                  )}
                </div>
                <AreaTexto
                  id="campo-resumo"
                  label="Resumo"
                  rows={3}
                  contador
                  maxLength={LIMITE_RESUMO}
                  placeholder="Ex.: A visão que abre o Corpus Hermeticum: luz, escuridão e a palavra que ordena o cosmos."
                  help="Aparece no card do conteúdo e na busca. Descreva, não prometa."
                  value={form.resumo}
                  error={erros["campo-resumo"]}
                  onChange={(e) => mudar({ resumo: e.target.value }, "campo-resumo")}
                />
              </section>

              {/* b) Classificação (RF-11) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-classificacao">
                <h2 id="sec-classificacao" className="sdb-headline">
                  Classificação
                </h2>
                <fieldset
                  id="campo-temas"
                  className="sdb-fieldset"
                  aria-describedby={erros["campo-temas"] ? "campo-temas-erro" : "campo-temas-ajuda"}
                >
                  <legend className="sdb-caption">Temas</legend>
                  <p id="campo-temas-ajuda" className="sdb-help">
                    Ao menos um. São os temas transversais que alimentam a busca comparativa. Se faltar um,
                    crie abaixo: ele passa a valer para todo o acervo e já fica marcado neste artigo.
                  </p>
                  <div className="sdb-row">
                    {temas.map((t) => (
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
                  {!arquivado && (
                    <div className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <CampoTexto
                          id="campo-novo-tema"
                          label="Novo tema"
                          placeholder="Ex.: Sabedoria"
                          maxLength={40}
                          value={novoTema}
                          error={erroNovoTema}
                          onChange={(e) => {
                            setNovoTema(e.target.value);
                            setErroNovoTema(undefined);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return;
                            e.preventDefault();
                            if (novoTema.trim() && !criandoTema) void adicionarTema();
                          }}
                        />
                      </div>
                      <Button
                        variant="tinted"
                        icon="mais"
                        loading={criandoTema}
                        aria-disabled={!novoTema.trim()}
                        onClick={() => {
                          if (novoTema.trim() && !criandoTema) void adicionarTema();
                        }}
                      >
                        Adicionar tema
                      </Button>
                    </div>
                  )}
                </fieldset>
                <RadioGrupo<`${Nivel}`>
                  id="campo-nivel"
                  legenda="Nível de aprofundamento"
                  nome="nivel"
                  valor={form.nivel ? (`${form.nivel}` as `${Nivel}`) : null}
                  error={erros["campo-nivel"]}
                  opcoes={([1, 2, 3] as Nivel[]).map((n) => ({
                    value: `${n}` as `${Nivel}`,
                    label: <SeloNivel nivel={n} plain />,
                    help: NIVEL_AJUDA[n],
                  }))}
                  onChange={(v) => mudar({ nivel: Number(v) as Nivel }, "campo-nivel")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto
                    id="campo-periodo"
                    label="Período"
                    placeholder="Ex.: séc. I – III ou c. 350"
                    help="Texto livre: datas incertas ficam incertas."
                    value={form.periodo}
                    onChange={(e) => mudar({ periodo: e.target.value })}
                  />
                  <CampoTexto
                    id="campo-duracao"
                    label="Tempo de leitura (min)"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={240}
                    value={form.duracaoMin ?? ""}
                    onChange={(e) => mudar({ duracaoMin: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </section>

              {/* c) Proveniência (RF-12, RNF-DOM-01) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-proveniencia">
                <h2 id="sec-proveniencia" className="sdb-headline">
                  Proveniência
                </h2>
                <p className="sdb-help">
                  Diz ao buscador de onde vem o texto. Assinado por pesquisador com credencial verificada é
                  “Especialista”; escrito e revisado pela equipe da Sala é “Editorial curado”.
                </p>
                <Checkbox
                  id="campo-producao-ia"
                  label="Texto produzido com auxílio de IA"
                  help="Se marcado, a proveniência só pode ser “Síntese por IA”: nunca curado, especialista ou fonte primária."
                  checked={form.producaoIA}
                  onChange={(e) =>
                    mudar(
                      {
                        producaoIA: e.target.checked,
                        ...(e.target.checked ? { proveniencia: "ia" as const } : {}),
                      },
                      "campo-proveniencia",
                    )
                  }
                />
                <RadioGrupo<Proveniencia>
                  id="campo-proveniencia"
                  legenda="Origem do texto"
                  nome="proveniencia"
                  valor={form.proveniencia}
                  error={erros["campo-proveniencia"]}
                  opcoes={PROVENIENCIAS.map((p) => ({
                    value: p,
                    label: PROVENIENCIA_ROTULO[p],
                    help: PROVENIENCIA_AJUDA[p],
                    disabled: form.producaoIA && p !== "ia",
                  }))}
                  onChange={(proveniencia) => mudar({ proveniencia }, "campo-proveniencia")}
                />
                {form.proveniencia && (
                  <p className="sdb-row" aria-live="polite">
                    <span className="sdb-footnote">Como aparece no portal:</span>
                    <SeloProveniencia tipo={form.proveniencia} />
                  </p>
                )}
              </section>

              {/* d) Autoria */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-autoria">
                <h2 id="sec-autoria" className="sdb-headline">
                  Autoria
                </h2>
                <Checkbox
                  id="campo-autoria-anonima"
                  label="Autoria não identificada"
                  help="Para textos anônimos. A credencial pode dizer a época: “Texto anônimo, séc. II”."
                  checked={form.autoriaNaoIdentificada}
                  onChange={(e) => mudar({ autoriaNaoIdentificada: e.target.checked }, "campo-autoria-nome")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoTexto
                    id="campo-autoria-nome"
                    label="Nome"
                    placeholder="Ex.: Equipe editorial da Sala Corpus Hermeticum"
                    disabled={form.autoriaNaoIdentificada}
                    value={form.autoriaNaoIdentificada ? "" : form.autoria.nome}
                    error={erros["campo-autoria-nome"]}
                    onChange={(e) =>
                      mudar({ autoria: { ...form.autoria, nome: e.target.value } }, "campo-autoria-nome")
                    }
                  />
                  <CampoTexto
                    id="campo-autoria-credencial"
                    label="Credencial"
                    placeholder="Ex.: Doutora em Estudos Clássicos"
                    help="Em texto simples. A autoria não tem página de perfil."
                    value={form.autoria.credencial}
                    onChange={(e) => mudar({ autoria: { ...form.autoria, credencial: e.target.value } })}
                  />
                </div>
              </section>

              {/* e) Corpo */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-corpo">
                <h2 id="sec-corpo" className="sdb-headline">
                  Corpo do texto
                </h2>
                <p className="sdb-help">
                  O primeiro parágrafo abre o texto (lead). Entre os blocos, “Adicionar” insere parágrafo,
                  intertítulo, destaque ou imagem. <b>Termo</b> marca vocabulário próprio da tradição (vira
                  definição); <b>Obra</b> marca título de obra. Atribua cada afirmação: “Segundo o
                  Poimandres…”.
                </p>
                <div id="campo-corpo">
                  <EditorBlocos
                    idBase="campo-corpo"
                    blocos={form.corpo}
                    erros={erros}
                    fontes={form.fontes.map((fid, i) => ({
                      n: i + 1,
                      titulo: fontes.find((f) => f.id === fid)?.titulo ?? "Obra escolhida",
                    }))}
                    somenteLeitura={arquivado}
                    onChange={(corpo) => mudar({ corpo }, ...errosDoCorpoResolvidos(erros, corpo))}
                  />
                </div>
              </section>

              <section className="sdb-material sdb-panel" aria-labelledby="sec-imagens">
                <h2 id="sec-imagens" className="sdb-headline">
                  Imagens
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoImagem
                    id="campo-imagem-card"
                    label="Imagem do card"
                    opcional
                    help="Aparece no card do artigo. Sem ela, a imagem da Sala."
                    valor={form.imagemCard ? { id: form.imagemCard, url: `/midia/${form.imagemCard}` } : null}
                    disabled={arquivado}
                    onMudar={(img) => mudar({ imagemCard: img?.id ?? null })}
                  />
                  <CampoImagem
                    id="campo-imagem-thumb"
                    label="Imagem de topo"
                    opcional
                    help="Topo da página do artigo. Sem ela, a imagem do card."
                    valor={form.thumb ? { id: form.thumb, url: `/midia/${form.thumb}` } : null}
                    disabled={arquivado}
                    onMudar={(img) => mudar({ thumb: img?.id ?? null })}
                  />
                </div>
              </section>

              {/* f) Citação (RF-15) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-citacao">
                <h2 id="sec-citacao" className="sdb-headline">
                  Citação de fonte primária
                </h2>
                <Checkbox
                  id="campo-tem-citacao"
                  label={
                    form.tipo === "fonte-primaria"
                      ? "Citação do trecho (obrigatória para fonte primária)"
                      : "Incluir citação de fonte primária"
                  }
                  checked={form.temCitacao}
                  error={Boolean(erros["campo-tem-citacao"])}
                  onChange={(e) => mudar({ temCitacao: e.target.checked }, "campo-tem-citacao")}
                />
                {erros["campo-tem-citacao"] && (
                  <ErroCampo id="campo-tem-citacao-erro" texto={erros["campo-tem-citacao"]} />
                )}
                {form.temCitacao && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <CampoTexto
                        id="campo-citacao-obra"
                        label="Obra"
                        placeholder="Ex.: Poimandres"
                        value={form.citacao.obra}
                        error={erros["campo-citacao-obra"]}
                        onChange={(e) =>
                          mudar({ citacao: { ...form.citacao, obra: e.target.value } }, "campo-citacao-obra")
                        }
                      />
                      <CampoTexto
                        id="campo-citacao-localizacao"
                        label="Localização"
                        placeholder="Ex.: Corpus Hermeticum, Tratado I, 26"
                        value={form.citacao.localizacao}
                        error={erros["campo-citacao-localizacao"]}
                        onChange={(e) =>
                          mudar(
                            { citacao: { ...form.citacao, localizacao: e.target.value } },
                            "campo-citacao-localizacao",
                          )
                        }
                      />
                    </div>
                    <AreaTexto
                      id="campo-citacao-original"
                      label="Texto original (opcional)"
                      rows={2}
                      placeholder="“τοῦτό ἐστι τὸ ἀγαθὸν τέλος…”"
                      help="Sem original disponível, deixe em branco: a citação mostra só a tradução."
                      value={form.citacao.originalTexto}
                      onChange={(e) =>
                        mudar(
                          { citacao: { ...form.citacao, originalTexto: e.target.value } },
                          "campo-citacao-idioma",
                          "campo-citacao-lang",
                        )
                      }
                    />
                    {form.citacao.originalTexto.trim() && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <CampoTexto
                          id="campo-citacao-idioma"
                          label="Idioma do original"
                          placeholder="Ex.: grego koiné, séc. I–III"
                          value={form.citacao.originalIdioma}
                          error={erros["campo-citacao-idioma"]}
                          onChange={(e) =>
                            mudar(
                              { citacao: { ...form.citacao, originalIdioma: e.target.value } },
                              "campo-citacao-idioma",
                            )
                          }
                        />
                        <CampoTexto
                          id="campo-citacao-lang"
                          label="Código do idioma"
                          placeholder="Ex.: grc, cop, en"
                          help="Código BCP 47, para leitores de tela pronunciarem certo."
                          value={form.citacao.originalLang}
                          error={erros["campo-citacao-lang"]}
                          onChange={(e) =>
                            mudar(
                              { citacao: { ...form.citacao, originalLang: e.target.value.trim() } },
                              "campo-citacao-lang",
                            )
                          }
                        />
                      </div>
                    )}
                    <AreaTexto
                      id="campo-citacao-traducao"
                      label="Tradução"
                      rows={3}
                      placeholder="“Este é o bom fim para os que alcançaram o conhecimento: ser divinizados.”"
                      value={form.citacao.traducao}
                      error={erros["campo-citacao-traducao"]}
                      onChange={(e) =>
                        mudar(
                          { citacao: { ...form.citacao, traducao: e.target.value } },
                          "campo-citacao-traducao",
                        )
                      }
                    />
                    <CampoTexto
                      id="campo-citacao-rotulo"
                      label="Rótulo da tradução (opcional)"
                      placeholder="Ex.: Tradução · original copta não exibido nesta edição"
                      value={form.citacao.rotuloTraducao}
                      onChange={(e) =>
                        mudar({ citacao: { ...form.citacao, rotuloTraducao: e.target.value } })
                      }
                    />
                    <AreaTexto
                      id="campo-citacao-referencia"
                      label="Referência (ABNT)"
                      rows={2}
                      placeholder="Ex.: CORPUS HERMETICUM, Tratado I, 26. In: COPENHAVER, Brian P. (trad.). Hermetica. Cambridge: Cambridge University Press, 1992."
                      value={form.citacao.referencia}
                      error={erros["campo-citacao-referencia"]}
                      onChange={(e) =>
                        mudar(
                          { citacao: { ...form.citacao, referencia: e.target.value } },
                          "campo-citacao-referencia",
                        )
                      }
                    />
                    {citacaoPrevia && (
                      <div className="flex flex-col gap-2">
                        <span className="sdb-caption">Pré-visualização</span>
                        <BlocoCitacao citacao={citacaoPrevia} />
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* g) Fontes (RNF-DOM-01) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-fontes">
                <div className="sdb-row sdb-row--between">
                  <h2 id="sec-fontes" className="sdb-headline">
                    Fontes
                  </h2>
                  <Button variant="tinted" size="sm" icon="mais" onClick={() => setGavetaFonte(true)}>
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
                    Toda afirmação precisa de origem rastreável. Fonte primária com citação completa dispensa
                    esta lista.
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
                            onClick={() =>
                              mudar(
                                {
                                  fontes: marcada
                                    ? form.fontes.filter((x) => x !== f.id)
                                    : [...form.fontes, f.id],
                                },
                                "campo-fontes",
                              )
                            }
                          >
                            <span>
                              {f.titulo}
                              <span className="sdb-table__sub">
                                {f.autor} · {f.tipo}
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

              {/* h) Situação jurídica (RF-15, RNF-DOM-04) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-juridica">
                <h2 id="sec-juridica" className="sdb-headline">
                  Situação jurídica
                </h2>
                <p className="sdb-help">
                  Texto protegido por direito autoral só entra na íntegra com licença ou cessão registrada.
                  Sem isso, entra em trecho curto, com referência e indicação de onde ler a obra.
                </p>
                <RadioGrupo<TipoSituacao>
                  id="campo-situacao"
                  legenda="Como este texto pode ser publicado"
                  nome="situacao"
                  valor={situacao?.tipo ?? null}
                  error={erros["campo-situacao"]}
                  opcoes={SITUACOES}
                  onChange={mudarSituacao}
                />
                {situacao?.tipo === "licenca" && (
                  <CampoTexto
                    id="campo-licenca"
                    label="Qual licença"
                    placeholder="Ex.: CC BY-SA 4.0"
                    value={situacao.licenca}
                    error={erros["campo-licenca"]}
                    onChange={(e) =>
                      mudar(
                        { situacaoJuridica: { tipo: "licenca", licenca: e.target.value } },
                        "campo-licenca",
                      )
                    }
                  />
                )}
                {situacao?.tipo === "cessao" && (
                  <CampoTexto
                    id="campo-cessao"
                    label="Registro da cessão"
                    placeholder="Ex.: Termo de cessão nº 12/2026, arquivado pela curadoria"
                    value={situacao.registro}
                    error={erros["campo-cessao"]}
                    onChange={(e) =>
                      mudar(
                        { situacaoJuridica: { tipo: "cessao", registro: e.target.value } },
                        "campo-cessao",
                      )
                    }
                  />
                )}
                {situacao?.tipo === "trecho-permitido" && (
                  <p className="sdb-footnote" aria-live="polite">
                    Texto reproduzido: {reproduzido.toLocaleString("pt-BR")} de{" "}
                    {LIMITE_TRECHO_PERMITIDO.toLocaleString("pt-BR")} caracteres (corpo e citação).
                  </p>
                )}
                {situacao?.tipo === "trecho-permitido" && reproduzido > LIMITE_TRECHO_PERMITIDO && (
                  <Alerta variant="warning" title="Atenção: o texto passou do limite de trecho permitido">
                    Com {reproduzido.toLocaleString("pt-BR")} caracteres, confira se o recorte ainda é um
                    trecho. Para publicar mais, registre licença ou cessão.
                  </Alerta>
                )}
              </section>

              {/* i) Divergência (RNF-DOM-03) */}
              <section className="sdb-material sdb-panel" aria-labelledby="sec-divergencia">
                <h2 id="sec-divergencia" className="sdb-headline">
                  Divergência
                </h2>
                <Checkbox
                  id="campo-divergente"
                  label="Este tema tem leituras divergentes"
                  help="Marque quando tradições ou estudiosos leem o tema de formas incompatíveis. A página pública mostra a nota em destaque."
                  checked={form.temaDivergente}
                  onChange={(e) => mudar({ temaDivergente: e.target.checked }, "campo-nota-divergencia")}
                />
                {form.temaDivergente && (
                  <AreaTexto
                    id="campo-nota-divergencia"
                    label="Nota de divergência"
                    rows={3}
                    contador
                    maxLength={LIMITE_NOTA_DIVERGENCIA}
                    placeholder="Ex.: Parte dos estudiosos data o Evangelho de Tomé no séc. I; outra parte, no séc. II. A Sala apresenta as duas leituras."
                    help="Apresente as leituras lado a lado, sem apontar qual é a correta."
                    value={form.notaDivergencia}
                    error={erros["campo-nota-divergencia"]}
                    onChange={(e) => mudar({ notaDivergencia: e.target.value }, "campo-nota-divergencia")}
                  />
                )}
              </section>
            </fieldset>
          </form>
          <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Publicação">
            {avisoPublicar && bloqueado && (
              <Alerta variant="error" title="Erro: ainda há itens pendentes">
                Cada item abaixo leva ao campo que falta.
              </Alerta>
            )}
            <div id="checklist">
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
            </div>
            <div className="sdb-material sdb-panel">
              <h2 className="sdb-headline">Ações</h2>
              <div className="flex flex-col gap-2">
                {form.id && (
                  <a
                    className="sdb-btn sdb-btn--secondary sdb-btn--block no-underline"
                    href={`/admin/salas/${sala.slug}/artigos/${form.id}/previa`}
                    target="_blank"
                    rel="noopener"
                  >
                    <Icon name="olho" />
                    Pré-visualizar como buscador
                  </a>
                )}
                {status === "rascunho" && form.id && (
                  <Button
                    variant="secondary"
                    block
                    icon="regenerar"
                    onClick={() => void salvarAgora("manual")}
                  >
                    Salvar rascunho agora
                  </Button>
                )}
                {publicado && form.id && (
                  <Button
                    variant="secondary"
                    block
                    onClick={() => pedir(alvo(form.id as string), "despublicar")}
                  >
                    Despublicar
                  </Button>
                )}
                {form.id && !arquivado && (
                  <Button
                    variant="destructive"
                    block
                    icon="cadeado"
                    onClick={() => pedir(alvo(form.id as string), "arquivar")}
                  >
                    Arquivar
                  </Button>
                )}
                {arquivado && form.id && (
                  <Button
                    variant="primary"
                    block
                    icon="regenerar"
                    onClick={() => pedir(alvo(form.id as string), "restaurar")}
                  >
                    Restaurar como rascunho
                  </Button>
                )}
              </div>
              {form.id && !slugTravado && !arquivado && salasDestino.length > 0 && (
                <Menu
                  titulo="Mais ações"
                  triggerLabel="Mais ações do artigo"
                  triggerClassName="sdb-btn sdb-btn--secondary sdb-btn--block"
                  trigger={
                    <>
                      <Icon name="reticencias" />
                      Mais ações
                    </>
                  }
                  items={[{ label: "Mover para outra Sala", icon: "seta", onSelect: () => setMover(true) }]}
                />
              )}
              <p className="sdb-footnote">Sala: {salaNome}</p>
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

      <Drawer
        open={gavetaFonte}
        onClose={() => setGavetaFonte(false)}
        title="Nova fonte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setGavetaFonte(false)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={salvandoFonte} onClick={salvarNovaFonte}>
              Cadastrar e escolher
            </Button>
          </>
        }
      >
        <CamposFonte
          form={novaFonte}
          erros={errosFonte}
          prefixo="nova-fonte"
          mudar={(parcial, ...campos) => {
            setNovaFonte((f) => ({ ...f, ...parcial }));
            if (campos.length)
              setErrosFonte((e) =>
                Object.fromEntries(Object.entries(e).filter(([k]) => !campos.includes(k))),
              );
          }}
        />
      </Drawer>

      <ModalConfirmacao
        open={confirmarAlteracoes}
        titulo="Salvar as alterações no portal?"
        icone="check"
        rotuloConfirmar="Salvar e atualizar"
        carregando={estado === "salvando"}
        onCancelar={() => setConfirmarAlteracoes(false)}
        onConfirmar={confirmarSalvar}
      >
        <b>{form.titulo}</b>
        <br />O conteúdo está publicado: as alterações aparecem na mesma hora na Sala {salaNome}, na página do
        conteúdo e na busca.
      </ModalConfirmacao>
      {form.id && (
        <MoverParaSala
          aberto={mover}
          onFechar={() => setMover(false)}
          artigoId={form.id}
          titulo={form.titulo}
          salaAtual={sala.nome}
          destinos={salasDestino}
          antesDeMover={async () => {
            if (!sujo) return true;
            const r = await salvarAgora("automatico");
            return Boolean(r?.ok);
          }}
        />
      )}
      {modal}
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
