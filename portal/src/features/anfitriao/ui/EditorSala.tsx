"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto, Checkbox } from "@/components/ds/Campos";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { TabelaDados } from "@/components/ds/TabelaDados";
import { useToast } from "@/components/ds/Toast";
import type { StatusEditorial } from "@/data/types";
import { formatarData } from "@/lib/texto";
import { enviarSalaAcao, excluirItemAcao, retirarDoArAcao, salvarSalaAcao } from "@/server/anfitriao/acoes";
import { AvisoSaida, focarCampo } from "../../admin/ui/AvisoSaida";
import { useEdicao } from "../../admin/ui/useEdicao";
import { type FormSalaAnfitriao, LIMITE_DESCRICAO_SALA, LIMITE_NOME_SALA } from "../regras/artigo";
import { DiretrizesAnfitriao } from "./Diretrizes";
import { SheetEnvio } from "./SheetEnvio";

export interface ArtigoDaSalaVisual {
  id: string;
  titulo: string;
  status: StatusEditorial;
  atualizadoEm: string;
}

interface EditorSalaProps {
  inicial: FormSalaAnfitriao;
  imagem: ImagemEnviada | null;
  status: StatusEditorial;
  atualizadoEm: string | null;
  jaPublicado: boolean;
  congelado: boolean;
  ultimoMotivo?: string;
  /** Endereço público, quando a Sala está no ar. */
  noAr?: string;
  artigos: ArtigoDaSalaVisual[];
}

const ENVIAVEIS: StatusEditorial[] = ["rascunho", "reprovado"];

