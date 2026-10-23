"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alerta } from "@/components/ds/Alerta";
import { Breadcrumbs } from "@/components/ds/Breadcrumbs";
import { Button, ButtonLink } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { CampoTexto } from "@/components/ds/Campos";
import { AreaTexto, RadioGrupo } from "@/components/ds/CamposExtras";
import { ChecklistPublicacao, IndicadorSalvamento, SeloStatus } from "@/components/ds/Curadoria";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import type { Placa, StatusEditorial } from "@/data/types";
import { mudarStatusSalaAcao, salvarSalaOficialAcao } from "@/server/admin/acoes";
import { temPendencia } from "../../regras/checklist";
import {
  checklistSala,
  type FormSalaOficial,
  LIMITE_DESCRICAO_SALA_OFICIAL,
  LIMITE_NOME_SALA_OFICIAL,
  LIMITE_TRADICAO_CURTA,
  slugDaSala,
} from "../../regras/sala";
import { AvisoSaida, focarCampo } from "../AvisoSaida";
import { PLACAS } from "../CamposFonte";
import { useEdicao } from "../useEdicao";

/**
 * Criar e editar uma Sala oficial (curadoria a partir da Sala, §4). Ciclo da
 * curadoria: rascunho salvo sozinho, publicação direta pelo checklist, Sala
 * publicada só muda com "Salvar alterações".
 */