/** A Sala do anfitrião (§5): formulário, artigos e envio para revisão. */
export function EditorSala({
  inicial,
  imagem: imagemInicial,
  status,
  atualizadoEm,
  jaPublicado,
  congelado,
  ultimoMotivo,
  noAr,
  artigos,
}: EditorSalaProps) {
  const router = useRouter();
  const toast = useToast();
  const [imagem, setImagem] = useState(imagemInicial);
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [envio, setEnvio] = useState(false);
  const [escolhidos, setEscolhidos] = useState<string[]>(() =>
    artigos.filter((a) => ENVIAVEIS.includes(a.status)).map((a) => a.id),
  );
  const [aceite, setAceite] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [retirar, setRetirar] = useState(false);
  const [excluir, setExcluir] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const publicado = status === "publicado";
  const emRevisao = status === "em_revisao";
  const travado = emRevisao || congelado;
  const edicao = useEdicao<FormSalaAnfitriao>({
    inicial,
    status,
    atualizadoEm,
    base: "/anfitriao/salas",
    salvar: salvarSalaAcao,
    podeSalvar: (f) => Boolean(f.nome.trim()),
    automatico: !publicado && !travado,
  });
  const { form, mudar, erros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const id = edicao.id.current;
  const enviaveis = artigos.filter((a) => ENVIAVEIS.includes(a.status));
  const primeiroEnvio = !jaPublicado;

  const mostrarErro = (r: { mensagem: string; erros?: Record<string, string> }) => {
    const primeiro = r.erros ? Object.keys(r.erros)[0] : undefined;
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: não foi possível concluir" });
  };

  const salvarPublicado = async () => {
    const r = await salvarAgora("manual");
    setConfirmarEdicao(false);
    if (r?.ok) {
      toast(r.mensagem);
      router.refresh();
    } else if (r && !r.ok) mostrarErro(r);
  };

  const enviar = async () => {
    if (!aceite) {
      setErroEnvio("marque a declaração de direitos para enviar.");
      return;
    }
    if (primeiroEnvio && escolhidos.length === 0) {
      setErroEnvio("escolha pelo menos um artigo para ir junto com a Sala.");
      return;
    }
    setEnviando(true);
    if (sujo && id) await salvarAgora("automatico");
    const r = await enviarSalaAcao(id ?? "", escolhidos, aceite);
    setEnviando(false);
    if (!r.ok) {
      setErroEnvio(r.mensagem.replace(/^Erro: /, ""));
      return;
    }
    setEnvio(false);
    toast(r.mensagem);
    router.refresh();
  };

  const executar = async (acao: () => Promise<{ ok: boolean; mensagem: string }>, depois: () => void) => {
    setOcupado(true);
    const r = await acao();
    setOcupado(false);
    if (!r.ok) return mostrarErro(r);
    toast(r.mensagem);
    depois();
  };

  const titulo = form.nome.trim() || (id ? "Sala sem nome" : "Nova Sala");

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs itens={[{ href: "/anfitriao" as Route, rotulo: "Minhas Salas" }]} atual={titulo} />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          {!travado && <IndicadorSalvamento estado={estado} hora={hora} />}
          {!id && (
            <span className="sdb-footnote">O rascunho é salvo sozinho depois que você escreve o nome.</span>
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
        <Alerta variant="warning" title="Atenção: a curadoria pediu ajustes nesta Sala">
          Motivo: {ultimoMotivo}
          <br />
          Corrija e envie de novo.
        </Alerta>
      )}
      {emRevisao && (
        <Alerta title="Em revisão">
          A curadoria está revisando esta Sala. Enquanto isso, ela não pode ser editada.
        </Alerta>
      )}
      {congelado && (
        <Alerta title="Sala congelada">
          Esta Sala foi congelada pela curadoria e não é mais editada. O que já estava no ar continua no ar.
        </Alerta>
      )}
      {publicado && (
        <Alerta title="Esta Sala está no ar">
          Editar o nome, a descrição, o período, o link ou a imagem tira a Sala e os artigos dela do ar até a
          curadoria aprovar a nova versão.
        </Alerta>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <form
            className="sdb-material sdb-panel"
            noValidate
            onSubmit={(e) => e.preventDefault()}
            aria-labelledby="sec-sala"
          >
            <h2 id="sec-sala" className="sdb-headline">
              A Sala
            </h2>
            <fieldset disabled={travado} className="contents">
              <CampoTexto
                id="campo-sala-nome"
                label="Nome"
                maxLength={LIMITE_NOME_SALA}
                placeholder="Ex.: Leituras do Evangelho de Tomé"
                value={form.nome}
                error={erros["campo-sala-nome"]}
                onChange={(e) => mudar({ nome: e.target.value }, "campo-sala-nome")}
              />
              <AreaTexto
                formatacao
                id="campo-sala-descricao"
                label="Descrição"
                rows={4}
                contador
                maxLength={LIMITE_DESCRICAO_SALA}
                placeholder="Ex.: Leituras comentadas dos 114 ditos do segundo códice de Nag Hammadi, com a edição usada em cada uma."
                help="Aparece no card e no topo da Sala. Descreva, não prometa."
                value={form.descricao}
                error={erros["campo-sala-descricao"]}
                onChange={(e) => mudar({ descricao: e.target.value }, "campo-sala-descricao")}
              />
              <CampoTexto
                id="campo-sala-periodo"
                label={
                  <>
                    Período <small>opcional</small>
                  </>
                }
                placeholder="Ex.: séc. II – III (datação incerta)"
                help="Datas incertas ficam incertas."
                value={form.periodo}
                onChange={(e) => mudar({ periodo: e.target.value })}
              />
              <CampoTexto
                id="campo-sala-link"
                label={
                  <>
                    Link da Sala <small>opcional</small>
                  </>
                }
                type="url"
                inputMode="url"
                placeholder="https://"
                help="Seu site ou canal, para quem quiser ir além. Só endereços https."
                value={form.link}
                error={erros["campo-sala-link"]}
                onChange={(e) => mudar({ link: e.target.value }, "campo-sala-link")}
              />
              <CampoImagem
                id="campo-sala-imagem"
                label="Imagem da Sala"
                opcional
                help="JPEG, PNG ou WebP, até 5 MB. Sem imagem, o card usa a placa da marca."
                valor={imagem}
                disabled={travado}
                onMudar={(nova) => {
                  setImagem(nova);
                  mudar({ imagem: nova?.id ?? null });
                }}
              />
            </fieldset>
          </form>

          {id && (
            <section className="flex flex-col gap-3" aria-labelledby="sec-artigos">
              <div className="sdb-row sdb-row--between">
                <h2 id="sec-artigos" className="sdb-title-2">
                  Artigos
                </h2>
                {!congelado && (
                  <ButtonLink
                    href={`/anfitriao/salas/${id}/artigos/novo` as Route}
                    variant="tinted"
                    icon="mais"
                  >
                    Novo artigo
                  </ButtonLink>
                )}
              </div>
              <TabelaDados<ArtigoDaSalaVisual>
                legenda={`Artigos desta Sala · ${artigos.length}`}
                navegacao
                itens={artigos}
                chave={(a) => a.id}
                rotuloItem={(a) => a.titulo}
                vazio="Nenhum artigo ainda. Uma Sala vai ao ar com pelo menos um."
                colunas={[
                  {
                    id: "titulo",
                    cabecalho: "Título",
                    celula: (a) => (
                      <span className="sdb-table__title">
                        <Link href={`/anfitriao/artigos/${a.id}` as Route}>{a.titulo}</Link>
                      </span>
                    ),
                  },
                  { id: "status", cabecalho: "Status", celula: (a) => <SeloStatus status={a.status} /> },
                  {
                    id: "atualizado",
                    cabecalho: "Atualizado",
                    className: "sdb-tabular",
                    celula: (a) => formatarData(a.atualizadoEm.slice(0, 10)),
                  },
                ]}
              />
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Revisão">
          <DiretrizesAnfitriao />
          <div className="sdb-material sdb-panel">
            <h2 className="sdb-headline">Revisão</h2>
            {!id ? (
              <p className="sdb-footnote">
                Escreva o nome para salvar a Sala; depois, crie o primeiro artigo.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {publicado && (
                  <Button variant="primary" block disabled={!sujo} onClick={() => setConfirmarEdicao(true)}>
                    Salvar alterações
                  </Button>
                )}
                {ENVIAVEIS.includes(status) && !congelado && (
                  <Button
                    variant="primary"
                    block
                    icon="enviar"
                    onClick={() => {
                      setErroEnvio(null);
                      setEnvio(true);
                    }}
                  >
                    Enviar para revisão
                  </Button>
                )}
                {publicado && !congelado && (
                  <Button variant="secondary" block onClick={() => setRetirar(true)}>
                    Retirar do ar
                  </Button>
                )}
                {!jaPublicado && !emRevisao && (
                  <Button variant="destructive" block icon="lixeira" onClick={() => setExcluir(true)}>
                    Excluir Sala
                  </Button>
                )}
                <p className="sdb-footnote">
                  {primeiroEnvio
                    ? "No primeiro envio, a Sala vai com pelo menos um artigo. Ela entra no ar quando a curadoria aprovar."
                    : "Artigos novos ou editados são enviados um a um, na página de cada artigo."}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <ModalConfirmacao
        open={confirmarEdicao}
        titulo="Salvar e tirar a Sala do ar?"
        icone="aviso"
        rotuloConfirmar="Salvar e tirar do ar"
        carregando={estado === "salvando"}
        onCancelar={() => setConfirmarEdicao(false)}
        onConfirmar={salvarPublicado}
      >
        Esta Sala sai do ar até a curadoria aprovar a nova versão. Os artigos dela saem junto. Depois de
        salvar, envie a Sala de novo para revisão.
      </ModalConfirmacao>

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
        {enviaveis.length > 0 ? (
          <fieldset className="sdb-fieldset">
            <legend className="sdb-caption">
              {primeiroEnvio ? "Artigos que vão junto · pelo menos um" : "Artigos que vão junto · opcional"}
            </legend>
            {enviaveis.map((a) => (
              <Checkbox
                key={a.id}
                label={a.titulo}
                checked={escolhidos.includes(a.id)}
                onChange={(e) => {
                  setErroEnvio(null);
                  setEscolhidos((x) => (e.target.checked ? [...x, a.id] : x.filter((y) => y !== a.id)));
                }}
              />
            ))}
          </fieldset>
        ) : (
          <p className="sdb-body-sm m-0">
            {primeiroEnvio
              ? "Esta Sala ainda não tem artigo pronto para ir junto. Crie um artigo antes de enviar."
              : "A Sala vai sozinha; os artigos publicados seguem como estão."}
          </p>
        )}
      </SheetEnvio>

      <ModalConfirmacao
        open={retirar}
        titulo="Retirar a Sala do ar?"
        icone="aviso"
        destrutivo
        rotuloConfirmar="Retirar do ar"
        carregando={ocupado}
        onCancelar={() => setRetirar(false)}
        onConfirmar={() =>
          executar(
            () => retirarDoArAcao("sala", id ?? ""),
            () => {
              setRetirar(false);
              router.refresh();
            },
          )
        }
      >
        A Sala e os artigos dela saem do portal e ficam arquivados. Nada é apagado.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={excluir}
        titulo="Excluir esta Sala?"
        icone="lixeira"
        destrutivo
        rotuloConfirmar="Excluir Sala"
        carregando={ocupado}
        onCancelar={() => setExcluir(false)}
        onConfirmar={() =>
          executar(
            () => excluirItemAcao("sala", id ?? ""),
            () => {
              setSujo(false);
              router.push("/anfitriao" as Route);
              router.refresh();
            },
          )
        }
      >
        A Sala e os rascunhos dela são apagados. Isso não pode ser desfeito.
      </ModalConfirmacao>

      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}