export function EditorSalaOficial({
  inicial,
  imagem: imagemInicial,
  status,
  atualizadoEm,
  slugTravado,
}: {
  inicial: FormSalaOficial;
  imagem: ImagemEnviada | null;
  status: StatusEditorial;
  atualizadoEm: string | null;
  slugTravado: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [imagem, setImagem] = useState(imagemInicial);
  const [publicar, setPublicar] = useState(false);
  const [confirmarEdicao, setConfirmarEdicao] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const edicao = useEdicao<FormSalaOficial>({
    inicial,
    status,
    atualizadoEm,
    base: "/admin/salas",
    salvar: salvarSalaOficialAcao,
    podeSalvar: (f) => Boolean(f.nome.trim()),
    caminho: (r) => `/admin/salas/${r.slug}/editar`,
  });
  const { form, mudar, erros, setErros, estado, hora, salvarAgora, sujo, setSujo } = edicao;
  const checklist = checklistSala(form);
  const bloqueado = temPendencia(checklist);
  const publicado = status === "publicado";
  const arquivado = status === "arquivado";
  const slug = form.slug || slugDaSala(form.nome);
  const titulo = form.nome.trim() || (form.id ? "Sala sem nome" : "Nova Sala");

  const mostrarErros = (novos: Record<string, string>, mensagem: string) => {
    setErros(novos);
    const primeiro = Object.keys(novos)[0];
    if (primeiro) requestAnimationFrame(() => focarCampo(primeiro));
    toast("O foco foi para o primeiro campo com erro.", { variant: "erro", title: mensagem });
  };

  const pedirPublicacao = async () => {
    if (bloqueado) {
      const pendentes = checklist.filter((i) => i.estado === "pendente");
      return mostrarErros(
        Object.fromEntries(pendentes.map((i) => [i.campo, i.ajuda.replace(/\.$/, "").toLowerCase()])),
        "Erro: ainda há itens pendentes para publicar",
      );
    }
    if (sujo || !edicao.id.current) {
      const r = await salvarAgora("automatico");
      if (!r?.ok) {
        if (r && !r.ok && r.erros) mostrarErros(r.erros, r.mensagem);
        return;
      }
    }
    setPublicar(true);
  };

  const executarPublicacao = async () => {
    setOcupado(true);
    const r = await mudarStatusSalaAcao(edicao.id.current ?? "", "publicar");
    setOcupado(false);
    setPublicar(false);
    if (!r.ok) {
      toast(r.mensagem.replace(/^Erro: /, ""), { variant: "erro", title: "Erro: a Sala não foi publicada" });
      return;
    }
    toast(r.mensagem);
    router.push(`/admin/salas/${form.slug || slug}` as Route);
    router.refresh();
  };

  const salvarPublicada = async () => {
    const r = await salvarAgora("manual");
    setConfirmarEdicao(false);
    if (r?.ok) {
      toast("Alterações salvas e já visíveis no portal.");
      router.refresh();
    } else if (r && !r.ok) mostrarErros(r.erros ?? {}, r.mensagem);
  };

  const restaurar = async () => {
    setOcupado(true);
    const r = await mudarStatusSalaAcao(edicao.id.current ?? "", "restaurar");
    setOcupado(false);
    if (!r.ok) return toast(r.mensagem, { variant: "erro", title: "Erro: não foi possível restaurar" });
    toast(r.mensagem);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        itens={[
          { href: "/admin/salas" as Route, rotulo: "Salas" },
          ...(form.id ? [{ href: `/admin/salas/${form.slug}` as Route, rotulo: form.nome || "Sala" }] : []),
        ]}
        atual={form.id ? "Editar Sala" : "Nova Sala"}
      />
      <header className="flex flex-col gap-3">
        <div className="sdb-row">
          <SeloStatus status={status} />
          {!publicado && !arquivado && <IndicadorSalvamento estado={estado} hora={hora} />}
          {!form.id && (
            <span className="sdb-footnote">O rascunho é salvo sozinho depois que você escreve o nome.</span>
          )}
          {publicado && (
            <span className="sdb-footnote">
              Publicada: as alterações só valem depois de “Salvar alterações”.
            </span>
          )}
        </div>
        <h1 className="sdb-title-1">{titulo}</h1>
      </header>

      {arquivado && (
        <Alerta
          title="Esta Sala está arquivada"
          actions={
            <Button variant="secondary" size="sm" icon="regenerar" loading={ocupado} onClick={restaurar}>
              Restaurar Sala
            </Button>
          }
        >
          Ela e tudo o que está nela ficam fora do portal e não podem ser editados. Restaurar devolve tudo
          como estava.
        </Alerta>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem] xl:items-start">
        <form
          className="flex min-w-0 flex-col gap-6"
          noValidate
          onSubmit={(e) => e.preventDefault()}
          aria-label="Edição da Sala"
        >
          <fieldset disabled={arquivado} className="contents">
            <section className="sdb-material sdb-panel" aria-labelledby="sec-sala-identidade">
              <h2 id="sec-sala-identidade" className="sdb-headline">
                Identificação
              </h2>
              <CampoTexto
                id="campo-sala-nome"
                label="Nome"
                maxLength={LIMITE_NOME_SALA_OFICIAL}
                placeholder="Ex.: Upanishads"
                value={form.nome}
                error={erros["campo-sala-nome"]}
                onChange={(e) => mudar({ nome: e.target.value }, "campo-sala-nome", "campo-sala-slug")}
              />
              <div className="flex flex-col gap-2">
                <CampoTexto
                  id="campo-sala-slug"
                  label="Endereço (slug)"
                  placeholder={slugDaSala(form.nome) || "upanishads"}
                  value={form.slug}
                  disabled={slugTravado}
                  error={erros["campo-sala-slug"]}
                  help={
                    slugTravado
                      ? `Travado depois da primeira publicação, para não quebrar links: /salas/${form.slug}`
                      : `Em branco, é gerado do nome. Fica: /salas/${slug || "…"}`
                  }
                  onChange={(e) => mudar({ slug: e.target.value.toLowerCase() }, "campo-sala-slug")}
                />
                {!slugTravado && (
                  <div>
                    <Button
                      variant="plain"
                      size="sm"
                      icon="regenerar"
                      disabled={!form.nome.trim()}
                      onClick={() => mudar({ slug: slugDaSala(form.nome) }, "campo-sala-slug")}
                    >
                      Gerar do nome
                    </Button>
                  </div>
                )}
              </div>
              <CampoTexto
                id="campo-sala-tradicao"
                label="Tradição"
                placeholder="Ex.: Vedanta · textos em sânscrito, séc. VIII a.C. – séc. I"
                help="Tradição ou corpus em uma linha, abaixo do nome no card."
                value={form.tradicao}
                onChange={(e) => mudar({ tradicao: e.target.value }, "campo-sala-tradicao")}
              />
              <CampoTexto
                id="campo-sala-tradicao-curta"
                label="Tradição curta"
                maxLength={LIMITE_TRADICAO_CURTA}
                placeholder="Ex.: Vedanta"
                help="Rótulo da coluna da Sala na grade comparativa."
                value={form.tradicaoCurta}
                error={erros["campo-sala-tradicao-curta"]}
                onChange={(e) => mudar({ tradicaoCurta: e.target.value }, "campo-sala-tradicao-curta")}
              />
              <AreaTexto
                formatacao
                id="campo-sala-descricao"
                label="Descrição"
                rows={4}
                contador
                maxLength={LIMITE_DESCRICAO_SALA_OFICIAL}
                placeholder="Ex.: Diálogos que encerram os Vedas, reunidos ao longo de séculos."
                help="Apresenta a Sala no topo da página. Descreva, não prometa."
                value={form.descricao}
                error={erros["campo-sala-descricao"]}
                onChange={(e) => mudar({ descricao: e.target.value }, "campo-sala-descricao")}
              />
              <CampoTexto
                id="campo-sala-periodo"
                label="Período"
                placeholder="Ex.: séc. VIII a.C. – séc. I (datação incerta)"
                help="Texto livre: datas incertas ficam incertas."
                value={form.periodo}
                onChange={(e) => mudar({ periodo: e.target.value })}
              />
            </section>

            <section className="sdb-material sdb-panel" aria-labelledby="sec-sala-aparencia">
              <h2 id="sec-sala-aparencia" className="sdb-headline">
                Aparência e link
              </h2>
              <RadioGrupo<Placa>
                id="campo-sala-placa"
                legenda="Placa"
                nome="placa-sala"
                valor={form.placa}
                help="Sem imagem, o card usa a placa da marca com o arco."
                opcoes={PLACAS}
                onChange={(placa) => mudar({ placa })}
              />
              <CampoTexto
                id="campo-sala-inicial"
                label="Inicial"
                maxLength={1}
                placeholder="U"
                help="Uma letra, para as capas compostas."
                value={form.inicial}
                error={erros["campo-sala-inicial"]}
                onChange={(e) => mudar({ inicial: e.target.value.toUpperCase() }, "campo-sala-inicial")}
              />
              <CampoImagem
                id="campo-sala-imagem"
                label="Imagem da Sala"
                opcional
                help="JPEG, PNG ou WebP, até 5 MB. Só imagem com direito de uso registrado. Sem ela, a placa."
                valor={imagem}
                disabled={arquivado}
                onMudar={(nova) => {
                  setImagem(nova);
                  mudar({ imagem: nova?.id ?? null });
                }}
              />
              <CampoTexto
                id="campo-sala-link"
                label={
                  <>
                    Link geral <small>opcional</small>
                  </>
                }
                type="url"
                inputMode="url"
                placeholder="https://"
                help="Só endereços https."
                value={form.link}
                error={erros["campo-sala-link"]}
                onChange={(e) => mudar({ link: e.target.value }, "campo-sala-link")}
              />
            </section>
          </fieldset>
        </form>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6" aria-label="Publicação">
          <ChecklistPublicacao
            aoIrParaCampo={focarCampo}
            itens={checklist}
            acao={
              arquivado ? null : publicado ? (
                <Button variant="primary" block disabled={!sujo} onClick={() => setConfirmarEdicao(true)}>
                  Salvar alterações
                </Button>
              ) : (
                <Button variant="primary" block aria-disabled={bloqueado} onClick={pedirPublicacao}>
                  Publicar Sala
                </Button>
              )
            }
          />
          {form.id && (
            <div className="sdb-material sdb-panel">
              <ButtonLink href={`/admin/salas/${form.slug}` as Route} variant="secondary" block icon="salas">
                Ver os artigos e vídeos da Sala
              </ButtonLink>
              <p className="sdb-footnote">
                A Sala aparece no portal quando estiver publicada e tiver pelo menos um artigo publicado.
              </p>
            </div>
          )}
        </aside>
      </div>

      <ModalConfirmacao
        open={publicar}
        titulo="Publicar a Sala?"
        icone="check"
        rotuloConfirmar="Publicar"
        carregando={ocupado}
        onCancelar={() => setPublicar(false)}
        onConfirmar={executarPublicacao}
      >
        <b>{form.nome}</b>
        <br />A Sala entra no portal assim que tiver um artigo publicado. Ela também ganha uma coluna na grade
        comparativa, vazia até a curadoria escrever as leituras.
      </ModalConfirmacao>

      <ModalConfirmacao
        open={confirmarEdicao}
        titulo="Salvar as alterações no portal?"
        icone="check"
        rotuloConfirmar="Salvar e atualizar"
        carregando={estado === "salvando"}
        onCancelar={() => setConfirmarEdicao(false)}
        onConfirmar={salvarPublicada}
      >
        <b>{form.nome}</b>
        <br />A Sala está publicada: as alterações aparecem na mesma hora no card e na página da Sala.
      </ModalConfirmacao>

      <AvisoSaida sujo={sujo && estado !== "salvando"} onDescartar={() => setSujo(false)} />
    </div>
  );
}
